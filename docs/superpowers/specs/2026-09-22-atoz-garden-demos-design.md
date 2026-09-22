# A To Z Home Improvement: garden landing page demos

Two static landing page previews for Nicolae Chiric (A To Z Home Improvement Ltd, Harrow), built from the two supplied mockups, plus a chooser page. The pages are for sales only. There is no backend.

## Structure

```
index.html          chooser page: Option A (navy) / Option B (green)
navy/               index.html, styles.css, script.js   (mockup dc847c6d…)
green/              index.html, styles.css, script.js   (mockup 5999d53f…)
assets/img/         shared photos as WebP (hero at 640/1024/1500, gallery at 480/800), og-image.jpg
assets/fonts/       self-hosted Latin woff2 files: Figtree variable (navy), Newsreader 500 + DM Sans variable (green)
README.md           run instructions and a list of what to confirm with the client
```

The two designs share only the photos, so whichever design the client picks becomes the site without either version depending on the other.

## Content (from the Checkatrade profile)

- Owner: Nicolae Chiric. Phone: 07424 940579. Based in Harrow, London.
- Free estimates, domestic and commercial work, cards accepted.
- 16 services in 4 groups, exactly as in the mockups.
- No reviews yet (0 on Checkatrade), so the pages show no ratings, reviews or rating badges.
- Photos are his own Checkatrade job photos: hero p22 (mown lawn), gallery p11 (lawn), p19 (tidy-up), p25 (side path).

## Behaviour

- Desktop layouts closely follow the mockups. Logos are redrawn as inline SVG.
- Mobile: hamburger nav, stacked sections, swipeable gallery (navy), and a sticky bottom bar on both designs with "Call" and "Request a visit".
- Every phone number is a `tel:` link. The "View our Checkatrade profile" link goes to the real profile.
- Form: the browser checks the fields, then an inline message says this is a preview. Nothing is sent.
- `noindex`, page title and description, favicon, and Open Graph image.

## Performance

No frameworks or libraries. Each page loads one CSS file and one deferred JS file. The hero image is preloaded with `fetchpriority=high` and uses `srcset`. Gallery images use `loading=lazy`. Fonts are preloaded with `font-display: swap`. Target: mobile Lighthouse score of 95+.

## Verification

Playwright screenshots at 375, 768 and 1280px compared against the mockups, no errors in the console, and a check of total page weight.
