import { describe, expect, it } from "vitest";
import { parseVimeoInput } from "./vimeo";

describe("parseVimeoInput", () => {
  it.each([
    ["76979871", "76979871"],
    [" 76979871 ", "76979871"],
    ["76979871/abcdef1234", "76979871/abcdef1234"],
    ["https://vimeo.com/76979871", "76979871"],
    ["https://vimeo.com/76979871/abcdef1234", "76979871/abcdef1234"],
    ["https://player.vimeo.com/video/76979871?h=abcdef1234", "76979871/abcdef1234"],
    ["https://vimeo.com/channels/staffpicks/76979871", "76979871"],
    ["https://vimeo.com/manage/videos/76979871/abcdef1234", "76979871/abcdef1234"],
  ])("%s → %s", (input, expected) => {
    expect(parseVimeoInput(input)).toBe(expected);
  });

  it.each(["", "abc", "https://youtube.com/watch?v=1", "https://vimeo.com/about"])(
    "不正な入力 %s は null",
    (input) => {
      expect(parseVimeoInput(input)).toBeNull();
    },
  );
});
