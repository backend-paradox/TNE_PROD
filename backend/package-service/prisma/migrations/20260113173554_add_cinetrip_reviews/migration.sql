-- AlterTable
ALTER TABLE "cinetrip_packages" ADD COLUMN "rating" DECIMAL(2,1) NOT NULL DEFAULT 0,
ADD COLUMN "review_count" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "cinetrip_reviews" (
    "id" TEXT NOT NULL,
    "package_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "user_email" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cinetrip_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cinetrip_reviews_package_id_idx" ON "cinetrip_reviews"("package_id");

-- CreateIndex
CREATE INDEX "cinetrip_reviews_user_id_idx" ON "cinetrip_reviews"("user_id");

-- AddForeignKey
ALTER TABLE "cinetrip_reviews" ADD CONSTRAINT "cinetrip_reviews_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "cinetrip_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
