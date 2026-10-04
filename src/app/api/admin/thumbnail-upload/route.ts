import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { THUMBNAIL_CONTENT_TYPES, THUMBNAIL_MAX_BYTES } from "@/lib/constants";
import { getSession } from "@/lib/session";

/** ブラウザから Vercel Blob へ直接アップロードするためのトークン発行（管理者のみ） */
export async function POST(request: Request) {
  const session = await getSession();
  if (session?.user.role !== "admin") return new Response(null, { status: 403 });

  try {
    const body = (await request.json()) as HandleUploadBody;
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("thumbnails/")) throw new Error("Invalid pathname");
        return {
          allowedContentTypes: THUMBNAIL_CONTENT_TYPES,
          maximumSizeInBytes: THUMBNAIL_MAX_BYTES,
          addRandomSuffix: true,
        };
      },
    });
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    );
  }
}
