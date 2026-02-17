import { parseMacro } from "./parser";
import type { MacroHandler, MacroRunContext } from "./types";

export class MacroRegistry {
  private readonly handlers: Map<string, MacroHandler>;

  constructor(handlers: MacroHandler[]) {
    this.handlers = new Map(handlers.map((handler) => [handler.name, handler]));
  }

  async run(text: string, context: Omit<MacroRunContext, "command">): Promise<boolean> {
    const command = parseMacro(text);
    if (!command) {
      return false;
    }

    const handler = this.handlers.get(command.name);
    if (!handler) {
      return false;
    }

    await handler.run({ ...context, command });
    return true;
  }
}
