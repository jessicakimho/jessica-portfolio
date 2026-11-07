# Koi Pond Kit: notes for AI helpers

You're helping someone customise the Koi Pond Kit, an interactive koi pond for their website. They may not be a developer: explain changes in plain words, say exactly which file and which lines to change, and give them complete code to paste rather than fragments.

## What it is

- `koi-pond.js`: the whole pond, plain JavaScript, no dependencies, no build step. It's a classic `<script>` (an IIFE that sets `window.KoiPond`), so it works when `index.html` is opened straight from disk. **Keep it that way**: no `import`/`export`, no npm packages, no TypeScript.
- Drawing: WebGL2 for the water and koi (two shader passes), a 2D canvas on top for lily pads, lotuses and petals, and real `<a>` elements for the link captions. Without WebGL2 it falls back to a plainer 2D pond.
- `index.html`: the page. Its two `✏️` blocks hold the settings: `const links = [...]` and `const look = {...}`, passed as `KoiPond.create(element, { ...look, links })`.
- `playground.html`: sliders that call `pond.update(...)` and print a `const look` block to paste into `index.html`.
- `koi-pond.css`: the vignette (`.koi-pond::after`) and the caption pills (`.koi-pond__link`).
- `examples/react/KoiPond.tsx|jsx`: a React wrapper that loads `/koi-pond.js` from `public/` and calls `KoiPond.create` in an effect.

## How to make a change

1. **Prefer settings.** Most requests (colours, number and kind of koi, ripple feel, pads, petals, links) are settings in `index.html`'s `look`, not code edits. Settings merge in this order: `DEFAULTS` → the chosen preset in `PRESETS` → the user's settings. Objects merge key by key; **arrays replace** (e.g. `koi.types`, `water.glows`, `pads.colors`).
2. **Colours are hex strings** (`"#F28CA4"`). Other formats show up magenta on purpose.
3. **New koi looks** go in `KOI_TYPES` (section 1) or straight into `koi.types` as objects.
4. **Edit `koi-pond.js`** only for things settings don't cover (shapes, new behaviour, new effects). Keep the code style: small named helpers, comments that say what something looks like or does.
5. **New setting?** Add it to `DEFAULTS` with a one-line comment, then read it as `opts.<group>.<name>`. Code that runs every frame (inside `swim`, `ripple`, `drawTop`, `render`) sees changes at once; code in `spawn`/`prepare` only on re-stock. If `update()` should apply it without re-stocking, add its path to `LIVE`.
6. **New shader value?** Add a `uniform` to the `WATER` (or `MESH_FRAGMENT`) source, add its name to `WATER_SETTINGS`, and set it in `applyLook`. Shaders are GLSL ES 3.00 (`#version 300 es`). Compile errors are printed to the browser console.
7. **Check it**: open `index.html`, open the console (right click → Inspect → Console), and look for errors or `Koi Pond:` warnings.

## Settings

All optional. Defaults shown are the `dusk` preset.

