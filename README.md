# PantryPal

A free, installable recipe organizer PWA. No subscription, no account, no usage limits.

## Included in this first build
- IndexedDB storage on the device (survives reloads and browser restarts)
- Add, edit, delete and search recipes
- Cookbook collections
- Weekly meal planner
- Grocery list and ingredient-to-list actions
- Recipe URL + pasted-text import drafts
- Offline app shell and installable PWA manifest

## Run locally
Serve this folder over HTTPS or localhost (service workers and install prompts require a secure context). For example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Android install
Deploy the folder to an HTTPS host, open the URL in Chrome on Android, then use the browser menu > Install app / Add to Home screen.

## Current limitations / next engineering steps
- Recipe URL import currently saves the URL and parses pasted text into a draft. Reliable automatic extraction requires a server-side recipe parser because browsers cannot freely read other websites due to CORS and anti-bot protections.
- TikTok, Instagram and YouTube imports are not implemented. Their content access is restricted and varies by platform. Next phase should support Android share-in / pasted links, metadata extraction where allowed, and user-pasted captions/transcripts as a fallback.
- Data is local to this browser/device. Cloud backup and multi-device sync are intentionally not included yet; they require a backend and privacy/security design.
- Export/import backup (JSON) should be added before wider use.

## Privacy
This build does not send recipe data to a PantryPal server. All recipe data is stored in the browser's IndexedDB on the device.
