/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-promo. Base: cards. Source: https://www.target.com/
 * Source: Target contentPoolContainer multistory grid ([class*="multistoryGrid"] > div.h-position-relative),
 * each item: mobileLayout > a.ndsLink > [img mobileImgTop + mobileCopy: h3, p subheading, optional p fine print].
 * Output (cards, 2 columns): one row per card = [image | h3 linked title, description p(s)].
 * Per-card panel colors are CSS, not authored. Iterates grid children, never the <a> wrappers.
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

  let items = [...element.querySelectorAll('[class*="multistoryGrid"] > div')];
  if (!items.length) items = [...element.querySelectorAll('[class*="carouselComponentGrid"] > div')];
  if (!items.length) items = [...element.querySelectorAll('[class*="mobileLayout"], [class*="multistoryLayout"]')];

  const cells = [];
  items.forEach((item) => {
    const img = item.querySelector('img');
    const linkEl = item.querySelector('a[href]') || item.closest('a[href]');
    const href = linkEl ? linkEl.getAttribute('href') : null;
    const h = item.querySelector('h3, h2, h4');
    const title = h ? clean(h.textContent) : '';
    // Subheading + fine print paragraphs (skip empty ones)
    const paras = [...item.querySelectorAll('p')]
      .map((p) => clean(p.textContent))
      .filter(Boolean);

    if (!img && !title && !paras.length) return;

    const imageCell = [];
    const src = getImgSrc(img);
    if (src) {
      const image = document.createElement('img');
      image.src = src;
      image.alt = img.getAttribute('alt') || '';
      imageCell.push(image);
    }

    const textCell = [];
    if (title) {
      const h3 = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = title;
        h3.append(a);
      } else {
        h3.textContent = title;
      }
      textCell.push(h3);
    }
    paras.forEach((t) => {
      const p = document.createElement('p');
      p.textContent = t;
      textCell.push(p);
    });

    cells.push([imageCell.length ? imageCell : '', textCell.length ? textCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards (promo)', cells });
  element.replaceWith(block);
}
