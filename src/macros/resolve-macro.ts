import type { MacroHandler } from "./types";

export function createResolveMacro(): MacroHandler {
  return {
    name: "resolve",
    async run(context) {
      const threadTs = context.message.thread_ts;
      if (!threadTs) {
        await context.client.chat.postMessage({
          channel: context.message.channel,
          text: "Use `?resolve` inside a thread so I know what to resolve.",
        });
        return;
      }

      const result = await context.resolveThread(context.client, threadTs, context.message.user);
      if (result.outcome !== "resolved") {
        await context.client.chat.postEphemeral({
          channel: context.message.channel,
          user: context.message.user,
          thread_ts: threadTs,
          text: `:rac_info: ${result.message}`,
        });
      }
    },
  };
}
