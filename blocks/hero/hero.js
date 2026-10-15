import { loadCSS } from '../../scripts/aem.js';

// variants live in ./variants/<name>.{js,css}; authored as e.g. "Hero (promo, left)".
// The plain hero needs no JS: its picture + heading are styled as-is by hero.css.
const VARIANTS = ['banner', 'promo'];

export default async function decorate(block) {
  const variant = VARIANTS.find((v) => block.classList.contains(v));
  if (!variant) return;
  await loadCSS(`${window.hlx.codeBasePath}/blocks/hero/variants/${variant}.css`);
  const { default: decorateVariant } = await import(`./variants/${variant}.js`);
  await decorateVariant(block);
}
