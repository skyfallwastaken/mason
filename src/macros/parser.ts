import type { ParsedMacro } from "./types";

const macroRegex = /^\?([a-z][a-z0-9_-]*)(?:\s+(.+))?$/i;

export function parseMacro(text: string): ParsedMacro | null {
  const normalized = text.trim();
  const match = normalized.match(macroRegex);

  if (!match) {
    return null;
  }

  const [, name, rawArgs] = match;
  if (!name) {
    return null;
  }

  return {
    name: name.toLowerCase(),
    args: rawArgs ? rawArgs.trim().split(/\s+/) : [],
  };
}
