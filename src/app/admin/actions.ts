"use server";

import { asc, count, eq, max, type SQL } from "drizzle-orm";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { head } from "@vercel/blob";
import {
  ACCESS_TYPES,
  course,
  lesson,
  lessonAttachment,
  purchase,
  section,
} from "@/db/schema";
import {
  attachmentsToken,
  deleteAttachmentBlobs,
  deleteBlobIfUnused,
} from "@/lib/blob";
import { attachmentExtension, isAttachmentPathname } from "@/lib/constants";
import { requireAdmin } from "@/lib/session";
import { fetchVimeoDuration, parseVimeoInput } from "@/lib/vimeo";

export type ActionState = { error?: string; message?: string } | undefined;

const slugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "スラッグは半角英小文字・数字・ハイフンで入力してください");

const optionalInt = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : Number(v)))
  .refine((v) => v === null || (Number.isInteger(v) && v >= 0), "0以上の整数で入力してください");

const courseSchema = z
  .object({
    title: z.string().trim().min(1, "タイトルは必須です"),
    slug: slugSchema,
    description: z.string(),
    thumbnailUrl: z
      .union([z.literal(""), z.url("サムネイルURLが正しくありません")])
      .transform((v) => v || null),
    accessType: z.enum(ACCESS_TYPES),
    priceJpy: optionalInt,
    sortOrder: optionalInt.transform((v) => v ?? 0),
    isPublished: z.boolean(),
  })
  .refine((c) => c.accessType !== "purchase" || c.priceJpy !== null, {
    message: "買い切り講座には価格を設定してください",
  })
  // Stripe の日本円の最低決済金額
  .refine((c) => c.accessType !== "purchase" || (c.priceJpy ?? 0) >= 50, {
    message: "買い切り講座の価格は50円以上にしてください",
  });

function firstError(error: z.ZodError) {
  return error.issues[0]?.message ?? "入力内容を確認してください";
}

async function slugTaken(slug: string, exceptId?: string) {
  const found = await db.query.course.findFirst({
    where: eq(course.slug, slug),
    columns: { id: true },
  });
  return !!found && found.id !== exceptId;
}

/** 削除対象に含まれる添付ファイルの保存先パス（行の削除はカスケードされるので、先に集めておく） */
async function attachmentPathnames(where: SQL | undefined) {
  const rows = await db
    .select({ pathname: lessonAttachment.blobPathname })
    .from(lessonAttachment)
    .innerJoin(lesson, eq(lessonAttachment.lessonId, lesson.id))
    .innerJoin(section, eq(lesson.sectionId, section.id))
    .where(where);
  return rows.map((r) => r.pathname);
}

// ---------- 講座 ----------

export async function createCourse(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = z
    .object({ title: z.string().trim().min(1, "タイトルは必須です"), slug: slugSchema })
    .safeParse({ title: formData.get("title"), slug: formData.get("slug") });
  if (!parsed.success) return { error: firstError(parsed.error) };
  if (await slugTaken(parsed.data.slug)) return { error: "このスラッグは既に使われています" };

  const [created] = await db.insert(course).values(parsed.data).returning({ id: course.id });
  redirect(`/admin/courses/${created.id}`);
}

export async function updateCourse(
  courseId: string,
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = courseSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description") ?? "",
    thumbnailUrl: formData.get("thumbnailUrl") ?? "",
    accessType: formData.get("accessType"),
    priceJpy: formData.get("priceJpy") ?? "",
    sortOrder: formData.get("sortOrder") ?? "",
    isPublished: formData.get("isPublished") === "on",
  });
  if (!parsed.success) return { error: firstError(parsed.error) };
  if (await slugTaken(parsed.data.slug, courseId)) return { error: "このスラッグは既に使われています" };

  const before = await db.query.course.findFirst({
    where: eq(course.id, courseId),
    columns: { thumbnailUrl: true },
  });
  await db.update(course).set(parsed.data).where(eq(course.id, courseId));
  await deleteBlobIfUnused(before?.thumbnailUrl ?? null, parsed.data.thumbnailUrl);
  refresh();
  return { message: "保存しました" };
}

export async function deleteCourse(courseId: string): Promise<ActionState> {
  await requireAdmin();
  const [{ purchases }] = await db
    .select({ purchases: count() })
    .from(purchase)
    .where(eq(purchase.courseId, courseId));
  if (purchases > 0) {
    return { error: "購入者がいる講座は削除できません。非公開にしてください。" };
  }
  const pathnames = await attachmentPathnames(eq(section.courseId, courseId));
  const [deleted] = await db
    .delete(course)
    .where(eq(course.id, courseId))
    .returning({ thumbnailUrl: course.thumbnailUrl });
  await deleteBlobIfUnused(deleted?.thumbnailUrl ?? null);
  await deleteAttachmentBlobs(pathnames);
  redirect("/admin/courses");
}

// ---------- 章 ----------

export async function addSection(courseId: string, formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const [{ last }] = await db
    .select({ last: max(section.sortOrder) })
    .from(section)
    .where(eq(section.courseId, courseId));
  await db.insert(section).values({ courseId, title, sortOrder: (last ?? -1) + 1 });
  refresh();
}

export async function renameSection(sectionId: string, formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  await db.update(section).set({ title }).where(eq(section.id, sectionId));
  refresh();
}

export async function deleteSection(sectionId: string) {
  await requireAdmin();
  const pathnames = await attachmentPathnames(eq(section.id, sectionId));
  await db.delete(section).where(eq(section.id, sectionId));
  await deleteAttachmentBlobs(pathnames);
  refresh();
}

