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
  const text = typeof event.text === "string" ? event.text : "";
  const ts = event.ts;

  if (
    typeof channel !== "string" ||
    typeof user !== "string" ||
    typeof ts !== "string"
  ) {
    return null;
  }

  const subtype = typeof event.subtype === "string" ? event.subtype : undefined;
  const botId = typeof event.bot_id === "string" ? event.bot_id : undefined;

  const allowedSubtypes = new Set(["file_share"]);
  if (botId || (subtype && !allowedSubtypes.has(subtype))) {
    return null;
  }

  let resolvedText = text;
  if (subtype === "file_share" && !text.trim()) {
    const files = Array.isArray(event.files) ? event.files : [];
    const first = files[0] as Record<string, unknown> | undefined;
    const fileLabel =
      typeof first?.title === "string" ? first.title :
      typeof first?.name === "string" ? first.name :
      "a file";
    resolvedText = `Shared ${fileLabel}`;
  }

  return {
    type: "message",
    channel,
    user,
    text: resolvedText,
    ts,
    thread_ts: typeof event.thread_ts === "string" ? event.thread_ts : undefined,
  };
}
