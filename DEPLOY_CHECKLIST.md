# Cardio Club deploy checklist

## Local demo

1. Install dependencies:
   npm install

2. Generate Prisma client:
   npx prisma generate

3. Run migrations:
   npx prisma migrate dev

4. Seed demo content:
   npm run db:seed:demo

5. Make admin user:
   npm run admin:make -- your@email.com

6. Check demo readiness:
   npm run demo:check

7. Build:
   npm run build

8. Start dev server:
   npm run dev

## Demo pages

- Site: http://localhost:3000
- Admin dashboard: http://localhost:3000/admin
- Materials: http://localhost:3000/admin/materials
- Categories: http://localhost:3000/admin/categories
- Users: http://localhost:3000/admin/users
- Library: http://localhost:3000/library
- ECG base: http://localhost:3000/library/base
- Video lectures: http://localhost:3000/videolecture
- Health check: http://localhost:3000/api/health

## What to show

1. Open public site.
2. Open library and video lectures.
3. Log in as admin.
4. Open admin dashboard.
5. Create or edit a material.
6. Open preview.
7. Publish material.
8. Show that material appears on the public site.
9. Show user subscription management.
10. Show health check.