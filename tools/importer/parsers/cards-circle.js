/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-circle. Base: cards. Source: https://www.target.com/
 * Source: Target picture-navigation list (ul > li[class*="listItem"] > a[class*="pictureNavigationLink"]
 * > [itemPictureWrapper: circle picture + itemTitleWrapper span]).
 * Output (cards, 2 columns): one row per category = [circular image | linked label].
 * Iterates the <li> items (block-level wrappers), never the <a> elements.
 * Generated: 2026-10-08
 */
// Lazy-loaded pictures only receive src once scrolled into view (the bulk importer scrolls);
// fall back to data-src / srcset / <source srcset> when src is not set yet.
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

// Below-the-fold items never get a src (the importer only scrolls a little), but the page's
// __NEXT_DATA__ JSON lists every taxonomy node as { link_url, image_path } (or
// seo_data { canonical_url, image_path }) — map href -> image.
const stripQuery = (u) => (u || '').split(/[?#]/)[0];
// The bulk importer strips <script> from the document it hands to the transform, so also
// look in the live page document (the transform runs in the page) and the raw html.
function getNextDataImages(document, html) {
  const map = new Map();
  const liveDoc = typeof window !== 'undefined' ? window.document : null;
  const script = [document, liveDoc]
    .filter(Boolean)
    .map((d) => d.querySelector('script#__NEXT_DATA__'))
    .find(Boolean);
  const text = script ? script.textContent : (html || '');
  const re = /"(?:link_url|canonical_url)"\s*:\s*"([^"]+)"[^{}]*?"image_path"\s*:\s*"([^"]+)"/g;
  let m = re.exec(text);
  while (m) {
    if (!map.has(stripQuery(m[1]))) map.set(stripQuery(m[1]), m[2]);
    m = re.exec(text);
  }
  return map;
}

export default function parse(element, { document, html }) {
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();
  let nextDataImages = null;

  // Items: list items (element is the <ul>; fall back to any nested list items)
  let items = [...element.querySelectorAll(':scope > li')];
  if (!items.length) items = [...element.querySelectorAll('li[class*="listItem"], li')];
  if (!items.length) items = [...element.querySelectorAll('[class*="itemPictureWrapper"]')];

  const cells = [];
  items.forEach((item) => {
    const img = item.querySelector('img');
    const linkEl = item.querySelector('a[href]') || item.closest('a[href]');
    const href = linkEl ? linkEl.getAttribute('href') : null;
    const titleEl = item.querySelector('[class*="itemTitleWrapper"], [class*="Title"]');
    const label = clean(titleEl ? titleEl.textContent : (linkEl ? linkEl.textContent : item.textContent));

    if (!img && !label) return;

    const imageCell = [];
    let src = getImgSrc(img);
    if (!src && href) {
      if (!nextDataImages) nextDataImages = getNextDataImages(document, html);
      const path = nextDataImages.get(stripQuery(href));
      if (path) src = `${path}?wid=315&hei=315&qlt=60&fmt=webp`;
    }
    if (src) {
      const image = document.createElement('img');
      image.src = src;
      image.alt = (img && img.getAttribute('alt')) || label;
      imageCell.push(image);
    }

    const textCell = [];
    if (label) {
      const p = document.createElement('p');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = label;
        p.append(a);
      } else {
        p.textContent = label;
      }
      textCell.push(p);
    }

    cells.push([imageCell.length ? imageCell : '', textCell.length ? textCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards (circle)', cells });
  element.replaceWith(block);
}
