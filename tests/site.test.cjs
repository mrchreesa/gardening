const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');
const axePath = require.resolve('axe-core/axe.min.js');
const root = path.resolve(__dirname, '..');
const artifacts = '/tmp/atoz-launch-qa';
let server, browser, base;

before(async () => {
  await fs.mkdir(artifacts, { recursive: true });
  server = http.createServer(async (req, res) => {
    try {
      let requested = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (requested.endsWith('/')) requested += 'index.html';
      const file = path.resolve(root, '.' + requested);
      if (!file.startsWith(root + path.sep)) throw new Error('Invalid path');
      const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2', '.xml': 'application/xml' };
      res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'text/plain' });
      res.end(await fs.readFile(file));
    } catch { res.writeHead(404); res.end('Not found'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true });
});
after(async () => {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
});

async function pageFor(t, { configured = false, width = 1280, javaScriptEnabled = true, captchaFails = false } = {}) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce', javaScriptEnabled });
  t.after(() => context.close());
  // All external requests are intercepted; tests never email the business.
  await context.route('**/*', route => {
    if (route.request().url().startsWith(base)) return route.continue();
    return route.abort();
  });
  if (configured) {
    await context.route('**/green/config.js', route => route.fulfill({ contentType: 'text/javascript', body: 'window.ATOZ_CONTACT = { accessKey: "11111111-1111-4111-8111-111111111111" };' }));
    await context.route('https://web3forms.com/client/script.js', route => captchaFails ? route.abort() : route.fulfill({ contentType: 'text/javascript', body: `
      const token = document.createElement('textarea');
      token.name = 'h-captcha-response'; token.hidden = true;
      document.querySelector('.h-captcha').appendChild(token);
      window.hcaptcha = { reset() { token.value = ''; } };
    ` }));
  }
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  t.after(() => assert.deepEqual(errors, [], 'Browser JavaScript errors'));
  await page.goto(base);
  await page.evaluate(() => document.fonts.ready).catch(() => {});
  return page;
}
async function fillForm(page, { token = true } = {}) {
  await page.locator('#v-name').fill('Test Gardener');
  await page.locator('#v-phone').fill('+44 (7424) 940579');
  await page.locator('#v-postcode').fill('nw10 1aa');
  await page.locator('#v-service').selectOption({ label: 'Garden maintenance' });
  if (token) await page.locator('[name="h-captcha-response"]').evaluate(el => { el.value = 'test-token'; });
}
async function assertNoOverflow(page) {
  const size = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: innerWidth }));
  assert.ok(size.content <= size.viewport, JSON.stringify(size));
}
async function assertAccessible(page) {
  await page.addScriptTag({ path: axePath });
  const violations = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ html: n.html, summary: n.failureSummary })) })));
  assert.deepEqual(violations, []);
}

test('SEO, hours, contact links, coverage, services and local assets are consistent', async t => {
  const page = await pageFor(t);
  assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'index, follow');
  assert.equal(await page.locator('.service-card li').count(), 16);
  const districts = await page.locator('.area-list dt').allTextContents();
  assert.deepEqual(districts, [...Array.from({ length: 11 }, (_, i) => `NW${i + 1}`), ...Array.from({ length: 10 }, (_, i) => `HA${i}`)]);
  const data = JSON.parse(await page.locator('[type="application/ld+json"]').textContent());
  assert.equal(data.telephone, '+447424940579');
  assert.equal(data.email, 'Atozhomeimprovementuk@gmail.com');
  assert.equal(data.openingHoursSpecification[0].dayOfWeek.length, 7);
  assert.equal(data.openingHoursSpecification[0].opens, '08:00');
  assert.equal(data.openingHoursSpecification[0].closes, '18:00');
  for (const href of await page.locator('[href^="tel:"]').evaluateAll(els => els.map(el => el.getAttribute('href')))) assert.equal(href, 'tel:+447424940579');
  for (const href of await page.locator('[href^="mailto:"]').evaluateAll(els => els.map(el => el.getAttribute('href')))) assert.ok(href.startsWith('mailto:Atozhomeimprovementuk@gmail.com'));
  assert.doesNotMatch(await page.locator('body').innerText(), /preview|about me|nothing was sent/i);
  const missing = await page.evaluate(async () => {
    const refs = [...document.querySelectorAll('[href], [src]')].flatMap(el => [el.getAttribute('href'), el.getAttribute('src')]).filter(Boolean);
    const errors = [];
    for (const ref of refs) {
      if (ref.startsWith('#')) { if (!document.getElementById(ref.slice(1))) errors.push(ref); continue; }
      const url = new URL(ref, location.href);
      if (url.origin === location.origin && !(await fetch(url)).ok) errors.push(ref);
    }
    return errors;
  });
  assert.deepEqual(missing, []);
  const sitemap = await fs.readFile(path.join(root, 'sitemap.xml'), 'utf8');
  assert.match(sitemap, /https:\/\/atoz-home-improvementl.vercel.app\/<\/loc>/);
  assert.doesNotMatch(sitemap, /\/(green|navy)\//);
  assert.match(await fs.readFile(path.join(root, 'robots.txt'), 'utf8'), /Allow: \/\s+Sitemap:/);
});

