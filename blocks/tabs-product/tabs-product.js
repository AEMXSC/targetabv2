// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';

let instanceCount = 0;

/**
 * Tabs Product block.
 * Authoring: one row per tab — [label | panel content].
 * Panel content is typically a "Shop <label>" category link (the source site's
 * panels are dynamic product carousels), but any authored content is kept.
 * @param {Element} block
 */
export default function decorate(block) {
  instanceCount += 1;
  const prefix = `tabs-product-${instanceCount}`;

  const tablist = document.createElement('div');
  tablist.className = 'tabs-product-list';
  tablist.setAttribute('role', 'tablist');

  const rows = [...block.children].filter((row) => row.firstElementChild);
  const used = new Set();

  rows.forEach((row, i) => {
    const labelCell = row.firstElementChild;
    let id = `${prefix}-${toClassName(labelCell.textContent) || i}`;
    if (used.has(id)) id = `${id}-${i}`;
    used.add(id);

    // panel: everything except the label cell; fall back to the label text if empty
    row.className = 'tabs-product-panel';
    row.id = `tabpanel-${id}`;
    row.setAttribute('role', 'tabpanel');
    row.setAttribute('aria-labelledby', `tab-${id}`);
    row.setAttribute('aria-hidden', i !== 0);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tabs-product-tab';
    button.id = `tab-${id}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', row.id);
    button.setAttribute('aria-selected', i === 0);
    button.tabIndex = i === 0 ? 0 : -1;
    button.textContent = labelCell.textContent.trim();

    button.addEventListener('click', () => {
      rows.forEach((panel) => panel.setAttribute('aria-hidden', true));
      tablist.querySelectorAll('[role=tab]').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
        btn.tabIndex = -1;
      });
      row.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
      button.tabIndex = 0;
    });

    tablist.append(button);
    labelCell.remove();

    // flatten remaining cells into a single content wrapper
    const content = document.createElement('div');
    content.className = 'tabs-product-content';
    content.append(...[...row.children].flatMap((cell) => [...cell.childNodes]));
    row.replaceChildren(content);
    content.querySelectorAll('a').forEach((a) => a.classList.add('tabs-product-link'));
  });

  // keyboard support (WAI-ARIA tabs pattern): arrows move between tabs, Home/End jump
  tablist.addEventListener('keydown', (e) => {
    const tabs = [...tablist.querySelectorAll('[role=tab]')];
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    const keys = {
      ArrowRight: (current + 1) % tabs.length,
      ArrowLeft: (current - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const next = tabs[keys[e.key]];
    next.focus();
    next.click();
  });

  block.prepend(tablist);
}
