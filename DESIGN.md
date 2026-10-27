---
name: Sirli mahsulotlar
description: Enamel cookware storefront and Telegram Mini App in a familiar marketplace layout. Red is the only action color, on warm cream and white.
colors:
  brand: "#c8172b"
  brand-hover: "#b3121f"
  brand-press: "#970f1a"
  brand-soft: "#fcecec"
  page: "#f7f4ef"
  surface: "#ffffff"
  cream: "#f3e9d8"
  cream-soft: "#faf5ec"
  ink: "#1f1b18"
  ink-2: "#5e564f"
  ink-3: "#746b64"
  line: "#ebe5dd"
  line-strong: "#d8cfc4"
  success: "#15803d"
  success-soft: "#e8f5ec"
  warning: "#b45309"
  warning-soft: "#fef3e2"
  info: "#1a56c4"
  info-soft: "#e8f0fe"
  transit: "#6b35c2"
  transit-soft: "#f1e9fd"
typography:
  wordmark:
    fontFamily: "Golos Text, ui-sans-serif, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Golos Text, ui-sans-serif, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.33
    letterSpacing: "-0.02em"
  headline-desktop:
    fontFamily: "Golos Text, ui-sans-serif, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  section-title:
    fontFamily: "Golos Text, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Golos Text, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.55
    letterSpacing: "-0.01em"
  price:
    fontFamily: "Golos Text, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.25
    fontFeature: "tnum"
  price-large:
    fontFamily: "Golos Text, ui-sans-serif, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "tnum"
  button:
    fontFamily: "Golos Text, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.33
  body:
    fontFamily: "Golos Text, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.43
  card-name:
    fontFamily: "Golos Text, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.375
  label:
    fontFamily: "Golos Text, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.33
  tab-label:
    fontFamily: "Golos Text, ui-sans-serif, system-ui, sans-serif"
    fontSize: "10.5px"
    fontWeight: 500
    lineHeight: 1.2
rounded:
  tag: "6px"
  field: "10px"
  card: "12px"
  sheet: "16px"
  pill: "9999px"
spacing:
  gutter: "16px"
  gutter-desktop: "24px"
  grid-gap: "12px"
  grid-gap-desktop: "16px"
  grid-row-gap: "24px"
  panel-padding: "20px"
  section: "32px"
  section-desktop: "48px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
    typography: "{typography.button}"
    rounded: "{rounded.field}"
    padding: "0 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.brand-hover}"
  button-primary-press:
    backgroundColor: "{colors.brand-press}"
  button-card-add:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
    rounded: "{rounded.field}"
    height: "36px"
  button-purchase:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
    typography: "{typography.button}"
    rounded: "{rounded.field}"
    height: "48px"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "0 12px"
  button-sold-out:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-3}"
    rounded: "{rounded.field}"
    height: "36px"
  quantity-stepper:
    backgroundColor: "{colors.brand-soft}"
    textColor: "{colors.brand}"
    rounded: "{rounded.field}"
    height: "36px"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "0 14px"
    height: "44px"
  card-product-media:
    backgroundColor: "{colors.cream}"
    rounded: "{rounded.card}"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "{spacing.panel-padding}"
  chip-category:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  chip-discounts:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.brand}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  badge-discount:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
    rounded: "{rounded.tag}"
    padding: "2px 6px"
  cart-badge:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    height: "18px"
  status-new:
    backgroundColor: "{colors.info-soft}"
    textColor: "{colors.info}"
    rounded: "{rounded.tag}"
    padding: "2px 8px"
  status-preparing:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.warning}"
    rounded: "{rounded.tag}"
    padding: "2px 8px"
  status-delivering:
    backgroundColor: "{colors.transit-soft}"
    textColor: "{colors.transit}"
    rounded: "{rounded.tag}"
    padding: "2px 8px"
  status-completed:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success}"
    rounded: "{rounded.tag}"
    padding: "2px 8px"
  status-cancelled:
    backgroundColor: "{colors.page}"
    textColor: "{colors.ink-3}"
    rounded: "{rounded.tag}"
    padding: "2px 8px"
  bottom-nav-item:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-3}"
    typography: "{typography.tab-label}"
    height: "56px"
  bottom-nav-item-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.brand}"
---

# Design System: Sirli mahsulotlar

## Overview

**Creative North Star: "The Everyday Marketplace"**

Sirli looks like the shopping app the buyer already uses every day, built to the craft level of Uzum Market. Search sits at the top, categories come first, then a dense product grid with clear prices, and every card lets you add to the cart in one tap. The owner chose this familiar layout after seeing three directions. It is meant to stand out through precision and speed, not decoration. There is no themed costume and no boutique hero banner. White product surfaces sit on a light, warm grey-cream page. Brand red is the only color that asks for action, and near-black brown ink carries everything else.

