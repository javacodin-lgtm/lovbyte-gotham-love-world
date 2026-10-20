# A Little Gotham Love World

A responsive, handmade Batman × Catwoman-inspired gift scrapbook with a customer-friendly editor and a one-click share-link flow. The artwork is original inline SVG/CSS, so the starter does not depend on external image links. Lovbyte appears in the opening scene and end credit.

## What the customer does

1. Open the Lovbyte template and choose **Customize this gift for your person**. The editor also opens directly with `?template=1`.
2. Change the names, messages, photos, soundtrack, and other details.
3. Choose a 6–10 digit recipient passcode.
4. Tick the sharing note, select **Create my gift link**, then **Copy link**.
5. Send the link to their loved one. The loved one enters the passcode before the full letter, photos, or song are returned by the server.

The customer can later return to the editor in the same browser to update or revoke their saved link. The management token stays in that browser's IndexedDB and is not part of the share URL. Clearing browser storage means the customer may lose the ability to update or revoke that link.

## One-time Lovbyte hosting setup

The share-link API requires **Cloudflare Pages**, Cloudflare Pages Functions, one private R2 bucket, and one KV namespace. GitHub Pages serves only the static site and cannot run the share-link functions. The current GitHub Pages link will not create customer-specific links until the project is deployed to Cloudflare Pages and the bindings below are added.

1. Put `index.html`, `gift-config.json`, `_routes.json`, and the `functions/` folder together at the root of the GitHub repository.
2. In Cloudflare, create a Pages project connected to that GitHub repository. Choose no build command and `.` as the build output directory.
3. Create a private R2 bucket for gifts (for example, `lovbyte-gifts`) and a KV namespace for rate limits (for example, `lovbyte-gift-limits`).
4. Open the Pages project **Settings → Bindings**. Add an R2 bucket binding named `GIFTS` and select the bucket. Add a KV namespace binding named `LIMITS` and select the namespace.
5. Redeploy the Pages project so both bindings are active. Open the new Cloudflare Pages URL and test the editor's **Create my gift link** button.
6. Give customers the Cloudflare Pages template URL. They do not need a GitHub or Cloudflare account to customize and make a gift link.

Cloudflare's [Pages Functions bindings guide](https://developers.cloudflare.com/pages/functions/bindings/) describes the R2 and KV binding setup. Its [Functions routing guide](https://developers.cloudflare.com/pages/functions/routing/) documents the `functions/` routing used here.

## Storage, privacy, and limits

- Each published gift is stored in a private R2 bucket under a random ID. The API returns only the recipient name, nickname, opening message, and button text before the passcode.
- The recipient passcode is SHA-256 hashed with the gift ID and checked by the server. The complete gift data is returned only after the passcode is correct. Eight attempts per gift and IP per hour are allowed.
- The owner desk PIN and recipient passcode are not sent in the public preview. Gift data is not end-to-end encrypted; the Lovbyte Cloudflare account controls the storage. After unlocking, the recipient can view the content and browser-delivered media.
- The share URL is unlisted, not a public directory listing. Anyone who gets the URL can attempt the passcode. Send the passcode separately if you want an extra step.
- A customer can **Revoke link** in the same browser that created it. Revocation deletes the saved object and stops that URL from loading.
- Uploaded audio is limited to 10 MB and the complete gift payload to 20 MB. Smaller photos and MP3 files make link creation faster.
- No gift expiration is configured; links remain until their owner revokes them or Lovbyte deletes them.
- Cloudflare storage and request quotas apply to the Lovbyte account. Set Cloudflare alerts or limits before inviting a large audience.

The older download option remains available for a customer who wants to host a separate copy manually. `Save in this browser` only saves a local preview; it does not create a share link.

## Music player

The owner can choose six player styles, shape, width, location, cover, title, background, accent, and spin/breathe/still animation. An uploaded MP3, M4A, OGG, or WAV file up to 10 MB works with play/pause and volume. A direct HTTPS audio URL also works; a normal song webpage link does not.

Spotify or SoundCloud embed URLs are supported. Those providers render their own controls inside the widget, so the page's custom play and volume buttons cannot control provider embeds. Audio waits for the visitor to press play.

## Preview and static hosting

Open `index.html` in a modern browser to preview the design. Browser file pages may block loading `gift-config.json`; use the local editor or a local web server for that preview.

GitHub Pages, Netlify, and other static hosts can still show the starter gift, but the one-click per-customer link flow runs only after the `functions/` directory is deployed on Cloudflare Pages with the `GIFTS` and `LIMITS` bindings.
