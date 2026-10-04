/** オープンリダイレクト防止: サイト内のパスだけを戻り先として許可する */
export function safeCallback(value: string | string[] | undefined): string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/";
}
