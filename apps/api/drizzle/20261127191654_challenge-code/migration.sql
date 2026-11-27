ALTER TABLE "challenge" ADD COLUMN "code" varchar(40) NOT NULL;--> statement-breakpoint
ALTER TABLE "challenge" ADD CONSTRAINT "challenge_code_key" UNIQUE("code");