import type { KnownBlock } from "@slack/types";

type PostMessageResponse = {
  ok?: boolean;
  ts?: string;
  permalink?: string;
};

export type SlackClient = {
  reactions: {
    add: (args: { channel: string; timestamp: string; name: string }) => Promise<unknown>;
    remove: (args: { channel: string; timestamp: string; name: string }) => Promise<unknown>;
  };
  chat: {
    postMessage: (args: {
      channel: string;
      text: string;
      thread_ts?: string;
      blocks?: KnownBlock[];
    }) => Promise<PostMessageResponse>;
    delete: (args: { channel: string; ts: string }) => Promise<unknown>;
    getPermalink: (args: { channel: string; message_ts: string }) => Promise<PostMessageResponse>;
  };
  conversations: {
    members: (args: {
      channel: string;
      cursor?: string;
      limit?: number;
    }) => Promise<{ members?: string[]; response_metadata?: { next_cursor?: string } }>;
  };
};
