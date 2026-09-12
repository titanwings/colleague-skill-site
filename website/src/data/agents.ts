/**
 * Coding-agent support matrix.
 *
 * An installation matrix: every host gets an exact command, an exact install
 * location, and an honest capability note, so a visitor never has to guess
 * whether their agent is supported.
 *
 * Two install routes exist:
 *   1. the AgentSkills CLI — `npx skills add <repo> --agent <id>`
 *   2. a direct clone into the directory the host scans
 *
 * Only hosts with a documented install location (distilly INSTALL.md or
 * bin/distilly.mjs) are listed here — no guessed paths. Hosts that are reachable
 * purely through the AgentSkills CLI still work via `npx skills add`.
 *
 * `capability: 'full'` means the host can read files and run shell commands, so
 * the whole distill → render workflow works. `'prompt-only'` means the host can
 * load the Skill but cannot run the bundled tooling (e.g. a sandbox without
 * shell access) — the copy is still useful, results degrade gracefully.
 */
import { BRAND } from './brand';

export type AgentId =
  | 'claude-code'
  | 'codex'
  | 'opencode'
  | 'openclaw'
  | 'hermes'
  | 'deepseek-harness'
  | 'pi'
  | 'grok-build';

export interface CodingAgent {
  id: AgentId;
  label: string;
  /** Alias accepted by `npx skills add --agent`. */
  skillsCliId?: string;
  /** Global install location of the creator Skill. */
  globalPath: string;
  /** Project-local install location, when the host documents one. */
  projectPath?: string;
  capability: 'full' | 'prompt-only';
  note: { zh: string; en: string };
}

export const AGENTS: CodingAgent[] = [
  {
    id: 'claude-code',
    label: 'Claude Code',
    skillsCliId: 'claude-code',
    globalPath: '~/.claude/skills/distilly',
    projectPath: '.claude/skills/distilly',
    capability: 'full',
    note: {
      zh: '安装后 Skill 会被自动发现，可直接说“把这段聊天蒸馏成 Skill”。',
      en: 'Discovered automatically once installed; just ask it to distill a conversation.',
    },
  },
  {
    id: 'codex',
    label: 'Codex CLI',
    skillsCliId: 'codex',
    globalPath: '~/.agents/skills/distilly',
    projectPath: '.agents/skills/distilly',
    capability: 'full',
    note: {
      zh: 'Codex 扫描 ~/.agents/skills；旧版 ~/.codex/skills 需手动迁移。',
      en: 'Codex scans ~/.agents/skills; the legacy ~/.codex/skills path needs a manual move.',
    },
  },
  {
    id: 'opencode',
    label: 'opencode',
    skillsCliId: 'opencode',
    globalPath: '~/.config/opencode/skills/distilly',
    projectPath: '.opencode/skills/distilly',
    capability: 'full',
    note: {
      zh: '同时兼容 ~/.agents/skills 与项目级 .opencode/skills。',
      en: 'Also reads ~/.agents/skills and the project-local .opencode/skills.',
    },
  },
  {
    id: 'openclaw',
    label: 'OpenClaw',
    skillsCliId: 'openclaw',
    globalPath: '~/.openclaw/workspace/skills/distilly',
    projectPath: '.openclaw/skills/distilly',
    capability: 'full',
    note: {
      zh: 'Skill 目录即工作区子目录，装完重开 session 生效。',
      en: 'The Skill directory lives inside the workspace; reopen the session after install.',
    },
  },
  {
    id: 'hermes',
    label: 'Hermes',
    skillsCliId: 'hermes',
    globalPath: '~/.hermes/skills/distilly',
    projectPath: '.hermes/skills/distilly',
    capability: 'full',
    note: {
      zh: '项目级安装需先在该目录运行 hermes skills trust。',
      en: 'Project-local installs need `hermes skills trust` in that directory first.',
    },
  },
  {
    id: 'deepseek-harness',
    label: 'DeepSeek Harness',
    skillsCliId: 'deepseek-harness',
    globalPath: '~/.dsh/skills/distilly',
    projectPath: '.dsh/skills/distilly',
    capability: 'full',
    note: {
      zh: '也支持 $DSH_HOME/skills/distilly；社区集成，非官方 DeepSeek 产品。',
      en: 'Also honours $DSH_HOME/skills/distilly; community integration, not an official DeepSeek product.',
    },
  },
  {
    id: 'grok-build',
    label: 'Grok Build',
    skillsCliId: 'grok-build',
    globalPath: '~/.grok/skills/distilly',
    projectPath: '.grok/skills/distilly',
    capability: 'full',
    note: {
      zh: '与 ~/.agents/skills 共用发现目录。',
      en: 'Shares the ~/.agents/skills discovery directory.',
    },
  },
  {
    id: 'pi',
    label: 'Pi',
    globalPath: '~/.pi/agent/skills/distilly',
    capability: 'full',
    note: {
      zh: '安装到 Pi 的 agent skills 目录即可。',
      en: 'Install into Pi’s agent skills directory.',
    },
  },
];

export const DEFAULT_AGENT: AgentId = 'claude-code';

export function getAgent(id: AgentId): CodingAgent {
  const agent = AGENTS.find((a) => a.id === id);
  if (!agent) throw new Error(`Unknown coding agent: ${id}`);
  return agent;
}

/** One-liner via the AgentSkills CLI (works for any host it supports). */
export function skillsCliCommand(id: AgentId, scope: 'global' | 'project' = 'global'): string {
  const agent = getAgent(id);
  const flags = [`--agent ${agent.skillsCliId ?? agent.id}`];
  if (scope === 'global') flags.push('--global', '--copy', '--yes');
  return `npx -y skills add ${BRAND.repo} --skill distilly ${flags.join(' ')}`;
}

/** Direct clone route, for hosts that are not AgentSkills CLI targets. */
export function cloneCommand(id: AgentId, scope: 'global' | 'project' = 'global'): string {
  const agent = getAgent(id);
  const target = scope === 'project' ? agent.projectPath : agent.globalPath;
  if (!target) throw new Error(`${agent.label} has no documented project-local path; use the global install.`);
  return `git clone https://github.com/${BRAND.repo} ${target}`;
}
