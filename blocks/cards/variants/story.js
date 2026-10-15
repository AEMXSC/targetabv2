import { createOptimizedPicture } from '../../../scripts/aem.js';

/**
 * Cards Story block — editorial story cards.
 * Authoring: one row per story — [image | badge p (e.g. "New"), linked h3 title, description p].
 * A short, link-less first paragraph before the heading is treated as the badge and
 * pinned over the image. The title link makes the whole card clickable.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-story-card';
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((cell) => {
      const onlyPicture = cell.querySelector('picture') && cell.textContent.trim() === '';
      cell.className = onlyPicture ? 'cards-story-card-image' : 'cards-story-card-body';
    });

    const body = li.querySelector('.cards-story-card-body');
    const image = li.querySelector('.cards-story-card-image');
    if (body) {
      const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
      const first = body.firstElementChild;
      if (heading) heading.classList.add('cards-story-title');
      if (
        first && heading && first !== heading && first.tagName === 'P'
        && !first.querySelector('a, picture') && first.textContent.trim().length <= 24
      ) {
        first.classList.add('cards-story-badge');
        (image || li).append(first);
      }
    }

    const link = (body && body.querySelector('.cards-story-title a[href]'))
      || li.querySelector('a[href]');
    if (link) {
      li.classList.add('cards-story-linked');
      link.classList.add('cards-story-link');
    }

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
    );
  });

  block.replaceChildren(ul);
}
