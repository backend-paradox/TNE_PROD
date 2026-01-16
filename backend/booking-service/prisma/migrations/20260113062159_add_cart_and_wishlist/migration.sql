-- CreateTable
CREATE TABLE "cart_items" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "package_id" TEXT NOT NULL,
    "package_type" VARCHAR(20) NOT NULL,
    "package_name" VARCHAR(255) NOT NULL,
    "package_slug" VARCHAR(255) NOT NULL,
    "package_image" VARCHAR(500),
    "package_price" DECIMAL(10,2) NOT NULL,
    "duration" VARCHAR(100),
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist_items" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "package_id" TEXT NOT NULL,
    "package_type" VARCHAR(20) NOT NULL,
    "package_name" VARCHAR(255) NOT NULL,
    "package_slug" VARCHAR(255) NOT NULL,
    "package_image" VARCHAR(500),
    "package_price" DECIMAL(10,2) NOT NULL,
    "duration" VARCHAR(100),
    "destination" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cart_items_user_id_idx" ON "cart_items"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_user_id_package_id_package_type_key" ON "cart_items"("user_id", "package_id", "package_type");

-- CreateIndex
CREATE INDEX "wishlist_items_user_id_idx" ON "wishlist_items"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_items_user_id_package_id_package_type_key" ON "wishlist_items"("user_id", "package_id", "package_type");
