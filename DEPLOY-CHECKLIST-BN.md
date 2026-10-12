# Glossy Home Cloud Setup — বাংলা নির্দেশনা

এই ZIP-এ নতুন কোড প্রস্তুত আছে, কিন্তু আপনার GitHub/Cloudflare/Neon অ্যাকাউন্টে এটি স্বয়ংক্রিয়ভাবে প্রকাশ করা হয়নি। প্রকাশের জন্য নিচের কাজগুলো করতে হবে।

## 1) Neon
1. Neon-এ আপনার Glossy Home project/branch খুলুন।
2. SQL Editor খুলে `neon-schema.sql`-এর SQL চালান। এটি একটি নতুন state table তৈরি করবে; অন্য টেবিল মুছবে না।
3. Neon connection string কপি করুন। এটি ব্যক্তিগত—কাউকে পাঠাবেন না।

## 2) Cloudflare Worker
1. `cloudflare-worker` ফোল্ডারে PowerShell/Terminal খুলুন।
2. `npm install` চালান।
3. `npx wrangler login` চালিয়ে নিজের Cloudflare account-এ অনুমতি দিন।
4. প্রথমে staging হিসেবে `wrangler.toml`-এর বর্তমান `name = "glossy-home-mobile"` রেখেই deploy করুন। এতে পুরোনো live Worker বদলাবে না।
5. নিচের secrets এক এক করে সেট করুন; বাস্তব value এখানে বা GitHub-এ লিখবেন না:
   - `npx wrangler secret put DATABASE_URL`
   - `npx wrangler secret put ADMIN_ID`
   - `npx wrangler secret put ADMIN_PASSWORD`
   - `npx wrangler secret put ADMIN_TOKEN_SECRET`
6. `npm run deploy` চালান।
7. `https://YOUR-WORKER-URL/api/health` খুলে `ok:true`, `databaseConfigured:true`, `authConfigured:true` দেখুন।
8. staging-এ login ও cloud sync পরীক্ষা করুন। এই staging URL-এ পুরোনো ফোনের localStorage থাকবে না।
9. **Production-এ যাওয়ার সময়** একই URL/origin রাখতে পুরোনো Worker `lingering-glade-fb92`-এর নামেই deploy করতে হবে—এতে বর্তমান Android app URL ও localStorage origin বজায় থাকবে। এটি পুরোনো Worker code replace করবে, তাই staging পরীক্ষা ও source/checkpoint নিশ্চিত হওয়ার পরই করুন। Android `MainActivity.java`-এর URL বদলাবেন না, যদি একই production Worker নাম রাখা হয়।

## 3) GitHub
- `cloudflare-worker`, `web-app`, `android-project`, `neon-schema.sql`, এবং ডকুমেন্টেশন নিজের private GitHub repository-তে commit করুন।
- `.dev.vars`, Neon connection string, Admin password, token secret বা real JSON backup কখনো repository-তে দেবেন না।

## 4) ডেটা সিঙ্ক কীভাবে কাজ করবে
- Admin ID/password Worker secrets-এ যাচাই হয়; HTML-এ credentials নেই।
- লগইন token 12 ঘণ্টা বৈধ।
- প্রথমবার Cloud database খালি থাকলে, বর্তমান ডিভাইসে প্রকৃত data থাকলে সেটি প্রথম cloud copy হবে। Starter-only data থাকলে স্বয়ংক্রিয়ভাবে upload হবে না; আলাদা confirmation লাগে।
- প্রতিটি save localStorage-এ রাখা হয় এবং তারপর Cloudflare API-তে Neon-এ সিঙ্ক হয়। Sync ব্যর্থ হলেও local copy মুছে যায় না।
- API-তে server-side auth আছে; client-side login screen একমাত্র security নয়।

## গুরুত্বপূর্ণ সীমাবদ্ধতা
- এটি single-property-manager state store; বহু আলাদা ব্যবহারকারী/বিল্ডিংয়ের জন্য multi-tenant schema এখনো তৈরি করা হয়নি।
- ছবির base64 data বড় হলে 5 MB API request limit-এ আটকে যেতে পারে। Production listing photos-এর জন্য Cloudflare R2 image upload পরবর্তী ধাপে যোগ করতে হবে।
- Android app এখন `https://lingering-glade-fb92.glossyhome-uae.workers.dev/` খোলে। নতুন staging URL-এ পরীক্ষা করলে সেটি আলাদা origin হবে এবং পুরোনো localStorage দেখবে না। Production-এ একই Worker name/URL রাখতে হবে যাতে বর্তমান app ও localStorage origin অক্ষত থাকে। নতুন origin-এ স্থায়ীভাবে সরালে data আলাদা থাকবে এবং আলাদা migration লাগবে।


## Version 3 — Dashboard / Projects
1. Open each existing flat with **Edit Flat** and enter Building / Project Name, Owner Name, and Owner Rent if known.
2. Dashboard cards calculate rent collection using current-month payments and current tenant rent.
3. Project cards group by Building / Project Name. Unassigned flats remain grouped as “Building Not Assigned” until assigned; do not guess owner/building data.
4. Flat detail bill summary uses bills recorded for the current month. “Net Balance” is collected rent minus recorded bill/cost amounts; rent balance is shown separately.
5. Test on staging with a copy of data before publishing.
