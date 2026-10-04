import { eq } from "drizzle-orm";
import { db } from "@/db";
import { lessonAttachment } from "@/db/schema";
import { canAccessLesson } from "@/lib/access";
import { presignAttachmentUrl } from "@/lib/blob";
import { getViewer } from "@/lib/session";

/** 受講できる人にだけ、添付ファイルの短期間有効なダウンロードURLを返す */
export async function GET(_request: Request, ctx: RouteContext<"/api/attachments/[id]">) {
  const { id } = await ctx.params;
  const attachment = await db.query.lessonAttachment.findFirst({
    where: eq(lessonAttachment.id, id),
    with: {
      lesson: {
        columns: { isPreview: true },
        with: {
          section: {
            columns: {},
            with: { course: { columns: { id: true, accessType: true, isPublished: true } } },
          },
        },
      },
    },
  });
  if (!attachment) return new Response(null, { status: 404 });

  const { course } = attachment.lesson.section;
  const viewer = await getViewer(course.id);
  if (!course.isPublished && !viewer?.isAdmin) return new Response(null, { status: 404 });
  if (!canAccessLesson(course, attachment.lesson, viewer)) {
    return new Response(null, { status: viewer ? 403 : 401 });
  }

  return Response.json({
    url: await presignAttachmentUrl(attachment.blobPathname),
    fileName: attachment.fileName,
  });
}
