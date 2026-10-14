/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-promo. Base: hero. Source: https://www.target.com/
 * Source: Target contentPoolContainer "standard" banner ([class*="standardDesktopLayout"]):
 * a.ndsLink (whole banner) > baseCopy > h2 baseHeading + p baseSubheading, plus sibling
 * img[class*="desktopImg"].
 * Output (hero, 1 column): row 1 = background image; row 2 = h2 (linked to banner target) + subheading p.
 * Generated: 2026-10-08
 */
// Lazy-loaded images may only get src once scrolled into view; fall back to srcset/data-src.
function getImgSrc(img) {
  if (!img) return null;
  const first = (v) => (v ? v.split(',')[0].trim().split(/\s+/)[0] : null);
  const source = img.closest('picture') ? img.closest('picture').querySelector('source[srcset]') : null;
  return img.getAttribute('src')
    || img.getAttribute('data-src')
    || first(img.getAttribute('srcset'))
    || first(img.getAttribute('data-srcset'))
    || (source ? first(source.getAttribute('srcset')) : null)
    || null;
}

// Copy alignment isn't in the markup (no class marks it), so measure where the copy sits on the
// rendered banner. The importer hands parsers a non-rendered copy of the page, so fall back to
// the matching banner in the live page (the transform runs in the page) by heading text.
function isCopyLeftAligned(element, heading) {
  const measure = (banner) => {
    const copy = banner.querySelector('[class*="baseCopy"], [class*="mainCopyBlock"]')
      || (banner.querySelector('h1, h2, h3') || {}).parentElement;
    if (!copy) return null;
    const b = banner.getBoundingClientRect();
    const c = copy.getBoundingClientRect();
    if (!b.width || !c.width) return null;
    return (c.left + c.width / 2 - b.left) / b.width < 0.4;
  };
  const own = measure(element);
  if (own !== null) return own;
  if (typeof window === 'undefined' || !heading) return false;
  const live = [...window.document.querySelectorAll('[class*="contentPoolContainer"]')]
    .find((el) => (el.querySelector('h1, h2, h3') || {}).textContent?.replace(/\s+/g, ' ').trim() === heading);
  return live ? measure(live) === true : false;
}

export default function parse(element, { document }) {
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

  // Scope to the first banner layout inside the container (desktop layout preferred)
  const scope = element.querySelector('[class*="standardDesktopLayout"]')
    || element.querySelector('[class*="DesktopLayout"], [class*="Layout"]')
    || element;

  const img = scope.querySelector('img[class*="desktopImg"]')
    || scope.querySelector('img')
    || element.querySelector('img');

  const linkEl = scope.querySelector('a[href]') || element.querySelector('a[href]') || element.closest('a[href]');
  const href = linkEl ? linkEl.getAttribute('href') : null;

  const headingEl = scope.querySelector('h1, h2, h3, [class*="baseHeading"]');
  const heading = headingEl ? clean(headingEl.textContent) : '';

  const subEls = [...scope.querySelectorAll('p[class*="Subheading"], p[class*="subheading"]')];
  const subs = (subEls.length ? subEls : [...scope.querySelectorAll('[class*="mainCopyBlock"] p, [class*="baseCopy"] p')])
    .map((p) => clean(p.textContent))
    .filter(Boolean)
    .filter((t, i, arr) => arr.indexOf(t) === i);

  if (!img && !heading && !subs.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  const src = getImgSrc(img);
  if (src) {
    const image = document.createElement('img');
    image.src = src;
    image.alt = img.getAttribute('alt') || '';
    cells.push([image]);
  }

  const content = [];
  if (heading) {
    const h2 = document.createElement('h2');
    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = heading;
      h2.append(a);
    } else {
      h2.textContent = heading;
    }
    content.push(h2);
  }
  subs.forEach((t) => {
    const p = document.createElement('p');
    p.textContent = t;
    content.push(p);
  });
  if (!heading && href) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = subs[0] || href;
    p.append(a);
    content.push(p);
  }
  cells.push([content]);

  const name = isCopyLeftAligned(element, heading) ? 'hero-promo (left)' : 'hero-promo';
  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);
}
