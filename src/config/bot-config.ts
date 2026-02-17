import { type } from "arktype";
import { parse } from "yaml";

const botConfigType = type({
  helpChannelId: "string > 0",
  helpBtsChannelId: "string > 0",
  ticketsChannelId: "string > 0",
  hackatimeHelpChannel: "string > 0",
  summaryTimezone: "string > 0",
  openaiModel: "string > 0",
});

export type BotConfig = {
  helpChannelId: string;
  helpBtsChannelId: string;
  ticketsChannelId: string;
  hackatimeHelpChannel: string;
  summaryTimezone: string;
  openaiModel: string;
};

export async function loadBotConfig(path: string): Promise<BotConfig> {
  const text = await Bun.file(path).text();
  const raw = parse(text) as unknown;
  return botConfigType.assert(raw);
}
