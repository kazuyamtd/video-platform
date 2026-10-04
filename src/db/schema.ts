import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { ACCESS_TYPES } from "../lib/constants";
import { user } from "./auth-schema";

export * from "./auth-schema";
export { ACCESS_TYPES, type AccessType } from "../lib/constants";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
};

export const course = sqliteTable("course", {
  id: id(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  thumbnailUrl: text("thumbnail_url"),
  accessType: text("access_type", { enum: ACCESS_TYPES })
    .notNull()
    .default("free"),
  // 買い切り講座の価格（円）と Stripe の Price ID
  priceJpy: integer("price_jpy"),
  stripePriceId: text("stripe_price_id"),
  isPublished: integer("is_published", { mode: "boolean" })
    .notNull()
    .default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const section = sqliteTable(
  "section",
  {
    id: id(),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("section_course_idx").on(t.courseId)],
);

export const lesson = sqliteTable(
  "lesson",
  {
    id: id(),
    sectionId: text("section_id")
      .notNull()
      .references(() => section.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    // "123456789" または限定公開動画の "123456789/abcdef1234"
    vimeoVideoId: text("vimeo_video_id"),
    durationSec: integer("duration_sec"),
    isPreview: integer("is_preview", { mode: "boolean" })
      .notNull()
      .default(false),
    bodyMarkdown: text("body_markdown").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("lesson_section_idx").on(t.sectionId)],
);

export const lessonAttachment = sqliteTable(
  "lesson_attachment",
  {
    id: id(),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lesson.id, { onDelete: "cascade" }),
    fileName: text("file_name").notNull(),
    r2Key: text("r2_key").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    ...timestamps,
  },
  (t) => [index("lesson_attachment_lesson_idx").on(t.lessonId)],
);

export const purchase = sqliteTable(
  "purchase",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "restrict" }),
    stripeCheckoutSessionId: text("stripe_checkout_session_id")
      .notNull()
      .unique(),
    amountJpy: integer("amount_jpy").notNull(),
    ...timestamps,
  },
  (t) => [uniqueIndex("purchase_user_course_uq").on(t.userId, t.courseId)],
);

export const lessonProgress = sqliteTable(
  "lesson_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lesson.id, { onDelete: "cascade" }),
    positionSec: integer("position_sec").notNull().default(0),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
    ...timestamps,
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] })],
);

export const courseRelations = relations(course, ({ many }) => ({
  sections: many(section),
}));

export const sectionRelations = relations(section, ({ one, many }) => ({
  course: one(course, { fields: [section.courseId], references: [course.id] }),
  lessons: many(lesson),
}));

export const lessonRelations = relations(lesson, ({ one, many }) => ({
  section: one(section, {
    fields: [lesson.sectionId],
    references: [section.id],
  }),
  attachments: many(lessonAttachment),
}));

export const lessonAttachmentRelations = relations(
  lessonAttachment,
  ({ one }) => ({
    lesson: one(lesson, {
      fields: [lessonAttachment.lessonId],
      references: [lesson.id],
    }),
  }),
);

export type Course = typeof course.$inferSelect;
export type Section = typeof section.$inferSelect;
export type Lesson = typeof lesson.$inferSelect;
