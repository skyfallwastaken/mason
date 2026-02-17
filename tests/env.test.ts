import { describe, expect, it } from "bun:test";

import { loadEnv } from "../src/config/env";

describe("loadEnv", () => {
  it("loads required env vars and defaults config path", () => {
    const env = loadEnv({
      SLACK_BOT_TOKEN: "xoxb-1",
      SLACK_SIGNING_SECRET: "secret",
      SLACK_APP_TOKEN: "xapp-1",
      DATABASE_URL: "postgres://localhost:5432/test",
    });

    expect(env.BOT_CONFIG_PATH).toBe("config/bot.config.yml");
  });

  it("throws on missing required values", () => {
    expect(() =>
      loadEnv({
        SLACK_BOT_TOKEN: "xoxb-1",
      }),
    ).toThrow();
  });
});
