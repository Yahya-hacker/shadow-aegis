"""
Shadow Aegis MCP Server - Phase 1: Real Aegis Engine Integration
================================================================

JSON-RPC 2.0 stdio bridge between the TypeScript CLI and the Python
Aegis adversarial-swarm engine.

Constraints honoured:
  1. stream_token() is the ONLY writer to stdout - all logs go to stderr.
  2. get_findings RPC returns a payload that strictly matches the
     TypeScript SecurityReport schema:
       { findings: Array<{
           vuln_id, title, severity_label, cvss_v31_score,
           cvss_v31_vector, cvss_v40_score?, cwe, file_paths
         }>
       }
  3. Aegis modules are imported via sys.path injection so no package
     install is required - works on Windows (win32) and POSIX alike.
"""

import asyncio
import hashlib
import json
import os
import sys
import logging
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional

# ---------------------------------------------------------------------------
# LOGGING - stderr only, never stdout (stdout is the JSON-RPC channel)
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s %(message)s",
    stream=sys.stderr,
)
logger = logging.getLogger("shadow-aegis-mcp")

# ---------------------------------------------------------------------------
# PATH BOOTSTRAP
# Layout: <repo-root>/shadow-aegis-engine/packages/core-engine/mcp_server.py
#         <repo-root>/Aegis_agent/aegis/...
# parents[0]=core-engine  parents[1]=packages  parents[2]=shadow-aegis-engine
# parents[3]=repo-root
# ---------------------------------------------------------------------------
_THIS_FILE = Path(__file__).resolve()
_REPO_ROOT = _THIS_FILE.parents[3]
_AEGIS_ROOT = _REPO_ROOT / "Aegis_agent"

for _inject in [str(_AEGIS_ROOT), str(_REPO_ROOT)]:
    if _inject not in sys.path:
        sys.path.insert(0, _inject)

logger.info("Repo root : %s", _REPO_ROOT)
logger.info("Aegis root: %s (exists=%s)", _AEGIS_ROOT, _AEGIS_ROOT.exists())

# ---------------------------------------------------------------------------
# AEGIS IMPORTS - each wrapped independently
# ---------------------------------------------------------------------------
_HAS_LLM = False
_HAS_SWARM = False
_HAS_EPISTEMIC = False
_HAS_GRAPH = False

try:
    from aegis.llm import get_llm  # type: ignore[import]
    _HAS_LLM = True
    logger.info("aegis.llm OK")
except Exception as _e:
    logger.warning("aegis.llm unavailable (%s) - built-in HTTP fallback active", _e)

try:
    from aegis.adversarial_swarm import AdversarialSwarm  # type: ignore[import]
    _HAS_SWARM = True
    logger.info("aegis.adversarial_swarm OK")
except Exception as _e:
    logger.warning("aegis.adversarial_swarm unavailable (%s) - heuristic swarm active", _e)

try:
    from aegis.epistemic_priority import (  # type: ignore[import]
        EpistemicPriorityManager,
        KnowledgeCategory,
    )
    _HAS_EPISTEMIC = True
    logger.info("aegis.epistemic_priority OK")
except Exception as _e:
    logger.warning("aegis.epistemic_priority unavailable (%s) - confidence gating disabled", _e)

try:
    from aegis.knowledge_graph import KnowledgeGraph, NodeType  # type: ignore[import]
    _HAS_GRAPH = True
    logger.info("aegis.knowledge_graph OK")
except Exception as _e:
    logger.warning("aegis.knowledge_graph unavailable (%s) - graph disabled", _e)

# ---------------------------------------------------------------------------
# SECURITY REPORT SCHEMA HELPERS
# Must match TypeScript securityReportSchema (report-schema.ts):
#   { findings: Array<{
#       vuln_id, title, severity_label, cvss_v31_score,
#       cvss_v31_vector, cvss_v40_score (null|number), cwe, file_paths
#     }>
#   }
# ---------------------------------------------------------------------------

SEVERITY_LABELS = ("Critical", "High", "Medium", "Low", "Info")


