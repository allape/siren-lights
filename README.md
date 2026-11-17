# siren-lights

A full-viewport red / blue warning-light page built with **Vite + React + TypeScript +
SCSS modules + i18next**, and bundled into a **single HTML file** for easy hosting.

## Features

- **CSS-only responsive layout** – two lamps always split the screen 50 / 50. A
  `@media (min-aspect-ratio: 1/1)` query puts them side by side in landscape and
  stacks them in portrait; no JavaScript measures the viewport.
- **Configurable colours** – pick any red and blue with the native colour picker.
- **Built for night use** – lamps are flat, edge-to-edge fields of the configured colour
  with no gradients, vignette or dark borders; switching is instant for maximum
  attention, and the panel reminds you to use maximum screen brightness.
- **Flash profiles** – Chinese (GB), American (SAE) and European (ECE) timing presets.
  The Chinese profile is selected by default.
- **First-visit confirmation** – a vertically and horizontally centred panel asks for
  colours and profile the first time. The lamps stay steadily lit and update live while
  the panel is open.
- **Running mode** – "Start" hides the panel, starts flashing and takes a screen wake
  lock. Tapping the screen reveals a stop button (80 % opaque black or white, depending
  on `prefers-color-scheme`, with a backdrop blur); it hides again after 3 s without
  interaction. "Stop" stops the flash and returns to the panel.
- **Bilingual UI** – Chinese and English, auto-detected on first load and switchable in
  the panel.
- **Wake Lock** – re-acquired when the tab becomes visible again and retried on
  interaction, so a lock that needed a gesture can still be obtained; gracefully
  skipped on browsers that do not support it.
- **Single-file build** – `npm run build` emits one self-contained `dist/index.html`.

## Visibility on a phone or tablet

- The whole viewport is used: two solid colour fields, no borders and no gradient
  falloff, so the light stays recognisable at a distance and in peripheral vision.
- Lamps switch instantly (no CSS opacity transition), which keeps the strobe crisp
  instead of smearing the two colours together.
- The Screen Wake Lock keeps the device from dimming while flashing. It is re-acquired
  after the page is hidden and retried on touch / click.
- For night use, set the device to maximum brightness and avoid low-power mode, which
  can force the display dimmer. The settings panel shows the same reminder.
- The page is a single HTML file and works offline; no network requests are made while
  flashing.

## Flash profiles

| Profile         | Reference | Pattern                                              | Cycle                    |
| --------------- | --------- | ---------------------------------------------------- | ------------------------ |
| 国标 / Chinese  | GB 13954  | Red and blue alternate, one 250 ms single flash each | 500 ms (≈ 2 flashes/s)   |
| 美标 / US       | SAE J845  | Wig-wag: two 80 ms bursts per side, sides alternate  | 1 s (≈ 1 burst group/s)  |
| 欧标 / European | ECE R65   | Red and blue alternate, one 200 ms single flash each | 400 ms (≈ 2.5 flashes/s) |

The profiles are timing presets inspired by those standards and are not a
certification of any real emergency-light product.

## Layout rules

```scss
// portrait (width < height): top / bottom
.lamp {
  width: 100%;
  height: 50%;
}

// landscape or square (width >= height): left / right
@media (min-aspect-ratio: 1/1) {
  .lamp {
    width: 50%;
    height: 100%;
  }
}
```

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
npm run build     # type-check + single-file production build
npm run preview   # preview dist/
npm run lint      # eslint.config.js
npm run format    # prettier
```

## Browser notes

- The Screen Wake Lock API requires a secure context (HTTPS or `localhost`) and may
  still be refused. It fails silently and flashing continues.
- The stop button and the settings panel follow `prefers-color-scheme`.
- Fullscreen is intentionally not requested; the page simply fills the viewport.
