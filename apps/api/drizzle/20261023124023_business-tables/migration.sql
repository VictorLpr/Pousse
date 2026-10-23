CREATE TYPE "age_range" AS ENUM('4-7', '8-12', '4-12');--> statement-breakpoint
CREATE TYPE "challenge_category" AS ENUM('helping', 'creativity', 'learning', 'politeness');--> statement-breakpoint
CREATE TYPE "child_challenge_status" AS ENUM('proposed', 'chosen', 'completed', 'abandoned', 'expired');--> statement-breakpoint
CREATE TYPE "pride_letter_status" AS ENUM('pending', 'generated', 'failed');--> statement-breakpoint
CREATE TABLE "badge" (
	"id" smallint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "badge_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 32767 START WITH 1 CACHE 1),
	"code" varchar(30) NOT NULL UNIQUE,
	"label" varchar(60) NOT NULL,
	"description" varchar(200)
);
--> statement-breakpoint
CREATE TABLE "badge_award" (
	"child_id" uuid,
	"badge_id" smallint,
	"awarded_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "badge_award_pkey" PRIMARY KEY("child_id","badge_id")
);
--> statement-breakpoint
CREATE TABLE "challenge" (
	"id" smallint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "challenge_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 32767 START WITH 1 CACHE 1),
	"title" varchar(100) NOT NULL,
	"description" varchar(300) NOT NULL,
	"age_range" "age_range" NOT NULL,
	"category" "challenge_category" NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "child" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"parent_id" uuid NOT NULL,
	"first_name" varchar(50) NOT NULL,
	"birth_date" date NOT NULL,
	"avatar" varchar(30),
	"reminder_time" time DEFAULT '20:00' NOT NULL,
	"reminder_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "child_first_name_not_blank" CHECK (char_length(trim("first_name")) > 0)
);
--> statement-breakpoint
CREATE TABLE "child_challenge" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"child_id" uuid NOT NULL,
	"challenge_id" smallint NOT NULL,
	"week_start" date NOT NULL,
	"status" "child_challenge_status" DEFAULT 'proposed'::"child_challenge_status" NOT NULL,
	"chosen_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	CONSTRAINT "child_challenge_child_id_challenge_id_week_start_unique" UNIQUE("child_id","challenge_id","week_start"),
	CONSTRAINT "child_challenge_week_start_is_monday" CHECK (extract(isodow from "week_start") = 1),
	CONSTRAINT "child_challenge_dates_match_status" CHECK (("status" = 'proposed' and "chosen_at" is null and "completed_at" is null)
        or ("status" in ('chosen', 'abandoned') and "chosen_at" is not null and "completed_at" is null)
        or ("status" = 'completed' and "chosen_at" is not null and "completed_at" is not null
          and "completed_at" >= "chosen_at")
        or ("status" = 'expired' and "completed_at" is null))
);
--> statement-breakpoint
CREATE TABLE "consent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"child_id" uuid NOT NULL UNIQUE,
	"given_at" timestamp with time zone DEFAULT now() NOT NULL,
	"policy_version" varchar(10) NOT NULL,
	"guardian_attested" boolean NOT NULL,
	CONSTRAINT "consent_guardian_attested" CHECK ("guardian_attested" = true)
);
--> statement-breakpoint
CREATE TABLE "emotion" (
	"id" smallint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "emotion_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 32767 START WITH 1 CACHE 1),
	"code" varchar(20) NOT NULL UNIQUE,
	"label" varchar(30) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_entry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"child_id" uuid NOT NULL,
	"emotion_id" smallint NOT NULL,
	"date" date NOT NULL,
	"text" varchar(500) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "journal_entry_child_id_date_unique" UNIQUE("child_id","date"),
	CONSTRAINT "journal_entry_text_not_blank" CHECK (char_length(trim("text")) > 0)
);
--> statement-breakpoint
CREATE TABLE "photo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"journal_entry_id" uuid NOT NULL UNIQUE,
	"file_name" varchar(255) NOT NULL,
	"mime_type" varchar(30) NOT NULL,
	CONSTRAINT "photo_mime_type_allowed" CHECK ("mime_type" in ('image/jpeg', 'image/png', 'image/webp'))
);
--> statement-breakpoint
CREATE TABLE "pride_letter" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"child_id" uuid NOT NULL,
	"month" date NOT NULL,
	"status" "pride_letter_status" DEFAULT 'pending'::"pride_letter_status" NOT NULL,
	"content" text,
	"generated_at" timestamp with time zone,
	"ai_model" varchar(50),
	"anonymous_id" uuid DEFAULT gen_random_uuid() NOT NULL UNIQUE,
	CONSTRAINT "pride_letter_child_id_month_unique" UNIQUE("child_id","month"),
	CONSTRAINT "pride_letter_month_is_first_day" CHECK (extract(day from "month") = 1),
	CONSTRAINT "pride_letter_generated_has_content" CHECK ("status" <> 'generated'
        or ("content" is not null and "generated_at" is not null and "ai_model" is not null))
);
--> statement-breakpoint
CREATE INDEX "badge_award_badge_id_idx" ON "badge_award" ("badge_id");--> statement-breakpoint
CREATE INDEX "child_parent_id_idx" ON "child" ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "child_challenge_one_taken_per_week_idx" ON "child_challenge" ("child_id","week_start") WHERE "status" in ('chosen', 'completed');--> statement-breakpoint
CREATE INDEX "child_challenge_challenge_id_idx" ON "child_challenge" ("challenge_id");--> statement-breakpoint
ALTER TABLE "badge_award" ADD CONSTRAINT "badge_award_child_id_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "badge_award" ADD CONSTRAINT "badge_award_badge_id_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badge"("id");--> statement-breakpoint
ALTER TABLE "child" ADD CONSTRAINT "child_parent_id_user_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "child_challenge" ADD CONSTRAINT "child_challenge_child_id_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "child_challenge" ADD CONSTRAINT "child_challenge_challenge_id_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenge"("id");--> statement-breakpoint
ALTER TABLE "consent" ADD CONSTRAINT "consent_child_id_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "journal_entry" ADD CONSTRAINT "journal_entry_child_id_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "journal_entry" ADD CONSTRAINT "journal_entry_emotion_id_emotion_id_fkey" FOREIGN KEY ("emotion_id") REFERENCES "emotion"("id");--> statement-breakpoint
ALTER TABLE "photo" ADD CONSTRAINT "photo_journal_entry_id_journal_entry_id_fkey" FOREIGN KEY ("journal_entry_id") REFERENCES "journal_entry"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "pride_letter" ADD CONSTRAINT "pride_letter_child_id_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child"("id") ON DELETE CASCADE;