## Installation Guide

### 1. Preview locally
Extract the ZIP and open `index.html` in a browser. No server or build step is needed. Stay online for the best result (Google Fonts).

### 2. Deploy
Upload everything (`index.html`, the other pages, `assets/`, `images/`) to your hosting root or any sub-folder.
Keep the folder structure; all links are relative.

### 3. Customise
* Products / prices / currency: `assets/js/products.js`
* Colours / fonts: `:root` in `assets/css/base.css`
* Real product photos: drop PNG/JPG files in `images/products/` and change each `image` path in `products.js`.

### 4. Botble / Laravel
This is a standalone front end. Copy `assets/` and `images/` into the theme's public assets, convert each page into a Blade view
(keeping the CSS links in the head and the scripts at the end of the body) and update the asset paths to your theme's asset helper.
The old `botble-admin-fields` stubs were removed because they referred to the previous file structure.