for (const width of [320, 390, 768, 900, 1440]) {
  test(`layout, keyboard controls and accessibility at ${width}px`, async t => {
    const page = await pageFor(t, { width });
    await assertNoOverflow(page);
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('.skip-link').evaluate(el => el === document.activeElement), true);
    if (width < 900) {
      await page.locator('.nav-toggle').click();
      assert.equal(await page.locator('.nav-toggle').getAttribute('aria-expanded'), 'true');
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.nav-toggle').getAttribute('aria-expanded'), 'false');
      assert.equal(await page.locator('.nav-toggle').evaluate(el => el === document.activeElement), true);
      await page.locator('.nav-toggle').click();
      await page.locator('.nav a[href="#areas"]').click();
      assert.equal(await page.locator('.nav-toggle').getAttribute('aria-expanded'), 'false');
    }
    for (const summary of await page.locator('.area-group summary').all()) await summary.click();
    await assertNoOverflow(page);
    await assertAccessible(page);
    await page.screenshot({ path: `${artifacts}/home-${width}.png`, fullPage: true });
  });
}

test('unconfigured and no-JavaScript states offer direct contact without accepting form data', async t => {
  for (const javaScriptEnabled of [true, false]) {
    const page = await pageFor(t, { javaScriptEnabled, width: 390 });
    assert.equal(await page.locator('.visit-form').isVisible(), false);
    assert.equal(await page.locator('.contact-fallback').isVisible(), true);
    assert.equal(await page.locator('.form-success').isVisible(), false);
    assert.equal(await page.locator('.contact-fallback a[href^="mailto:"]').isVisible(), true);
    if (!javaScriptEnabled) {
      assert.equal(await page.locator('.nav').isVisible(), true);
      await assertNoOverflow(page);
    }
  }
});

test('missing or invalid form configuration keeps direct contact working', async t => {
  const page = await pageFor(t, { width: 390 });
  let providerRequests = 0;
  page.on('request', request => {
    if (request.url().includes('web3forms.com')) providerRequests++;
  });
  for (const body of [
    '',
    'window.ATOZ_CONTACT = {};',
    'window.ATOZ_CONTACT = { accessKey: null };',
    'window.ATOZ_CONTACT = { accessKey: 123 };',
    'window.ATOZ_CONTACT = { accessKey: "not-a-form-key" };'
  ]) {
    await page.route('**/green/config.js', route => route.fulfill({ contentType: 'text/javascript', body }));
    await page.reload();
    assert.equal(await page.locator('.visit-form').isVisible(), false);
    assert.equal(await page.locator('.contact-fallback').isVisible(), true);
    await page.locator('.nav-toggle').click();
    assert.equal(await page.locator('.nav-toggle').getAttribute('aria-expanded'), 'true');
    await page.unroute('**/green/config.js');
  }
  await page.route('**/green/config.js', route => route.abort());
  await page.reload();
  assert.equal(await page.locator('.contact-fallback').isVisible(), true);
  assert.equal(providerRequests, 0);
});

test('desktop booking links focus the name field when the form is activated', async t => {
  const page = await pageFor(t, { configured: true });
  await page.locator('.nav-cta').click();
  await page.waitForFunction(() => document.activeElement.id === 'v-name');
  assert.equal(new URL(page.url()).hash, '#contact');
});

test('configured form validates input, security check and blocks the honeypot', async t => {
  const page = await pageFor(t, { configured: true, width: 390 });
  let sends = 0;
  await page.route('https://api.web3forms.com/submit', route => { sends++; return route.abort(); });
  await page.locator('[type="submit"]').click();
  assert.equal(await page.locator('.field.is-invalid').count(), 4);
  assert.equal(await page.locator('#v-name').evaluate(el => el === document.activeElement), true);
  await fillForm(page, { token: false });
  await page.locator('#v-phone').fill('123');
  await page.locator('#v-postcode').fill('INVALID');
  await page.locator('[type="submit"]').click();
  assert.equal(await page.locator('.field.is-invalid').count(), 2);
  await fillForm(page, { token: false });
  await page.locator('[type="submit"]').click();
  assert.equal(await page.locator('.captcha-error').isVisible(), true);
  assert.equal(sends, 0);
  await page.locator('[name="botcheck"]').evaluate(el => { el.checked = true; });
  await page.locator('[type="submit"]').click();
  assert.equal(await page.locator('.form-error').isVisible(), true);
  assert.equal(sends, 0);
});

