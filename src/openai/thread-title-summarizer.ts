import OpenAI from "openai";

type ThreadTitleSummarizerOptions = {
  apiKey?: string;
  baseURL?: string;
  model: string;
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

export class ThreadTitleSummarizer {
  private readonly client: OpenAI | null;

  constructor(private readonly options: ThreadTitleSummarizerOptions) {
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
      return fallback;
    }

    try {
      const completion = await this.client.chat.completions.create({
        model: this.options.model,
        temperature: 0.2,
        max_completion_tokens: 32,
        messages: [
          {
            role: "system",
            content:
              "Create a short help-ticket title from one Slack message. Use 4-12 words, plain text only.",
          },
          {
            role: "user",
            content: rawMessage,
          },
        ],
      });

      const title = completion.choices[0]?.message?.content?.trim();
      if (!title) {
        return fallback;
      }

      return title.length <= 90 ? title : `${title.slice(0, 87)}...`;
    } catch {
      return fallback;
    }
  }
}
