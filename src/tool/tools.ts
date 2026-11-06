// The Addis tools: the family every tool site lists, in the order addis.gg shows them.
export type ToolId = 'rixse' | 'mirab' | 'woreda' | 'kebele' | 'gelada' | 'harar' | 'p8' | 'securecore';

export type ToolInfo = {
  id: ToolId;
  /** Its site, without the scheme: `mirab.addis.gg`. */
  domain: string;
  /** One line, as the family list shows it. */
  short: string;
  /** The name as shown, when it isn't the id: `SecureCore`. */
  name?: string;
};

export const TOOLS: ToolInfo[] = [
  { id: 'rixse', domain: 'rixse.dev', short: 'The gateway. Agents ask, you decide.' },
  { id: 'mirab', domain: 'mirab.addis.gg', short: 'Agents in VMs on your own machine.' },
  { id: 'woreda', domain: 'woreda.addis.gg', short: 'Self-hosted GitHub Actions runners.' },
  { id: 'kebele', domain: 'kebele.addis.gg', short: 'Container stacks over the Docker socket.' },
  { id: 'gelada', domain: 'gelada.addis.gg', short: 'OS sandboxes, without a container.' },
  { id: 'harar', domain: 'harar.addis.gg', short: 'A simple vault for your keys.' },
  { id: 'p8', domain: 'p8.addis.gg', short: 'PHP in pure Rust. Memory-safe.' },
  { id: 'securecore', name: 'SecureCore', domain: 'securecore.addis.gg', short: 'Every WordPress plugin in its own sandbox.' },
];

export function toolInfo(id: ToolId): ToolInfo {
  const info = TOOLS.find((t) => t.id === id);
  if (!info) throw new Error(`unknown tool: ${id}`);
  return info;
}

/** A tool's name as every site shows it: its display name, else its id. */
export function toolName(id: ToolId): string {
  return toolInfo(id).name ?? id;
}
