import { describe, expect, it } from "vitest";
import { attachmentExtension, isAttachmentPathname } from "./constants";

describe("attachmentExtension", () => {
  it.each([
    ["資料.pdf", "pdf"],
    ["Slides.PPTX", "pptx"],
    ["archive.tar.zip", "zip"],
    ["image.png", null],
    ["noext", null],
    ["script.pdf.exe", null],
  ])("%s → %s", (name, expected) => {
    expect(attachmentExtension(name)).toBe(expected);
  });
});

describe("isAttachmentPathname", () => {
  const lessonId = "lesson-1";
  const uuid = "0f8fad5b-d9cb-469f-a165-70867728950e";

  it("accepts attachments/<lessonId>/<uuid>.<ext>", () => {
    expect(isAttachmentPathname(`attachments/${lessonId}/${uuid}.pdf`, lessonId)).toBe(true);
  });

  it.each([
    [`attachments/other/${uuid}.pdf`, "another lesson"],
    [`attachments/${lessonId}/${uuid}.png`, "disallowed extension"],
    [`attachments/${lessonId}/資料.pdf`, "non-ASCII name"],
    [`attachments/${lessonId}/../x/${uuid}.pdf`, "path traversal"],
    [`thumbnails/${uuid}.pdf`, "wrong folder"],
  ])("rejects %s (%s)", (pathname) => {
    expect(isAttachmentPathname(pathname, lessonId)).toBe(false);
  });

  it("rejects an empty lesson id", () => {
    expect(isAttachmentPathname(`attachments//${uuid}.pdf`, "")).toBe(false);
  });
});
