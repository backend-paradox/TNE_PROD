-- CreateTable
CREATE TABLE "cinetrip_packages" (
    "id" TEXT NOT NULL,
    "package_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "short_description" TEXT NOT NULL,
    "long_description" TEXT,
    "image" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "price_display" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "features" TEXT[],
    "delivery_time" TEXT,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cinetrip_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_packages" (
    "id" TEXT NOT NULL,
    "package_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'India',
    "category" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "short_description" TEXT NOT NULL,
    "long_description" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "starting_price" DECIMAL(10,2) NOT NULL,
    "price_type" TEXT NOT NULL DEFAULT 'Per Person',
    "best_season" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'Easy',
    "max_group_size" INTEGER NOT NULL DEFAULT 20,
    "tags" TEXT[],
    "highlights" TEXT[],
    "inclusions" TEXT[],
    "exclusions" TEXT[],
    "itinerary" JSONB NOT NULL,
    "faqs" JSONB NOT NULL,
    "rating" DECIMAL(2,1) NOT NULL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "trending" BOOLEAN NOT NULL DEFAULT false,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "image_url" TEXT NOT NULL,
    "gallery_images" TEXT[],
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tour_packages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cinetrip_packages_package_id_key" ON "cinetrip_packages"("package_id");

-- CreateIndex
CREATE UNIQUE INDEX "cinetrip_packages_slug_key" ON "cinetrip_packages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tour_packages_package_id_key" ON "tour_packages"("package_id");

-- CreateIndex
CREATE UNIQUE INDEX "tour_packages_slug_key" ON "tour_packages"("slug");
