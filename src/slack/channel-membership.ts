import type { SlackClient } from "./client-types";

export async function isUserInChannel(
  client: SlackClient,
  channelId: string,
  userId: string,
): Promise<boolean> {
  let cursor: string | undefined;

  do {
    const response = await client.conversations.members({
      channel: channelId,
      cursor,
      limit: 200,
    });

    if (response.members?.includes(userId)) {
      return true;
    }

    cursor = response.response_metadata?.next_cursor;
  } while (cursor);

  return false;
}

export class ChannelMembershipService {
  constructor(
    private readonly client: SlackClient,
    private readonly btsChannelId: string,
  ) {}

  async isInBts(userId: string): Promise<boolean> {
    return isUserInChannel(this.client, this.btsChannelId, userId);
  }
}
