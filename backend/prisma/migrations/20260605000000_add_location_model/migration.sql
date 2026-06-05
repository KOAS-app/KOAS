-- Create Location model and migrate existing locations data

-- Step 1: Create the Location table
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "stadiumId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- Step 2: Migrate existing stadium locations array into Location records
DO $$
DECLARE
    stadium_rec RECORD;
    loc_name TEXT;
    loc_index INT;
BEGIN
    FOR stadium_rec IN SELECT id, locations FROM "Stadium" WHERE array_length(locations, 1) > 0
    LOOP
        loc_index := 0;
        FOREACH loc_name IN ARRAY stadium_rec.locations
        LOOP
            loc_index := loc_index + 1;
            INSERT INTO "Location" ("id", "stadiumId", "name", "address", "images", "createdAt", "updatedAt")
            VALUES (
                gen_random_uuid()::TEXT,
                stadium_rec.id,
                loc_name,
                NULL,
                ARRAY[]::TEXT[],
                NOW(),
                NOW()
            );
        END LOOP;
    END LOOP;
END $$;

-- Step 3: Drop old columns from Stadium
ALTER TABLE "Stadium" DROP COLUMN "locations";
ALTER TABLE "Stadium" DROP COLUMN "imageUrl";

-- Step 4: Add foreign key index
CREATE INDEX "Location_stadiumId_idx" ON "Location"("stadiumId");

ALTER TABLE "Location" ADD CONSTRAINT "Location_stadiumId_fkey" FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id") ON DELETE CASCADE ON UPDATE CASCADE;
