# A To Z Home Improvement: landing page previews

Two static one-page previews (HTML/CSS/JS, no build step) for Nicolae Chiric, A To Z Home Improvement Ltd, garden care in Harrow. Both are based on the two supplied mockups.

Live preview: https://atoz-home-improvementl.vercel.app (Vercel deploys every push to `main`)

Run locally: `python3 -m http.server 8790` and open http://localhost:8790

## Files

- `index.html`: chooser page, "Option A / Option B", with desktop and phone previews of each design. Send the client this link.
- `navy/`: Option A (navy and orange, form in the hero). `index.html`, `styles.css` (design tokens in `:root`), `script.js` (menu and services dropdown, mobile call bar, preview form), `favicon.svg`, `apple-touch-icon.png`, `og-image.jpg`
- `green/`: Option B (green and cream, serif headings, form in the contact panel). Same file layout.
- `assets/img/`: shared photos as WebP. `og-image.jpg` is the chooser's sharing image. `preview-*` are the chooser thumbnails (screenshots of each design; regenerate them if a design changes).
- `assets/fonts/`: self-hosted Latin woff2 files: Figtree variable (navy), Newsreader 500 and DM Sans variable (green)
- `docs/superpowers/specs/`: the short design spec
- `docs/og/og-images.html`: editable source for the three sharing images and the two home-screen icons

The two designs share only `assets/`, so the design the client picks can become the site without untangling the other one.

## Photos

All photos are Nicolae's own, from his Checkatrade profile (https://www.checkatrade.com/trades/atozhomeimprovementlimited). They were cropped, lightly softened to cut phone-camera noise, and exported as WebP at several widths.

- `hero-lawn-*`: mown back lawn with shed. Used as the hero in both designs.
- `work-lawn-*`, `work-tidy-up-*`, `work-side-path-*`: the "Our work" gallery

The profile has more garden photos (including before shots of the overgrown garden) and some door and interior jobs that aren't used here. It also shows logos of *other* companies from Checkatrade's "similar trades" panel; don't use those.

## Confirm with the client before launch

- Which design he prefers (or a mix of the two)
- Reviews: Checkatrade shows 0 reviews (he joined in September 2026), so neither design has ratings or testimonials. Add them once he has some.
- Area covered: the pages only say Harrow, London
- Business details: the Ltd company name, and whether "Free estimates", "Domestic & commercial" and "Cards accepted" (from Checkatrade) are all still true
- Option B's nav says "Services / Our work / Contact". The mockup had "About", but there is no About content yet. Add an about section if he wants one.
- Public liability insurance: Checkatrade lists it as unverified. Worth mentioning on the site once confirmed.

## Sharing previews (WhatsApp, Facebook, iMessage)

Each page has its own 1200×630 sharing image and full Open Graph and Twitter tags with absolute URLs:

| Link | Image | Shows |
|---|---|---|
| `/` | `assets/img/og-image.jpg` | Both designs side by side, "Two designs for your new garden care website" |
| `/navy/` | `navy/og-image.jpg` | Option A: headline, logo and phone number over the hero photo |
| `/green/` | `green/og-image.jpg` | Option B: headline, logo and phone number beside the hero photo |

- The images are designed in `docs/og/og-images.html` using the real fonts and logos. To change one, edit that page, serve the project root, screenshot each `[data-out]` element at 1200×630 (icons at 180×180), and save it as JPEG (quality ~84) to the path in its `data-out` attribute. Keep each image under 300 KB so WhatsApp shows it.
- Image URLs end in `?v=2`. WhatsApp caches previews per URL, so after changing an image, bump the number in the three pages.
- All URLs use `https://atoz-home-improvementl.vercel.app`. If the site moves to a custom domain, find and replace that address across the three `index.html` files.

## Before launch

- `robots` is set to `noindex, nofollow` on every page. Remove it from the chosen design at launch.
- `.vercelignore` keeps the mockup PNGs, docs and README out of the deployment.

## Not done yet (after sign-up)

- The forms only validate and show a "preview" message; nothing is sent. Connect them to email (Formspree, Web3Forms or a small serverless function).
- LocalBusiness structured data has no postcode yet. Add it when his address is confirmed.
