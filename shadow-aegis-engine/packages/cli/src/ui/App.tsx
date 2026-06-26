import { Box, Static, Text, useApp, useStdout } from 'ink';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import TextInput from 'ink-text-input';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import React, { useEffect, useRef, useState } from 'react';

import { AgentSession, type AgentStreamEvent } from '../core/agent.js';
import { enforceLicenseGate, type LicenseGateResult } from '../core/policy/license-guard.js';
import { buildDiffScopeHint, getChangedFiles } from '../core/tools/git-diff.js';
import { AsciiMotionCli } from '../utils/ascii-motion-cli.js';
import { loadConfig, registerSecretStoreAdapter, saveConfig, ShadowConfig } from '../utils/config.js';
import { KeychainAdapter } from '../utils/keychain.js';
import { generateRepoMap } from '../utils/repo-map.js';
import { getModelPlaceholder } from '../utils/setup.js';

// =============================================================================
// TYPES
// =============================================================================

type AppState =
  | 'booting'
  | 'initializing'
  | 'license-blocked'
  | 'setup'
  | 'setup-apikey'
  | 'setup-baseurl'
  | 'setup-license'
  | 'setup-model'
  | 'setup-provider'
  | 'shell'
  | 'targetSelection';

type MessageRole = 'agent' | 'error' | 'system' | 'user';

type Message = {
  id: string;
  role: MessageRole;
  text: string;
};

type ActivityEventLine = {
  id: string;
  kind: AgentStreamEvent['kind'];
  text: string;
};

const MAX_ACTIVITY_EVENTS = 12;

// =============================================================================
// HELPERS
// =============================================================================

function formatActivityLine(event: AgentStreamEvent): string {
  const ts = new Date(event.timestamp).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const tool = event.toolName ? ` [${event.toolName}]` : '';

  switch (event.kind) {
    case 'mcp_thought': return `${ts} \u{1F4AD} ${event.message}`;
    case 'mcp_action':  return `${ts} \u26A1 ${event.message}`;
    case 'tool_call':   return `${ts} \u25B6 ${event.message}${tool}`;
    case 'tool_result': return `${ts} \u2713 ${event.message}${tool}`;
    default:            return `${ts} \u2022 ${event.message}${tool}`;
  }
}

