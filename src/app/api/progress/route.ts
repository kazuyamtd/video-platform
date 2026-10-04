import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { lesson } from "@/db/schema";
import { canAccessLesson } from "@/lib/access";
import { setLessonCompleted } from "@/lib/progress";
import { getSession, getViewer } from "@/lib/session";

const bodySchema = z.object({
  lessonId: z.string().min(1),
  completed: z.boolean(),
});

/** レッスンの完了状態の保存 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return new Response(null, { status: 401 });

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(JSON.parse(await request.text()));
  } catch {
    return new Response(null, { status: 400 });
  }

  const target = await db.query.lesson.findFirst({
    where: eq(lesson.id, body.lessonId),
    columns: { id: true, isPreview: true },
    with: { section: { with: { course: { columns: { id: true, accessType: true } } } } },
  });
  if (!target) return new Response(null, { status: 404 });

  const { course } = target.section;
  if (!canAccessLesson(course, target, await getViewer(course.id))) {
    return new Response(null, { status: 403 });
  }

  await setLessonCompleted(session.user.id, target.id, body.completed);
  return new Response(null, { status: 204 });
}
