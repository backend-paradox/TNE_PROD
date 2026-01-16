-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('HOTEL', 'FLIGHT', 'BUS', 'EVENT', 'PACKAGE');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'PAYMENT_PENDING', 'PAYMENT_FAILED', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PassengerType" AS ENUM ('ADULT', 'CHILD', 'INFANT');

-- CreateEnum
CREATE TYPE "GuestType" AS ENUM ('ADULT', 'CHILD');

-- CreateTable
CREATE TABLE "bookings" (
    "id" SERIAL NOT NULL,
    "booking_number" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "BookingType" NOT NULL,
    "hotel_id" INTEGER,
    "flight_id" INTEGER,
    "bus_id" INTEGER,
    "event_id" INTEGER,
    "package_id" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "booking_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "travel_date" TIMESTAMP(3),
    "return_date" TIMESTAMP(3),
    "check_in_date" TIMESTAMP(3),
    "check_out_date" TIMESTAMP(3),
    "event_date" TIMESTAMP(3),
    "base_price" DECIMAL(10,2) NOT NULL,
    "tax_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "payment_id" INTEGER,
    "payment_status" VARCHAR(50) DEFAULT 'PENDING',
    "guests" JSONB,
    "passengers" JSONB,
    "attendees" JSONB,
    "special_requests" TEXT,
    "notes" TEXT,
    "contact_name" VARCHAR(120) NOT NULL,
    "contact_email" VARCHAR(120) NOT NULL,
    "contact_phone" VARCHAR(20) NOT NULL,
    "cancelled_at" TIMESTAMP(3),
    "cancelled_by" INTEGER,
    "cancellation_reason" TEXT,
    "refund_amount" DECIMAL(10,2),
    "refund_status" VARCHAR(50),
    "confirmed_at" TIMESTAMP(3),
    "confirmation_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotel_bookings" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "hotel_id" INTEGER NOT NULL,
    "room_type" VARCHAR(100) NOT NULL,
    "number_of_rooms" INTEGER NOT NULL DEFAULT 1,
    "number_of_guests" INTEGER NOT NULL,
    "number_of_nights" INTEGER NOT NULL,
    "meals_included" BOOLEAN NOT NULL DEFAULT false,
    "meal_plan" VARCHAR(50),
    "extra_beds" INTEGER NOT NULL DEFAULT 0,
    "room_numbers" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotel_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flight_bookings" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "flight_id" INTEGER NOT NULL,
    "flight_number" VARCHAR(20) NOT NULL,
    "airline" VARCHAR(100) NOT NULL,
    "origin" VARCHAR(100) NOT NULL,
    "destination" VARCHAR(100) NOT NULL,
    "departure_time" TIMESTAMP(3) NOT NULL,
    "arrival_time" TIMESTAMP(3) NOT NULL,
    "number_of_passengers" INTEGER NOT NULL,
    "adult_count" INTEGER NOT NULL DEFAULT 0,
    "child_count" INTEGER NOT NULL DEFAULT 0,
    "infant_count" INTEGER NOT NULL DEFAULT 0,
    "cabin_class" VARCHAR(50) NOT NULL,
    "baggage_allowance" VARCHAR(100) NOT NULL,
    "pnr" VARCHAR(10),
    "seats" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flight_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_reviews" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "service_quality" INTEGER,
    "value_for_money" INTEGER,
    "cleanliness" INTEGER,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(120) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "message" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bookings_booking_number_key" ON "bookings"("booking_number");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_payment_id_key" ON "bookings"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_confirmation_code_key" ON "bookings"("confirmation_code");

-- CreateIndex
CREATE INDEX "bookings_user_id_idx" ON "bookings"("user_id");

-- CreateIndex
CREATE INDEX "bookings_booking_number_idx" ON "bookings"("booking_number");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_type_idx" ON "bookings"("type");

-- CreateIndex
CREATE INDEX "bookings_payment_id_idx" ON "bookings"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "hotel_bookings_booking_id_key" ON "hotel_bookings"("booking_id");

-- CreateIndex
CREATE INDEX "hotel_bookings_hotel_id_idx" ON "hotel_bookings"("hotel_id");

-- CreateIndex
CREATE UNIQUE INDEX "flight_bookings_booking_id_key" ON "flight_bookings"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "flight_bookings_pnr_key" ON "flight_bookings"("pnr");

-- CreateIndex
CREATE INDEX "flight_bookings_flight_id_idx" ON "flight_bookings"("flight_id");

-- CreateIndex
CREATE INDEX "flight_bookings_pnr_idx" ON "flight_bookings"("pnr");

-- CreateIndex
CREATE INDEX "booking_reviews_booking_id_idx" ON "booking_reviews"("booking_id");

-- CreateIndex
CREATE INDEX "booking_reviews_user_id_idx" ON "booking_reviews"("user_id");

-- CreateIndex
CREATE INDEX "quotes_status_idx" ON "quotes"("status");

-- CreateIndex
CREATE INDEX "quotes_email_idx" ON "quotes"("email");

-- AddForeignKey
ALTER TABLE "hotel_bookings" ADD CONSTRAINT "hotel_bookings_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_bookings" ADD CONSTRAINT "flight_bookings_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_reviews" ADD CONSTRAINT "booking_reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
