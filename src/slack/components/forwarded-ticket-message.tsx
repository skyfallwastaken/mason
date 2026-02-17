/** @jsxImportSource jsx-slack */
import type { KnownBlock } from "@slack/types";
import JSXSlack, { Blocks, Context, Divider, Section } from "jsx-slack";

type ForwardedTicketProps = {
  openerUserId: string;
  title: string;
  permalink: string;
};

export function buildForwardedTicketBlocks(
  props: ForwardedTicketProps,
): KnownBlock[] {
  const openerLine = `:ticket: New help ticket from <@${props.openerUserId}>`;

  return JSXSlack(
    <Blocks>
      <Section>{openerLine}</Section>
      <Section>
        <b>{props.title}</b>
      </Section>
      <Section>
        <a href={props.permalink}>Open thread</a>
      </Section>
      <Divider />
    </Blocks>,
  ) as KnownBlock[];
}
