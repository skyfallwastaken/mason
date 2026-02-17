import { describe, expect, it } from "bun:test";

import { isResolverAuthorized } from "../src/slack/permissions";

describe("isResolverAuthorized", () => {
  it("allows BTS users", () => {
    expect(
      isResolverAuthorized({
        isBtsMember: true,
        isThreadOpener: false,
      }),
    ).toBeTrue();
  });

  it("allows thread opener", () => {
    expect(
      isResolverAuthorized({
        isBtsMember: false,
        isThreadOpener: true,
      }),
    ).toBeTrue();
  });

  it("denies unrelated users", () => {
    expect(
      isResolverAuthorized({
        isBtsMember: false,
        isThreadOpener: false,
      }),
    ).toBeFalse();
  });
});