The layout is phone-first and dense. One UI serves both the website and the Telegram Mini App. On phones, a sticky search bar and a five-tab bottom navigation frame the page. On desktop, the header gains a red Catalog button, wide search, Orders and Cart links, and a row of category chips below. The product grid grows from 2 columns to 5. Motion is short and uses ease-out, and it only animates transform, opacity and color. The signature moment is the card's "Savatga" button, which turns into a − n + stepper in the same spot.

The product art in the build is placeholder demo SVG illustration on tinted backgrounds. Treat it as a stand-in for real photography, not as a style to extend.

**Key Characteristics:**
- One action color (brand red) on warm neutrals (cream, off-white page, white surfaces)
- Golos Text throughout, weights 400–700 (800 only for the wordmark), tabular figures on every number
- Two radii carry the system: 12px for cards and media, 10px for fields and buttons. Chips are fully round.
- Flat at rest. Shadows appear only on fixed bars and floating popovers.
- Lucide line icons at 1.75 stroke (2 when active or inside buttons)
- Bilingual Uzbek/Russian, so every label must survive a longer Russian string

## Colors

Warm and restrained. Cream and paper neutrals with a single saturated red that means "do this" or "this is a deal".

### Primary
- **Sirli Red** (brand): primary buttons, the card "Savatga" button, the desktop Catalog button, discount prices, the −% discount tag, cart count badge, active bottom-nav tab, focus ring, text selection, caret, the wordmark, and service-strip icons. Hover darkens to **Deep Red** (brand-hover) and press to **Oxblood Press** (brand-press).
- **Red Blush** (brand-soft): the quantity stepper background, hover on the Discounts chip, and the sold-out tint in admin.

### Neutral
- **Warm Paper** (page): the page background behind all surfaces. Also used as the hover fill for ghost header links and as the round icon-button fill (language toggle, sheet close).
- **Surface White** (surface): product panels, header, bottom nav, sticky bars, form panels, order summary.
- **Enamel Cream** (cream): the backdrop behind product and category imagery, so images sit on a warm field instead of white.
- **Soft Cream** (cream-soft): quiet informational notes, such as the checkout info callout.
- **Ink** (ink): headings, prices without a discount, primary text.
- **Ink Muted** (ink-2): product names on cards, secondary copy, summary labels.
- **Ink Faint** (ink-3): placeholders, old struck-through prices, inactive tab labels, metadata.
- **Hairline** (line): header and bottom-nav borders, dividers, admin card rings.
- **Hairline Strong** (line-strong): input and outline-button strokes, scrollbar thumb.

### Status (order tones only)
- **Info Blue / Amber / Transit Violet / Success Green**, each with a soft partner. They mark order status: new, preparing, delivering, completed. Cancelled uses page + ink-3. These are state labels, never actions or decoration.

### Named Rules
**The One Red Rule.** Red is the only action and brand color. If something is red, it is either tappable or a price or discount. No second accent color is allowed for buttons, links or highlights.

**The Red Means Deal Rule.** A price turns red only when it is discounted, and then the old price appears beside it in ink-3 with a strikethrough. A regular price stays ink.

**The Cream Backdrop Rule.** Product and category imagery always sits on cream inside a 12px clip. It never sits directly on white or on the page color.

## Typography

**Display Font:** Golos Text (with ui-sans-serif, system-ui, sans-serif), loaded via next/font with latin, latin-ext and cyrillic subsets
**Body Font:** Golos Text
**Label/Mono Font:** none distinct. Numbers use `tabular-nums`.

**Character:** One grotesque made for Cyrillic and Latin. It is friendly and plain like a marketplace, and it holds Uzbek apostrophes and Russian strings equally well. Hierarchy comes from weight and size, never from a second family.

### Hierarchy
- **Wordmark** (800, 22px, -0.03em): the lowercase "sirli" next to the pot mark. This is the only 800 in the storefront.
- **Headline** (700, 24px on phones, 30px from md, -0.02em): page titles (catalog, cart, checkout, orders, admin PageHeader).
- **Section title** (700, 20px, 24px from md, -0.02em): home rows such as Chegirmalar or Ommabop, with a quiet "Barchasi ›" link on the right.
- **Title** (700, 18px, -0.01em): panel headings (order summary, checkout recipient, filter sheet).
- **Price** (700, 17px, tabular): card price. Large variant (700, 28px) on the product page, and 22px for the order total.
- **Button** (600, 15px; 14px on small card buttons).
- **Body** (400, 14px): the default UI text size and the most used.
- **Card name** (400, 13px, leading-snug, ink-2, two-line clamp): product names under prices.
- **Label** (500–600, 12px): category counts, metadata, discount tags, status pills.
- **Tab label** (500, 10.5px): bottom-nav captions.