export async function moveSection(sectionId: string, direction: -1 | 1) {
  await requireAdmin();
  const target = await db.query.section.findFirst({ where: eq(section.id, sectionId) });
  if (!target) return;
  const siblings = await db
    .select({ id: section.id })
    .from(section)
    .where(eq(section.courseId, target.courseId))
    .orderBy(asc(section.sortOrder), asc(section.createdAt));
  await reorder(siblings, sectionId, direction, (id, sortOrder) =>
    db.update(section).set({ sortOrder }).where(eq(section.id, id)),
  );
  refresh();
}

// ---------- レッスン ----------

export async function addLesson(sectionId: string, formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const [{ last }] = await db
    .select({ last: max(lesson.sortOrder) })
    .from(lesson)
    .where(eq(lesson.sectionId, sectionId));
  await db.insert(lesson).values({ sectionId, title, sortOrder: (last ?? -1) + 1 });
  refresh();
}

export async function updateLesson(
  lessonId: string,
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = z
    .object({
      title: z.string().trim().min(1, "タイトルは必須です"),
      vimeo: z.string().trim(),
      durationSec: optionalInt,
      isPreview: z.boolean(),
      bodyMarkdown: z.string(),
    })
    .safeParse({
      title: formData.get("title"),
      vimeo: formData.get("vimeo") ?? "",
      durationSec: formData.get("durationSec") ?? "",
      isPreview: formData.get("isPreview") === "on",
      bodyMarkdown: formData.get("bodyMarkdown") ?? "",
    });
  if (!parsed.success) return { error: firstError(parsed.error) };
  const { vimeo, ...rest } = parsed.data;

  const vimeoVideoId = vimeo === "" ? null : parseVimeoInput(vimeo);
  if (vimeo !== "" && !vimeoVideoId) {
    return { error: "Vimeo の動画ID または URL を正しく入力してください" };
  }
  // 再生時間が空欄なら Vimeo から取得を試みる（取得できなければ空のまま）
  const durationSec =
    rest.durationSec ?? (vimeoVideoId ? await fetchVimeoDuration(vimeoVideoId) : null);

  await db
    .update(lesson)
    .set({ ...rest, vimeoVideoId, durationSec })
    .where(eq(lesson.id, lessonId));
  refresh();
  return { message: "保存しました" };
}

export async function deleteLesson(lessonId: string): Promise<ActionState> {
  await requireAdmin();
  const target = await db.query.lesson.findFirst({
    where: eq(lesson.id, lessonId),
    with: { section: { columns: { courseId: true } } },
  });
  if (!target) return { error: "レッスンが見つかりません" };
  const pathnames = await attachmentPathnames(eq(lesson.id, lessonId));
  await db.delete(lesson).where(eq(lesson.id, lessonId));
  await deleteAttachmentBlobs(pathnames);
  redirect(`/admin/courses/${target.section.courseId}`);
}

export async function moveLesson(lessonId: string, direction: -1 | 1) {
  await requireAdmin();
  const target = await db.query.lesson.findFirst({ where: eq(lesson.id, lessonId) });
  if (!target) return;
  const siblings = await db
    .select({ id: lesson.id })
    .from(lesson)
    .where(eq(lesson.sectionId, target.sectionId))
    .orderBy(asc(lesson.sortOrder), asc(lesson.createdAt));
  await reorder(siblings, lessonId, direction, (id, sortOrder) =>
    db.update(lesson).set({ sortOrder }).where(eq(lesson.id, id)),
  );
  refresh();
}

type BatchItem = Parameters<typeof db.batch>[0][number];

/** 隣と入れ替えたうえで 0,1,2… と振り直す（同じ sortOrder が混ざっていても安定させる） */
async function reorder(
  siblings: { id: string }[],
  id: string,
  direction: -1 | 1,
  update: (id: string, sortOrder: number) => BatchItem,
) {
  const ids = siblings.map((s) => s.id);
  const from = ids.indexOf(id);
  const to = from + direction;
  if (from === -1 || to < 0 || to >= ids.length) return;
  [ids[from], ids[to]] = [ids[to], ids[from]];
  const [first, ...others] = ids.map((sid, i) => update(sid, i));
  await db.batch([first, ...others]);
}

// ---------- 添付ファイル ----------

/** ブラウザから Blob へのアップロードが終わったあとに、添付ファイルとして登録する */
export async function addAttachment(
  lessonId: string,
  upload: { pathname: string; fileName: string },
): Promise<ActionState> {
  await requireAdmin();
  const fileName = upload.fileName.trim().slice(0, 200);
  if (!fileName || !attachmentExtension(fileName) || !isAttachmentPathname(upload.pathname, lessonId)) {
    return { error: "ファイルの情報が正しくありません" };
  }
  const target = await db.query.lesson.findFirst({
    where: eq(lesson.id, lessonId),
    columns: { id: true },
  });
  if (!target) return { error: "レッスンが見つかりません" };

  // サイズはクライアントの申告ではなく、実際に保存されたファイルから取る
  let sizeBytes: number;
  try {
    sizeBytes = (await head(upload.pathname, { token: attachmentsToken() })).size;
  } catch {
    return { error: "アップロードされたファイルが見つかりません" };
  }

  await db.insert(lessonAttachment).values({
    lessonId,
    fileName,
    blobPathname: upload.pathname,
    sizeBytes,
  });
  refresh();
  return { message: `${fileName} を追加しました` };
}

export async function deleteAttachment(attachmentId: string) {
  await requireAdmin();
  const [deleted] = await db
    .delete(lessonAttachment)
    .where(eq(lessonAttachment.id, attachmentId))
    .returning({ pathname: lessonAttachment.blobPathname });
  if (deleted) await deleteAttachmentBlobs([deleted.pathname]);
  refresh();
}
