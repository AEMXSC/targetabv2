/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Target (www.target.com) site-wide cleanup.
 * All selectors verified against migration-work/cleaned.html.
 *
 * Target uses CSS-module hashed class names (e.g. styles_CarouselContainer__tYn6_),
 * so substring selectors ([class*="..."]) are used instead of exact hashed classes.
 *
 * IMPORTANT: page-templates.json block/section selectors rely on
 * `#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(N)`.
 * Nothing that shifts those direct children is removed in beforeTransform;
 * ad slot wrappers and empty spacers are removed in afterTransform only.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

// Direct children of the page-body wrapper (main#pageBodyContainer > div > div:nth-of-type(2))
const PAGE_BODY = '#pageBodyContainer > div > div:nth-of-type(2)';

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Overlays / modals that can block parsing:
    // - Health Data Consent modal: <div id="_r_d_"><div class="styles_overlay__dmjf7">...#VA_HEALTH_CONSENT_BUTTON
    // - Empty modal drawers / header dropdown containers: <div class="ModalDrawer">, <div class="HeaderModalDropdown">
    // - Bot-verification / captcha iframes: <iframe id="px-captcha-modal">, recaptcha aframe, <iframe id="google_ads_top_frame">
    WebImporter.DOMUtils.remove(element, [
      '[class*="styles_overlay__"]',
      '.ModalDrawer',
      '.HeaderModalDropdown',
      '#px-captcha-modal',
      'iframe[src*="recaptcha"]',
      '#google_ads_top_frame',
    ]);

    // 3rd-party ad iframes inside the Sponsored slots (inner content only,
    // does not shift page-body children): <iframe id="google_ads_iframe_/7079046/tgt/homepage_3">
    WebImporter.DOMUtils.remove(element, ['iframe[id^="google_ads_iframe"]']);

    // <body style="overflow: hidden; ..."> - restore scrolling
    const { body } = element.ownerDocument;
    if (body && body.style && body.style.overflow === 'hidden') {
      body.style.overflow = 'scroll';
    }
  }

  if (hookName === TransformHook.afterTransform) {
    // Sponsored ad slots (#sskinny, #clpu, #mega) and their page-body wrapper divs (3, 7, 20)
    ['#sskinny', '#clpu', '#mega'].forEach((id) => {
      const slot = element.querySelector(id);
      if (!slot) return;
      const wrapper = slot.closest(`${PAGE_BODY} > div`);
      (wrapper || slot).remove();
    });
    // Any leftover ad wrappers / "Sponsored" labels
    WebImporter.DOMUtils.remove(element, [
      '[class*="styles_styledRoundelAdContainer"]',
      '[class*="styles_pubAdWrapper"]',
      '[class*="styles_sponsoredLabel"]',
    ]);

    // Empty spacer divs among page-body children (13, 18): no text, no media, no blocks
    const pageBody = element.querySelector(PAGE_BODY);
    if (pageBody) {
      [...pageBody.children].forEach((child) => {
        if (child.tagName !== 'DIV') return;
        if (child.textContent.trim() !== '') return;
        if (child.querySelector('img, picture, table, a, video, iframe')) return;
        child.remove();
      });
    }

    // Visually hidden page heading: <div class="h-text-center h-margin-a-tight h-sr-only"><h1>Homepage</h1>
    WebImporter.DOMUtils.remove(element, ['#pageBodyContainer > div > div.h-sr-only']);

    // Global site chrome:
    // - #skipLinks, #staticShellLink
    // - utility header (zip/store/links): <div class="styles_utilityHeaderWrapper__qFk52">
    // - primary header + nav + sign-in flyout: <div id="@web/component-header" class="styles_primaryHeaderWrapper__tiMYv">
    // - global email signup strip: <div class="styles_container__ZisCt"> with h3.styles_signupHeading__l_hr_
    // - footer (includes "See details" disclaimer, #footer nav, #embedded-chat)
    WebImporter.DOMUtils.remove(element, [
      '#skipLinks',
      '#staticShellLink',
      '[class*="styles_utilityHeaderWrapper"]',
      '[class*="styles_primaryHeaderWrapper"]',
      '[class*="styles_container__"]:has([class*="styles_signupHeading"])',
      'footer',
      '#__next-route-announcer__',
      'next-route-announcer',
    ]);

    // Health consent modal wrapper (if still present)
    const consentBtn = element.querySelector('#VA_HEALTH_CONSENT_BUTTON');
    if (consentBtn) {
      const modal = consentBtn.closest('[class*="styles_ndsModal"]');
      if (modal) modal.remove();
    }

    // Non-authorable leftovers: tracking iframes (Adobe ID sync), preload links, noscript
    WebImporter.DOMUtils.remove(element, ['iframe', 'link', 'noscript']);
  }
}
