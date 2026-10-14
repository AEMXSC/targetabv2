import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Cards Circle block — circular category thumbnails with a linked label.
 * Authoring: one row per category — [image | linked label].
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-circle-item';
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((cell) => {
      const onlyPicture = cell.querySelector('picture') && cell.textContent.trim() === '';
      cell.className = onlyPicture ? 'cards-circle-image' : 'cards-circle-label';
    });

    const link = li.querySelector('a[href]');
    if (link) {
      li.classList.add('cards-circle-linked');
      link.classList.add('cards-circle-link');
      // the label is a plain text link, not a button
      link.classList.remove('button', 'primary', 'secondary');
      const wrapper = link.closest('.button-container');
      if (wrapper) wrapper.classList.remove('button-container');
    }

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    // the label right next to the image already names the item; repeating it is noise
    const label = img.closest('li').querySelector('.cards-circle-label');
    const same = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();
    const alt = label && same(img.alt, label.textContent) ? '' : img.alt;
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, alt, false, [{ width: '300' }]),
    );
  });

  block.replaceChildren(ul);
}
