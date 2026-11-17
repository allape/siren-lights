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

## Flash profiles

| Profile         | Reference | Pattern                                              | Cycle                    |
| --------------- | --------- | ---------------------------------------------------- | ------------------------ |
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

## Scripts

```bash
npm install       # install dependencies
npm run dev       # dev server
npm run build     # type-check + build into docs/
npm run preview   # preview the docs/ build
npm run lint      # eslint.config.js
npm run format    # prettier
```

## GitHub Pages

`npm run build` writes the self-contained site to `docs/`:

- `docs/index.html` – the complete app (JS, CSS and icon inlined)
- `docs/.nojekyll` – tells GitHub Pages to skip Jekyll processing; copied from
  `public/.nojekyll` on every build

Commit the `docs/` folder, then open **Settings → Pages** in the repository and choose
**Deploy from a branch**, branch `main`, folder `/docs`. The app is served at
`https://allape.github.io/siren-lights/`; the relative `base` path makes the repository
sub-path work.

Because the app is one relative HTML file with no external requests, it also works when
opened directly from disk or hosted under any static path.

## Browser notes

- The Screen Wake Lock API requires a secure context (HTTPS or `localhost`) and may
  still be refused. It fails silently and flashing continues.
- The stop button and the settings panel follow `prefers-color-scheme`.
- Fullscreen is intentionally not requested; the page simply fills the viewport.
