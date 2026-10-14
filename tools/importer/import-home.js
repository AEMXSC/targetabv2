/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroBannerParser from './parsers/hero-banner.js';
import tabsProductParser from './parsers/tabs-product.js';
import cardsDealsParser from './parsers/cards-deals.js';
import heroPromoParser from './parsers/hero-promo.js';
import cardsCircleParser from './parsers/cards-circle.js';
import cardsStoryParser from './parsers/cards-story.js';
import cardsPromoParser from './parsers/cards-promo.js';

// TRANSFORMER IMPORTS
import targetCleanupTransformer from './transformers/target-cleanup.js';
import targetSectionsTransformer from './transformers/target-sections.js';
import targetDmImagesTransformer from './transformers/target-dm-images.js';

// PARSER REGISTRY
const parsers = {
  'hero-banner': heroBannerParser,
  'tabs-product': tabsProductParser,
  'cards-deals': cardsDealsParser,
  'hero-promo': heroPromoParser,
  'cards-circle': cardsCircleParser,
  'cards-story': cardsStoryParser,
  'cards-promo': cardsPromoParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "home",
  "description": "Target homepage: promo banners, tabbed product carousels, deal and story card grids, category shortcuts",
  "urls": [
    "https://www.target.com/"
  ],
  "blocks": [
    {
      "name": "hero-banner",
      "instances": [
        "#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(1) [class*=\"storycardWrapper\"]"
      ]
    },
    {
      "name": "tabs-product",
      "instances": [
        "[class*=\"styles_CarouselContainer\"] > div:has([class*=\"styles_tabBar\"])"
      ]
    },
    {
      "name": "cards-deals",
      "instances": [
        "#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(5) [class*=\"contentPoolContainer\"]"
      ]
    },
    {
      "name": "hero-promo",
      "instances": [
        "#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(8) [class*=\"contentPoolContainer\"]",
        "#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(19) [class*=\"contentPoolContainer\"]"
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
        "#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(12) [class*=\"contentPoolContainer\"]"
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
        "#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(2) [class*=\"styles_HeadlineContainer\"]"
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
        "#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(4) [class*=\"storycardWrapper\"]"
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
        "#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(6) [class*=\"styles_HeadlineContainer\"]"
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
        "#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(10) [class*=\"styles_HeadlineContainer\"]"
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
        "#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(11) [class*=\"storycardWrapper\"]"
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
        "#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(14) [class*=\"bannerWrapper\"]"
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
        "#pageBodyContainer > div > div:nth-of-type(2) > div:nth-of-type(17) a[href*=\"shop-all-categories\"]"
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

// TRANSFORMER REGISTRY - order: cleanup, sections, DM/Scene7 images
const transformers = [
  targetCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [targetSectionsTransformer] : []),
  targetDmImagesTransformer,
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;

    // 1. Initial cleanup + section break markers
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks using the embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, html, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Final cleanup, section metadata, DM/Scene7 image anchors
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path — root URL maps to /index
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
