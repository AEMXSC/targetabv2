/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-deals. Base: cards. Source: https://www.target.com/
 * Source: Target contentPoolContainer grid ([class*="carouselComponentGrid"]) with 8 deal tiles.
 * Each tile: a.main-link (whole tile) > [mobileCopy: h3 amplified offer (eyebrowLine + faceLine +
 * sr-only full text), p mobileSubheading, optional p mobileFinePrint] + product img.
 * Output (cards, 2 columns): one row per deal = [image | eyebrow p, h3 linked offer, label p, fine print p].
 * Iteration is keyed on the grid's block-level children (not on the <a> wrappers) so adjacent
 * anchors merged by html2md preprocessing cannot collapse items.
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

  // Items: block-level children of the grid (validated: div.h-position-relative.styles-carousel_storyN)
  let items = [...element.querySelectorAll('[class*="carouselComponentGrid"] > div')];
  if (!items.length) items = [...element.querySelectorAll('[class*="mobileLayout"]')];
  if (!items.length) {
    // Last resort: one item per image
    items = [...element.querySelectorAll('img')].map((img) => img.closest('div') || img);
  }

  const cells = [];
  items.forEach((item) => {
    const img = item.querySelector('img');
    const linkEl = item.querySelector('a[href]') || item.closest('a[href]');
    const href = linkEl ? linkEl.getAttribute('href') : null;

    // Offer heading
    const h = item.querySelector('h3, h2, h4');
    let eyebrow = '';
    let offer = '';
    if (h) {
      const eyebrowEl = h.querySelector('[class*="eyebrowLine"]');
      eyebrow = eyebrowEl ? clean(eyebrowEl.textContent) : '';
      const srOnly = h.querySelector('.h-sr-only, [class*="sr-only"]');
      let full = srOnly ? clean(srOnly.textContent) : '';
      if (!full) {
        full = clean([...h.querySelectorAll('[class*="eyebrowLine"], [class*="faceLine"]')].map((s) => s.textContent).join(' '))
          || clean(h.textContent);
      }
      offer = eyebrow && full.toLowerCase().startsWith(eyebrow.toLowerCase())
        ? clean(full.slice(eyebrow.length))
        : full;
      if (!offer) { offer = full; eyebrow = ''; }
    }

    const subEl = item.querySelector('p[class*="mobileSubheading"], p[class*="Subheading"]');
    const fineEl = item.querySelector('p[class*="FinePrint"]');
    const sub = subEl ? clean(subEl.textContent) : '';
    const fine = fineEl && fineEl !== subEl ? clean(fineEl.textContent) : '';

    if (!img && !offer && !sub) return;

    const imageCell = [];
    const src = getImgSrc(img);
    if (src) {
      const image = document.createElement('img');
      image.src = src;
      image.alt = img.getAttribute('alt') || '';
      imageCell.push(image);
    }

    const textCell = [];
    if (eyebrow) {
      const p = document.createElement('p');
      p.textContent = eyebrow;
      textCell.push(p);
    }
    if (offer) {
      const h3 = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = offer;
        h3.append(a);
      } else {
        h3.textContent = offer;
      }
      textCell.push(h3);
    }
    if (sub) {
      const p = document.createElement('p');
      p.textContent = sub;
      textCell.push(p);
    }
    if (fine) {
      const p = document.createElement('p');
      p.textContent = fine;
      textCell.push(p);
    }
    if (!offer && href) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = sub || href;
      p.append(a);
      textCell.push(p);
    }

    cells.push([imageCell.length ? imageCell : '', textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards (deals)', cells });
  element.replaceWith(block);
}
