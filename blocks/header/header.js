// media query match that indicates desktop width
const isDesktop = window.matchMedia('(width >= 900px)');

const SEARCH_ACTION = 'https://www.target.com/s';

/**
 * Fetches the nav fragment from the site root; only the local dev server falls back
 * to /content, where it serves imported content.
 * @returns {Promise<{ html: string, base: string }|null>}
 */
async function fetchNavFragment() {
  let resp = await fetch('/nav.plain.html');
  if (!resp.ok && window.location.hostname === 'localhost') resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) return null;
  return { html: await resp.text(), base: resp.url };
}

/**
 * Parses the fragment and makes relative image URLs absolute to the fragment location.
 * @param {{ html: string, base: string }} fragment
 * @returns {HTMLElement[]} the top-level section divs
 */
function parseSections({ html, base }) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  wrapper.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), base).href;
    img.loading = 'eager';
  });
  return [...wrapper.children].filter((el) => el.tagName === 'DIV');
}

/**
 * DA splits `<a><img>Label</a>` into an icon-only link plus a sibling paragraph,
 * leaving the link without an accessible name. Moves that label back into the link.
 * @param {HTMLUListElement} list
 */
function mergeIconLinkLabels(list) {
  list.querySelectorAll(':scope > li').forEach((li) => {
    const link = li.querySelector('a');
    if (!link || link.textContent.trim()) return;
    const labels = [...li.children].filter((c) => !c.contains(link) && c.textContent.trim());
    if (!labels.length) return;
    link.append(labels.map((c) => c.textContent.trim()).join(' '));
    labels.forEach((c) => c.remove());
  });
}

function iconImg(base, name, alt = '') {
  const img = document.createElement('img');
  img.src = new URL(`images/nav/${name}.svg`, base).href;
  img.alt = alt;
  img.width = 24;
  img.height = 24;
  return img;
}

/**
 * Closes every open drop panel (and the mobile drawer when requested).
 * @param {HTMLElement} nav
 * @param {boolean} [closeDrawer]
 */
function closeAll(nav, closeDrawer = false) {
  nav.querySelectorAll('.nav-drop-trigger[aria-expanded="true"]').forEach((t) => t.setAttribute('aria-expanded', 'false'));
  if (closeDrawer) {
    nav.setAttribute('aria-expanded', 'false');
    const burger = nav.querySelector('.nav-hamburger');
    if (burger) {
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Open menu');
    }
  }
  const anyOpen = nav.querySelector('.nav-drop-trigger[aria-expanded="true"]') || nav.getAttribute('aria-expanded') === 'true';
  document.body.classList.toggle('nav-open', Boolean(anyOpen));
}

/**
 * Turns a list item with a nested list into a click-to-open drop panel.
 * @param {HTMLLIElement} item
 * @param {HTMLElement} nav
 * @param {string} base
 * @param {number} index
 */
function buildDrop(item, nav, base, index) {
  // DA wraps a list item's leading link in a <p>; local plain HTML does not
  const link = item.querySelector(':scope > a, :scope > p > a');
  const linkHolder = link && link.parentElement !== item ? link.parentElement : link;
  const label = link ? link.textContent.trim() : '';
  const panelId = `nav-panel-${index}`;

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'nav-drop-trigger';
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', panelId);
  trigger.append(label, iconImg(base, 'chevron-down'));

  const panel = document.createElement('div');
  panel.className = 'nav-panel';
  panel.id = panelId;
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', label);

  const head = document.createElement('div');
  head.className = 'nav-panel-head';
  const title = document.createElement('p');
  title.className = 'nav-panel-title';
  title.textContent = label;
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'nav-panel-close';
  close.setAttribute('aria-label', `Close ${label}`);
  close.append(iconImg(base, 'close'));
  close.addEventListener('click', () => {
    trigger.setAttribute('aria-expanded', 'false');
    closeAll(nav);
    trigger.focus();
  });
  head.append(title, close);

  const body = document.createElement('div');
  body.className = 'nav-panel-body';
  [...item.children].filter((c) => c !== linkHolder).forEach((c) => {
    if (c.tagName === 'P') c.className = 'nav-panel-subhead';
    if (c.tagName === 'UL') c.className = 'nav-panel-list';
    body.append(c);
  });
  if (link) {
    const all = document.createElement('p');
    all.className = 'nav-panel-all';
    link.textContent = `Shop all ${label.toLowerCase()}`;
    all.append(link);
    body.append(all);
  }
  panel.append(head, body);

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = trigger.getAttribute('aria-expanded') === 'true';
    // desktop shows one drawer at a time; mobile sections expand independently
    if (isDesktop.matches) closeAll(nav);
    trigger.setAttribute('aria-expanded', open ? 'false' : 'true');
    document.body.classList.toggle('nav-open', !open || nav.getAttribute('aria-expanded') === 'true');
  });

  item.className = 'nav-drop';
  item.replaceChildren(trigger, panel);
}

