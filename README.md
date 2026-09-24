# A To Z Home Improvement: garden care website

Static HTML/CSS/JavaScript website for A To Z Home Improvement Ltd. The selected green-and-cream design is served at `/`; no production framework or build step is required.

Current canonical address: https://atoz-home-improvementl.vercel.app (existing Vercel deployment; pushes to `main` deploy automatically).

## Confirmed content

- The existing 16 gardening services, free estimates, domestic/commercial work and card payments are confirmed by the client.
- Business identity stays as previously supplied: A To Z Home Improvement Ltd.
- Coverage: North West London. The directory lists neighbourhoods within NW1–NW11 and HA0–HA9, including the existing Harrow service area.
- Telephone: 07424 940579; email: Atozhomeimprovementuk@gmail.com.
- Open every day, 08:00–18:00 (UK local time).
- No personal About section, testimonials or unverified insurance claims.

The geographical interpretation used for the directory is the NW postal districts plus the HA districts around Harrow. Neighbourhood boundaries overlap postcode boundaries. NW1W and NW26 are PO-box districts, not service locations. Sources checked on 24 September 2026: [NW districts](https://en.wikipedia.org/wiki/NW_postcode_area) and [HA districts](https://en.wikipedia.org/wiki/HA_postcode_area).

## Local development and checks

Serve: `python3 -m http.server 8790`, then open http://localhost:8790.

Browser checks (development tools only):

```
npm ci
npx playwright install chromium
npm test
```

The tests start an isolated local HTTP server. They check 320, 390, 768, 900 and 1440px layouts; keyboard navigation; automated WCAG A/AA checks with axe; contact targets; postcode coverage; metadata; local asset links; retired-page fallback redirects; and form validation, success, rejection, network failure, rate limits, duplicate submits, CAPTCHA failure and timeout states. Screenshots are written to `/tmp/atoz-launch-qa`.

All external requests are intercepted in the automated suite. Web3Forms and hCaptcha responses are simulated: no test messages are sent. Browser automation and axe are not a complete manual accessibility audit. Vercel's actual HTTP redirects and actual email delivery must be checked on the deployed site.

## Contact form: Web3Forms

Integration code is ready in `green/script.js`. The client has deferred supplying the access key. No key is currently configured, so the site displays usable telephone and email links instead of collecting unsent enquiries. It does the same with JavaScript disabled or unavailable. A missing or invalid configuration also leaves direct contact available and makes no requests to Web3Forms or hCaptcha.

1. Create a form at https://app.web3forms.com/ and verify the receiving address `Atozhomeimprovementuk@gmail.com`.
2. Set `accessKey` in `green/config.js` to that form's access key. This is a public form identifier, not a mailbox password or secret server key.
3. Enable **hCaptcha** in the Web3Forms dashboard for the form. The client loads the provider's free hCaptcha integration only when configured. Server-side CAPTCHA enforcement must be enabled in the dashboard; browser validation alone is not spam protection.
4. Review provider settings (including retention) and the privacy notice with the business before activating collection. The notice describes Web3Forms' published default retention; amend it if settings or business handling change.
5. Deploy and submit an authorised test enquiry. Confirm it arrives in the business inbox, including the telephone, postcode and selected service. Check junk/spam too.

The form only shows confirmation after a successful HTTP response with `success: true`. It prevents double submits while waiting, times out after 20 seconds, preserves fields on failure, and offers direct contact when delivery cannot be confirmed. It never retries automatically.

Provider documentation: [API](https://docs.web3forms.com/getting-started/api-reference), [hCaptcha setup](https://docs.web3forms.com/getting-started/customizations/spam-protection/hcaptcha), [privacy](https://web3forms.com/privacy).

## Files and routing

- `index.html`: homepage, contact information, service directory, work gallery and coverage lists.
- `green/styles.css`, `green/script.js`, `green/config.js`: styles, interactions, form integration and public form configuration.
- `privacy.html`: enquiry privacy notice.
- `robots.txt`, `sitemap.xml`: crawl permissions and canonical pages for launch.
- `vercel.json`: permanent HTTP redirects from `/index.html`, `/green`, `/green/`, `/green/index.html`, `/navy`, `/navy/` and `/navy/index.html` to `/`. Shared files under `/green/` are not redirected.
- `green/index.html`, `navy/index.html`: minimal redirect documents for local/non-Vercel hosting. These have no duplicate page content and preserve URL fragments in JavaScript.
- `assets/img/`: the supplied hero artwork, optimised sizes and existing Checkatrade project photos. The independently supplied `logo.jpeg` has not been changed.
- `docs/og/og-images.html`: editable social-image source. The selected 1200×630 image is `green/og-image.jpg` and uses `?v=5` in the homepage.

The homepage and privacy page permit indexing. Retired redirect documents use `noindex, follow`. Changes become live only after deployment; verify the production host does not impose an additional `X-Robots-Tag: noindex` header. The domain is intentionally unchanged. If it changes later, update canonical/schema/OG URLs, `robots.txt` and `sitemap.xml` together.

## Remaining launch dependencies

The site can be deployed with telephone/email enquiries while the online form is deferred. The blank key is intentional and does not prevent the other pages or navigation from working.

- On deployment: verify production redirects, crawlability and contact links.
- When the client supplies the key: complete Web3Forms account verification, dashboard CAPTCHA enforcement and a real delivery check. Review provider retention settings and the privacy notice against the business's enquiry handling before activating form collection.

The requested company identity is retained unchanged. This update does not independently verify or supplement company registration disclosures.
