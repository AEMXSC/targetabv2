import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Desktop collage tiles. Target storycard assets are portrait "mobile" images laid out
 * as a 3x3 grid: a row of three product tiles, a cream text band, another row of three
 * tiles. On wide screens the source shows the copy in a centered cream panel flanked by
 * 2x2 product tiles, so each side panel is rebuilt from tiles of the same image
 * ([column, row] of the 3-column grid), alternating colours like a checkerboard.
 */
const COLLAGE = {
  start: [[0, 'top'], [1, 'top'], [1, 'bottom'], [0, 'bottom']],
  end: [[2, 'top'], [1, 'bottom'], [1, 'top'], [2, 'bottom']],
};

function buildTiles(side) {
  const tiles = document.createElement('div');
  tiles.className = `hero-banner-tiles hero-banner-tiles-${side}`;
  tiles.setAttribute('aria-hidden', 'true');
  COLLAGE[side].forEach(([col, row]) => {
    const tile = document.createElement('span');
    tile.className = `hero-banner-tile hero-banner-tile-c${col} hero-banner-tile-${row}`;
    tiles.append(tile);
  });
  return tiles;
}

/**
 * Scene7 pads (rather than upscales) a request wider than the master — e.g. wid=2000 of a
 * 1500px master returns white side bars, which breaks the tile grid. fit=constrain caps
 * the output at the master size while keeping its aspect ratio.
 * @param {Element} picture
 */
function constrainScene7(picture) {
  const fix = (url) => {
    if (!/scene7\.com\/is\/image\//.test(url) || /[?&]fit=/.test(url)) return url;
    return `${url}${url.includes('?') ? '&' : '?'}fit=constrain`;
  };
  picture.querySelectorAll('source[srcset]').forEach((source) => {
    source.srcset = source.getAttribute('srcset').split(/,\s+/).map((candidate) => {
      const [url, ...descriptors] = candidate.trim().split(/\s+/);
      return [fix(url), ...descriptors].join(' ');
    }).join(', ');
  });
  picture.querySelectorAll('img[src]').forEach((img) => {
    img.src = fix(img.getAttribute('src'));
  });
}

/**
 * Hero Banner block — wide promo banner (Target storycard) with centered copy.
 * Authoring: row 1 = image, row 2 = optional eyebrow p, heading,
 * subheading p(s), optional CTA link. Rows may also be combined in a single cell:
 * the first picture becomes the background, everything else the overlay content.
 * Image cells may hold a <picture> rebuilt from a Dynamic Media (Scene7) URL —
 * re-rendering goes through createOptimizedPicture, which keeps DM query params.
 * The CTA link is stretched over the whole banner (the source banner is one link).
 * @param {Element} block
 */
export default function decorate(block) {
  const picture = block.querySelector('picture');

  const media = document.createElement('div');
  media.className = 'hero-banner-media';
  let bannerImg = null;
  if (picture) {
    const img = picture.querySelector('img');
    const optimized = img
      ? createOptimizedPicture(img.src, img.alt, true, [
        { media: '(min-width: 600px)', width: '2000' },
        { width: '750' },
      ])
      : picture;
    constrainScene7(optimized);
    // the banner image is the LCP candidate — never lazy-load it
    bannerImg = optimized.querySelector('img');
    if (bannerImg) {
      bannerImg.loading = 'eager';
      bannerImg.fetchPriority = 'high';
    }
    const holder = picture.closest('p');
    picture.remove();
    if (holder && !holder.textContent.trim() && !holder.children.length) holder.remove();
    media.append(optimized);
  }

  const content = document.createElement('div');
  content.className = 'hero-banner-content';
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    content.append(...cell.childNodes);
  });
  [...content.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) node.remove();
  });

  const heading = content.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    heading.classList.add('hero-banner-title');
    // a short paragraph authored before the heading is the eyebrow ("3 days only!")
    const prev = heading.previousElementSibling;
    if (prev && prev.tagName === 'P' && !prev.querySelector('a, picture')) {
      prev.classList.add('hero-banner-eyebrow');
    }
    // the source sets the currency sign as a raised, smaller glyph ("Save $10")
    if (heading.children.length === 0) {
      heading.innerHTML = heading.innerHTML.replace(/([$€£])(?=\d)/g, '<span class="hero-banner-currency">$1</span>');
    }
  }

  const cta = content.querySelector('a[href]');
  if (cta) {
    const ctaHolder = cta.closest('.button-container') || cta.parentElement;
    if (ctaHolder && ctaHolder !== content) ctaHolder.classList.add('hero-banner-cta');
    cta.classList.add('hero-banner-link');
  }

  if (!picture) {
    block.replaceChildren(content);
    block.classList.add('hero-banner-no-image');
    return;
  }

  block.replaceChildren(media, buildTiles('start'), content, buildTiles('end'));
  block.classList.add('hero-banner-collage');

  if (bannerImg) {
    const syncImage = () => {
      const url = bannerImg.currentSrc || bannerImg.src;
      block.style.setProperty('--hero-banner-image', `url("${url}")`);
      // landscape artwork is not a tile grid: show it as a plain background instead
      if (bannerImg.naturalWidth && bannerImg.naturalWidth >= bannerImg.naturalHeight) {
        block.classList.remove('hero-banner-collage');
      }
    };
    // wait for the picture to pick its source so the tiles reuse the same download
    if (bannerImg.complete && bannerImg.currentSrc) syncImage();
    else bannerImg.addEventListener('load', syncImage, { once: true });
  }
}
