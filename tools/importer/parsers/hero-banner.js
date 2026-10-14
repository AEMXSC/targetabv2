/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-banner. Base: hero. Source: https://www.target.com/
 * Source: Target storycard ([class*="storycardWrapper"]) — a linked banner with
 * picture, headline (eyebrow + main line), subhead and a <button> CTA inside the <a>.
 * Output (hero, 1 column): row 1 = background image; row 2 = eyebrow p, h2, subheading p, CTA link.
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

export default function parse(element, { document }) {
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

  // Link target: the wrapping storycard anchor (or any anchor in the block)
  const link = element.querySelector('a[class*="storycardLink"]')
    || element.closest('a[href]')
    || element.querySelector('a[href]');
  const href = link ? link.getAttribute('href') : null;

  // Background image
  const img = element.querySelector('[class*="ndsPicture"] img, picture img, img');

  // Headline: h2 inside storycard text; may contain multiple line groups (eyebrow + headline)
  const headlineEl = element.querySelector('[class*="storycardHeadline"], h1, h2, h3');
  let eyebrow = '';
  let headline = '';
  if (headlineEl) {
    const wrapper = headlineEl.querySelector(':scope > span') || headlineEl;
    const lines = [...wrapper.children]
      .filter((c) => c.tagName === 'SPAN')
      .map((c) => clean(c.textContent))
      .filter(Boolean);
    if (lines.length > 1) {
      eyebrow = lines.slice(0, -1).join(' ');
      headline = lines[lines.length - 1];
    } else {
      headline = clean(headlineEl.textContent);
    }
  }

  // Subheading / detail text
  const detailEl = element.querySelector('[class*="storycardDetail"], [class*="resizeTextSubhead"]');
  const detail = detailEl ? clean(detailEl.textContent) : '';

  // CTA label: button text inside the storycard
  const ctaEl = element.querySelector('[class*="storycardButtonWrapper"] button, [class*="storycardButtonWrapper"] span, button');
  const ctaText = ctaEl ? clean(ctaEl.textContent) : '';

  if (!img && !headline && !detail) {
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
  if (eyebrow) {
    const p = document.createElement('p');
    p.textContent = eyebrow;
    content.push(p);
  }
  if (headline) {
    const h2 = document.createElement('h2');
    h2.textContent = headline;
    content.push(h2);
  }
  if (detail) {
    const p = document.createElement('p');
    p.textContent = detail;
    content.push(p);
  }
  if (href) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = ctaText || headline || href;
    p.append(a);
    content.push(p);
  }
  cells.push([content]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