def _make_vuln_id(cwe: str, title: str, primary_path: str) -> str:
    """Deterministic SHADOW-<CWE_NUM>-<HEX8> - mirrors TS vuln-fingerprint logic."""
    raw = f"{cwe}:{title.lower()}:{primary_path}"
    hex8 = hashlib.sha256(raw.encode()).hexdigest()[:8].upper()
    cwe_num = cwe.replace("CWE-", "").strip()
    return f"SHADOW-{cwe_num}-{hex8}"


def _build_finding(
    title: str,
    cwe: str,
    severity_label: str,
    cvss_v31_score: float,
    cvss_v31_vector: str,
    file_paths: List[str],
    cvss_v40_score: Optional[float] = None,
) -> Dict[str, Any]:
    """Return a dict that passes the TS SecurityReport Zod schema."""
    if severity_label not in SEVERITY_LABELS:
        severity_label = "Medium"
    primary = file_paths[0] if file_paths else "unknown"
    return {
        "vuln_id": _make_vuln_id(cwe, title, primary),
        "title": title,
        "severity_label": severity_label,
        "cvss_v31_score": round(float(cvss_v31_score), 1),
        "cvss_v31_vector": cvss_v31_vector,
        "cvss_v40_score": cvss_v40_score,
        "cwe": cwe,
        "file_paths": file_paths if file_paths else ["unknown"],
    }


# ---------------------------------------------------------------------------
# BUILT-IN FALLBACK LLM (direct aiohttp - no Aegis dependency required)
# ---------------------------------------------------------------------------