| Setting | Default | What it does |
| --- | --- | --- |
| `preset` | `"dusk"` | Starting look: `"dusk"`, `"moonlight"`, `"daylight"` |
| `koi.count` / `koi.countOnPhones` | `7` / `4` | Free-swimming koi (phones: pond narrower than 700px) |
| `koi.types` | `["sakura","kohaku","sanke","blush","sunrise"]` | Looks, by `KOI_TYPES` name or as objects; koi take them in turn |
| `koi.size` | `0.24` | Length as a share of the pond's shorter side |
| `koi.minSize` / `koi.maxSize` | `100` / `230` | Length limits in px |
| `koi.speed` | `[24, 44]` | px per second, each koi picks within the range |
| `koi.wiggle` | `1` | Body and tail swish (multiplier) |
| `koi.wander` | `1` | How much they meander (multiplier) |
| `koi.dive` | `true` | Slowly rise and sink |
| `koi.shy` | `true` | Dart away from the pointer |
| `links` | 2 links | `[{ label, href, koi, x, y, tint, ink, target }]`; `[]` for none |
| `water.middle` / `water.edges` | `#1C403D` / `#0B2023` | Water colour in the middle / toward the banks |
| `water.background` | `#12302F` | Page colour before the water draws |
| `water.haze`, `water.hazeAmount` | `#80B3A8`, `0.14` | Milky clouds in the water |
| `water.light`, `water.lightAmount` | `#9EDBCC`, `1` | Sunlight net on the floor (caustics) |
| `water.glow`, `water.glowAmount` | `#F08CAB`, `1` | Reflected sky/lotus light |
| `water.glows` | 4 spots | Up to 6 `{ x, y, size, strength }` (x, y, size as shares of the pond) |
| `water.sheen`, `water.sheenAmount` | `#FFDBE6`, `1` | Sky sheen on the surface |
| `water.sparkle`, `water.sparkleAmount` | `#FFEDF2`, `1` | Sun glints on ripples |
| `water.swell` | `1` | Gentle waves over the whole pond (0 is glassy) |
| `water.tint`, `water.sink` | `#10292A`, `1` | Colour koi fade into when deep / how much |
| `ripples.fade` | `0.982` | Ripple lifetime per frame; 0.95 short, 0.995 long; must stay below 1 |
| `ripples.bend` | `1` | How much ripples refract the floor and koi |
| `ripples.tap`, `ripples.tapSize` | `240`, `4` | Splash from a tap/click (strength, radius in 3px cells) |
| `ripples.drag` | `1` | Wake from dragging through the water |
| `ripples.wake` | `6` | Ripples koi leave near the surface |
| `ripples.rain`, `ripples.rainEvery`, `ripples.rainStrength` | `true`, `[0.9, 2.4]`, `70` | Random drops |
| `pads.count` / `pads.countOnPhones` | `7` / `4` | Lily pads |
| `pads.size` / `pads.sizeOnPhones` | `[42, 86]` / `[28, 52]` | Radius range in px |
| `pads.colors` | 3 greens | Leaf colours: hex, or `{ base, light, dark, vein }` |
| `pads.lotusEvery` | `2` | Lotus on every Nth pad; 0 for none |
| `pads.drops`, `pads.drift`, `pads.push` | `true`, `1`, `true` | Water beads; drift speed; pointer pushes pads and petals |
| `lotus.petal/blush/tip/centre/stamens/pod/seeds` | pinks and golds | Lotus colours |
| `petals.count` / `petals.countOnPhones` | `14` / `8` | Fallen petals |
| `petals.size`, `petals.colors`, `petals.vein` | `[6, 11]`, `["#DDB4BF","#ECD2D8"]`, `#C495A3` | Petal size (px) and colours (base → tip) |
| `keepCenterClear` | `true` | Koi and pads avoid the middle so a title stays readable |
| `allowScroll` | `false` | `true` lets phones scroll the page past the pond |
| `navigate` | `null` | `function(href)` for link koi, e.g. a SPA router |

### A koi type

```js
{
  base: "#F8F3EE",            // required: body colour
  head: "#F28CA4",            // colour over the whole head
  cap: "#E4502F",             // small round patch on top of the head
  saddle: "#F2A447",          // broad band down the back
  dot: "#E4502F",             // small spot on the crown (tancho)
  spots: [{ color: "#EE6A4D", count: 3, size: 1 }], // patches; size 1 is normal
  sheen: 0.8,                 // 0–1, metallic shine of the scales
  shade: "#D6C4CE",           // flank shading (auto from base)
  fin: "#FCD6DE",             // fin colour at the root (auto from base)
  eye: "#CFA45C",             // iris
}
```

Built-in types: `sakura`, `kohaku`, `sanke`, `blush`, `sunrise`, `gold`, `platinum`, `showa`, `asagi`, `tangerine`, `midnight`.

## The API

```js
const pond = KoiPond.create(element, settings); // element needs a height; its children sit above the water if they have z-index ≥ 3
pond.update({ water: { glow: "#FFD27A" } });    // change settings while it runs
pond.splash(x, y, strength);                    // px from the pond's top left
pond.settings;                                  // the merged settings in use
pond.destroy();                                 // stop and remove it

KoiPond.defaults; KoiPond.presets; KoiPond.types;
KoiPond.paintKoi(type);  // a canvas of one koi, nose left (body and tail on top, fins below)
KoiPond.resolve(settings); // the merged settings a pond would use
```

Layers inside the element, bottom to top: water canvas (z 0), surface canvas for pads and petals (z 1), vignette `::after` (z 2), the page's own content such as the title (z 3), link hit areas and captions (z 4).

## Map of koi-pond.js

The file is in numbered sections; search for the heading, e.g. `// 5. KOI SKINS`.

