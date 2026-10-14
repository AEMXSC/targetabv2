/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Target (www.target.com) Dynamic Media / Scene7 images.
 *
 * Target serves images from Scene7 IS/Image (https://target.scene7.com/is/image/Target/...).
 * Keeps DM images as real <img> elements so authors see them in Document Authoring;
 * on preview EDS ingests them into its media store and serves optimized pictures.
 * The scraped src is often a small rendition (wid=315/600/668, sometimes boxed by
 * hei), so the URL is normalized to request up to 2000px without upscaling or
 * padding: wid=2000, hei removed, fit=constrain.
 *
 * Runs in afterTransform ONLY - block parsers run between hooks and need <img>.
 * Spec: excat-import-infrastructure/references/dm-scene7-transformer.md
 */

// ---- Begin canonical helpers (copy from dm-scene7-helpers.js) ----
function detectDynamicMediaUrl(urlStr) {
  if (typeof urlStr !== 'string') return false;
  // Reject relative URLs. The Scene7 rule is path-only (`/is/image/`) and
  // collides with same-named local paths on customer sites — without this
  // guard, a relative `/is/image/foo` would be classified as scene7 and
  // rewritten by the transformer/auto-block, breaking local rendering.
  // Absolute (`https://…`) and protocol-relative (`//host/…`) inputs are
  // accepted; the synthetic base below only resolves the protocol-relative
  // case to a parseable URL.
  if (!/^(https?:\/\/|\/\/)/i.test(urlStr)) return false;
  let u;
  try {
    u = new URL(urlStr, 'https://x/');
  } catch {
    return false;
  }
  if (u.pathname.startsWith('/is/image/')) {
    return 'scene7';
  }
  if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname)
      && u.pathname.startsWith('/adobe/assets/urn:')) {
    return 'dm-openapi';
  }
  return false;
}

// ---- End canonical helpers ----

// Request a large, unpadded rendition: wid=2000, no hei box, fit=constrain.
// Query string is edited verbatim so Scene7 `$` template params stay intact.
function toIngestRendition(src) {
  const normalized = src.startsWith('//') ? `https:${src}` : src;
  const qIdx = normalized.indexOf('?');
  const base = qIdx >= 0 ? normalized.slice(0, qIdx) : normalized;
  const query = qIdx >= 0 ? normalized.slice(qIdx + 1) : '';
  const pairs = query.split('&').filter((p) => p && !['wid', 'hei', 'fit'].includes(p.split('=')[0]));
  pairs.push('wid=2000', 'fit=constrain');
  return `${base}?${pairs.join('&')}`;
}

// eslint-disable-next-line no-unused-vars
export default function transform(hookName, element, payload) {
  if (hookName !== 'afterTransform') return;

  element.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') || '';
    const type = detectDynamicMediaUrl(src);
    if (!type) return;
    if (type === 'scene7') img.setAttribute('src', toIngestRendition(src));
    // drop responsive siblings that still point at the small scraped renditions
    const picture = img.closest('picture');
    if (picture) picture.querySelectorAll('source').forEach((s) => s.remove());
  });
}
