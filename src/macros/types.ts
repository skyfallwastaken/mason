import type { BotConfig } from "../config/bot-config";
import type { SlackClient } from "../slack/client-types";
import type { UserMessageEvent } from "../slack/message-types";
import type { ResolveResult } from "../slack/resolve-ticket";

export type ParsedMacro = {
  name: string;
  args: string[];
};

export type MacroRunContext = {
  command: ParsedMacro;
  message: UserMessageEvent;
  client: SlackClient;
  config: BotConfig;
  isBtsMember: (userId: string) => Promise<boolean>;
  resolveThread: (
    client: SlackClient,
    threadTs: string,
    resolverUserId: string,
  ) => Promise<ResolveResult>;
};

export type MacroHandler = {
  name: string;
  run: (context: MacroRunContext) => Promise<void>;
};