### Named Rules
**The Price First Rule.** On a product card, the price comes before the name and is heavier and larger than it. The name is muted at 13px.

**The Tabular Rule.** Every price, count, quantity, order number and date uses tabular figures.

## Layout

The container is centered at max 1280px, with 16px gutters on phones and 24px from lg. Breakpoints are Tailwind defaults (sm 640, md 768, lg 1024, xl 1280). Home sections stack with 32px gaps, or 48px from md.

- **Phone (390 reference):** the logo row scrolls away, and the search header (56px) stays sticky. The 5-tab bottom nav (56px plus safe area) is fixed, and content gets matching bottom padding. Category tiles (84px wide) and "rail" product rows scroll sideways with snap and hidden scrollbars, bleeding to the screen edge. Product grids use 2 columns with 12px column gap and 24px row gap.
- **Desktop (md+):** the header is 72px with logo, red Catalog button, wide search, language segmented control, Orders and Cart. A 40px chip row of categories follows. Category tiles become a 6-column grid. Product grids use 3, 4 and 5 columns with 16px gaps, or 3/4 next to the catalog filter sidebar. Rails become a single complete grid row, and items that overflow are hidden.
- **Purchase flows:** cart and checkout use a main column plus a 380px summary column from lg. The summary column is sticky. Below lg, a sticky bottom bar sits above the tab bar with the total and the primary action.

**The Thumb Zone Rule.** On phones, the primary purchase action lives either on the card or in the sticky bar just above the bottom nav. It is never only at the top of the page.

## Elevation & Depth

The system is flat and uses tonal layers. Depth comes from white surfaces on the warm page, hairline borders and cream image fields. Cards, tiles and panels have no shadow at rest. Shadows exist only for things that float over content.

### Shadow Vocabulary
- **Bar** (`box-shadow: 0 -6px 20px -12px rgb(31 27 24 / 0.28)`): sticky bottom action bars (cart, checkout, product purchase), which cast an upward shadow.
- **Pop** (`box-shadow: 0 12px 32px -12px rgb(31 27 24 / 0.32)`): toasts and other floating popovers.

### Named Rules
**The Flat Card Rule.** Product cards and panels never carry a shadow. Separation comes from surface vs page color, and in admin from a 1px line ring.

## Shapes

Shapes are softly rounded without getting bubbly. **Card radius (12px)** clips product images, category tiles, panels, the promo banner and service strips. **Field radius (10px)** is used for every button, input and the quantity stepper, so controls read as one family that is slightly tighter than the containers that hold them. **Full round** is for chips, the cart badge, the language control and round icon buttons. **6px tags** are for discount and status labels. The filter sheet rises from the bottom with a 16px top radius. Product imagery is 4:5 portrait and category imagery is square.

## Components

### Buttons
Solid, confident and easy to tap.
- **Shape:** field radius (10px).
- **Primary:** brand red with white 600-weight text. Heights are 44px (header Catalog, admin), 48px (checkout submit, product purchase) and 36px (card). Lucide icon left at 2 stroke.
- **Hover / Press:** brand-hover, then brand-press. The card button also scales to 0.98 on press. Color transitions take about 200ms with ease-out. Focus shows a 2px red outline with 2px offset.
- **Outline:** surface background with a 1px line-strong stroke and ink text. Hover darkens the stroke to ink-3. Used for secondary actions like "share phone from Telegram".
- **Ghost:** ink text with no fill and a page-color hover fill. Used for header Orders/Cart links and "Barchasi ›" links (which hover to red).
- **Sold out / disabled:** line-strong stroke, ink-3 text, no fill, not-allowed cursor.

### Quantity Stepper (signature)
The card's "Savatga" button and the stepper are stacked in the same box. On first add, the button fades and scales to 0.95, and the brand-soft stepper fades and scales in from 0.95. The transition takes 200ms with ease-out. The stepper has square − and + hit areas (36px, or 48px in the large variant), red 2.5-stroke icons, a hover tint of red at 10%, and a bold tabular ink count in the middle that announces changes through aria-live. Its height and position never change, so the card never jumps. At the same time, the cart badge plays a short "bump" (scale to 1.28 over 320ms).

### Chips
- **Style:** fully round, 6×12px padding, 14px text. Category chips are ink-2 and hover to ink on a page-color fill. The Discounts chip is always first and is red at 600 weight, with a brand-soft hover fill.

