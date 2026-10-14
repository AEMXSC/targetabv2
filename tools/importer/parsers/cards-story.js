/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-story. Base: cards. Source: https://www.target.com/
 * Source: Target contentPoolContainer multistory grid ([class*="carouselComponentGrid"] > div),
 * each item: [class*="ribbon"] badge ("New") + a.ndsLink > [img + copy: h3 heading, p subheading].
 * Two layouts occur (multistoryLayout / mobileLayout) — selectors are class-substring based.
 * Output (cards, 2 columns): one row per story = [image | badge p, h3 linked title, description p].
 * Iterates the grid's block-level children, never the <a> wrappers.
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

// Heading text; when a visually-hidden label is followed by a glyph replacement
// (e.g. sr-only "Target" + "◎"), keep the readable label and drop the glyph.
function headingText(h) {
  const clone = h.cloneNode(true);
  clone.querySelectorAll('.h-sr-only, [class*="sr-only"]').forEach((sr) => {
    const next = sr.nextElementSibling;
    if (next && !/[a-z0-9]/i.test(next.textContent)) next.remove();
  });
  return clone.textContent.replace(/\s+/g, ' ').trim();
}

export default function parse(element, { document }) {
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

  let items = [...element.querySelectorAll('[class*="carouselComponentGrid"] > div')];
  if (!items.length) items = [...element.querySelectorAll('[class*="multistoryLayout"], [class*="mobileLayout"]')];

  const cells = [];
  items.forEach((item) => {
    const img = item.querySelector('img');
    const linkEl = item.querySelector('a[href]') || item.closest('a[href]');
    const href = linkEl ? linkEl.getAttribute('href') : null;
    const badgeEl = item.querySelector('[class*="ribbon"]');
    const badge = badgeEl ? clean(badgeEl.textContent) : '';
    const h = item.querySelector('h3, h2, h4');
    const title = h ? headingText(h) : '';
    const descEl = item.querySelector('p[class*="Subheading"], p[class*="subheading"]')
      || [...item.querySelectorAll('p')].find((p) => clean(p.textContent));
    const desc = descEl ? clean(descEl.textContent) : '';

    if (!img && !title && !desc) return;

    const imageCell = [];
    const src = getImgSrc(img);
    if (src) {
      const image = document.createElement('img');
      image.src = src;
      image.alt = img.getAttribute('alt') || '';
      imageCell.push(image);
    }

    const textCell = [];
    if (badge) {
      const p = document.createElement('p');
      p.textContent = badge;
      textCell.push(p);
    }
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
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc;
      textCell.push(p);
    }

    cells.push([imageCell.length ? imageCell : '', textCell.length ? textCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-story', cells });
  element.replaceWith(block);
}
