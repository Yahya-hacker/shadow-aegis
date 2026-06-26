import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Static, Text, useApp } from 'ink';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import TextInput from 'ink-text-input';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { useEffect, useRef, useState } from 'react';
import { AgentSession } from '../core/agent.js';
import { enforceLicenseGate } from '../core/policy/license-guard.js';
import { buildDiffScopeHint, getChangedFiles } from '../core/tools/git-diff.js';
import { AsciiMotionCli } from '../utils/ascii-motion-cli.js';
import { loadConfig, registerSecretStoreAdapter, saveConfig } from '../utils/config.js';
import { KeychainAdapter } from '../utils/keychain.js';
import { generateRepoMap } from '../utils/repo-map.js';
import { getModelPlaceholder } from '../utils/setup.js';
const MAX_ACTIVITY_EVENTS = 40;
function formatActivityLine(event) {
    const timestamp = new Date(event.timestamp).toLocaleTimeString();
    const toolSuffix = event.toolName ? ` [${event.toolName}]` : '';
    switch (event.kind) {
        case 'tool_call': {
            return `${timestamp} ▶ ${event.message}${toolSuffix}`;
        }
        case 'tool_result': {
            return `${timestamp} ✓ ${event.message}${toolSuffix}`;
        }
        default: {
            return `${timestamp} • ${event.message}${toolSuffix}`;
        }
    }
}
const ActivityStreamPanel = ({ activityEvents, isProcessing, }) => (_jsxs(Box, { borderColor: "blue", borderStyle: "round", flexDirection: "column", marginBottom: 1, paddingX: 1, children: [_jsx(Text, { bold: true, color: "blue", children: "Live Activity Stream" }), activityEvents.length === 0 && isProcessing && (_jsx(Text, { color: "gray", children: "Waiting for first tool or status event..." })), activityEvents.slice(-8).map((event) => (_jsx(Text, { color: "gray", children: event.text }, event.id)))] }));
const providerOptions = [
    { label: 'Anthropic (Claude)', value: 'anthropic' },
    { label: 'OpenAI (GPT-4o, o1, o3)', value: 'openai' },
    { label: 'Google (Gemini)', value: 'google' },
    { label: 'Mistral', value: 'mistral' },
    { label: 'Ollama (Local)', value: 'ollama' },
    { label: 'Custom (OpenAI-Compatible)', value: 'custom' },
];
// =============================================================================
// License Paywall Component
// =============================================================================
const LicensePaywall = ({ gateResult, onRetry }) => (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsxs(Box, { borderColor: "yellow", borderStyle: "round", flexDirection: "column", paddingX: 2, paddingY: 1, children: [_jsx(Text, { bold: true, color: "yellow", children: "\u26A1 PRO FEATURE" }), _jsx(Box, { marginTop: 1, children: _jsxs(Text, { children: ["The feature ", _jsx(Text, { bold: true, color: "cyan", children: gateResult.feature }), " requires a", ' ', _jsx(Text, { bold: true, color: "magenta", children: gateResult.requiredTier?.toUpperCase() }), " license."] }) }), _jsx(Box, { marginTop: 1, children: _jsxs(Text, { color: "gray", children: ["Your current tier: ", _jsx(Text, { bold: true, children: gateResult.currentTier?.toUpperCase() ?? 'FREE' })] }) })] }), _jsxs(Box, { flexDirection: "column", marginTop: 1, paddingX: 1, children: [_jsx(Text, { bold: true, color: "green", children: "\uD83D\uDD11 Upgrade to unlock:" }), _jsx(Text, { color: "gray", children: "  \u2022 Deep SAST analysis with full taint tracing" }), _jsx(Text, { color: "gray", children: "  \u2022 Comprehensive PDF/Markdown security reports" }), _jsx(Text, { color: "gray", children: "  \u2022 CI/CD integration with exit codes" }), _jsx(Text, { color: "gray", children: "  \u2022 Priority support" })] }), _jsx(Box, { marginTop: 1, paddingX: 1, children: _jsxs(Text, { children: ["\uD83D\uDC49 ", _jsx(Text, { bold: true, color: "cyan", underline: true, children: gateResult.upgradeUrl })] }) }), _jsx(Box, { marginTop: 1, paddingX: 1, children: _jsxs(Text, { color: "gray", dimColor: true, children: ["Already purchased? Run ", _jsx(Text, { bold: true, children: "shadow-auditor --reconfigure" }), " to enter your license key."] }) })] }));
const App = ({ ciEnabled, diffEnabled, expertUnsafe, failOn, forceReconfigure, mode, since, }) => {
    const [appState, setAppState] = useState('booting');
    const [config, setConfig] = useState(null);
    const [targetPath, setTargetPath] = useState('');
    const [licenseGateResult, setLicenseGateResult] = useState(null);
    // Setup Wizard State
    const [setupData, setSetupData] = useState({});
    const [setupInput, setSetupInput] = useState('');
    // Custom Path Input
    const [useCurrentDir, setUseCurrentDir] = useState(true);
    const [customPathInput, setCustomPathInput] = useState('');
    const [pathError, setPathError] = useState('');
    // Shell State
    const [messages, setMessages] = useState([]);
    const [activeMessage, setActiveMessage] = useState(null);
    const [input, setInput] = useState('');
    const [agentSession, setAgentSession] = useState(null);
    const [activityEvents, setActivityEvents] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const activityEventCounter = useRef(0);
    const keychainRegistered = useRef(false);
    useEffect(() => {
        // Config Load Effect
        const checkConfig = async () => {
            const cfg = forceReconfigure ? null : await loadConfig();
            if (cfg) {
                setConfig(cfg);
                setAppState('targetSelection');
            }
            else {
                setAppState('setup-provider');
            }
        };
        if (appState === 'setup') {
            checkConfig();
        }
    }, [appState, forceReconfigure]);
    const handleProviderSelect = (item) => {
        setSetupData({ ...setupData, provider: item.value });
        if (item.value === 'custom') {
            setAppState('setup-baseurl');
        }
        else {
            setAppState('setup-model');
        }
    };
    const handleBaseUrlInput = (value) => {
        setSetupData({ ...setupData, customBaseUrl: value });
        setSetupInput('');
        setAppState('setup-model');
    };
    const handleModelInput = async (value) => {
        const updated = { ...setupData, model: value };
        setSetupData(updated);
        setSetupInput('');
        if (updated.provider === 'ollama') {
            const finalConfig = { ...updated, apiKey: '' };
            await saveConfig(finalConfig);
            setConfig(finalConfig);
            setAppState('targetSelection');
        }
        else {
            setAppState('setup-apikey');
        }
    };
    const handleApiKeyInput = async (value) => {
        const finalConfig = { ...setupData, apiKey: value };
        await saveConfig(finalConfig);
        setConfig(finalConfig);
        setSetupInput('');
        setAppState('setup-license');
    };
    const handleLicenseKeyInput = async (value) => {
        if (value.trim()) {
            const updatedConfig = { ...config, licenseKey: value.trim() };
            await saveConfig(updatedConfig);
            setConfig(updatedConfig);
        }
        setSetupInput('');
        setAppState('targetSelection');
    };
    useEffect(() => {
        // Register KeychainAdapter once at boot
        if (!keychainRegistered.current) {
            keychainRegistered.current = true;
            registerSecretStoreAdapter(new KeychainAdapter());
        }
        if (appState === 'booting') {
            // The animation has ~1 frame taking 83.3ms, we loop false
            // Give it 1.5s then jump to next state
            const timer = setTimeout(() => {
                setAppState('setup');
            }, 1500);
            return () => clearTimeout(timer);
        }
        if (appState === 'initializing' && targetPath && config) {
            const initSession = async () => {
                try {
                    // Build effective config with CLI flag overrides
                    const effectiveConfig = {
                        ...config,
                        ...(mode ? { auditMode: mode } : {}),
                        ...(ciEnabled ? { ci: { enabled: true, failOn: (failOn ?? 'high') } } : {}),
                        ...(diffEnabled ? { diff: { baseRef: since ?? 'HEAD~1', enabled: true } } : {}),
                    };
                    // License gate check
                    const gateResult = await enforceLicenseGate(effectiveConfig);
                    if (!gateResult.allowed) {
                        setLicenseGateResult(gateResult);
                        setAppState('license-blocked');
                        return;
                    }
                    const map = await generateRepoMap(targetPath);
                    // Build diff scope hint for incremental mode
                    let diffScopeHint;
                    if (diffEnabled) {
                        const changedFiles = await getChangedFiles({
                            baseRef: since ?? 'HEAD~1',
                            cwd: targetPath,
                        });
                        diffScopeHint = buildDiffScopeHint(changedFiles) || undefined;
                    }
                    const session = new AgentSession(effectiveConfig, map, targetPath, {
                        diffScopeHint,
                        expertUnsafe,
                    });
                    setAgentSession(session);
                    setAppState('shell');
                }
                catch (error) {
                    setMessages([{
                            id: 'init-error',
                            role: 'error',
                            text: `Failed to initialize: ${error.message}`
                        }]);
                    setAppState('shell'); // Go to shell to show error
                }
            };
            initSession();
        }
    }, [appState, targetPath, config, expertUnsafe, mode, ciEnabled, failOn, diffEnabled, since]);
    const handlePathSubmit = async (p) => {
        try {
            const resolved = path.resolve(p);
            const stat = await fs.stat(resolved);
            if (!stat.isDirectory()) {
                setPathError('Target path is not a directory.');
                return;
            }
            setTargetPath(resolved);
            setAppState('initializing');
        }
        catch {
            setPathError('Target path does not exist.');
        }
    };
    const handleUseCurrentDirSubmit = (value) => {
        if (value.toLowerCase() === 'y' || value.toLowerCase() === 'yes' || value === '') {
            handlePathSubmit(process.cwd());
        }
        else {
            setUseCurrentDir(false);
            setCustomPathInput(''); // clear the "n" typed
        }
    };
    const { exit } = useApp();
    const handleCommandSubmit = async (command) => {
        if (!command.trim() || isProcessing)
            return;
        if ([':q', ':quit', 'exit', 'quit'].includes(command.trim().toLowerCase())) {
            exit();
            return;
        }
        const newMsgId = Date.now().toString();
        const userMsg = { id: `u-${newMsgId}`, role: 'user', text: command };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        if (!agentSession) {
            setMessages(prev => [...prev, { id: `e-${newMsgId}`, role: 'error', text: 'Agent session not initialized.' }]);
            return;
        }
        setIsProcessing(true);
        setActivityEvents([]);
        const agentMsgId = `a-${newMsgId}`;
        setActiveMessage({ id: agentMsgId, role: 'agent', text: '' });
        try {
            let finalResponse = '';
            await agentSession.sendMessage(command, (chunk) => {
                finalResponse += chunk;
                setActiveMessage({ id: agentMsgId, role: 'agent', text: finalResponse });
            }, (event) => {
                const line = formatActivityLine(event);
                activityEventCounter.current += 1;
                setActivityEvents((prev) => [
                    ...prev,
                    {
                        id: `activity-${activityEventCounter.current}`,
                        text: line,
                    },
                ].slice(-MAX_ACTIVITY_EVENTS));
            });
            setMessages(prev => [...prev, { id: agentMsgId, role: 'agent', text: finalResponse }]);
            setActiveMessage(null);
        }
        catch (error) {
            const errMsg = error.message;
            if (errMsg.includes('API key') || errMsg.includes('401') || errMsg.includes('authentication')) {
                setMessages(prev => [...prev, { id: `e-${Date.now()}`, role: 'error', text: 'Authentication failed. Run again with --reconfigure.' }]);
            }
            else {
                setMessages(prev => [...prev, { id: `e-${Date.now()}`, role: 'error', text: `Error: ${errMsg}` }]);
            }
            setActiveMessage(null);
        }
        finally {
            setIsProcessing(false);
        }
    };
    const rows = process.stdout.rows || 24;
    const columns = process.stdout.columns || 80;
    return (_jsxs(Box, { flexDirection: "column", minHeight: rows, width: columns, children: [appState === 'booting' && (_jsxs(Box, { alignItems: "center", flexDirection: "column", height: "100%", justifyContent: "center", children: [_jsx(AsciiMotionCli, { autoPlay: true, loop: false }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "cyan", children: "Booting Shadow Auditor..." }) })] })), appState === 'setup' && (_jsx(Text, { children: "Loading configuration..." })), appState === 'setup-provider' && (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { bold: true, color: "cyan", children: "\uD83D\uDD13 SHADOW AUDITOR :: Configuration Wizard" }) }), _jsx(Box, { marginBottom: 1, children: _jsx(Text, { children: "Select your LLM provider:" }) }), _jsx(SelectInput, { items: providerOptions, onSelect: handleProviderSelect })] })), appState === 'setup-baseurl' && (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { bold: true, color: "cyan", children: "\uD83D\uDD13 SHADOW AUDITOR :: Configuration Wizard" }) }), _jsx(Box, { marginBottom: 1, children: _jsx(Text, { children: "Enter your custom API base URL:" }) }), _jsxs(Box, { children: [_jsx(Text, { color: "gray", children: "\u276F " }), _jsx(TextInput, { onChange: setSetupInput, onSubmit: handleBaseUrlInput, placeholder: "https://api.your-provider.com/v1", value: setupInput })] })] })), appState === 'setup-model' && (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { bold: true, color: "cyan", children: "\uD83D\uDD13 SHADOW AUDITOR :: Configuration Wizard" }) }), _jsx(Box, { marginBottom: 1, children: _jsx(Text, { children: "Enter the model name:" }) }), _jsxs(Box, { children: [_jsx(Text, { color: "gray", children: "\u276F " }), _jsx(TextInput, { onChange: setSetupInput, onSubmit: handleModelInput, placeholder: getModelPlaceholder(setupData.provider || ''), value: setupInput })] })] })), appState === 'setup-apikey' && (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { bold: true, color: "cyan", children: "\uD83D\uDD13 SHADOW AUDITOR :: Configuration Wizard" }) }), _jsx(Box, { marginBottom: 1, children: _jsx(Text, { children: "Enter your API key:" }) }), _jsxs(Box, { children: [_jsx(Text, { color: "gray", children: "\u276F " }), _jsx(TextInput, { mask: "*", onChange: setSetupInput, onSubmit: handleApiKeyInput, value: setupInput })] })] })), appState === 'setup-license' && (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { bold: true, color: "cyan", children: "\uD83D\uDD13 SHADOW AUDITOR :: Configuration Wizard" }) }), _jsx(Box, { marginBottom: 1, children: _jsxs(Text, { children: ["Enter your license key ", _jsx(Text, { color: "gray", children: "(press Enter to skip \u2014 free tier)" }), ":"] }) }), _jsxs(Box, { children: [_jsx(Text, { color: "gray", children: "\u276F " }), _jsx(TextInput, { onChange: setSetupInput, onSubmit: handleLicenseKeyInput, placeholder: "SA-XXXX-XXXX-XXXX-XXXX", value: setupInput })] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "gray", dimColor: true, children: "Get a license at: https://polar.sh/Yahya-hacker/shadow-auditor" }) })] })), appState === 'license-blocked' && licenseGateResult && (_jsx(LicensePaywall, { gateResult: licenseGateResult, onRetry: () => setAppState('setup-license') })), appState === 'targetSelection' && (_jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { borderColor: "cyan", borderStyle: "round", paddingX: 2, paddingY: 1, children: _jsx(Text, { bold: true, color: "cyan", children: "Shadow Auditor Target Selection" }) }), _jsx(Box, { flexDirection: "column", marginTop: 1, children: useCurrentDir ? (_jsxs(Box, { children: [_jsx(Text, { color: "yellow", children: "Use current directory (" }), _jsx(Text, { bold: true, children: process.cwd() }), _jsx(Text, { color: "yellow", children: ") for the audit? [Y/n] " }), _jsx(TextInput, { onChange: setCustomPathInput, onSubmit: handleUseCurrentDirSubmit, value: customPathInput })] })) : (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Box, { children: [_jsx(Text, { color: "yellow", children: "Enter target directory: " }), _jsx(TextInput, { onChange: setCustomPathInput, onSubmit: handlePathSubmit, value: customPathInput })] }), pathError && _jsx(Text, { color: "red", children: pathError })] })) })] })), appState === 'initializing' && (_jsx(Box, { flexDirection: "column", padding: 1, children: _jsxs(Text, { color: "cyan", children: [_jsx(Spinner, { type: "dots" }), " Parsing AST with tree-sitter & initializing agent..."] }) })), appState === 'shell' && (_jsxs(Box, { flexDirection: "column", height: "100%", children: [_jsxs(Box, { borderColor: "magenta", borderStyle: "round", flexDirection: "column", paddingX: 2, paddingY: 1, children: [_jsx(Text, { bold: true, color: "magenta", children: "Shadow Auditor" }), _jsx(Text, { color: "gray", children: "Interactive Security Analysis Shell" }), _jsx(Text, { color: "yellow", children: "Tip: Type a command to start investigating the codebase." })] }), _jsxs(Box, { marginBottom: 1, paddingX: 1, children: [_jsx(Text, { color: "blue", children: "\u25CF Environment loaded: " }), _jsxs(Text, { color: "white", children: ["Provider: ", config?.provider, " | Model: ", config?.model, " | Target: ", path.basename(targetPath), expertUnsafe ? ' | Mode: EXPERT-UNSAFE' : ''] })] }), _jsx(Static, { items: messages, children: (msg) => (_jsx(Box, { flexDirection: "column", marginBottom: 1, children: _jsxs(Text, { color: msg.role === 'user' ? 'green' : msg.role === 'error' ? 'red' : 'cyan', children: [msg.role === 'user' ? '❯ ' : msg.role === 'error' ? '✖ ' : '● ', msg.text] }) }, msg.id)) }), _jsxs(Box, { flexDirection: "column", marginTop: 1, children: [(isProcessing || activityEvents.length > 0) && (_jsx(ActivityStreamPanel, { activityEvents: activityEvents, isProcessing: isProcessing })), activeMessage && (_jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsx(Text, { color: "cyan", children: "\u25CF Streaming response" }), _jsx(Text, { color: "cyan", children: activeMessage.text })] })), _jsx(Box, { children: _jsxs(Text, { color: "green", children: [targetPath, " [\u2713] "] }) }), _jsxs(Box, { children: [_jsx(Text, { bold: true, color: "magenta", children: "\u276F " }), isProcessing ? (_jsxs(Text, { color: "cyan", children: [_jsx(Spinner, { type: "dots" }), " Agent is thinking..."] })) : (_jsx(TextInput, { onChange: setInput, onSubmit: handleCommandSubmit, placeholder: "Describe a task or ask a question to get started...", value: input }))] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "gray", dimColor: true, children: "Type 'exit' or Ctrl+C to leave the shell." }) })] })] }))] }));
};
export default App;