function eventColor(kind: AgentStreamEvent['kind']): string {
  switch (kind) {
    case 'mcp_thought': return 'gray';
    case 'mcp_action':  return 'cyan';
    case 'tool_call':   return 'yellow';
    case 'tool_result': return 'green';
    default:            return 'white';
  }
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

// -- Header / Status Bar ------------------------------------------------------

const HeaderBar = ({
  config,
  expertUnsafe,
  targetPath,
}: {
  config: ShadowConfig;
  expertUnsafe: boolean;
  targetPath: string;
}) => (
  <Box flexDirection="column">
    <Box
      borderColor="magenta"
      borderStyle="round"
      flexDirection="row"
      justifyContent="space-between"
      paddingX={2}
      paddingY={0}
    >
      <Text bold color="magenta">
        {'\u25C8'} SHADOW AUDITOR
      </Text>
      <Text color="gray" dimColor>
        Interactive Security Analysis Shell
      </Text>
    </Box>
    <Box paddingX={2} paddingY={0}>
      <Text color="blue">{'\u25CF'} </Text>
      <Text color="gray">
        {config.provider}/{config.model}
        {'  '}
      </Text>
      <Text color="white">{'\u2302'} {path.basename(targetPath)}</Text>
      {expertUnsafe && <Text color="red">  {'\u26A0'} EXPERT-UNSAFE</Text>}
    </Box>
  </Box>
);

// -- Message History (Static -- never re-renders) -----------------------------

const MessageHistory = ({ messages }: { messages: Message[] }) => (
  <Static items={messages}>
    {(msg) => {
      const prefix =
        msg.role === 'user'   ? '\u276F ' :
        msg.role === 'error'  ? '\u2716 ' :
        msg.role === 'system' ? '\u25C8 ' : '\u25CF ';
      const color =
        msg.role === 'user'   ? 'green' :
        msg.role === 'error'  ? 'red'   :
        msg.role === 'system' ? 'gray'  : 'cyan';
      return (
        <Box flexDirection="column" key={msg.id} marginBottom={1} paddingX={1}>
          <Text bold color={color}>
            {prefix}
            {msg.text}
          </Text>
        </Box>
      );
    }}
  </Static>
);

// -- Live Activity Stream Panel -----------------------------------------------

const ActivityStreamPanel = ({
  activityEvents,
  isProcessing,
}: {
  activityEvents: ActivityEventLine[];
  isProcessing: boolean;
}) => {
  const visible = activityEvents.slice(-MAX_ACTIVITY_EVENTS);
  return (
    <Box
      borderColor="blue"
      borderStyle="round"
      flexDirection="column"
      paddingX={1}
      paddingY={0}
    >
      <Box flexDirection="row" justifyContent="space-between">
        <Text bold color="blue">
          {'\u25C8'} Live Activity Stream
        </Text>
        {isProcessing && (
          <Text color="cyan">
            <Spinner type="dots" />
          </Text>
        )}
      </Box>
      {visible.length === 0 && isProcessing && (
        <Text color="gray" dimColor>
          Waiting for first event...
        </Text>
      )}
      {visible.map((ev) => (
        <Text color={eventColor(ev.kind)} key={ev.id}>
          {ev.text}
        </Text>
      ))}
    </Box>
  );
};

// -- Active Streaming Message Buffer ------------------------------------------

const StreamingBuffer = ({ message }: { message: Message }) => (
  <Box
    borderColor="cyan"
    borderStyle="round"
    flexDirection="column"
    paddingX={1}
    paddingY={0}
  >
    <Text bold color="cyan">
      {'\u25CF'} Streaming response
    </Text>
    <Text color="cyan" wrap="wrap">
      {message.text || '\u2026'}
    </Text>
  </Box>
);

// -- Input Prompt Line --------------------------------------------------------

const InputPrompt = ({
  input,
  isProcessing,
  onChange,
  onSubmit,
  targetPath,
}: {
  input: string;
  isProcessing: boolean;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
  targetPath: string;
}) => (
  <Box flexDirection="column">
    <Box flexDirection="row" paddingX={1}>
      <Text color="green" dimColor>
        {path.basename(targetPath)}
        {' '}
      </Text>
      <Text bold color="magenta">
        {'\u276F'}{' '}
      </Text>
      {isProcessing ? (
        <Text color="cyan">
          <Spinner type="dots" />
          {' '}Agent is thinking...
        </Text>
      ) : (
        <TextInput
          onChange={onChange}
          onSubmit={onSubmit}
          placeholder="Describe a task or ask a security question..."
          value={input}
        />
      )}
    </Box>
    <Box paddingX={1}>
      <Text color="gray" dimColor>
        Type 'exit' or Ctrl+C to quit
      </Text>
    </Box>
  </Box>
);

// -- License Paywall ----------------------------------------------------------

const LicensePaywall = ({
  gateResult,
  onRetry,
}: {
  gateResult: LicenseGateResult;
  onRetry: () => void;
}) => (
  <Box flexDirection="column" padding={1}>
    <Box borderColor="yellow" borderStyle="round" flexDirection="column" paddingX={2} paddingY={1}>
      <Text bold color="yellow">{'\u26A1'} PRO FEATURE</Text>
      <Box marginTop={1}>
        <Text>
          The feature{' '}
          <Text bold color="cyan">
            {gateResult.feature}
          </Text>{' '}
          requires a{' '}
          <Text bold color="magenta">
            {gateResult.requiredTier?.toUpperCase()}
          </Text>{' '}
          license.
        </Text>
      </Box>
      <Box marginTop={1}>
        <Text color="gray">
          Your current tier:{' '}
          <Text bold>{gateResult.currentTier?.toUpperCase() ?? 'FREE'}</Text>
        </Text>
      </Box>
    </Box>
    <Box flexDirection="column" marginTop={1} paddingX={1}>
      <Text bold color="green">{'\uD83D\uDD11'} Upgrade to unlock:</Text>
      <Text color="gray">  {'\u2022'} Deep SAST analysis with full taint tracing</Text>
      <Text color="gray">  {'\u2022'} Comprehensive PDF/Markdown security reports</Text>
      <Text color="gray">  {'\u2022'} CI/CD integration with exit codes</Text>
      <Text color="gray">  {'\u2022'} Priority support</Text>
    </Box>
    <Box marginTop={1} paddingX={1}>
      <Text>
        {'\uD83D\uDC49'}{' '}
        <Text bold color="cyan" underline>
          {gateResult.upgradeUrl}
        </Text>
      </Text>
    </Box>
    <Box marginTop={1} paddingX={1}>
      <Text color="gray" dimColor>
        Already purchased? Run{' '}
        <Text bold>shadow-auditor --reconfigure</Text> to enter your license key.
      </Text>
    </Box>
  </Box>
);

// =============================================================================
// PROVIDER OPTIONS
// =============================================================================

const providerOptions = [
  { label: 'Anthropic (Claude)',         value: 'anthropic' },
  { label: 'OpenAI (GPT-4o, o1, o3)',   value: 'openai'    },
  { label: 'Google (Gemini)',            value: 'google'    },
  { label: 'Mistral',                    value: 'mistral'   },
  { label: 'Ollama (Local)',             value: 'ollama'    },
  { label: 'Custom (OpenAI-Compatible)', value: 'custom'    },
];

// =============================================================================
// MAIN APP
// =============================================================================

const App = ({
  ciEnabled,
  diffEnabled,
  expertUnsafe,
  failOn,
  forceReconfigure,
  mode,
  since,
}: {
  ciEnabled?: boolean;
  diffEnabled?: boolean;
  expertUnsafe: boolean;
  failOn?: string;
  forceReconfigure: boolean;
  mode?: string;
  since?: string;
  // eslint-disable-next-line complexity
}) => {
  // Terminal dimensions via useStdout (reactive to resize)
  const { stdout } = useStdout();
  const rows    = stdout?.rows    ?? 40;
  const columns = stdout?.columns ?? 120;

  // App state
  const [appState, setAppState]                   = useState<AppState>('booting');
  const [config, setConfig]                       = useState<null | ShadowConfig>(null);
  const [targetPath, setTargetPath]               = useState<string>('');
  const [licenseGateResult, setLicenseGateResult] = useState<LicenseGateResult | null>(null);

  // Setup wizard
  const [setupData, setSetupData]   = useState<Partial<ShadowConfig>>({});
  const [setupInput, setSetupInput] = useState<string>('');

  // Target selection
  const [useCurrentDir, setUseCurrentDir]     = useState<boolean>(true);
  const [customPathInput, setCustomPathInput] = useState<string>('');
  const [pathError, setPathError]             = useState<string>('');

  // Shell
  const [messages, setMessages]             = useState<Message[]>([]);
  const [activeMessage, setActiveMessage]   = useState<Message | null>(null);
  const [input, setInput]                   = useState<string>('');
  const [agentSession, setAgentSession]     = useState<AgentSession | null>(null);
  const [activityEvents, setActivityEvents] = useState<ActivityEventLine[]>([]);
  const [isProcessing, setIsProcessing]     = useState<boolean>(false);

  const activityCounter    = useRef(0);
  const keychainRegistered = useRef(false);

  const { exit } = useApp();

  // Effects

  useEffect(() => {
    if (!keychainRegistered.current) {
      keychainRegistered.current = true;
      registerSecretStoreAdapter(new KeychainAdapter());
    }
    if (appState === 'booting') {
      const t = setTimeout(() => setAppState('setup'), 1500);
      return () => clearTimeout(t);
    }
  }, [appState]);

  useEffect(() => {
    if (appState !== 'setup') return;
    const checkConfig = async () => {
      const cfg = forceReconfigure ? null : await loadConfig();
      if (cfg) {
        setConfig(cfg);
        setAppState('targetSelection');
      } else {
        setAppState('setup-provider');
      }
    };
    checkConfig();
  }, [appState, forceReconfigure]);

  useEffect(() => {
    if (appState !== 'initializing' || !targetPath || !config) return;
    const initSession = async () => {
      try {
        const effectiveConfig: ShadowConfig = {
          ...config,
          ...(mode       ? { auditMode: mode as ShadowConfig['auditMode'] } : {}),
          ...(ciEnabled  ? { ci: { enabled: true, failOn: (failOn ?? 'high') as 'critical' | 'high' | 'low' | 'medium' | 'none' } } : {}),
          ...(diffEnabled ? { diff: { baseRef: since ?? 'HEAD~1', enabled: true } } : {}),
        };
        const gateResult = await enforceLicenseGate(effectiveConfig);
        if (!gateResult.allowed) {
          setLicenseGateResult(gateResult);
          setAppState('license-blocked');
          return;
        }
        const map = await generateRepoMap(targetPath);
        let diffScopeHint: string | undefined;
        if (diffEnabled) {
          const changedFiles = await getChangedFiles({ baseRef: since ?? 'HEAD~1', cwd: targetPath });
          diffScopeHint = buildDiffScopeHint(changedFiles) || undefined;
        }
        const session = new AgentSession(effectiveConfig, map, targetPath, { diffScopeHint, expertUnsafe });
        setAgentSession(session);
        setAppState('shell');
      } catch (error) {
        setMessages([{ id: 'init-error', role: 'error', text: `Failed to initialize: ${(error as Error).message}` }]);
        setAppState('shell');
      }
    };
    initSession();
  }, [appState, targetPath, config, expertUnsafe, mode, ciEnabled, failOn, diffEnabled, since]);

  // Setup wizard handlers

  const handleProviderSelect = (item: { value: string }) => {
    setSetupData({ ...setupData, provider: item.value });
    setAppState(item.value === 'custom' ? 'setup-baseurl' : 'setup-model');
  };

  const handleBaseUrlInput = (value: string) => {
    setSetupData({ ...setupData, customBaseUrl: value });
    setSetupInput('');
    setAppState('setup-model');
  };

  const handleModelInput = async (value: string) => {
    const updated = { ...setupData, model: value };
    setSetupData(updated);
    setSetupInput('');
    if (updated.provider === 'ollama') {
      const finalConfig = { ...updated, apiKey: '' } as ShadowConfig;
      await saveConfig(finalConfig);
      setConfig(finalConfig);
      setAppState('targetSelection');
    } else {
      setAppState('setup-apikey');
    }
  };

  const handleApiKeyInput = async (value: string) => {
    const finalConfig = { ...setupData, apiKey: value } as ShadowConfig;
    await saveConfig(finalConfig);
    setConfig(finalConfig);
    setSetupInput('');
    setAppState('setup-license');
  };

  const handleLicenseKeyInput = async (value: string) => {
    if (value.trim()) {
      const updatedConfig = { ...config!, licenseKey: value.trim() };
      await saveConfig(updatedConfig);
      setConfig(updatedConfig);
    }
    setSetupInput('');
    setAppState('targetSelection');
  };

  // Target selection handlers

  const handlePathSubmit = async (p: string) => {
    try {
      const resolved = path.resolve(p);
      const stat = await fs.stat(resolved);
      if (!stat.isDirectory()) { setPathError('Target path is not a directory.'); return; }
      setTargetPath(resolved);
      setAppState('initializing');
    } catch {
      setPathError('Target path does not exist.');
    }
  };

  const handleUseCurrentDirSubmit = (value: string) => {
    const lower = value.toLowerCase();
    if (lower === 'y' || lower === 'yes' || lower === '') {
      handlePathSubmit(process.cwd());
    } else {
      setUseCurrentDir(false);
      setCustomPathInput('');
    }
  };

  // Shell command handler

  const handleCommandSubmit = async (command: string) => {
    if (!command.trim() || isProcessing) return;
    if ([':q', ':quit', 'exit', 'quit'].includes(command.trim().toLowerCase())) { exit(); return; }

    const ts = Date.now().toString();
    setMessages((prev) => [...prev, { id: `u-${ts}`, role: 'user', text: command }]);
    setInput('');

    if (!agentSession) {
      setMessages((prev) => [...prev, { id: `e-${ts}`, role: 'error', text: 'Agent session not initialized.' }]);
      return;
    }

    setIsProcessing(true);
    setActivityEvents([]);
    const agentMsgId = `a-${ts}`;
    setActiveMessage({ id: agentMsgId, role: 'agent', text: '' });

    try {
      let finalResponse = '';
      await agentSession.sendMessage(
        command,
        (chunk: string) => {
          finalResponse += chunk;
          setActiveMessage({ id: agentMsgId, role: 'agent', text: finalResponse });
        },
        (event: AgentStreamEvent) => {
          const line = formatActivityLine(event);
          activityCounter.current += 1;
          setActivityEvents((prev) =>
            [...prev, { id: `ev-${activityCounter.current}`, kind: event.kind, text: line }]
              .slice(-MAX_ACTIVITY_EVENTS),
          );
        },
      );
      setMessages((prev) => [...prev, { id: agentMsgId, role: 'agent', text: finalResponse }]);
      setActiveMessage(null);
    } catch (error) {
      const errMsg = (error as Error).message;
      const friendly =
        errMsg.includes('API key') || errMsg.includes('401') || errMsg.includes('authentication')
          ? 'Authentication failed. Run again with --reconfigure.'
          : `Error: ${errMsg}`;
      setMessages((prev) => [...prev, { id: `e-${Date.now()}`, role: 'error', text: friendly }]);
      setActiveMessage(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Render

  return (
    <Box flexDirection="column" height={rows} width={columns}>

      {appState === 'booting' && (
        <Box alignItems="center" flexDirection="column" height={rows} justifyContent="center">
          <AsciiMotionCli autoPlay loop={false} />
          <Box marginTop={1}><Text color="cyan">Booting Shadow Auditor...</Text></Box>
        </Box>
      )}

      {appState === 'setup' && (
        <Box padding={1}><Text color="gray">Loading configuration...</Text></Box>
      )}

      {appState === 'setup-provider' && (
        <Box flexDirection="column" padding={1}>
          <Box marginBottom={1}><Text bold color="cyan">{'\u25C8'} SHADOW AUDITOR :: Configuration Wizard</Text></Box>
          <Box marginBottom={1}><Text>Select your LLM provider:</Text></Box>
          <SelectInput items={providerOptions} onSelect={handleProviderSelect} />
        </Box>
      )}

      {appState === 'setup-baseurl' && (
        <Box flexDirection="column" padding={1}>
          <Box marginBottom={1}><Text bold color="cyan">{'\u25C8'} SHADOW AUDITOR :: Configuration Wizard</Text></Box>
          <Box marginBottom={1}><Text>Enter your custom API base URL:</Text></Box>
          <Box>
            <Text color="gray">{'\u276F'} </Text>
            <TextInput onChange={setSetupInput} onSubmit={handleBaseUrlInput} placeholder="https://api.your-provider.com/v1" value={setupInput} />
          </Box>
        </Box>
      )}

      {appState === 'setup-model' && (
        <Box flexDirection="column" padding={1}>
          <Box marginBottom={1}><Text bold color="cyan">{'\u25C8'} SHADOW AUDITOR :: Configuration Wizard</Text></Box>
          <Box marginBottom={1}><Text>Enter the model name:</Text></Box>
          <Box>
            <Text color="gray">{'\u276F'} </Text>
            <TextInput onChange={setSetupInput} onSubmit={handleModelInput} placeholder={getModelPlaceholder(setupData.provider ?? '')} value={setupInput} />
          </Box>
        </Box>
      )}

      {appState === 'setup-apikey' && (
        <Box flexDirection="column" padding={1}>
          <Box marginBottom={1}><Text bold color="cyan">{'\u25C8'} SHADOW AUDITOR :: Configuration Wizard</Text></Box>
          <Box marginBottom={1}><Text>Enter your API key:</Text></Box>
          <Box>
            <Text color="gray">{'\u276F'} </Text>
            <TextInput mask="*" onChange={setSetupInput} onSubmit={handleApiKeyInput} value={setupInput} />
          </Box>
        </Box>
      )}

      {appState === 'setup-license' && (
        <Box flexDirection="column" padding={1}>
          <Box marginBottom={1}><Text bold color="cyan">{'\u25C8'} SHADOW AUDITOR :: Configuration Wizard</Text></Box>
          <Box marginBottom={1}>
            <Text>Enter your license key <Text color="gray">(press Enter to skip)</Text>:</Text>
          </Box>
          <Box>
            <Text color="gray">{'\u276F'} </Text>
            <TextInput onChange={setSetupInput} onSubmit={handleLicenseKeyInput} placeholder="SA-XXXX-XXXX-XXXX-XXXX" value={setupInput} />
          </Box>
          <Box marginTop={1}>
            <Text color="gray" dimColor>Get a license at: https://polar.sh/Yahya-hacker/shadow-auditor</Text>
          </Box>
        </Box>
      )}

      {appState === 'license-blocked' && licenseGateResult && (
        <LicensePaywall gateResult={licenseGateResult} onRetry={() => setAppState('setup-license')} />
      )}

      {appState === 'targetSelection' && (
        <Box flexDirection="column" padding={1}>
          <Box borderColor="cyan" borderStyle="round" paddingX={2} paddingY={0}>
            <Text bold color="cyan">{'\u25C8'} Shadow Auditor -- Target Selection</Text>
          </Box>
          <Box flexDirection="column" marginTop={1}>
            {useCurrentDir ? (
              <Box>
                <Text color="yellow">Use current directory (</Text>
                <Text bold>{process.cwd()}</Text>
                <Text color="yellow">) for the audit? [Y/n] </Text>
                <TextInput onChange={setCustomPathInput} onSubmit={handleUseCurrentDirSubmit} value={customPathInput} />
              </Box>
            ) : (
              <Box flexDirection="column">
                <Box>
                  <Text color="yellow">Enter target directory: </Text>
                  <TextInput onChange={setCustomPathInput} onSubmit={handlePathSubmit} value={customPathInput} />
                </Box>
                {pathError && <Text color="red">{pathError}</Text>}
              </Box>
            )}
          </Box>
        </Box>
      )}

      {appState === 'initializing' && (
        <Box flexDirection="column" padding={1}>
          <Text color="cyan"><Spinner type="dots" /> Parsing AST with tree-sitter & initialising agent...</Text>
        </Box>
      )}

      {/* ================================================================
          SHELL — strict vertical layout:
            1. Header / Status Bar
            2. Message History  (<Static> — never re-renders)
            3. Live Activity Stream Panel
            4. Current Active Streaming Message Buffer
            5. Input Prompt Line (fixed at bottom)
          ================================================================ */}
      {appState === 'shell' && config && (
        <Box flexDirection="column" height={rows} width={columns}>

          {/* 1. Header / Status Bar */}
          <HeaderBar config={config} expertUnsafe={expertUnsafe} targetPath={targetPath} />

          {/* 2. Message History — Static zone, grows upward, isolated from re-renders */}
          <Box flexDirection="column" flexGrow={1} overflow="hidden">
            <MessageHistory messages={messages} />
          </Box>

          {/* 3. Live Activity Stream Panel — only mounted while active */}
          {(isProcessing || activityEvents.length > 0) && (
            <ActivityStreamPanel activityEvents={activityEvents} isProcessing={isProcessing} />
          )}

          {/* 4. Current Active Streaming Message Buffer */}
          {activeMessage !== null && (
            <StreamingBuffer message={activeMessage} />
          )}

          {/* 5. Input Prompt Line — always at the bottom */}
          <InputPrompt
            input={input}
            isProcessing={isProcessing}
            onChange={setInput}
            onSubmit={handleCommandSubmit}
            targetPath={targetPath}
          />

        </Box>
      )}

    </Box>
  );
};

export default App;
