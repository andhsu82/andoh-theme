# andoh theme

The Shopify theme for andoh. It is built on Shopify's free [Dawn](https://github.com/Shopify/dawn) theme (MIT license, see `LICENSE.md`), with an andoh layer on top.

## What the andoh layer adds

- **Two switches in the header.** FLAT / BUILT shows every piece as flat parts or finished. TAIPEI / NEW YORK swaps the hand-drawn patterns and the live clock between the two cities. Each visitor's choice is remembered across pages.
- **Brand settings** under *Theme settings > andoh*: accent color, the Newsreader font on or off, and each switch on or off.
- **Homepage sections**: *andoh hero*, *andoh divider* (hand-drawn band), *andoh how it arrives*, *andoh lookbook image* (a photo with product tags), plus Dawn's featured collection and newsletter.
- **Product page block**: *How it arrives* shows box size, parts, assembly time and tools.
- **Product cards**: in FLAT mode the card shows the product's flat image and its parts and box size.
- **Lookbook page template** (`page.lookbook`): create a page called Lookbook and pick this template.

Line drawings of the revelo side table stand in wherever a photo or drawing has not been uploaded yet.

## Connect it to Shopify

1. In Shopify admin, go to **Online Store > Themes > Add theme > Connect from GitHub**.
2. Pick the `andhsu82/andoh-theme` repository and the `main` branch.
3. It arrives as an unpublished theme. Use **Preview** to look around, and **Customize** to fill in images and text.
4. Publish it only when you're happy. Changes pushed to `main` show up in the connected theme automatically, and edits you make in the theme editor are committed back here.

## Product metafields to create

Go to **Settings > Custom data > Products > Add definition** and create these, all with the namespace `andoh`:

| Name | Namespace and key | Type | Example |
| --- | --- | --- | --- |
| Flat image | `andoh.flat_image` | File (image) | Photo or drawing of the parts or the box |
| Material | `andoh.material` | Single line text | Ash, oiled |
| Parts | `andoh.parts` | Single line text | 3 |
| Box size | `andoh.box_size` | Single line text | 62 × 50 × 6 cm |
| Assembly time | `andoh.assembly_time` | Single line text | 2 min |
| Tools | `andoh.tools` | Single line text | None |
| Arrives note | `andoh.arrives_note` | Multi-line text | Slide B into C, then drop the top on. |

Then fill them in on each product. Anything left empty is simply not shown.
