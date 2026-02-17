export type UserMessageEvent = {
  type: "message";
  channel: string;
  user: string;
  text: string;
  ts: string;
  thread_ts?: string;
  subtype?: string;
  bot_id?: string;
};

export function toUserMessageEvent(event: Record<string, unknown>): UserMessageEvent | null {
  if (event.type !== "message") {
    return null;
  }

  const channel = event.channel;
  const user = event.user;
  const text = event.text;
  const ts = event.ts;

  if (
    typeof channel !== "string" ||
    typeof user !== "string" ||
    typeof text !== "string" ||
    typeof ts !== "string"
  ) {
    return null;
  }

  const subtype = typeof event.subtype === "string" ? event.subtype : undefined;
  const botId = typeof event.bot_id === "string" ? event.bot_id : undefined;

  if (subtype || botId) {
    return null;
  }

  return {
    type: "message",
    channel,
    user,
    text,
    ts,
    thread_ts: typeof event.thread_ts === "string" ? event.thread_ts : undefined,
  };
}
