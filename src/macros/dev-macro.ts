import type { MacroHandler } from "./types";

export function createDevMacro(): MacroHandler {
  return {
    name: "dev",
    async run(context) {
      const threadTs = context.message.thread_ts;
      if (!threadTs) {
        await context.client.chat.postMessage({
          channel: context.message.channel,
          text: "Use `?dev` inside a thread.",
        });
        return;
      }

      const isBts = await context.isBtsMember(context.message.user);
      if (!isBts) {
        await context.client.chat.postMessage({
          channel: context.message.channel,
          thread_ts: threadTs,
          text: ":rac_info: Only folks in help BTS can use `?dev`.",
        });
        return;
      }

      await context.client.chat.postMessage({
        channel: context.message.channel,
        thread_ts: threadTs,
        text: `:rac_info: For dev questions, please head over to ${context.config.hackatimeHelpChannel}.`,
      });

      const result = await context.resolveThread(context.client, threadTs, context.message.user);
      if (result.outcome !== "resolved") {
        await context.client.chat.postMessage({
          channel: context.message.channel,
          thread_ts: threadTs,
          text: `:rac_info: ${result.message}`,
        });
      }
    },
  };
}
