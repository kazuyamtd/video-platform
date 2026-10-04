import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { lesson } from "@/db/schema";
import { attachmentsToken } from "@/lib/blob";
import {
  ATTACHMENT_MAX_BYTES,
  ATTACHMENT_TYPES,
  isAttachmentPathname,
} from "@/lib/constants";
import { getSession } from "@/lib/session";

/** ブラウザから非公開の Vercel Blob へ直接アップロードするためのトークン発行（管理者のみ） */
export async function POST(request: Request) {
  const session = await getSession();
  if (session?.user.role !== "admin") return new Response(null, { status: 403 });

  try {
    const body = (await request.json()) as HandleUploadBody;
    const result = await handleUpload({
      body,
      request,
      token: attachmentsToken(),
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const lessonId = clientPayload ?? "";
        if (!isAttachmentPathname(pathname, lessonId)) throw new Error("Invalid pathname");
        const found = await db.query.lesson.findFirst({
          where: eq(lesson.id, lessonId),
          columns: { id: true },
        });
        if (!found) throw new Error("Lesson not found");
        return {
          allowedContentTypes: Object.values(ATTACHMENT_TYPES),
          maximumSizeInBytes: ATTACHMENT_MAX_BYTES,
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
