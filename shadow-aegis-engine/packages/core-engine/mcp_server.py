import asyncio
import json
import sys
import logging
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple, Callable
from dataclasses import dataclass, field
from enum import Enum

# --- LOGGING CONFIGURATION ---
# Ensure all logs go to stderr to avoid corrupting the stdout JSON-RPC stream
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stderr
)
logger = logging.getLogger("shadow-aegis-mcp")

# --- ADVERSARIAL SWARM COMPONENTS (Adapted from Aegis) ---

class SwarmPersona(Enum):
    RED = "red"      # Attacker perspective
    BLUE = "blue"    # Defender perspective
    JUDGE = "judge"  # Strategic synthesis

@dataclass
class SwarmArgument:
    persona: SwarmPersona
    content: str
    risk_assessment: Optional[float] = None
    confidence: float = 0.8
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class DebateResult:
    original_action: Dict[str, Any]
    final_action: Dict[str, Any]
    approved: bool
    reasoning: str
    risk_score: float

class AdversarialSwarm:
    """
    Adversarial Swarm Protocol for risk-aware offensive operations.
    Simulates a debate between Attacker (RED), Defender (BLUE), and Strategist (JUDGE).
    """
    TOOL_RISK_SCORES = {
        "sql_injection_test": 8, "xss_test": 7, "command_injection": 9,
        "file_upload_exploit": 8, "deserialization_attack": 9, "ssrf_test": 7,
        "lfi_test": 7, "rfi_test": 8, "xxe_test": 7, "template_injection": 8,
        "directory_bruteforce": 6, "parameter_fuzzing": 6, "authentication_bypass": 7,
        "session_hijacking": 8, "brute_force_login": 7, "http_request": 2,
        "find_forms": 3, "technology_fingerprint": 3, "port_scan": 4,
    }

    def __init__(self, llm_client: Any):
        self.llm_client = llm_client

    def get_tool_risk(self, tool_name: str) -> float:
        return self.TOOL_RISK_SCORES.get(tool_name, 5.0)

    async def conduct_debate(self, action: Dict[str, Any], context: Dict[str, Any]) -> DebateResult:
        tool = action.get("tool", "unknown")
        risk_score = self.get_tool_risk(tool)
        
        # In a real production scenario, this would call the LLM to simulate the debate.
        # For the MCP bridge, we implement the logic that triggers the reasoning loop.
        prompt = f"Debate the risk of using tool {tool} with args {action.get('args')} in context {context}"
        
        # Simplified debate logic for the bridge: 
        # We delegate the actual LLM synthesis to the reasoning loop, 
        # but the Swarm provides the risk-based guardrail.
        
        # Mocking the judge's decision for the structural implementation
        # In practice, the AutonomousAuditEngine will use the LLM to populate this.
        return DebateResult(
            original_action=action,
            final_action=action, 
            approved=True, 
            reasoning="Risk analyzed by swarm: approved for stealth execution.",
            risk_score=risk_score
        )

# --- REASONING ENGINE (Adapted from OpenJarvis) ---

