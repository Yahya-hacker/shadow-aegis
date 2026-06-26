# aegis/__init__.py
"""
Aegis AI - Autonomous Penetration Testing Agent

Lazy-loading package init.
Direct submodule imports (e.g. `from aegis.llm import get_llm`) work without
triggering the full dependency chain, so the MCP bridge can import individual
components even when optional deps (aiohttp, networkx, etc.) are not installed.
"""

from __future__ import annotations

__version__ = "2.0.0"

__all__ = [
    # Core
    "AegisOmega",
    "get_agent",
    "LLMEngine",
    "get_llm",
    "AppState",
    "get_app_state",
    "OperationMode",
    "MissionConfig",
    # Omega Protocol
    "KnowledgeGraph",
    "get_knowledge_graph",
    "NodeType",
    "EdgeType",
    "EpistemicPriorityManager",
    "get_epistemic_manager",
    "EpistemicMode",
    "AdversarialSwarm",
    "get_adversarial_swarm",
    "SwarmPersona",
    "VirtualSandbox",
    "get_virtual_sandbox",
    "HiveMind",
    "get_hive_mind",
    "OmegaProtocol",
    "get_omega_protocol",
]


def __getattr__(name: str):
    """Lazy-load any public symbol on first access."""
    _module_map = {
        "AegisOmega":              ("aegis.agent",             "AegisOmega"),
        "get_agent":               ("aegis.agent",             "get_agent"),
        "LLMEngine":               ("aegis.llm",               "LLMEngine"),
        "get_llm":                 ("aegis.llm",               "get_llm"),
        "AppState":                ("aegis.state",             "AppState"),
        "get_app_state":           ("aegis.state",             "get_app_state"),
        "OperationMode":           ("aegis.state",             "OperationMode"),
        "MissionConfig":           ("aegis.state",             "MissionConfig"),
        "KnowledgeGraph":          ("aegis.knowledge_graph",   "KnowledgeGraph"),
        "get_knowledge_graph":     ("aegis.knowledge_graph",   "get_knowledge_graph"),
        "NodeType":                ("aegis.knowledge_graph",   "NodeType"),
        "EdgeType":                ("aegis.knowledge_graph",   "EdgeType"),
        "EpistemicPriorityManager":("aegis.epistemic_priority","EpistemicPriorityManager"),
        "get_epistemic_manager":   ("aegis.epistemic_priority","get_epistemic_manager"),
        "EpistemicMode":           ("aegis.epistemic_priority","EpistemicMode"),
        "AdversarialSwarm":        ("aegis.adversarial_swarm", "AdversarialSwarm"),
        "get_adversarial_swarm":   ("aegis.adversarial_swarm", "get_adversarial_swarm"),
        "SwarmPersona":            ("aegis.adversarial_swarm", "SwarmPersona"),
        "VirtualSandbox":          ("aegis.virtual_sandbox",   "VirtualSandbox"),
        "get_virtual_sandbox":     ("aegis.virtual_sandbox",   "get_virtual_sandbox"),
        "HiveMind":                ("aegis.hive_mind",         "HiveMind"),
        "get_hive_mind":           ("aegis.hive_mind",         "get_hive_mind"),
        "OmegaProtocol":           ("aegis.omega_protocol",    "OmegaProtocol"),
        "get_omega_protocol":      ("aegis.omega_protocol",    "get_omega_protocol"),
    }
    if name in _module_map:
        import importlib
        mod_name, attr = _module_map[name]
        mod = importlib.import_module(mod_name)
        return getattr(mod, attr)
    raise AttributeError(f"module 'aegis' has no attribute {name!r}")
