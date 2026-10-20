# A Little Gotham Love World

A responsive, self-contained Batman × Catwoman-inspired scrapbook gift. The artwork is original inline SVG/CSS, so it does not rely on external image links. The Lovbyte signature appears at the opening and in the end credit.

## Preview it

Open the index.html file in a modern browser. No install or build step is needed. Some browsers restrict fetching gift-config.json from a file page, so use the owner editor or a small local web server when checking the published config file.

## Personalize it without coding

1. On the opening screen, choose **Customize this gift for your person ↗**. You can also press Ctrl + Shift + E (on a Mac, Control + Shift + E), or open the link with ?edit=1. The owner desk opens behind a PIN prompt; it is separate from the recipient's gift experience.
2. The starter Owner Desk PIN is 1212. Change it in Your secret & your words. The recipient's starter passcode is 0406; set your own 4–10 digit code before sharing.
3. Edit names, title and button text, note, letter, dialogue, secrets, reasons, theme, photos, artwork, and music. Add or replace photos, adjust frame size, position and rotation, move a sticker, and edit captions and dates. Photo uploads are resized for a manageable gift file; uploaded audio is limited to 18 MB.
4. Save in this browser keeps the edits in this browser using IndexedDB. This is useful for previewing, but it does not update a hosted copy or transfer edits to another device.
5. Download gift config creates gift-config.json. Upload that file next to index.html, replacing the existing one. A fresh visitor or another device will then see those settings.
6. If you use the same browser after exporting, the browser's locally saved edits take precedence over the hosted config. To preview a newly uploaded hosted config in that browser, choose Restore starter version in the Owner Desk first (this clears the saved local copy), then reload.
7. The **end link URL** field adds an optional button to the final page. The opening-screen template link label can also be changed in the owner desk.

The downloadable JSON can include all uploaded photo and music data, so it may be a large file. Keep a backup of the exported config and use reasonably sized photos.

## Music player

The owner can choose six styles, shape, width, location, cover, title, background, accent, and spin/breathe/still animation. A direct MP3, M4A, OGG, or WAV URL or an uploaded audio file works with the custom play/pause and volume controls. A normal webpage link to a song page will not work as an audio file.

Spotify or SoundCloud embed URLs can be entered as an alternative. Those providers render their own player and controls inside the widget; provider embeds do not allow this page's custom volume and play buttons to control the service. Browsers require the visitor to press play; this site does not autoplay.

## Publish and share

Upload both index.html and gift-config.json to any static host that serves HTML and JSON from the same folder (for example, GitHub Pages, Netlify, or Cloudflare Pages). Open the resulting HTTPS link on a phone and desktop before sharing it. Use that URL as the gift link. To open the editor directly for a template customer, add `?template=1`; the customization button is also available on the opening screen. The optional end link is for any second surprise, shop, or destination URL you choose.

## Important privacy limit

This static edition's passcode is an affectionate reveal, not real access control. The page's JavaScript, gift-config.json, and any photos or audio packaged with it can be inspected or downloaded; the recipient can also discover the passcode in those files. Changing the code or hiding the editor shortcut does not make static hosting private.

For genuinely private photos and letters, use a backend-authenticated version: verify credentials on the server, issue a short-lived secure session cookie, and serve the protected page and media only after authorization. Do not put a real password or private media in a public static folder. This project does not claim to provide that backend.
