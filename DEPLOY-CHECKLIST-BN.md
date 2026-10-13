# Deploy Checklist (Bangla)

- Cloudflare secrets-এ `DATABASE_URL`, `ADMIN_ID`, `ADMIN_PASSWORD`, `ADMIN_TOKEN_SECRET` সেট করুন। আসল secret GitHub-এ দেবেন না।
- Neon SQL editor-এ `neon-schema.sql` একবার চালান।
- `cloudflare-worker` ফোল্ডারে `npm install`, `npm run typecheck`, `npm run deploy` চালান।
- `/api/health` এবং `/api/v1/public-data` খুলে দেখুন।
- প্রথম cloud copy করার সময় যে ডিভাইসে আসল ডাটা আছে, সেই ডিভাইসের Admin login ব্যবহার করুন। conflict prompt এলে যাচাই ছাড়া কোনো copy overwrite করবেন না।
- GitHub-এ এই ZIP-এর ভিতরের `GlossyHome-Property-Rent-Manager-Final` ফোল্ডারের contents আপলোড করুন।
