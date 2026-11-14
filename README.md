# Botble Farmart — Website (HTML / CSS / JavaScript)

**Design & Development:** Atik Masud

Static, dependency-free website. No build step, no frameworks.
Every visual (landing scene, torn paper, ribbon, wood sign, logo, vegetables, products) is code or SVG.
The only raster images are the two you supplied: the farm photo and the transparent cow.

## Pages and flow

| Page | File | What it does |
|---|---|---|
| Start / Landing | `index.html` | Full-screen farm scene. **Click to View Special Event** → `special-event.html`. **× Close** → `shop.html`. |
| Special Event | `special-event.html` | Page tears open, cow breaks out. **Shop Now** → `shop.html`. **× Close** (or Esc) → `index.html`. |
| Shop | `shop.html` | 4 products, **Add to Cart**, basket drawer (**View Basket**, **Continue to Checkout**). |
| Basket | `basket.html` | Change quantity, remove, **Continue to Checkout**. |
| Checkout | `checkout.html` | Validated demo form and confirmation (nothing is sent anywhere). |

The basket is stored in `localStorage` (key `farmart-demo-cart:v1`) and is shared by all pages.

## Folder structure

```
index.html  special-event.html  shop.html  basket.html  checkout.html
assets/
  css/  base.css        shared tokens, logo, buttons, trust bar, close button, page wipe
        home.css        landing scene
        event.css       special event page
        shop.css        store header, shop grid, basket drawer (shared by basket/checkout)
        basket.css      basket page + shared panel styles
        checkout.css    checkout page
  js/   products.js     product list (single source of truth, edit prices/names here)
        cart.js         basket logic (localStorage)
        transitions.js  green wipe between pages
        home.js         landing parallax
        event.js        torn-paper animation, parallax, Esc to close
        shop.js  basket.js  checkout.js
  svg/  barn, windmill, vegetables, leaves, logo, ribbon, wood sign, icons ...
images/
  natural-farm-background.jpg   (your farm photo)
  PlayfulCowReachingForward.png (your transparent cow)
  products/  tomato.svg carrot.svg spinach.svg eggs.svg
```

## Editing guide

* **Colours / fonts:** `:root` variables at the top of `assets/css/base.css`.
* **Text on the landing page and event page:** plain HTML in `index.html` / `special-event.html`.
* **Products, prices, currency:** `assets/js/products.js` (`CURRENCY`, `products`).
* **Use real product photos later:** put `tomato.jpg`, etc. in `images/products/` and change the
  `image:` path of each product in `products.js`. Nothing else needs to change (shop, drawer, basket and
  checkout all read the same field).
* **Animation timing:** durations/delays are in `home.css` and `event.css`. The tear itself is in
  `event.js` (`START`, `DUR`). Cow breakout is the `@keyframes cow-in` rule.
* **Layout scale:** the desktop scenes are a 16:9 composition measured in `S` units (1S = 1% of the
  composition width). Mobile / portrait switches to a stacked layout (see the last media query in each CSS file).

## Notes

* **Fonts:** Baloo 2 and Poppins load from Google Fonts. Without internet the site falls back to system fonts and still works.
* **Reduced motion:** visitors with "reduce motion" enabled get static scenery and no tear animation.
* **Mobile performance:** only `transform` and `opacity` are animated, pointer parallax is disabled on touch devices.
* **Photo:** the cow and photo are your original assets; they were not modified.


## Real product photo assets

The four catalogue images (eggs, spinach, tomatoes, and carrots) are now realistic product photographs.
The existing `.svg` paths are retained for compatibility; each SVG contains the corresponding embedded
JPEG photo, so existing page references continue to work. Standalone editable JPG originals are included
in `images/products/real-photos/`.