class _FallbackLLM:
    """Minimal OpenRouter client used when aegis.llm cannot be imported."""

    def __init__(self, api_key: str) -> None:
        self._api_key = api_key
        self._base = "https://openrouter.ai/api/v1"
        self._model = os.getenv(
            "STRATEGIC_MODEL", "nousresearch/hermes-3-llama-3.1-405b:free"
        )

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model_type: str = "strategic",
        temperature: float = 0.7,
        max_tokens: int = 4096,
        json_mode: bool = False,
    ) -> str:
        try:
            import aiohttp
        except ImportError:
            logger.warning("aiohttp not installed - LLM call skipped")
            return ""

        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/shadow-aegis",
            "X-Title": "Shadow Aegis MCP",
        }
        payload: Dict[str, Any] = {
            "model": self._model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        async with aiohttp.ClientSession() as session:
            try:
                async with session.post(
                    f"{self._base}/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=120),
                ) as resp:
                    if resp.status != 200:
                        body = await resp.text()
                        logger.error("LLM API %s: %s", resp.status, body[:200])
                        return ""
                    data = await resp.json()
                    return data["choices"][0]["message"]["content"]
            except Exception as exc:
                logger.error("LLM request failed: %s", exc)
                return ""


# ---------------------------------------------------------------------------
# HEURISTIC SWARM FALLBACK (when aegis.adversarial_swarm is unavailable)
# ---------------------------------------------------------------------------

_TOOL_RISK: Dict[str, int] = {
    "sql_injection_test": 8, "xss_test": 7, "command_injection": 9,
    "file_upload_exploit": 8, "deserialization_attack": 9, "ssrf_test": 7,
    "lfi_test": 7, "rfi_test": 8, "xxe_test": 7, "template_injection": 8,
    "directory_bruteforce": 6, "parameter_fuzzing": 6, "authentication_bypass": 7,
    "session_hijacking": 8, "brute_force_login": 7, "http_request": 2,
    "find_forms": 3, "technology_fingerprint": 3, "port_scan": 4,
    "sast_analysis": 3,
}


class _HeuristicSwarm:
    """Minimal swarm that runs without the full Aegis package."""

    def get_tool_risk(self, tool: str) -> float:
        return float(_TOOL_RISK.get(tool, 5))

    async def conduct_debate(
        self, action: Dict[str, Any], context: Dict[str, Any]
    ) -> Dict[str, Any]:
        tool = action.get("tool", "unknown")
        risk = self.get_tool_risk(tool)
        approved = risk < 9
        verdict = "Approved - stealth variant." if approved else "Rejected - risk too high."
        return {
            "approved": approved,
            "risk_score": risk,
            "reasoning": (
                f"[HEURISTIC] RED: Execute {tool} aggressively. "
                f"BLUE: Risk={risk}/10, proceed with caution. "
                f"JUDGE: {verdict}"
            ),
            "final_action": action,
        }


# ---------------------------------------------------------------------------
# SAST SYSTEM PROMPTS
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT_SAST = (
    "You are an elite autonomous SAST security researcher. "
    "Analyse the provided repository architecture map and identify real, "
    "evidence-backed vulnerabilities. "
    "For each finding produce a JSON object with exactly these fields: "
    "title, cwe, severity_label (Critical|High|Medium|Low|Info), "
    "cvss_v31_score (float 0-10), cvss_v31_vector (CVSS:3.1/... string), "
    "file_paths (array of strings), description, remediation. "
    'Return a JSON object: { "findings": [ ... ] } '
    "Do NOT include markdown fences. Only return valid JSON."
)

_SYSTEM_PROMPT_VERIFY = (
    "You are a strict security verifier. Review the following SAST findings. "
    "Remove any that are clearly false positives or lack code evidence. "
    'Return ONLY a JSON object: { "findings": [ ... ] } '
    "preserving the exact same field structure for each retained finding. "
    "Do NOT include markdown fences. Only return valid JSON."
)


# ---------------------------------------------------------------------------
# AUTONOMOUS AUDIT ENGINE
# ---------------------------------------------------------------------------

class AutonomousAuditEngine:
    """
    Drives the full OODA reasoning loop, wiring real Aegis components
    (LLMEngine, AdversarialSwarm, EpistemicPriorityManager, KnowledgeGraph)
    with graceful fallbacks when packages are unavailable.

    Streaming contract (stdout only):
      { "type": "thought"|"action", "content": "..." }  - live tokens for the UI
      { "jsonrpc": "2.0", ... }                          - RPC responses
    """

    def __init__(self, api_keys: Dict[str, str]) -> None:
        self.api_keys = api_keys
        self._findings: List[Dict[str, Any]] = []
        self._audit_complete: Dict[str, asyncio.Event] = {}

        # --- LLM ---
        openrouter_key = (
            api_keys.get("openrouter")
            or api_keys.get("anthropic")
            or api_keys.get("openai")
            or os.getenv("OPENROUTER_API_KEY", "")
        )
        if _HAS_LLM and openrouter_key:
            try:
                self._llm: Any = get_llm()
                self._llm.api_key = openrouter_key
                self._llm.headers["Authorization"] = f"Bearer {openrouter_key}"
                logger.info("LLM: aegis.LLMEngine")
            except Exception:
                self._llm = _FallbackLLM(openrouter_key)
                logger.info("LLM: _FallbackLLM (aegis init failed)")
        elif openrouter_key:
            self._llm = _FallbackLLM(openrouter_key)
            logger.info("LLM: _FallbackLLM")
        else:
            self._llm = None
            logger.warning("LLM: NONE - no API key provided; analysis will be limited")

        # --- Adversarial Swarm ---
        if _HAS_SWARM:
            try:
                self._swarm: Any = AdversarialSwarm(ai_core=None)
                logger.info("Swarm: aegis.AdversarialSwarm")
            except Exception:
                self._swarm = _HeuristicSwarm()
                logger.info("Swarm: _HeuristicSwarm (aegis init failed)")
        else:
            self._swarm = _HeuristicSwarm()
            logger.info("Swarm: _HeuristicSwarm")

        # --- Epistemic Priority ---
        if _HAS_EPISTEMIC:
            try:
                self._epistemic: Any = EpistemicPriorityManager()
                logger.info("Epistemic: aegis.EpistemicPriorityManager")
            except Exception:
                self._epistemic = None
        else:
            self._epistemic = None

        # --- Knowledge Graph ---
        if _HAS_GRAPH:
            try:
                _tmp = os.getenv("TMPDIR", os.getenv("TEMP", "/tmp"))
                _gp = Path(_tmp) / "shadow_aegis_graph.json"
                self._graph: Any = KnowledgeGraph(persist_path=_gp)
                logger.info("Graph: aegis.KnowledgeGraph")
            except Exception:
                self._graph = None
        else:
            self._graph = None

    # ------------------------------------------------------------------
    # STREAMING HELPERS - stdout only, never stderr
    # ------------------------------------------------------------------

    async def stream_token(self, token_type: str, content: str) -> None:
        """Emit a streaming token to the TypeScript React Ink UI."""
        sys.stdout.write(json.dumps({"type": token_type, "content": content}) + "\n")
        sys.stdout.flush()

    async def _thought(self, msg: str) -> None:
        await self.stream_token("thought", msg)

    async def _action(self, msg: str) -> None:
        await self.stream_token("action", msg)

    # ------------------------------------------------------------------
    # LLM HELPER
    # ------------------------------------------------------------------

    async def _llm_chat(
        self,
        messages: List[Dict[str, str]],
        json_mode: bool = False,
    ) -> str:
        if self._llm is None:
            return ""
        try:
            return await self._llm.chat(messages, json_mode=json_mode)
        except Exception as exc:
            logger.error("LLM chat error: %s", exc)
            return ""

    # ------------------------------------------------------------------
    # OODA PHASES
    # ------------------------------------------------------------------

    async def _phase_observe(self, repo_map: Dict[str, Any]) -> str:
        """OBSERVE - ingest repo map, build attack surface summary."""
        await self._thought("OBSERVE - Ingesting repository architecture map...")

        map_str = json.dumps(repo_map, indent=2)[:6000]
        summary = await self._llm_chat([
            {
                "role": "system",
                "content": (
                    "You are a senior security architect. Summarise the attack surface "
                    "of the following repository map in 3-5 concise bullet points. "
                    "Focus on entry points, trust boundaries, and high-risk components."
                ),
            },
            {"role": "user", "content": f"Repository map:\n{map_str}"},
        ])
        summary = summary.strip() or "Repository map ingested (LLM unavailable)."
        await self._thought(f"Attack surface summary:\n{summary}")

        if self._graph is not None:
            try:
                self._graph.add_node(
                    NodeType.ASSET,
                    label="Target Repository",
                    description=summary[:300],
                    confidence=0.9,
                )
            except Exception:
                pass

        return summary

    async def _phase_orient(self, surface_summary: str) -> float:
        """ORIENT - calculate epistemic confidence, decide operating mode."""
        await self._thought("ORIENT - Calculating epistemic confidence...")

        if self._epistemic is not None:
            try:
                self._epistemic.add_knowledge(
                    KnowledgeCategory.ARCHITECTURE,
                    "repo_map",
                    surface_summary,
                    confidence=0.7,
                    source="mcp_observe",
                )
                state = self._epistemic.get_state_summary()
                confidence: float = state["overall_confidence"]
                mode: str = state["mode"]
                await self._thought(
                    f"Epistemic mode: {mode.upper()} | Confidence: {confidence:.0%}"
                )
                return confidence
            except Exception as exc:
                logger.warning("Epistemic orient failed: %s", exc)

        await self._thought("Epistemic gating: balanced mode (fallback)")
        return 0.5

    async def _phase_decide_and_act(
        self, repo_map: Dict[str, Any], confidence: float
    ) -> List[Dict[str, Any]]:
        """DECIDE + ACT - swarm debate then LLM SAST analysis."""
        await self._thought(
            f"DECIDE - Confidence {confidence:.0%} launching SAST analysis pass..."
        )

        analysis_action = {"tool": "sast_analysis", "args": {"scope": "full"}}
        debate = await self._swarm.conduct_debate(
            analysis_action, {"confidence": confidence}
        )

        if hasattr(debate, "approved"):
            approved: bool = debate.approved
            reasoning: str = debate.reasoning
        else:
            approved = debate.get("approved", True)
            reasoning = debate.get("reasoning", "Swarm approved.")

        await self._action(f"Swarm debate: {reasoning[:200]}")

        if not approved:
            await self._thought("Swarm rejected analysis action - aborting.")
            return []

        await self._action("ACT - Running LLM-powered SAST analysis...")

        map_str = json.dumps(repo_map, indent=2)[:8000]
        raw_resp = await self._llm_chat(
            [
                {"role": "system", "content": _SYSTEM_PROMPT_SAST},
                {
                    "role": "user",
                    "content": (
                        "Analyse this repository architecture map for security vulnerabilities:\n\n"
                        f"{map_str}\n\n"
                        "Return ONLY a JSON object with a findings array. "
                        "Each finding must have: title, cwe, severity_label, "
                        "cvss_v31_score, cvss_v31_vector, file_paths, description, remediation."
                    ),
                },
            ],
            json_mode=True,
        )

        findings = self._parse_llm_findings(raw_resp)
        await self._thought(
            f"LLM analysis complete - {len(findings)} raw finding(s) extracted."
        )
        return findings

    def _parse_llm_findings(self, raw: str) -> List[Dict[str, Any]]:
        """Parse and normalise LLM output into the strict SecurityReport schema."""
        if not raw:
            return []
        try:
            cleaned = raw.strip()
            if cleaned.startswith("```"):
                parts = cleaned.split("```")
                cleaned = parts[1] if len(parts) > 1 else cleaned
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
            data = json.loads(cleaned)
        except json.JSONDecodeError as exc:
            logger.error("Failed to parse LLM findings JSON: %s | raw=%s", exc, raw[:300])
            return []

        raw_findings = data.get("findings", [])
        normalised: List[Dict[str, Any]] = []

        for f in raw_findings:
            try:
                title = str(f.get("title", "Unnamed Finding")).strip()

                cwe = str(f.get("cwe", "CWE-0")).strip()
                if not cwe.upper().startswith("CWE-"):
                    cwe = f"CWE-{cwe}"

                severity = str(f.get("severity_label", "Medium")).strip().capitalize()
                if severity not in SEVERITY_LABELS:
                    severity = "Medium"

                score = float(f.get("cvss_v31_score", 5.0))
                score = max(0.0, min(10.0, score))

                vector = str(
                    f.get(
                        "cvss_v31_vector",
                        "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:L/A:N",
                    )
                )
                if not vector.startswith("CVSS:3.1/"):
                    vector = "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:L/A:N"

                fps = f.get("file_paths", [])
                if isinstance(fps, str):
                    fps = [fps]
                fps = [str(p) for p in fps if p] or ["unknown"]

                normalised.append(
                    _build_finding(
                        title=title,
                        cwe=cwe,
                        severity_label=severity,
                        cvss_v31_score=score,
                        cvss_v31_vector=vector,
                        file_paths=fps,
                        cvss_v40_score=None,
                    )
                )
            except Exception as exc:
                logger.warning("Skipping malformed finding: %s | %s", exc, f)

        return normalised

    async def _phase_verify(
        self, findings: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """VERIFY - second-pass LLM anti-hallucination gate."""
        if not findings or self._llm is None:
            return findings

        await self._thought(
            f"VERIFY - Running anti-hallucination gate on {len(findings)} finding(s)..."
        )

        verify_resp = await self._llm_chat(
            [
                {"role": "system", "content": _SYSTEM_PROMPT_VERIFY},
                {
                    "role": "user",
                    "content": f"Findings to verify:\n{json.dumps(findings, indent=2)}",
                },
            ],
            json_mode=True,
        )

        verified = self._parse_llm_findings(verify_resp)
        removed = len(findings) - len(verified)
        await self._thought(
            f"Verification complete - {len(verified)} finding(s) retained, {removed} removed."
        )
        return verified if verified else findings

    # ------------------------------------------------------------------
    # PUBLIC ENTRY POINT
    # ------------------------------------------------------------------

    async def start_autonomous_audit(
        self, repo_map: Dict[str, Any], audit_id: str
    ) -> None:
        """Full OODA loop. Streams thought/action tokens throughout."""
        complete_event = asyncio.Event()
        self._audit_complete[audit_id] = complete_event

        try:
            await self._thought(
                f"Shadow Aegis autonomous audit {audit_id} initialising..."
            )
            surface_summary = await self._phase_observe(repo_map)
            confidence = await self._phase_orient(surface_summary)
            raw_findings = await self._phase_decide_and_act(repo_map, confidence)
            verified_findings = await self._phase_verify(raw_findings)
            self._findings = verified_findings
            await self._thought(
                f"Audit {audit_id} complete - {len(verified_findings)} verified finding(s)."
            )
            await self._action(
                f"REPORT - {len(verified_findings)} finding(s) ready. "
                "Call get_findings to retrieve the structured SecurityReport."
            )
        except Exception as exc:
            logger.exception("Audit %s failed", audit_id)
            await self._action(f"Audit error: {exc}")
        finally:
            complete_event.set()

    def get_findings(self) -> List[Dict[str, Any]]:
        """Return the last completed audit findings (SecurityReport schema)."""
        return self._findings

    async def wait_for_audit(self, audit_id: str, timeout: float = 300.0) -> bool:
        """Block until the audit completes or timeout expires."""
        event = self._audit_complete.get(audit_id)
        if event is None:
            return False
        try:
            await asyncio.wait_for(event.wait(), timeout=timeout)
            return True
        except asyncio.TimeoutError:
            return False


# ---------------------------------------------------------------------------
# JSON-RPC 2.0 STDIO HANDLER
# ---------------------------------------------------------------------------

class MCPHandler:
    """
    Reads JSON-RPC 2.0 requests from stdin, dispatches to the engine,
    writes responses to stdout.

    Supported methods:
      initialize              - MCP handshake
      start_autonomous_audit  - launch OODA audit (returns immediately, streams tokens)
      get_findings            - retrieve SecurityReport-compatible findings JSON
    """

    def __init__(self) -> None:
        self.engine: Optional[AutonomousAuditEngine] = None

    def _write(self, obj: Dict[str, Any]) -> None:
        sys.stdout.write(json.dumps(obj) + "\n")
        sys.stdout.flush()

    async def handle_request(self, line: str) -> None:
        try:
            data = json.loads(line)
        except json.JSONDecodeError:
            logger.error("Invalid JSON on stdin: %s", line[:120])
            return

        method: str = data.get("method", "")
        params: Dict[str, Any] = data.get("params", {})
        req_id = data.get("id")

        try:
            if method == "initialize":
                self._write({
                    "jsonrpc": "2.0",
                    "result": {
                        "protocolVersion": "2024-11-05",
                        "capabilities": {
                            "methods": [
                                "initialize",
                                "start_autonomous_audit",
                                "get_findings",
                            ]
                        },
                        "serverInfo": {
                            "name": "shadow-aegis-mcp",
                            "version": "1.0.0",
                        },
                    },
                    "id": req_id,
                })

            elif method == "start_autonomous_audit":
                api_keys: Dict[str, str] = params.get("api_keys", {})
                repo_map: Dict[str, Any] = params.get("repo_map", {})

                if self.engine is None:
                    self.engine = AutonomousAuditEngine(api_keys)

                audit_id = str(uuid.uuid4())
                asyncio.create_task(
                    self.engine.start_autonomous_audit(repo_map, audit_id)
                )

                self._write({
                    "jsonrpc": "2.0",
                    "result": {"audit_id": audit_id, "status": "started"},
                    "id": req_id,
                })

            elif method == "get_findings":
                if self.engine is None:
                    self._write({
                        "jsonrpc": "2.0",
                        "error": {
                            "code": -32000,
                            "message": "No audit has been started yet.",
                        },
                        "id": req_id,
                    })
                    return

                self._write({
                    "jsonrpc": "2.0",
                    "result": {"findings": self.engine.get_findings()},
                    "id": req_id,
                })

            else:
                self._write({
                    "jsonrpc": "2.0",
                    "error": {
                        "code": -32601,
                        "message": f"Method not found: {method}",
                    },
                    "id": req_id,
                })

        except Exception as exc:
            logger.exception("Error handling method %s", method)
            self._write({
                "jsonrpc": "2.0",
                "error": {"code": -32603, "message": str(exc)},
                "id": req_id,
            })

    async def run_loop(self) -> None:
        """
        Non-blocking stdin reader.
        Uses run_in_executor so it works on Windows (no asyncio.StreamReader on win32).
        """
        logger.info("Shadow Aegis MCP Server ready - listening on stdin")
        loop = asyncio.get_event_loop()
        while True:
            line: str = await loop.run_in_executor(None, sys.stdin.readline)
            if not line:
                logger.info("stdin closed - shutting down")
                break
            line = line.strip()
            if line:
                await self.handle_request(line)


if __name__ == "__main__":
    handler = MCPHandler()
    try:
        asyncio.run(handler.run_loop())
    except KeyboardInterrupt:
        logger.info("MCP Server interrupted")
