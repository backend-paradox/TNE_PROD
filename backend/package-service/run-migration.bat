@echo off
echo Running Prisma migration for CineTrip reviews...
echo.
npx prisma migrate dev --name add_cinetrip_reviews
echo.
echo Migration completed!
pause