function buildSearch(placeholder, base) {
  const form = document.createElement('form');
  form.className = 'nav-search';
  form.setAttribute('role', 'search');
  form.action = SEARCH_ACTION;
  form.method = 'get';
  const label = document.createElement('label');
  label.className = 'nav-search-label';
  label.htmlFor = 'nav-search-input';
  label.textContent = placeholder;
  const input = document.createElement('input');
  input.id = 'nav-search-input';
  input.type = 'search';
  input.name = 'searchTerm';
  input.placeholder = placeholder;
  input.autocomplete = 'off';
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'nav-search-submit';
  submit.setAttribute('aria-label', 'search');
  submit.append(iconImg(base, 'search'));
  form.append(label, input, submit);
  return form;
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNavFragment();
  if (!fragment) return;
  const [utilSection, brandSection, navSection, toolsSection] = parseSections(fragment);
  const { base } = fragment;

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');
  nav.setAttribute('aria-expanded', 'false');

  // row 0: utility bar
  const utility = document.createElement('div');
  utility.className = 'nav-utility';
  if (utilSection) {
    const lists = [...utilSection.querySelectorAll(':scope > ul')];
    lists.forEach(mergeIconLinkLabels);
    if (lists[0]) lists[0].className = 'nav-utility-left';
    if (lists[1]) lists[1].className = 'nav-utility-right';
    utility.append(...lists);
  }

  // row 1: main header
  const main = document.createElement('div');
  main.className = 'nav-main';

  const burger = document.createElement('button');
  burger.type = 'button';
  burger.className = 'nav-hamburger';
  burger.setAttribute('aria-controls', 'nav-sections');
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-label', 'Open menu');
  burger.append(iconImg(base, 'menu'));
  burger.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = nav.getAttribute('aria-expanded') === 'true';
    if (open) {
      closeAll(nav, true);
    } else {
      nav.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Close menu');
      document.body.classList.add('nav-open');
    }
  });

  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  if (brandSection) brand.append(...brandSection.childNodes);

  const sections = document.createElement('div');
  sections.className = 'nav-sections';
  sections.id = 'nav-sections';
  // the mobile drawer is full width, so it carries its own close control
  const drawerClose = document.createElement('button');
  drawerClose.type = 'button';
  drawerClose.className = 'nav-sections-close';
  drawerClose.setAttribute('aria-label', 'Close menu');
  drawerClose.append(iconImg(base, 'close'));
  drawerClose.addEventListener('click', (e) => {
    e.stopPropagation();
    closeAll(nav, true);
    burger.focus();
  });
  sections.append(drawerClose);
  const sectionList = navSection && navSection.querySelector(':scope > ul');
  if (sectionList) {
    [...sectionList.children].forEach((item, i) => {
      if (item.querySelector(':scope > ul')) buildDrop(item, nav, base, i);
    });
    sections.append(sectionList);
  }

  const placeholder = toolsSection && toolsSection.querySelector(':scope > p');
  const search = buildSearch(placeholder ? placeholder.textContent.trim() : 'Search', base);

  const tools = toolsSection && toolsSection.querySelector(':scope > ul');
  if (tools) {
    mergeIconLinkLabels(tools);
    tools.className = 'nav-tools';
  }

  main.append(burger, brand, sections, search);
  if (tools) main.append(tools);

  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  overlay.addEventListener('click', () => closeAll(nav, true));

  nav.append(utility, main, overlay);

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) || e.target === overlay) closeAll(nav, true);
  });
  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    const open = nav.querySelector('.nav-drop-trigger[aria-expanded="true"]');
    closeAll(nav, true);
    if (open) open.focus();
  });
  // crossing the breakpoint resets menus so neither layout inherits the other's open state
  isDesktop.addEventListener('change', () => closeAll(nav, true));

  const wrapper = document.createElement('div');
  wrapper.className = 'nav-wrapper';
  wrapper.append(nav);
  block.replaceChildren(wrapper);
}