### Cards / Containers
- **Product card:** has no container box. It is a 4:5 cream image clipped at 12px, with a −% red tag at top left when discounted. Below that come the price, a two-line name, and the full-width add control pinned to the bottom. On hover, the image scales to 1.03 over 500ms. Sold-out images drop to 55% opacity.
- **Panels:** white surface, 12px radius, 16–24px padding, no border on the storefront and a 1px line ring in admin.
- **Category tile:** square cream image at 12px radius with the name below. From sm, the product count also appears.

### Inputs / Fields
- **Style:** white fill, 1px line-strong stroke, 10px radius, 44px tall (40px compact), 15px text, ink-3 placeholder, red caret. Form controls are set to 16px so iOS does not zoom.
- **Focus:** the border turns red and a 3px red ring appears at 15% opacity.
- **Error:** the message sits below in red at 13px/500. Labels sit above at 14px, weight 500 (600 in admin).

### Navigation
- **Bottom nav (phones, owner-pinned):** five equal tabs: Home, Catalog, Discounts, Cart, Orders. Each has a 24px Lucide icon over a 10.5px label. Inactive tabs are ink-3 with a 1.75 stroke. The active tab is red with a 2 stroke. It sits on a white bar with a hairline top border and safe-area padding. The cart badge sits on the cart icon.
- **Header:** white with a hairline bottom border, sticky. Active Orders/Cart links turn red.

### Status Pills
6px radius, 12px/600, soft background with matching strong text from the status tones. Used in My Orders.

### 360° Spin Viewer
Frames cut from a turntable video in the admin (36 frames, one every 10°). A canvas swaps between the frames. When a product has frames, the product gallery opens on the spin view, which turns slowly by itself (one turn in about 9s, paused while offscreen and under reduced motion). A horizontal drag rotates the product, with a short inertia, while a vertical swipe still scrolls the page (`touch-action: pan-y`). On phones, a "360° | Rasmlar" pill switch sits top-right. On desktop, a "360°" tile leads the thumbnail column. Until the first drag, an ink pill hint "Aylantirish uchun suring" shows at the bottom.

### Popular Showcase ("Eng ommabop")
The owner asked for this creative block, modelled on agrumeafarm.it. It sits directly under the category tiles, so categories stay the first screen.

- **Look:** a cream panel (full-bleed on phones, 12px card from md up). A red brand dome rises from the bottom, and a cream circular text ring sits on the dome.
- **Scroll behaviour:** the panel sticks under the header (`top-14`, `md:top-28`) while a scroll runway passes, about 15rem of runway per product (19rem on desktop). The vertical scroll position drives the products along an arc. The centre product is large and floats gently (5.5s). Neighbours spread out, dip, tilt ±16° per step, scale down and are dimmed with brightness, never with opacity, because opacity turns them pink on the red. Every product keeps spinning on its own axis (each slightly out of phase) and turns about 150° more per step of travel. Items that are offscreen pause. The ring turns with scroll, on top of its slow idle rotation.
- **What qualifies:** in-stock products with transparent (`spinCutout`) frames. Featured products come first, newest first. The demo products' 36 frames are generated from their SVG illustrations: the decal layer is turned around a cylinder while the silhouette, lid and handles stay fixed. A single transparent frame still works as a static cut-out.
- **Info and controls:** the name, price and an inverse cream "Savatga" stepper sit on the red. The dots and the desktop arrows scroll the page to the matching product. A "Pastga suring" hint fades out after the first scroll. With one product there is no runway, and the block is hidden when no product qualifies.

## Do's and Don'ts

### Do:
- **Do** keep brand red as the single action and brand color. Hover is brand-hover and press is brand-press.
- **Do** put product imagery on cream inside a 12px clip, at 4:5 for products and 1:1 for categories.
- **Do** lead product cards with the price (700, 17px, tabular). Use red plus a struck ink-3 old price only when discounted.
- **Do** use the 10px field radius for every button and input, and 12px for every card or panel.
- **Do** keep motion short and ease-out (`cubic-bezier(0.22, 1, 0.36, 1)`), animating only transform, opacity and color, and respect reduced motion.
- **Do** use Lucide line icons at 1.75 stroke, or 2 for active states and inside buttons.
- **Do** test every label in Russian as well as Uzbek.

### Don't:
- **Don't** introduce a second accent color for actions, links or highlights. Status tones are for order status only.
- **Don't** put shadows on cards, tiles or panels. Use Bar and Pop only for floating or fixed layers.
- **Don't** replace the familiar marketplace structure (search, categories, dense grid, add on card) with a boutique banner-led layout or a themed costume. The Popular Showcase is the one expressive block, and it always sits below the categories.
- **Don't** write unconfirmed promises in UI copy (delivery times, warranties, ratings, reviews, installments).
- **Don't** remove or reorder the five-tab bottom navigation on phones.
