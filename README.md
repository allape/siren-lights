# siren-lights

A full-viewport red / blue warning-light page built with **Vite + React + TypeScript +
SCSS modules + i18next**, and bundled into a **single HTML file** for easy hosting.

## Features

- **Configurable colours** – pick any red and blue with the native colour picker.
- **Built for night use** – lamps are flat, edge-to-edge fields of the configured colour
  with no gradients, vignette or dark borders; switching is instant for maximum
  attention, and the panel reminds you to use maximum screen brightness.
- **Flash profiles** – Chinese (GB), American (SAE) and European (ECE) timing presets.
  The Chinese profile is selected by default.
- **Installable PWA** – a web app manifest, maskable icons and a service worker let the
  page run full screen from the home screen and keep flashing without a network.

## Flash profiles

| Profile  | Reference | Pattern                                              | Cycle                    |
| -------- | --------- | ---------------------------------------------------- | ------------------------ |
| Chinese  | GB 13954  | Red and blue alternate, one 250 ms single flash each | 500 ms (≈ 2 flashes/s)   |
| US       | SAE J845  | Wig-wag: two 80 ms bursts per side, sides alternate  | 1 s (≈ 1 burst group/s)  |
| European | ECE R65   | Red and blue alternate, one 200 ms single flash each | 400 ms (≈ 2.5 flashes/s) |

The profiles are timing presets inspired by those standards and are not a
certification of any real emergency-light product.

## Colour presets

| Lamp | Presets                                                                            |
| ---- | ---------------------------------------------------------------------------------- |
| Red  | White `#FFFFFF` · Pure red `#FF0000` · GB `#FF1F2D` · US `#FF2A00` · EU `#E60012`  |
| Blue | White `#FFFFFF` · Pure blue `#0000FF` · GB `#1F6BFF` · US `#0033FF` · EU `#0057B8` |

The standards define the emitted light colour by chromaticity rather than by a fixed
screen RGB value, so the GB / US / EU entries are vivid sRGB approximations for display
use, not certified colour samples.

## Persistence

| Key                        | Contents                                                 |
| -------------------------- | -------------------------------------------------------- |
| `siren-lights:config:v1`   | `{ red, blue, standard }` – written when the user starts |
| `siren-lights:language:v1` | `zh` or `en`                                             |

If a valid config exists on load, the page starts flashing immediately; otherwise the
confirmation panel is shown.

## PWA

The page is a Progressive Web App: it can be installed to the home screen and keeps
working when the network is gone.

| Path                         | Role                                                     |
| ---------------------------- | -------------------------------------------------------- |
| `public/manifest.json`       | App name, colours, `standalone` display and icons        |
| `public/sw.js`               | Service worker: precaches the shell, serves it offline   |
| `public/icons/*.png`         | 192 / 512 px "any", 512 px maskable and 180 px iOS icons |
| `scripts/generate-icons.mjs` | Dependency-free icon generator (`npm run icons`)         |

`vite build` copies everything in `public/` next to the generated HTML, so the
deployed `docs/` folder holds `index.html`, `manifest.json`, `sw.js` and
`icons/`. Every reference is relative, which keeps the PWA working under the GitHub
Pages sub-path as well as at a domain root.

### Caching

The whole app is one inlined HTML document, so the shell is tiny:

- `install` precaches the document, the manifest and the icons, then activates
  immediately (`skipWaiting`), so no extra reload is needed after a deploy.
- Navigations are **network-first**: a new deploy is picked up on the next load, and
  the cached document is the offline fallback for any route.
- Other same-origin requests are **cache-first** with a background refresh.
- Old `siren-lights-*` caches are pruned on activation; caches that belong to other
  apps on the same origin are left alone.

Bump `CACHE_NAME` in `public/sw.js` when the shell list changes.

### Installing

- Chrome, Edge and Android: use the browser's install button, or the **安装到桌面**
  button that the settings panel shows when the browser offers an install prompt.
- iOS and iPadOS Safari: **分享 → 添加到主屏幕**; the settings panel shows the same
  hint, and `apple-touch-icon` plus the `apple-mobile-web-app-*` meta tags make the
  installed app open full screen.
- Installing needs a secure context (HTTPS or `localhost`). The service worker is
  registered by production builds only: in `npm run dev` it would cache Vite's dev
  modules, so use `npm run preview` to test offline behaviour.

## Scripts

```bash
npm install       # install dependencies
npm run dev       # dev server
npm run build     # type-check + build into docs/
npm run preview   # preview the docs/ build
npm run lint      # eslint.config.js
npm run format    # prettier
npm run icons     # regenerate public/icons from scripts/generate-icons.mjs
```

## GitHub Pages

`npm run build` writes the self-contained site to `docs/`:

- `docs/index.html` – the complete app (JS, CSS and favicon inlined)
- `docs/manifest.json`, `docs/sw.js`, `docs/icons/` – the PWA assets, copied
  from `public/` on every build
- `docs/.nojekyll` – tells GitHub Pages to skip Jekyll processing; copied from
  `public/.nojekyll` on every build

Commit the `docs/` folder, then open **Settings → Pages** in the repository and choose
**Deploy from a branch**, branch `main`, folder `/docs`. The app is served at
`https://allape.github.io/siren-lights/`; the relative `base` path makes the repository
sub-path work.

Because the app is one relative HTML document, it also works when opened directly from
disk or hosted under any static path — installing and offline caching then simply stay
inactive, since service workers need an HTTP(S) origin.

## Browser notes

- The Screen Wake Lock API requires a secure context (HTTPS or `localhost`) and may
  still be refused. It fails silently and flashing continues.
- Service workers and the install prompt also require a secure context; both are
  opt-in, so a plain HTTP deployment keeps working exactly as before.
- The stop button and the settings panel follow `prefers-color-scheme`.
- Fullscreen is intentionally not requested; the page simply fills the viewport.
