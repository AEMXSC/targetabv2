import { createOptimizedPicture } from '../../../scripts/aem.js';

/**
 * Hero Promo block — mid-page linked promo banner.
 * Authoring: row 1 = background image, row 2 = heading + paragraph(s) + link.
 * Rows may also be combined in a single cell; the first picture becomes the
 * background, everything else becomes the overlay content.
 * Options: default = centered copy; `left` = copy aligned to the start edge (CSS-only).
 * @param {Element} block
 */
export default function decorate(block) {
  const picture = block.querySelector('picture');

  const media = document.createElement('div');
  media.className = 'hero-promo-media';
  if (picture) {
    const img = picture.querySelector('img');
    const optimized = img
      ? createOptimizedPicture(img.src, img.alt, false, [
        { media: '(min-width: 900px)', width: '2000' },
        { width: '900' },
      ])
      : picture;
    const holder = picture.closest('p');
    picture.remove();
    if (holder && !holder.textContent.trim() && !holder.children.length) holder.remove();
    media.append(optimized);
  }

  const content = document.createElement('div');
  content.className = 'hero-promo-content';
  [...block.querySelectorAll(':scope > div > div')].forEach((cell) => {
    content.append(...cell.childNodes);
  });
  [...content.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) node.remove();
  });

  const link = content.querySelector('a[href]');
  if (link) {
    block.classList.add('hero-promo-linked');
    link.classList.add('hero-promo-link');
  }

  block.replaceChildren(...(picture ? [media] : []), content);
  if (!picture) block.classList.add('hero-promo-no-image');

  const has = (c) => block.classList.contains(c);
  const autoTheme = !has('dark') && !has('light');
  const autoAlign = !has('left') && !has('center');
  // eslint-disable-next-line no-use-before-define
  if (picture && (autoTheme || autoAlign)) applyAutoTheme(block, media.querySelector('img'), { autoTheme, autoAlign });
}

/**
 * Picks copy alignment and light/dark copy colour from the image when the author
 * set neither. Samples a tiny rendition (Scene7 supports CORS): if the centre is
 * busy (QR code, product shot) but the left band is plain, the copy goes left;
 * the colour follows the area behind the copy. Fails silently (tainted canvas,
 * network) -> centred, light theme.
 * @param {Element} block
 * @param {HTMLImageElement} img
 * @param {{ autoTheme: boolean, autoAlign: boolean }} opts
 */
function applyAutoTheme(block, img, { autoTheme = true, autoAlign = false } = {}) {
  if (!img) return;
  let url;
  try {
    url = new URL(img.currentSrc || img.src, window.location.href);
  } catch (e) {
    return;
  }
  if (url.pathname.includes('/is/image/')) {
    url.searchParams.set('wid', '64');
    url.searchParams.delete('hei');
    url.searchParams.set('fmt', 'png');
  } else if (url.origin !== window.location.origin) {
    return;
  }
  const probe = new Image();
  probe.crossOrigin = 'anonymous';
  probe.decoding = 'async';
  probe.addEventListener('load', () => {
    try {
      const w = probe.naturalWidth;
      const h = probe.naturalHeight;
      if (!w || !h) return;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(probe, 0, 0, w, h);
      const lum = (c) => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
      const stats = (x0, x1) => {
        const { data } = ctx.getImageData(x0, 0, Math.max(1, x1 - x0), h);
        let r = 0; let g = 0; let b = 0; let n = 0; let sq = 0;
        for (let i = 0; i < data.length; i += 4) {
          const l = lum([data[i], data[i + 1], data[i + 2]]);
          r += data[i]; g += data[i + 1]; b += data[i + 2]; n += 1; sq += l * l;
        }
        const mean = [r / n, g / n, b / n];
        const ml = lum(mean);
        return { mean, spread: Math.sqrt(Math.max(0, sq / n - ml * ml)) };
      };
      const leftBand = stats(0, Math.round(w * 0.4));
      const centreBand = stats(Math.round(w * 0.3), Math.round(w * 0.7));
      if (autoAlign && leftBand.spread < 0.12 && centreBand.spread > leftBand.spread * 2) {
        block.classList.add('left');
      }
      if (autoTheme) {
        const region = block.classList.contains('left') ? leftBand : centreBand;
        block.classList.add(lum(region.mean) < 0.5 ? 'dark' : 'light');
      }
    } catch (e) {
      // tainted canvas or decode failure: keep default (light) styling
    }
  });
  probe.src = url.href;
}
