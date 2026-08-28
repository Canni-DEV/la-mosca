import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { beginHintSession, dismissHint, nextHint } from "./hints.ts";

const memory = new Map<string, string>();

beforeEach(() => {
  memory.clear();
  globalThis.localStorage = {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
    removeItem: (key: string) => {
      memory.delete(key);
    },
    clear: () => memory.clear(),
    key: (index: number) => [...memory.keys()][index] ?? null,
    get length() {
      return memory.size;
    },
  };
});

afterEach(() => {
  memory.clear();
});

describe("nextHint", () => {
  it("enables coach marks for the first match only", () => {
    expect(beginHintSession()).toBe(true);
    expect(beginHintSession()).toBe(false);
  });
  it("offers trump first, then exchange, then follow", () => {
    expect(
      nextHint({
        hasTrump: true,
        canExchange: true,
        isTrickPlay: false,
        trickHasLead: false,
      })?.id,
    ).toBe("trump");
    dismissHint("trump");
    expect(
      nextHint({
        hasTrump: true,
        canExchange: true,
        isTrickPlay: false,
        trickHasLead: false,
      })?.id,
    ).toBe("exchange");
    dismissHint("exchange");
    expect(
      nextHint({
        hasTrump: true,
        canExchange: false,
        isTrickPlay: true,
        trickHasLead: true,
      })?.id,
    ).toBe("follow");
  });

  it("returns null when the player already dismissed the visible hints", () => {
    dismissHint("trump");
    dismissHint("exchange");
    dismissHint("follow");
    dismissHint("overtake");
    dismissHint("palito");
    expect(
      nextHint({
        hasTrump: true,
        canExchange: true,
        isTrickPlay: true,
        trickHasLead: true,
      }),
    ).toBeNull();
  });
});
