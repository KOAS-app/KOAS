-- Add bookingCode to Booking model
ALTER TABLE "Booking" ADD COLUMN "bookingCode" TEXT;
CREATE UNIQUE INDEX "Booking_bookingCode_key" ON "Booking"("bookingCode");
