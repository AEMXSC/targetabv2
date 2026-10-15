import { createOptimizedPicture } from '../../../scripts/aem.js';

/**
 * Cards Promo block — promotional feature cards.
 * Authoring: one row per card — [image | linked heading, description p(s), optional CTA].
 * The heading link (or first link) makes the whole card clickable.
 * @param {Element} block
 */
export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-promo-card';
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      const onlyPicture = div.querySelector('picture') && div.textContent.trim() === '';
      div.className = onlyPicture ? 'cards-promo-card-image' : 'cards-promo-card-body';
    });

    const body = li.querySelector('.cards-promo-card-body');
    const heading = body && body.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) heading.classList.add('cards-promo-title');

    const link = (heading && heading.querySelector('a[href]')) || li.querySelector('a[href]');
    if (link) {
      li.classList.add('cards-promo-linked');
      link.classList.add('cards-promo-link');
    }

    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
