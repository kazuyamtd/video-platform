import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Markdown } from "./markdown";

const render = (md: string) => renderToStaticMarkup(<Markdown>{md}</Markdown>);

describe("Markdown", () => {
  it("見出し・太字・表を HTML にする", () => {
    const html = render("# 見出し\n\n**太字**\n\n| a | b |\n|---|---|\n| 1 | 2 |");
    expect(html).toContain("<h1>見出し</h1>");
    expect(html).toContain("<strong>太字</strong>");
    expect(html).toContain("<table>");
  });
  it("HTML タグはそのまま出力しない", () => {
    const html = render('<script>alert(1)</script><img src=x onerror="alert(1)">');
    expect(html).not.toContain("<script");
    expect(html).not.toContain("<img");
  });
  it("javascript: のリンクを無効化する", () => {
    expect(render("[x](javascript:alert(1))")).not.toContain("javascript:");
  });
  it("外部リンクは新しいタブで開く", () => {
    expect(render("[x](https://example.com)")).toContain('target="_blank"');
    expect(render("[x](/courses)")).not.toContain("target=");
  });
});