test('confirmed API success sends correct fields once and focuses confirmation', async t => {
  const page = await pageFor(t, { configured: true });
  let sends = 0, payload, finish;
  await page.route('https://api.web3forms.com/submit', async route => {
    sends++; payload = route.request().postDataJSON();
    await new Promise(resolve => { finish = resolve; });
    await route.fulfill({ status: 200, json: { success: true } });
  });
  await fillForm(page);
  await page.locator('[type="submit"]').click();
  await page.waitForFunction(() => document.querySelector('[type="submit"]').disabled);
  assert.equal(await page.locator('[type="submit"]').textContent(), 'Sending…');
  await page.locator('form').evaluate(el => el.dispatchEvent(new Event('submit', { cancelable: true })));
  assert.equal(sends, 1);
  assert.equal(payload.name, 'Test Gardener');
  assert.equal(payload.postcode, 'NW10 1AA');
  assert.equal(payload.service, 'Garden maintenance');
  assert.equal(payload['h-captcha-response'], 'test-token');
  assert.equal(payload.botcheck, false);
  finish();
  await page.locator('.form-success').waitFor({ state: 'visible' });
  assert.match(await page.locator('.form-success').textContent(), /Thanks, Test, request received/);
  assert.equal(await page.locator('.form-success').evaluate(el => el === document.activeElement), true);
  assert.equal(await page.locator('form').isVisible(), false);
});

for (const failure of ['rejection', 'rate-limit', 'server', 'bad-json', 'network', 'timeout']) {
  test(`${failure} preserves input and never claims success`, async t => {
    const page = await pageFor(t, { configured: true });
    if (failure === 'timeout') await page.clock.install();
    await page.route('https://api.web3forms.com/submit', route => {
      if (failure === 'network') return route.abort();
      if (failure === 'timeout') return;
      if (failure === 'bad-json') return route.fulfill({ status: 200, contentType: 'text/plain', body: 'not JSON' });
      return route.fulfill({ status: failure === 'rate-limit' ? 429 : failure === 'server' ? 500 : 200, json: { success: false } });
    });
    await fillForm(page);
    await page.locator('[type="submit"]').click();
    if (failure === 'timeout') await page.clock.fastForward(21000);
    await page.locator('.form-error').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#v-name').inputValue(), 'Test Gardener');
    assert.equal(await page.locator('#v-phone').inputValue(), '+44 (7424) 940579');
    assert.equal(await page.locator('.form-success').isVisible(), false);
    assert.equal(await page.locator('[type="submit"]').isDisabled(), false);
    assert.equal(await page.locator('.form-error').evaluate(el => el === document.activeElement), true);
    assert.equal(await page.locator('[name="h-captcha-response"]').inputValue(), '');
  });
}

test('configured form is accessible on mobile; CAPTCHA loading failure offers contact', async t => {
  const page = await pageFor(t, { configured: true, width: 320 });
  await assertNoOverflow(page);
  await assertAccessible(page);
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${artifacts}/form-320.png`, fullPage: true });
  const failed = await pageFor(t, { configured: true, captchaFails: true });
  await failed.locator('.form-error').waitFor({ state: 'visible' });
  assert.match(await failed.locator('.form-error').textContent(), /security check could not load/);
});

test('retired demo documents redirect to homepage and preserve anchors', async t => {
  const page = await pageFor(t);
  for (const source of ['/green/', '/green/index.html', '/navy/', '/navy/index.html']) {
    await page.goto(base + source + '?ref=test#contact');
    await page.waitForURL(base + '/?ref=test#contact');
    assert.equal(await page.locator('h1').textContent(), 'A garden you can enjoy\u00a0again.');
  }
  const config = JSON.parse(await fs.readFile(path.join(root, 'vercel.json'), 'utf8'));
  for (const source of ['/index.html', '/green', '/green/', '/green/index.html', '/navy', '/navy/', '/navy/index.html']) {
    assert.ok(config.redirects.some(r => r.source === source && r.destination === '/' && r.permanent === true));
  }
  assert.ok(!config.redirects.some(r => r.source.includes('*')));
});

test('privacy page is readable, linked and accessible', async t => {
  const page = await pageFor(t, { width: 390 });
  await page.locator('.credit a').click();
  assert.equal(new URL(page.url()).pathname, '/privacy.html');
  assert.equal(await page.locator('h1').textContent(), 'Privacy notice');
  await assertNoOverflow(page);
  await assertAccessible(page);
});

test('gallery scrolls with the keyboard and reduced motion is respected', async t => {
  const page = await pageFor(t, { width: 390 });
  await page.locator('.gallery').focus();
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(() => document.querySelector('.gallery').scrollLeft > 0);
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
  await page.locator('.hero').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('.mobile-bar').inert);
});

test('social image is rendered from the updated HTML source', async t => {
  const page = await pageFor(t, { width: 1440 });
  await page.goto(base + '/docs/og/og-images.html');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('#og-green').screenshot({ path: `${artifacts}/og-image.jpg`, type: 'jpeg', quality: 84 });
  assert.ok((await fs.stat(`${artifacts}/og-image.jpg`)).size < 300000);
});
