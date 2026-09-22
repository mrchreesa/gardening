# A To Z Home Improvement: landing page previews

Two static one-page previews (HTML/CSS/JS, no build step) for Nicolae Chiric, A To Z Home Improvement Ltd, garden care in Harrow. Both are based on the two supplied mockups.

Run locally: `python3 -m http.server 8790` and open http://localhost:8790

## Files

- `index.html`: chooser page, "Option A / Option B", with desktop and phone previews of each design. Send the client this link.
- `navy/`: Option A (navy and orange, form in the hero). `index.html`, `styles.css` (design tokens in `:root`), `script.js` (menu and services dropdown, mobile call bar, preview form), `favicon.svg`
- `green/`: Option B (green and cream, serif headings, form in the contact panel). Same file layout.
- `assets/img/`: shared photos as WebP. `og-image.jpg` is the 1200×630 social-sharing image. `preview-*` are the chooser thumbnails (screenshots of each design; regenerate them if a design changes).
- `assets/fonts/`: self-hosted Latin woff2 files: Figtree variable (navy), Newsreader 500 and DM Sans variable (green)
- `docs/superpowers/specs/`: the short design spec

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

## Before deploying

- `robots` is set to `noindex, nofollow` on every page. Remove it from the chosen design at launch.
- `og:image` uses a relative path. Open Graph needs an absolute URL, so switch it to the deployed domain (for example `https://<domain>/assets/img/og-image.jpg`) or WhatsApp and Facebook won't show the preview image.
- `.vercelignore` keeps the mockup PNGs, docs and test screenshots out of the deployment.

## Not done yet (after sign-up)

- The forms only validate and show a "preview" message; nothing is sent. Connect them to email (Formspree, Web3Forms or a small serverless function).
- LocalBusiness structured data has no URL or postcode yet. Add them when the domain and address are known.
