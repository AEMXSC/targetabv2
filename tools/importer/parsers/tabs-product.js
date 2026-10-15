/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-product. Base: tabs. Source: https://www.target.com/
 * Source: Target CarouselContainer tab bar ([class*="tabBar"] > ... > button[class*="tabsButton"])
 * with a single #tabContent-tab-* panel whose product carousel loads client-side (empty at import).
 * Output (tabs, 2 columns): one row per tab = [tab label | "Shop <label>" category link].
 * Category URL precedence: link found in the matching tab panel -> section headline link ->
 * Target search URL for the label.
 * Generated: 2026-10-08
 */
export default function parse(element, { document }) {
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

  // Tab buttons (validated: button.styles_tabsButton__* inside [class*="tabList"])
  let buttons = [...element.querySelectorAll('[class*="tabList"] button, [class*="tabList"] [role="tab"]')];
  if (!buttons.length) buttons = [...element.querySelectorAll('button[class*="tabsButton"], [role="tab"]')];
  // de-duplicate (role=tab buttons could match twice in fallback chains)
  buttons = buttons.filter((b, i) => buttons.indexOf(b) === i && clean(b.textContent));

  if (!buttons.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Section-level headline link (e.g. h2 "Save on top toys" -> /c/toy-deals/-/N-55fjf)
  const carousel = element.closest('[class*="CarouselContainer"]') || element.parentElement;
  const headlineLink = carousel
    ? carousel.querySelector('[class*="HeadlineContainer"] a[href], [class*="HeadlineLink"][href]')
    : null;
  const headlineHref = headlineLink ? headlineLink.getAttribute('href') : null;

  const cells = [];
  buttons.forEach((btn) => {
    const label = clean(btn.textContent);

    // Category link inside the matching panel, if the carousel rendered one
    let href = null;
    const btnId = btn.getAttribute('id');
    const controls = btn.getAttribute('aria-controls');
    let panel = null;
    if (controls) panel = element.querySelector(`[id="${controls}"]`);
    if (!panel && btnId) panel = element.querySelector(`[id="tabContent-${btnId}"]`);
    if (panel) {
      const panelLink = panel.querySelector('a[href*="/c/"], a[href*="/pl/"], a[href*="/s?"]');
      if (panelLink) href = panelLink.getAttribute('href');
    }
    if (!href && headlineHref) href = headlineHref;
    if (!href) href = `/s?searchTerm=${encodeURIComponent(label)}`;

    const labelCell = document.createElement('p');
    labelCell.textContent = label;

    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = `Shop ${label}`;
    p.append(a);

    cells.push([labelCell, p]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'Tabs (product)', cells });
  element.replaceWith(block);
}
