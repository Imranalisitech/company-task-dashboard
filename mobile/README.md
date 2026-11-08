# Company Tasks native app wrapper

This Capacitor project loads the existing HTTPS dashboard, preserving its shared Supabase login and cloud data.

## Build prerequisites
- Node.js 20+
- Android Studio for Android
- macOS and Xcode for iOS
- Google Play Console and Apple Developer accounts for store release

## Generate native projects
From this folder run:
1. `npm install`
2. Create the web placeholder: `mkdir -p www && printf '<!doctype html><html><head><meta http-equiv="refresh" content="0;url=https://company-task-dashboard.onrender.com"></head><body>Opening Company Tasks…</body></html>' > www/index.html`
3. `npm run android:add` and/or `npm run ios:add`
4. `npm run cap:sync`
5. Open with `npm run android:open` or `npm run ios:open`.

Android builds can be made with Android Studio on supported desktop OSes. iOS builds require a Mac with Xcode. Store signing credentials must be supplied by the app owner; never commit signing keys.

## Scope
This first shell is online-connected, not offline-first. Task data continues to live in the existing dashboard and Supabase. Push notifications, biometric unlock, offline editing, device-specific QA, signing and store publishing remain to be completed before release.