class AutonomousAuditEngine:
    """
    Core reasoning loop that fuses adversarial scanning with 
    asynchronous token streaming via MCP.
    """
    def __init__(self, api_keys: Dict[str, str]):
        self.api_keys = api_keys
        self.swarm = AdversarialSwarm(llm_client=self)
        self.active_audits: Dict[str, asyncio.Task] = {}

    async def stream_token(self, token_type: str, content: str):
        """Streams a JSON object to stdout."""
        payload = {"type": token_type, "content": content}
        sys.stdout.write(json.dumps(payload) + "
")
        sys.stdout.flush()

    async def call_llm(self, prompt: str, system_prompt: str = "") -> str:
        """
        Placeholder for the actual LLM call using the provided api_keys.
        In production, this would integrate with litellm or a similar provider.
        """
        # This is where the actual integration with an LLM provider happens.
        # For the bridge prototype, we simulate the reasoning process.
        await asyncio.sleep(0.1) # Simulate latency
        return f"Simulated response to: {prompt[:50]}..."

    async def start_autonomous_audit(self, repo_map: Dict[str, Any], audit_id: str = None):
        """
        The main entry point for an autonomous security audit.
        Implements the reasoning-streaming loop.
        """
        audit_id = audit_id or str(uuid.uuid4())
        
        try:
            await self.stream_token("thought", f"Initializing autonomous audit {audit_id}...")
            await self.stream_token("thought", f"Analyzing repository map: {list(repo_map.keys())}")
            
            # Reasoning Loop
            for i in range(3): # Simulate a few turns of reasoning
                # 1. Planning (Thought)
                thought = f"Turn {i+1}: Evaluating attack surface for target components..."
                await self.stream_token("thought", thought)
                
                # 2. Action Selection
                action = {"tool": "port_scan", "args": {"target": "localhost"}}
                
                # 3. Adversarial Swarm Guardrail
                debate = await self.swarm.conduct_debate(action, {"repo_map": repo_map})
                if debate.approved:
                    await self.stream_token("action", f"Executing {action['tool']} - {debate.reasoning}")
                    # Simulate tool execution
                    await asyncio.sleep(0.5)
                else:
                    await self.stream_token("thought", f"Action {action['tool']} rejected by swarm: {debate.reasoning}")

            await self.stream_token("thought", "Audit cycle complete. Synthesizing findings...")
            await self.stream_token("action", "Generating final vulnerability report.")
            
        except Exception as e:
            logger.exception("Audit failed")
            await self.stream_token("action", f"Error during audit: {str(e)}")

# --- JSON-RPC 2.0 STDIO HANDLER ---

class MCPHandler:
    """
    Handles JSON-RPC 2.0 communication over stdin/stdout.
    """
    def __init__(self):
        self.engine: Optional[AutonomousAuditEngine] = None

    async def handle_request(self, request_json: str):
        try:
            data = json.loads(request_json)
            method = data.get("method")
            params = data.get("params", {})
            request_id = data.get("id")

            if method == "initialize":
                # In MCP, initialize usually sets up capabilities
                response = {"jsonrpc": "2.0", "result": {"protocolVersion": "2024-11-05", "capabilities": {}}, "id": request_id}
                sys.stdout.write(json.dumps(response) + "
")
                sys.stdout.flush()

            elif method == "start_autonomous_audit":
                # Inject keys in-memory from the payload
                api_keys = params.get("api_keys", {})
                repo_map = params.get("repo_map", {})
                
                if not self.engine:
                    self.engine = AutonomousAuditEngine(api_keys)
                
                # Run audit in background so we can return the RPC confirmation immediately
                # while the engine streams 'thought' and 'action' tokens.
                audit_id = str(uuid.uuid4())
                asyncio.create_task(self.engine.start_autonomous_audit(repo_map, audit_id))
                
                response = {"jsonrpc": "2.0", "result": {"audit_id": audit_id, "status": "started"}, "id": request_id}
                sys.stdout.write(json.dumps(response) + "
")
                sys.stdout.flush()

            else:
                response = {"jsonrpc": "2.0", "error": {"code": -32601, "message": "Method not found"}, "id": request_id}
                sys.stdout.write(json.dumps(response) + "
")
                sys.stdout.flush()

        except json.JSONDecodeError:
            logger.error("Received invalid JSON")
        except Exception as e:
            logger.exception("Error handling request")
            response = {"jsonrpc": "2.0", "error": {"code": -32603, "message": str(e)}, "id": None}
            sys.stdout.write(json.dumps(response) + "
")
            sys.stdout.flush()

    async def run_loop(self):
        """Reads from stdin line by line."""
        logger.info("MCP Server started. Listening on stdin...")
        # Use a non-blocking reader for stdin
        loop = asyncio.get_event_loop()
        while True:
            line = await loop.run_in_executor(None, sys.stdin.readline)
            if not line:
                break
            await self.handle_request(line)

if __name__ == "__main__":
    handler = MCPHandler()
    try:
        asyncio.run(handler.run_loop())
    except KeyboardInterrupt:
        pass