| Section | What's there | Edit it to… |
| --- | --- | --- |
| 1. KOI TYPES | `KOI_TYPES` and the colour constants above it | add or change koi looks |
| 2. SETTINGS | `DEFAULTS` | change any default |
| 3. PRESETS | `PRESETS` | add a new look, e.g. `sakura: { water: {...}, koi: {...} }` |
| 4. HELPERS | `rgbOf`, `mix`, `merge`, `resolve`, `koiType`, `leafOf`, `smoothPath`, `blob` | patch shapes (`blob`), colour helpers |
| 5. KOI SKINS | shape constants (`WIDTH`, `TAIL`, `LEAD`, `NOSE`, `PEC_SHAPE`, `PEL_SHAPE`, `halfWidth`), `scaleGrid`, `paintBody`, `membrane`, `paintTail`, `paintBlade`, `paintKoi` | body width and outline (`WIDTH`, `halfWidth`), tail length (`TAIL`) and outline (`paintTail`: `tipU`, `tipD`, `fork`), fin shapes, scales, where patches sit (`paintBody` "Patches of colour"), eyes and lips ("Lips, nostrils and eyes"), whiskers ("Whiskers") |
| 6. SURFACE | `padSprite`, `paintLotus`, `paintPetal`, `paintGlow`, `paintDrop` | leaf veins and notch, lotus petal rings (`rings`), petal shape, water beads |
| 7. POND FLOOR | `paintFloor` | stones, silt, grain on the bottom |
| 8. WATER | `MAX_GLOWS`, the `WATER` shader (`caustics`, `swell`, `glow`, `main`), `MESH_FRAGMENT`, `setupGl`, `skinTexture` | the water's look: colours, sunlight, reflections, surface sheen and glints, how koi fade with depth |
| 9. KOI BODIES | `shapeOf` (swish), `bodyPath` (shadow outline), `along` | how the body bends |
| 10. THE POND | `create()`, inside it: `applyLook`, `makeKoi`, `spawn`, `resize`, `swim`, `ripple`, `ribbon`, `fin`, `lay`, `drawShadows`, `drawTop`, `render`, `placeGuides`, `buildLinks`, `prepare`, `onMove`, `drag`, `onUp`, `loop` | behaviour: swimming (`swim`), ripple physics (`ripple`, `disturb`), pointer effects (`onMove`, `drag`, `onUp`), fin beat (`lay`), pads and petals drifting (`drawTop`), caption placement (`placeGuides`) |
| 11. EXPORTS | `window.KoiPond` | add public helpers |

### Where common requests live

- **Koi colours and markings** → settings (`koi.types`) or `KOI_TYPES`.
- **Chubbier / slimmer koi** → `WIDTH` (0.13; try 0.1–0.17). Shadows use `profile`.
- **Longer, flowing tails (butterfly koi)** → `TAIL` (0.62; try 0.8–1) and, for wider tails, `tipU.y` / `tipD.y` in `paintTail`.
- **Bigger side fins** → scale the numbers in `PEC_SHAPE` (and `PEC.len`).
- **Faster, calmer, more playful swimming** → settings `koi.speed`, `koi.wander`, `koi.wiggle`; turning limits in `swim` ("Never turn tighter…").
- **How koi react to the pointer** → `swim` (the `o.shy` block: radius 160px, `boost = 2`).
- **Ripples: size, lifetime, strength** → settings `ripples.*`; the physics is `ripple()` (wave equation on a 3px grid, `CELL`), splashes are `disturb(x, y, radius, strength)`.
- **What a tap does** → `onUp`; **what a drag does** → `drag`; **what clicking a link koi does** → `buildLinks` (`follow`) and `splashGuide`.
- **The water's look** → settings `water.*`; deeper changes in `WATER`'s `main()`.
- **Link caption style** → `.koi-pond__link` in `koi-pond.css`; caption text and arrow → `buildLinks`; where link koi swim → `links[].x`, `links[].y` and the `k.guide` block in `swim`.
- **Title, fonts, page colours** → `index.html` (`<style>` and the `.center` block).

## Things to keep working

- Opening `index.html` straight from disk (no server): no modules, no fetch of local files.
- `prefers-reduced-motion`: the pond slows down and stops the rain and koi wakes (`reduced`).
- Phones: `koi.countOnPhones`, `pads.countOnPhones`, `petals.countOnPhones` keep it light; the ripple grid is the heaviest part, so don't shrink `CELL`.
- Accessibility: link captions are real `<a>` elements that work with the keyboard; the canvases are `aria-hidden`.
- `destroy()` must remove everything `create()` added (React mounts and unmounts it).
