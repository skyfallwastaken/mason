/** @jsxImportSource jsx-slack */
import type { KnownBlock } from "@slack/types";
import JSXSlack, { Blocks, Context, Divider, Section } from "jsx-slack";

type ForwardedTicketProps = {
  openerUserId: string;
  title: string;
  permalink: string;
  bodyPreview: string;
};

function truncate(text: string, max = 180): string {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (normalized.length <= max) {
    return normalized;
  }

  return `${normalized.slice(0, max - 3)}...`;
}

export function buildForwardedTicketBlocks(props: ForwardedTicketProps): KnownBlock[] {
  return JSXSlack(
    <Blocks>
      <Section>
        :ticket: New help ticket from &lt;@{props.openerUserId}&gt;{"\n"}
        <b>{props.title}</b>
        {"\n"}
        <a href={props.permalink}>Open thread</a>
      </Section>
      <Context>{truncate(props.bodyPreview)}</Context>
      <Divider />
    </Blocks>,
  ) as KnownBlock[];
}
