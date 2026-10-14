import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Splits an offer like "25% off" or "$100" into styled parts so the number renders
 * large with a small "$" prefix and a stacked "% / off" suffix (as on the source).
 * The text content stays identical, so links and headings read the same.
 * @param {Element} el element whose only content is the offer text
 */
function splitOffer(el) {
  if (!el || el.children.length) return;
  const match = el.textContent.trim().match(/^(\$)?(\d+(?:\.\d+)?)(%)?\s*(off)?$/i);
  if (!match) return;
  const [, currency, num, percent, off] = match;
  const span = (cls, text) => {
    const s = document.createElement('span');
    s.className = cls;
    s.textContent = text;
    return s;
  };
  const parts = [];
  if (currency) parts.push(span('cards-deals-offer-currency', currency));
  parts.push(span('cards-deals-offer-num', num));
  if (percent || off) {
    const suffix = span('cards-deals-offer-suffix', '');
    if (percent) suffix.append(span('cards-deals-offer-percent', percent));
    if (off) suffix.append(span('cards-deals-offer-off', `${percent ? ' ' : ''}${off}`));
    parts.push(suffix);
  }
  el.replaceChildren(...parts);
}

/**
 * Cards Deals block.
 * Authoring: one row per deal — [product image | eyebrow, offer heading, label,
 * optional fine print, link]. The first link in a card makes the whole tile clickable.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-deals-card';
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((cell) => {
      const onlyPicture = cell.querySelector('picture')
        && cell.textContent.trim() === '';
      cell.className = onlyPicture ? 'cards-deals-card-image' : 'cards-deals-card-body';
    });

    const body = li.querySelector('.cards-deals-card-body');
    if (body) {
      const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) {
        heading.classList.add('cards-deals-offer');
        splitOffer(heading.querySelector('a') || heading);
      }
      const first = body.firstElementChild;
      if (first && heading && first !== heading && first.tagName === 'P') {
        first.classList.add('cards-deals-eyebrow');
      }
      // paragraphs after the offer: first is the product label, the rest are fine print
      if (heading) {
        let sibling = heading.nextElementSibling;
        let isLabel = true;
        while (sibling) {
          if (sibling.tagName === 'P') {
            sibling.classList.add(isLabel ? 'cards-deals-label' : 'cards-deals-fineprint');
            isLabel = false;
          }
          sibling = sibling.nextElementSibling;
        }
      }
    }

    const link = li.querySelector('a[href]');
    if (link) {
      li.classList.add('cards-deals-linked');
      link.classList.add('cards-deals-link');
      if (!link.getAttribute('aria-label')) {
        const textOf = (el) => (el ? [...el.children].map((c) => c.textContent.trim()) : []);
        const label = textOf(body).filter(Boolean).join(' ').replace(/\s+/g, ' ');
        if (label) link.setAttribute('aria-label', label);
      }
    }

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '500' }]),
    );
  });

  block.replaceChildren(ul);
}
