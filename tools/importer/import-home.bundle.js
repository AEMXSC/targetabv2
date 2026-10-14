/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/hero-banner.js
  function getImgSrc(img) {
    if (!img) return null;
    const first = (v) => v ? v.split(",")[0].trim().split(/\s+/)[0] : null;
    const source = img.closest("picture") ? img.closest("picture").querySelector("source[srcset]") : null;
    return img.getAttribute("src") || img.getAttribute("data-src") || first(img.getAttribute("srcset")) || first(img.getAttribute("data-srcset")) || (source ? first(source.getAttribute("srcset")) : null) || null;
  }
  function parse(element, { document: document2 }) {
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
    const link = element.querySelector('a[class*="storycardLink"]') || element.closest("a[href]") || element.querySelector("a[href]");
    const href = link ? link.getAttribute("href") : null;
    const img = element.querySelector('[class*="ndsPicture"] img, picture img, img');
    const headlineEl = element.querySelector('[class*="storycardHeadline"], h1, h2, h3');
    let eyebrow = "";
    let headline = "";
    if (headlineEl) {
      const wrapper = headlineEl.querySelector(":scope > span") || headlineEl;
      const lines = [...wrapper.children].filter((c) => c.tagName === "SPAN").map((c) => clean(c.textContent)).filter(Boolean);
      if (lines.length > 1) {
        eyebrow = lines.slice(0, -1).join(" ");
        headline = lines[lines.length - 1];
      } else {
        headline = clean(headlineEl.textContent);
      }
    }
    const detailEl = element.querySelector('[class*="storycardDetail"], [class*="resizeTextSubhead"]');
    const detail = detailEl ? clean(detailEl.textContent) : "";
    const ctaEl = element.querySelector('[class*="storycardButtonWrapper"] button, [class*="storycardButtonWrapper"] span, button');
    const ctaText = ctaEl ? clean(ctaEl.textContent) : "";
    if (!img && !headline && !detail) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    const src = getImgSrc(img);
    if (src) {
      const image = document2.createElement("img");
      image.src = src;
      image.alt = img.getAttribute("alt") || "";
      cells.push([image]);
    }
    const content = [];
    if (eyebrow) {
      const p = document2.createElement("p");
      p.textContent = eyebrow;
      content.push(p);
    }
    if (headline) {
      const h2 = document2.createElement("h2");
      h2.textContent = headline;
      content.push(h2);
    }
    if (detail) {
      const p = document2.createElement("p");
      p.textContent = detail;
      content.push(p);
    }
    if (href) {
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = href;
      a.textContent = ctaText || headline || href;
      p.append(a);
      content.push(p);
    }
    cells.push([content]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-product.js
  function parse2(element, { document: document2 }) {
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
    let buttons = [...element.querySelectorAll('[class*="tabList"] button, [class*="tabList"] [role="tab"]')];
    if (!buttons.length) buttons = [...element.querySelectorAll('button[class*="tabsButton"], [role="tab"]')];
    buttons = buttons.filter((b, i) => buttons.indexOf(b) === i && clean(b.textContent));
    if (!buttons.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const carousel = element.closest('[class*="CarouselContainer"]') || element.parentElement;
    const headlineLink = carousel ? carousel.querySelector('[class*="HeadlineContainer"] a[href], [class*="HeadlineLink"][href]') : null;
    const headlineHref = headlineLink ? headlineLink.getAttribute("href") : null;
    const cells = [];
    buttons.forEach((btn) => {
      const label = clean(btn.textContent);
      let href = null;
      const btnId = btn.getAttribute("id");
      const controls = btn.getAttribute("aria-controls");
      let panel = null;
      if (controls) panel = element.querySelector(`[id="${controls}"]`);
      if (!panel && btnId) panel = element.querySelector(`[id="tabContent-${btnId}"]`);
      if (panel) {
        const panelLink = panel.querySelector('a[href*="/c/"], a[href*="/pl/"], a[href*="/s?"]');
        if (panelLink) href = panelLink.getAttribute("href");
      }
      if (!href && headlineHref) href = headlineHref;
      if (!href) href = `/s?searchTerm=${encodeURIComponent(label)}`;
      const labelCell = document2.createElement("p");
      labelCell.textContent = label;
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = href;
      a.textContent = `Shop ${label}`;
      p.append(a);
      cells.push([labelCell, p]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-deals.js
  function getImgSrc2(img) {
    if (!img) return null;
    const first = (v) => v ? v.split(",")[0].trim().split(/\s+/)[0] : null;
    const source = img.closest("picture") ? img.closest("picture").querySelector("source[srcset]") : null;
    return img.getAttribute("src") || img.getAttribute("data-src") || first(img.getAttribute("srcset")) || first(img.getAttribute("data-srcset")) || (source ? first(source.getAttribute("srcset")) : null) || null;
  }
  function parse3(element, { document: document2 }) {
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
    let items = [...element.querySelectorAll('[class*="carouselComponentGrid"] > div')];
    if (!items.length) items = [...element.querySelectorAll('[class*="mobileLayout"]')];
    if (!items.length) {
      items = [...element.querySelectorAll("img")].map((img) => img.closest("div") || img);
    }
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector("img");
      const linkEl = item.querySelector("a[href]") || item.closest("a[href]");
      const href = linkEl ? linkEl.getAttribute("href") : null;
      const h = item.querySelector("h3, h2, h4");
      let eyebrow = "";
      let offer = "";
      if (h) {
        const eyebrowEl = h.querySelector('[class*="eyebrowLine"]');
        eyebrow = eyebrowEl ? clean(eyebrowEl.textContent) : "";
        const srOnly = h.querySelector('.h-sr-only, [class*="sr-only"]');
        let full = srOnly ? clean(srOnly.textContent) : "";
        if (!full) {
          full = clean([...h.querySelectorAll('[class*="eyebrowLine"], [class*="faceLine"]')].map((s) => s.textContent).join(" ")) || clean(h.textContent);
        }
        offer = eyebrow && full.toLowerCase().startsWith(eyebrow.toLowerCase()) ? clean(full.slice(eyebrow.length)) : full;
        if (!offer) {
          offer = full;
          eyebrow = "";
        }
      }
      const subEl = item.querySelector('p[class*="mobileSubheading"], p[class*="Subheading"]');
      const fineEl = item.querySelector('p[class*="FinePrint"]');
      const sub = subEl ? clean(subEl.textContent) : "";
      const fine = fineEl && fineEl !== subEl ? clean(fineEl.textContent) : "";
      if (!img && !offer && !sub) return;
      const imageCell = [];
      const src = getImgSrc2(img);
      if (src) {
        const image = document2.createElement("img");
        image.src = src;
        image.alt = img.getAttribute("alt") || "";
        imageCell.push(image);
      }
      const textCell = [];
      if (eyebrow) {
        const p = document2.createElement("p");
        p.textContent = eyebrow;
        textCell.push(p);
      }
      if (offer) {
        const h3 = document2.createElement("h3");
        if (href) {
          const a = document2.createElement("a");
          a.href = href;
          a.textContent = offer;
          h3.append(a);
        } else {
          h3.textContent = offer;
        }
        textCell.push(h3);
      }
      if (sub) {
        const p = document2.createElement("p");
        p.textContent = sub;
        textCell.push(p);
      }
      if (fine) {
        const p = document2.createElement("p");
        p.textContent = fine;
        textCell.push(p);
      }
      if (!offer && href) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = sub || href;
        p.append(a);
        textCell.push(p);
      }
      cells.push([imageCell.length ? imageCell : "", textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-deals", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-promo.js
  function getImgSrc3(img) {
    if (!img) return null;
    const first = (v) => v ? v.split(",")[0].trim().split(/\s+/)[0] : null;
    const source = img.closest("picture") ? img.closest("picture").querySelector("source[srcset]") : null;
    return img.getAttribute("src") || img.getAttribute("data-src") || first(img.getAttribute("srcset")) || first(img.getAttribute("data-srcset")) || (source ? first(source.getAttribute("srcset")) : null) || null;
  }
  function parse4(element, { document: document2 }) {
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
    const scope = element.querySelector('[class*="standardDesktopLayout"]') || element.querySelector('[class*="DesktopLayout"], [class*="Layout"]') || element;
    const img = scope.querySelector('img[class*="desktopImg"]') || scope.querySelector("img") || element.querySelector("img");
    const linkEl = scope.querySelector("a[href]") || element.querySelector("a[href]") || element.closest("a[href]");
    const href = linkEl ? linkEl.getAttribute("href") : null;
    const headingEl = scope.querySelector('h1, h2, h3, [class*="baseHeading"]');
    const heading = headingEl ? clean(headingEl.textContent) : "";
    const subEls = [...scope.querySelectorAll('p[class*="Subheading"], p[class*="subheading"]')];
    const subs = (subEls.length ? subEls : [...scope.querySelectorAll('[class*="mainCopyBlock"] p, [class*="baseCopy"] p')]).map((p) => clean(p.textContent)).filter(Boolean).filter((t, i, arr) => arr.indexOf(t) === i);
    if (!img && !heading && !subs.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    const src = getImgSrc3(img);
    if (src) {
      const image = document2.createElement("img");
      image.src = src;
      image.alt = img.getAttribute("alt") || "";
      cells.push([image]);
    }
    const content = [];
    if (heading) {
      const h2 = document2.createElement("h2");
      if (href) {
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = heading;
        h2.append(a);
      } else {
        h2.textContent = heading;
      }
      content.push(h2);
    }
    subs.forEach((t) => {
      const p = document2.createElement("p");
      p.textContent = t;
      content.push(p);
    });
    if (!heading && href) {
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = href;
      a.textContent = subs[0] || href;
      p.append(a);
      content.push(p);
    }
    cells.push([content]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-circle.js
  function getImgSrc4(img) {
    if (!img) return null;
    const first = (v) => v ? v.split(",")[0].trim().split(/\s+/)[0] : null;
    const source = img.closest("picture") ? img.closest("picture").querySelector("source[srcset]") : null;
    return img.getAttribute("src") || img.getAttribute("data-src") || first(img.getAttribute("srcset")) || first(img.getAttribute("data-srcset")) || (source ? first(source.getAttribute("srcset")) : null) || null;
  }
  var stripQuery = (u) => (u || "").split(/[?#]/)[0];
  function getNextDataImages(document2, html) {
    const map = /* @__PURE__ */ new Map();
    const liveDoc = typeof window !== "undefined" ? window.document : null;
    const script = [document2, liveDoc].filter(Boolean).map((d) => d.querySelector("script#__NEXT_DATA__")).find(Boolean);
    const text = script ? script.textContent : html || "";
    const re = /"(?:link_url|canonical_url)"\s*:\s*"([^"]+)"[^{}]*?"image_path"\s*:\s*"([^"]+)"/g;
    let m = re.exec(text);
    while (m) {
      if (!map.has(stripQuery(m[1]))) map.set(stripQuery(m[1]), m[2]);
      m = re.exec(text);
    }
    return map;
  }
  function parse5(element, { document: document2, html }) {
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
    let nextDataImages = null;
    let items = [...element.querySelectorAll(":scope > li")];
    if (!items.length) items = [...element.querySelectorAll('li[class*="listItem"], li')];
    if (!items.length) items = [...element.querySelectorAll('[class*="itemPictureWrapper"]')];
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector("img");
      const linkEl = item.querySelector("a[href]") || item.closest("a[href]");
      const href = linkEl ? linkEl.getAttribute("href") : null;
      const titleEl = item.querySelector('[class*="itemTitleWrapper"], [class*="Title"]');
      const label = clean(titleEl ? titleEl.textContent : linkEl ? linkEl.textContent : item.textContent);
      if (!img && !label) return;
      const imageCell = [];
      let src = getImgSrc4(img);
      if (!src && href) {
        if (!nextDataImages) nextDataImages = getNextDataImages(document2, html);
        const path = nextDataImages.get(stripQuery(href));
        if (path) src = `${path}?wid=315&hei=315&qlt=60&fmt=webp`;
      }
      if (src) {
        const image = document2.createElement("img");
        image.src = src;
        image.alt = img && img.getAttribute("alt") || label;
        imageCell.push(image);
      }
      const textCell = [];
      if (label) {
        const p = document2.createElement("p");
        if (href) {
          const a = document2.createElement("a");
          a.href = href;
          a.textContent = label;
          p.append(a);
        } else {
          p.textContent = label;
        }
        textCell.push(p);
      }
      cells.push([imageCell.length ? imageCell : "", textCell.length ? textCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-circle", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-story.js
  function getImgSrc5(img) {
    if (!img) return null;
    const first = (v) => v ? v.split(",")[0].trim().split(/\s+/)[0] : null;
    const source = img.closest("picture") ? img.closest("picture").querySelector("source[srcset]") : null;
    return img.getAttribute("src") || img.getAttribute("data-src") || first(img.getAttribute("srcset")) || first(img.getAttribute("data-srcset")) || (source ? first(source.getAttribute("srcset")) : null) || null;
  }
  function headingText(h) {
    const clone = h.cloneNode(true);
    clone.querySelectorAll('.h-sr-only, [class*="sr-only"]').forEach((sr) => {
      const next = sr.nextElementSibling;
      if (next && !/[a-z0-9]/i.test(next.textContent)) next.remove();
    });
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function parse6(element, { document: document2 }) {
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
    let items = [...element.querySelectorAll('[class*="carouselComponentGrid"] > div')];
    if (!items.length) items = [...element.querySelectorAll('[class*="multistoryLayout"], [class*="mobileLayout"]')];
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector("img");
      const linkEl = item.querySelector("a[href]") || item.closest("a[href]");
      const href = linkEl ? linkEl.getAttribute("href") : null;
      const badgeEl = item.querySelector('[class*="ribbon"]');
      const badge = badgeEl ? clean(badgeEl.textContent) : "";
      const h = item.querySelector("h3, h2, h4");
      const title = h ? headingText(h) : "";
      const descEl = item.querySelector('p[class*="Subheading"], p[class*="subheading"]') || [...item.querySelectorAll("p")].find((p) => clean(p.textContent));
      const desc = descEl ? clean(descEl.textContent) : "";
      if (!img && !title && !desc) return;
      const imageCell = [];
      const src = getImgSrc5(img);
      if (src) {
        const image = document2.createElement("img");
        image.src = src;
        image.alt = img.getAttribute("alt") || "";
        imageCell.push(image);
      }
      const textCell = [];
      if (badge) {
        const p = document2.createElement("p");
        p.textContent = badge;
        textCell.push(p);
      }
      if (title) {
        const h3 = document2.createElement("h3");
        if (href) {
          const a = document2.createElement("a");
          a.href = href;
          a.textContent = title;
          h3.append(a);
        } else {
          h3.textContent = title;
        }
        textCell.push(h3);
      }
      if (desc) {
        const p = document2.createElement("p");
        p.textContent = desc;
        textCell.push(p);
      }
      cells.push([imageCell.length ? imageCell : "", textCell.length ? textCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-story", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-promo.js
  function getImgSrc6(img) {
    if (!img) return null;
    const first = (v) => v ? v.split(",")[0].trim().split(/\s+/)[0] : null;
    const source = img.closest("picture") ? img.closest("picture").querySelector("source[srcset]") : null;
    return img.getAttribute("src") || img.getAttribute("data-src") || first(img.getAttribute("srcset")) || first(img.getAttribute("data-srcset")) || (source ? first(source.getAttribute("srcset")) : null) || null;
  }
  function parse7(element, { document: document2 }) {
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
    let items = [...element.querySelectorAll('[class*="multistoryGrid"] > div')];
    if (!items.length) items = [...element.querySelectorAll('[class*="carouselComponentGrid"] > div')];
    if (!items.length) items = [...element.querySelectorAll('[class*="mobileLayout"], [class*="multistoryLayout"]')];
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector("img");
      const linkEl = item.querySelector("a[href]") || item.closest("a[href]");
      const href = linkEl ? linkEl.getAttribute("href") : null;
      const h = item.querySelector("h3, h2, h4");
      const title = h ? clean(h.textContent) : "";
      const paras = [...item.querySelectorAll("p")].map((p) => clean(p.textContent)).filter(Boolean);
      if (!img && !title && !paras.length) return;
      const imageCell = [];
      const src = getImgSrc6(img);
      if (src) {
        const image = document2.createElement("img");
        image.src = src;
        image.alt = img.getAttribute("alt") || "";
        imageCell.push(image);
      }
      const textCell = [];
      if (title) {
        const h3 = document2.createElement("h3");
        if (href) {
          const a = document2.createElement("a");
          a.href = href;
          a.textContent = title;
          h3.append(a);
        } else {
          h3.textContent = title;
        }
        textCell.push(h3);
      }
      paras.forEach((t) => {
        const p = document2.createElement("p");
        p.textContent = t;
        textCell.push(p);
      });
      cells.push([imageCell.length ? imageCell : "", textCell.length ? textCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/target-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var PAGE_BODY = "#pageBodyContainer > div > div:nth-of-type(2)";
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        '[class*="styles_overlay__"]',
        ".ModalDrawer",
        ".HeaderModalDropdown",
        "#px-captcha-modal",
        'iframe[src*="recaptcha"]',
        "#google_ads_top_frame"
      ]);
      WebImporter.DOMUtils.remove(element, ['iframe[id^="google_ads_iframe"]']);
      const { body } = element.ownerDocument;
      if (body && body.style && body.style.overflow === "hidden") {
        body.style.overflow = "scroll";
      }
    }
    if (hookName === TransformHook.afterTransform) {
      ["#sskinny", "#clpu", "#mega"].forEach((id) => {
        const slot = element.querySelector(id);
        if (!slot) return;
        const wrapper = slot.closest(`${PAGE_BODY} > div`);
        (wrapper || slot).remove();
      });
      WebImporter.DOMUtils.remove(element, [
        '[class*="styles_styledRoundelAdContainer"]',
        '[class*="styles_pubAdWrapper"]',
        '[class*="styles_sponsoredLabel"]'
      ]);
      const pageBody = element.querySelector(PAGE_BODY);
      if (pageBody) {
        [...pageBody.children].forEach((child) => {
          if (child.tagName !== "DIV") return;
          if (child.textContent.trim() !== "") return;
          if (child.querySelector("img, picture, table, a, video, iframe")) return;
          child.remove();
        });
      }
      WebImporter.DOMUtils.remove(element, ["#pageBodyContainer > div > div.h-sr-only"]);
      WebImporter.DOMUtils.remove(element, [
        "#skipLinks",
        "#staticShellLink",
        '[class*="styles_utilityHeaderWrapper"]',
        '[class*="styles_primaryHeaderWrapper"]',
        '[class*="styles_container__"]:has([class*="styles_signupHeading"])',
        "footer",
        "#__next-route-announcer__",
        "next-route-announcer"
      ]);
      const consentBtn = element.querySelector("#VA_HEALTH_CONSENT_BUTTON");
      if (consentBtn) {
        const modal = consentBtn.closest('[class*="styles_ndsModal"]');
        if (modal) modal.remove();
      }
      WebImporter.DOMUtils.remove(element, ["iframe", "link", "noscript"]);
    }
  }

  // tools/importer/transformers/target-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    const doc = element.ownerDocument || document;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = doc.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/transformers/target-dm-images.js
  function detectDynamicMediaUrl(urlStr) {
    if (typeof urlStr !== "string") return false;
    if (!/^(https?:\/\/|\/\/)/i.test(urlStr)) return false;
    let u;
    try {
      u = new URL(urlStr, "https://x/");
    } catch (e) {
      return false;
    }
    if (u.pathname.startsWith("/is/image/")) {
      return "scene7";
    }
    if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname) && u.pathname.startsWith("/adobe/assets/urn:")) {
      return "dm-openapi";
    }
    return false;
  }
  var LINKED_DM_INLINE_WRAPPER_TAGS = /* @__PURE__ */ new Set(["PICTURE"]);
  var LINKED_DM_WRAPPER_SIBLING_TAGS = /* @__PURE__ */ new Set(["SOURCE"]);
  function findLinkedDmCarrier(img) {
    if (!img || !img.parentElement) return null;
    let node = img;
    let parent = img.parentElement;
    while (parent && LINKED_DM_INLINE_WRAPPER_TAGS.has(parent.tagName)) {
      let foundNode = false;
      for (const child of parent.children) {
        if (child === node) {
          foundNode = true;
        } else if (!LINKED_DM_WRAPPER_SIBLING_TAGS.has(child.tagName)) {
          return null;
        }
      }
      if (!foundNode) return null;
      node = parent;
      parent = parent.parentElement;
    }
    if (!parent || parent.tagName !== "A") return null;
    if (parent.children.length !== 1 || parent.children[0] !== node) return null;
    if (parent.textContent.trim() !== "") return null;
    return parent;
  }
  var EMPTY_ALT_SENTINEL = "Image without alt text";
  function altToLinkText(alt) {
    return alt || EMPTY_ALT_SENTINEL;
  }
  function transform3(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const doc = element.ownerDocument;
    element.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (!detectDynamicMediaUrl(src)) return;
      const alt = img.getAttribute("alt") || "";
      const linkedAnchor = findLinkedDmCarrier(img);
      if (linkedAnchor) {
        linkedAnchor.setAttribute("title", src);
        linkedAnchor.textContent = altToLinkText(alt);
        return;
      }
      const parent = img.parentElement;
      if (parent && parent.tagName === "A") {
        console.warn("DM image inside mixed-content anchor, skipped:", src);
        return;
      }
      const a = doc.createElement("a");
      a.href = src;
      a.textContent = altToLinkText(alt);
      img.replaceWith(a);
    });
  }

  // tools/importer/import-home.js
  var parsers = {
    "hero-banner": parse,
    "tabs-product": parse2,
    "cards-deals": parse3,
    "hero-promo": parse4,
    "cards-circle": parse5,
    "cards-story": parse6,
    "cards-promo": parse7
  };
  var PAGE_TEMPLATE = {
    "name": "home",
    "description": "Target homepage: promo banners, tabbed product carousels, deal and story card grids, category shortcuts",
    "urls": [
      "https://www.target.com/"
    ],
    "blocks": [
      {
        "name": "hero-banner",
        "instances": [
          '#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(1) [class*="storycardWrapper"]'
        ]
      },
      {
        "name": "tabs-product",
        "instances": [
          '[class*="styles_CarouselContainer"] > div:has([class*="styles_tabBar"])'
        ]
      },
      {
        "name": "cards-deals",
        "instances": [
          '#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(5) [class*="contentPoolContainer"]'
        ]
      },
      {
        "name": "hero-promo",
        "instances": [
          '#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(8) [class*="contentPoolContainer"]',
          '#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(19) [class*="contentPoolContainer"]'
        ]
      },
      {
        "name": "cards-circle",
        "instances": [
          "#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(9) ul",
          "#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(17) ul"
        ]
      },
      {
        "name": "cards-story",
        "instances": [
          '#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(12) [class*="contentPoolContainer"]'
        ]
      },
      {
        "name": "cards-promo",
        "instances": [
          "#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(15) > div"
        ]
      }
    ],
    "sections": [
      {
        "id": "1",
        "name": "Top promotional banner",
        "selector": [
          "#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(1)"
        ],
        "style": null,
        "blocks": [
          "hero-banner"
        ],
        "defaultContent": []
      },
      {
        "id": "2",
        "name": "Toy deals tabs",
        "selector": [
          "#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(2)"
        ],
        "style": "cream",
        "blocks": [
          "tabs-product"
        ],
        "defaultContent": [
          '#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(2) [class*="styles_HeadlineContainer"]'
        ]
      },
      {
        "id": "3",
        "name": "Weekly deals grid",
        "selector": [
          "#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(4)"
        ],
        "style": "beige",
        "blocks": [
          "cards-deals"
        ],
        "defaultContent": [
          '#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(4) [class*="storycardWrapper"]'
        ]
      },
      {
        "id": "4",
        "name": "BOGO deals tabs",
        "selector": [
          "#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(6)"
        ],
        "style": "beige",
        "blocks": [
          "tabs-product"
        ],
        "defaultContent": [
          '#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(6) [class*="styles_HeadlineContainer"]'
        ]
      },
      {
        "id": "5",
        "name": "Halloween banner and shortcuts",
        "selector": [
          "#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(8)"
        ],
        "style": null,
        "blocks": [
          "hero-promo",
          "cards-circle"
        ],
        "defaultContent": []
      },
      {
        "id": "6",
        "name": "Halloween tabs",
        "selector": [
          "#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(10)"
        ],
        "style": "dark",
        "blocks": [
          "tabs-product"
        ],
        "defaultContent": [
          '#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(10) [class*="styles_HeadlineContainer"]'
        ]
      },
      {
        "id": "7",
        "name": "What is new for fall stories",
        "selector": [
          "#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(11)"
        ],
        "style": "beige",
        "blocks": [
          "cards-story"
        ],
        "defaultContent": [
          '#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(11) [class*="storycardWrapper"]'
        ]
      },
      {
        "id": "8",
        "name": "Seasonal celebrations",
        "selector": [
          "#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(14)"
        ],
        "style": null,
        "blocks": [
          "cards-promo"
        ],
        "defaultContent": [
          '#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(14) [class*="bannerWrapper"]'
        ]
      },
      {
        "id": "9",
        "name": "Seasonal collections tabs",
        "selector": [
          "#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(16)"
        ],
        "style": "cream",
        "blocks": [
          "tabs-product"
        ],
        "defaultContent": []
      },
      {
        "id": "10",
        "name": "Featured categories",
        "selector": [
          "#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(17)"
        ],
        "style": null,
        "blocks": [
          "cards-circle"
        ],
        "defaultContent": [
          "#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(17) h2",
          '#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(17) a[href*="shop-all-categories"]'
        ]
      },
      {
        "id": "11",
        "name": "SMS signup promo",
        "selector": [
          "#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(19)"
        ],
        "style": null,
        "blocks": [
          "hero-promo"
        ],
        "defaultContent": []
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : [],
    transform3
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_home_default = {
    transform: (payload) => {
      const { document: document2, url, html, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, html, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_home_exports);
})();
