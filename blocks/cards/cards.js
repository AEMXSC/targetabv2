import { createOptimizedPicture, loadCSS } from '../../scripts/aem.js';

// variants live in ./variants/<name>.{js,css}; authored as e.g. "Cards (deals)"
const VARIANTS = ['deals', 'circle', 'story', 'promo'];

export default async function decorate(block) {
  const variant = VARIANTS.find((v) => block.classList.contains(v));
  if (variant) {
    await loadCSS(`${window.hlx.codeBasePath}/blocks/cards/variants/${variant}.css`);
    const { default: decorateVariant } = await import(`./variants/${variant}.js`);
    await decorateVariant(block);
    return;
  }

  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });

  // replace images with optimized versions
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

  block.replaceChildren(ul);
}
