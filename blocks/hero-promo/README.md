# hero-promo

Custom **hero** block. Purpose: promo-banner.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row, one cell of content.

## Supported variations

| Variation | Option class |
| --- | --- |
| Left aligned | `left` |
| Centered (turns off automatic alignment) | `center` |
| Light copy for dark imagery | `dark` |
| Dark copy for light imagery (ring border, `#f7f6f0` panel) | `light` |

If neither `left` nor `center` is authored, `hero-promo.js` samples a small
rendition of the image: when the centre is busy (QR code, product shot) but the
left band is plain, it adds `left`. If neither `dark` nor `light` is authored,
it then adds the class matching the image behind the copy area.

Layout: below 768px the copy stacks under the image; from 768px the banner is
4:1 with the copy overlaid (centered by default, start-aligned with `left`).

## Universal Editor fields

N/A (Document Authoring project)
