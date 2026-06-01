import OpenAI from "openai";

type SummarizerLogger = {
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
};

type ThreadTitleSummarizerOptions = {
  apiKey?: string;
  baseURL?: string;
  model: string;
  logger?: SummarizerLogger;
};

const consoleLogger: SummarizerLogger = {
  warn: (message, ...args) => console.warn(message, ...args),
  error: (message, ...args) => console.error(message, ...args),
};

function fallbackTitle(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) {
    return "Untitled help thread";
  }

  const compact = trimmed.replace(/\s+/g, " ");
  const shortened = compact.split(" ").slice(0, 10).join(" ");
  return shortened.length <= 70 ? shortened : `${shortened.slice(0, 67)}...`;
}

function parseTitleFromJson(text: string): string | null {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "title" in parsed &&
      typeof parsed.title === "string"
    ) {
      return parsed.title;
    }
  } catch {
    return null;
  }

  return null;
}

export function cleanGeneratedTitle(text: string, fallback: string): string {
  const unfenced = text
    .replace(/^```(?:json|text)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  const parsedTitle = parseTitleFromJson(unfenced);
  const candidate = parsedTitle ?? unfenced;

  const lines = candidate
    .split("\n")
    .map((line) => line.replace(/^[-*]\s+/, "").trim())
    .filter(Boolean);

  const labelledTitle = lines.find((line) =>
    /^\s*(?:title|ticket title|help ticket title)\s*:/i.test(line),
  );
  const includesConversation = lines.some((line) =>
    /^(?:conversation|slack message|original message)\s*:/i.test(line),
  );
  const firstUsefulLine = labelledTitle
    ? labelledTitle.replace(
        /^\s*(?:title|ticket title|help ticket title)\s*:\s*/i,
        "",
      )
    : includesConversation
      ? ""
      : (lines[0] ?? "");

  const cleaned = firstUsefulLine
    .replace(/^['"“”‘’]+|['"“”‘’]+$/g, "")
    .replace(/[.。]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned || /^(?:\{|\[)/.test(cleaned)) {
    return fallback;
  }

  return cleaned.length <= 90 ? cleaned : `${cleaned.slice(0, 87)}...`;
}

export class ThreadTitleSummarizer {
  private readonly client: OpenAI | null;
  private readonly logger: SummarizerLogger;

  constructor(private readonly options: ThreadTitleSummarizerOptions) {
    this.logger = options.logger ?? consoleLogger;
    this.client = options.apiKey
      ? new OpenAI({
          apiKey: options.apiKey,
          baseURL: options.baseURL,
        })
      : null;
  }

  async summarize(rawMessage: string): Promise<string> {
    const fallback = fallbackTitle(rawMessage);

    if (!this.client) {
      this.logger.warn(
        "Summarizer has no API key configured; using fallback title.",
      );
      return fallback;
    }

    try {
      const completion = await this.client.chat.completions.create({
        model: this.options.model,
        temperature: 0,
        messages: [
          {
            role: "system",
            content:
              "Return only a short help-ticket title for the Slack message. Do not summarize the conversation. Do not include JSON, markdown, labels, quotes, explanations, or the original message. Use 4-10 words of plain text.",
          },
          {
            role: "user",
            content: `Slack message:\n<<<\n${rawMessage}\n>>>\n\nTitle only:`,
          },
        ],
      });

      const choice = completion.choices[0];
      const title = choice?.message?.content?.trim();
      if (!title) {
        this.logger.warn(
          `Summarizer returned empty content (model=${this.options.model}, finish_reason=${choice?.finish_reason ?? "unknown"}); using fallback title.`,
        );
        return fallback;
      }

      return cleanGeneratedTitle(title, fallback);
    } catch (error) {
      this.logger.error(
        `Summarizer request failed (model=${this.options.model}); using fallback title.`,
        error,
      );
      return fallback;
    }
  }
}
