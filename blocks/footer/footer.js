/**
 * Fetches the footer fragment: /content first (local preview), then the site root (DA/EDS).
 * @returns {Promise<{ html: string, base: string }|null>}
 */
async function fetchFooterFragment() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  return { html: await resp.text(), base: resp.url };
}

/**
 * Groups each heading with the list that follows it into a column.
 * @param {Element} section
 * @returns {HTMLElement}
 */
function buildColumns(section) {
  const columns = document.createElement('div');
  columns.className = 'footer-columns';
  let column;
  [...section.children].forEach((el) => {
    if (/^H[2-6]$/.test(el.tagName)) {
      column = document.createElement('div');
      column.className = 'footer-column';
      el.className = 'footer-column-title';
      column.append(el);
      columns.append(column);
    } else if (column) {
      column.append(el);
    }
  });
  return columns;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooterFragment();
  if (!fragment) return;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = fragment.html;
  wrapper.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), fragment.base).href;
    img.loading = 'lazy';
  });
  const [signupSection, linksSection, bottomSection] = [...wrapper.children].filter((el) => el.tagName === 'DIV');

  const footer = document.createElement('div');
  footer.className = 'footer-inner';

  if (signupSection) {
    const signup = document.createElement('div');
    signup.className = 'footer-signup';
    const row = document.createElement('div');
    row.className = 'footer-signup-row';
    const heading = signupSection.querySelector('h2, h3');
    const [cta, disclaimer] = [...signupSection.querySelectorAll(':scope > p')];
    const legal = signupSection.querySelector(':scope > ul');
    if (heading) {
      heading.className = 'footer-signup-title';
      row.append(heading);
    }
    if (cta) {
      cta.className = 'footer-signup-cta';
      const link = cta.querySelector('a');
      if (link) link.className = 'footer-signup-button';
      row.append(cta);
    }
    if (legal) {
      legal.className = 'footer-signup-legal';
      row.append(legal);
    }
    signup.append(row);
    if (disclaimer) {
      disclaimer.className = 'footer-disclaimer';
      signup.append(disclaimer);
    }
    footer.append(signup);
  }

  const links = document.createElement('div');
  links.className = 'footer-links';
  if (linksSection) links.append(buildColumns(linksSection));

  if (bottomSection) {
    const bottom = document.createElement('div');
    bottom.className = 'footer-bottom';
    const [logo, copyright] = [...bottomSection.querySelectorAll(':scope > p')];
    const [social, legal] = [...bottomSection.querySelectorAll(':scope > ul')];
    if (logo) logo.className = 'footer-logo';
    if (social) social.className = 'footer-social';
    if (legal) legal.className = 'footer-legal';
    if (copyright) copyright.className = 'footer-copyright';
    bottom.append(...[logo, social, legal, copyright].filter(Boolean));
    links.append(bottom);
  }
  footer.append(links);

  block.replaceChildren(footer);
}
