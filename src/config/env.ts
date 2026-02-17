import { type } from "arktype";

const envType = type({
  SLACK_BOT_TOKEN: "string > 0",
  SLACK_SIGNING_SECRET: "string > 0",
  SLACK_APP_TOKEN: "string > 0",
  DATABASE_URL: "string > 0",
  "OPENAI_API_KEY?": "string",
  "OPENAI_API_URL?": "string",
  "OPENAI_MODEL?": "string",
  "BOT_CONFIG_PATH?": "string",
});

export type AppEnv = {
  SLACK_BOT_TOKEN: string;
  SLACK_SIGNING_SECRET: string;
  SLACK_APP_TOKEN: string;
  DATABASE_URL: string;
  OPENAI_API_KEY?: string;
  OPENAI_API_URL?: string;
  OPENAI_MODEL?: string;
  BOT_CONFIG_PATH: string;
};

export function loadEnv(source: Record<string, string | undefined> = process.env): AppEnv {
  const parsed = envType.assert(source);

  return {
    SLACK_BOT_TOKEN: parsed.SLACK_BOT_TOKEN,
    SLACK_SIGNING_SECRET: parsed.SLACK_SIGNING_SECRET,
    SLACK_APP_TOKEN: parsed.SLACK_APP_TOKEN,
    DATABASE_URL: parsed.DATABASE_URL,
    OPENAI_API_KEY: parsed.OPENAI_API_KEY,
    OPENAI_API_URL: parsed.OPENAI_API_URL,
    OPENAI_MODEL: parsed.OPENAI_MODEL,
    BOT_CONFIG_PATH: parsed.BOT_CONFIG_PATH ?? "config/bot.config.yml",
  };
}
