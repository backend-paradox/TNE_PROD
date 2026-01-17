-- AlterTable
ALTER TABLE "tour_packages" ADD COLUMN     "continent" TEXT,
ADD COLUMN     "visa_required" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "tour_package_reviews" (
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

    CONSTRAINT "tour_package_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tour_package_reviews_package_id_idx" ON "tour_package_reviews"("package_id");

-- CreateIndex
CREATE INDEX "tour_package_reviews_user_id_idx" ON "tour_package_reviews"("user_id");

-- AddForeignKey
ALTER TABLE "tour_package_reviews" ADD CONSTRAINT "tour_package_reviews_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "tour_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
