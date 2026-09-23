# A To Z Home Improvement: garden care landing page

The selected green-and-cream landing page (HTML/CSS/JS, no build step) for Nicolae Chiric, A To Z Home Improvement Ltd, garden care in Harrow. The homepage now uses the supplied London hero artwork, with forest green, cream and gold styling.

Live preview: https://atoz-home-improvementl.vercel.app (Vercel deploys every push to `main`)

Run locally: `python3 -m http.server 8790` and open http://localhost:8790

## Files

- `index.html`: the selected green landing page, served at `/`.
- `green/`: shared `styles.css` (design tokens in `:root`), `script.js` (menu, mobile call bar and preview form), favicon, home-screen icon and sharing image. `/green/` also serves the selected design for existing preview links, with `/` as its canonical URL. Keep its HTML in sync with the root page; only relative asset paths differ.
- `navy/`: the original navy-and-orange preview, retained at `/navy/`.
- `assets/img/`: shared images. `hero.png` is the supplied hero artwork; `hero-640.webp`, `hero-1024.webp` and `hero-1536.webp` are optimised, uncropped versions used by the green landing page. `preview-*` and `og-image.jpg` are legacy chooser assets.
- `assets/fonts/`: self-hosted Latin woff2 files: Figtree variable (navy), Newsreader 500 and DM Sans variable (green)
- `docs/superpowers/specs/`: the short design spec
- `docs/og/og-images.html`: editable source for the three sharing images and the two home-screen icons

The root landing page and `/green/` share their CSS and JavaScript. The navy preview remains independent.

## Photos

The garden project photos are Nicolae's own, from his Checkatrade profile (https://www.checkatrade.com/trades/atozhomeimprovementlimited). They were cropped, lightly softened to cut phone-camera noise, and exported as WebP at several widths. The new London hero artwork was supplied separately in `assets/img/hero.png`.

- `hero-lawn-*`: mown back lawn with shed. Retained for the navy preview.
- `work-lawn-*`, `work-tidy-up-*`, `work-side-path-*`: the "Our work" gallery

The profile has more garden photos (including before shots of the overgrown garden) and some door and interior jobs that aren't used here. It also shows logos of *other* companies from Checkatrade's "similar trades" panel; don't use those.

## Confirm with the client before launch

- Reviews: Checkatrade shows 0 reviews (he joined in September 2026), so neither design has ratings or testimonials. Add them once he has some.
- Area covered: the pages only say Harrow, London
- Business details: the Ltd company name, and whether "Free estimates", "Domestic & commercial" and "Cards accepted" (from Checkatrade) are all still true
- The navigation says "Services / Our work / Contact". There is no About content yet. Add an about section if he wants one.
- Public liability insurance: Checkatrade lists it as unverified. Worth mentioning on the site once confirmed.

## Sharing previews (WhatsApp, Facebook, iMessage)

The pages have 1200×630 sharing images and full Open Graph and Twitter tags with absolute URLs:

| Link | Image | Shows |
|---|---|---|
| `/` | `green/og-image.jpg` | Green design with the supplied London artwork, headline and phone number |
| `/navy/` | `navy/og-image.jpg` | Option A: headline, logo and phone number over the hero photo |
| `/green/` | `green/og-image.jpg` | Same selected design as `/` |

- The images are designed in `docs/og/og-images.html` using the real fonts and logos. To change one, edit that page, serve the project root, screenshot each `[data-out]` element at 1200×630 (icons at 180×180), and save it as JPEG (quality ~84) to the path in its `data-out` attribute. Keep each image under 300 KB so WhatsApp shows it.
- The selected design's image URLs end in `?v=3`; the navy preview uses `?v=2`. WhatsApp caches previews per URL, so after changing an image, bump the number in the pages using it.
- All URLs use `https://atoz-home-improvementl.vercel.app`. If the site moves to a custom domain, find and replace that address across the three `index.html` files.

## Before launch

- `robots` is set to `noindex, nofollow` on every page. Remove it from the chosen design at launch.
- `.vercelignore` keeps the mockup PNGs, docs and README out of the deployment.

## Not done yet (after sign-up)

- The forms only validate and show a "preview" message; nothing is sent. Connect them to email (Formspree, Web3Forms or a small serverless function).
- LocalBusiness structured data has no postcode yet. Add it when his address is confirmed.
