/*!
 * Koi Pond Kit v1.0.0
 * An interactive koi pond for your website: koi that swim, rise and sink, ripples you can draw
 * through the water, lily pads, lotuses and drifting petals.
 *
 * Made by Vivian (play with vivian). Use it on your own websites and your clients' websites;
 * please don't resell or share the code itself. Full terms in LICENSE.txt.
 *
 * Start with the guide (Koi-Pond-Kit-Guide.pdf). AI helpers: read AGENTS.md first.
 *
 * The file is in sections, numbered the same as in the guide:
 *   1. KOI TYPES       what each kind of koi looks like
 *   2. SETTINGS        every setting and its default
 *   3. PRESETS         ready-made looks: dusk, moonlight, daylight
 *   4. HELPERS         small tools used everywhere below
 *   5. KOI SKINS       paints each koi: markings, scales, fins, tail, face
 *   6. SURFACE         lily pads, lotuses, petals and water beads
 *   7. POND FLOOR      the silt and stones under the water
 *   8. WATER           the WebGL shaders: water colour, light, reflections, ripples
 *   9. KOI BODIES      the shape of a swimming koi
 *  10. THE POND        KoiPond.create(): swimming, ripples, drawing, the pointer, links
 *  11. EXPORTS
 */
(function () {
  "use strict";

  // =====================================================================
  // 1. KOI TYPES
  // What each kind of koi looks like. Use these names in `koi.types` and `links[].koi`,
  // or add your own here. Colours are hex, like "#F28CA4". Only `base` is needed.
  //
  //   base    body colour
  //   head    colour over the whole head
  //   cap     a small round patch on top of the head
  //   saddle  a broad band of colour down the back
  //   dot     a small round spot on the crown, like a tancho's
  //   spots   patches of colour: [{ color, count, size }], size 1 is normal
  //   sheen   0 to 1, how much the scales catch the light (1 is metallic)
  //   shade   colour the flanks fall into (worked out from `base` if left out)
  //   fin     fin colour where it meets the body (worked out from `base` if left out)
  //   eye     colour of the iris
  // =====================================================================

  const PEARL = "#F8F3EE";
  const RED = "#E4502F";
  const CORAL = "#EE6A4D";
  const PINK = "#F28CA4";
  const AMBER = "#F2A447";
  const INK = "#2C2A30";

  const KOI_TYPES = {
    // A pink head over a golden back.
    sakura: { base: PEARL, saddle: AMBER, head: PINK, sheen: 0.95, shade: "#D6C4CE", fin: "#FCD6DE" },
    // White with red patches.
    kohaku: { base: PEARL, spots: [{ color: CORAL, count: 3, size: 1 }], sheen: 0.55, shade: "#D4C8D0", fin: "#FAD0C6" },
    // Kohaku with a few ink-black spots.
    sanke: {
      base: PEARL,
      spots: [
        { color: CORAL, count: 2, size: 0.95 },
        { color: INK, count: 3, size: 0.3 },
      ],
      sheen: 0.5,
      shade: "#D2CAD2",
      fin: "#F6D8D0",
    },
    // A blush-pink metallic.
    blush: { base: "#F3C6CF", sheen: 1, shade: "#D6AAB8", fin: "#FFE0E8" },
    // A red cap over a golden back.
    sunrise: { base: PEARL, saddle: "#F3B550", cap: RED, sheen: 0.85, shade: "#D6C8CC", fin: "#FADEC6" },
    // Solid metallic gold.
    gold: { base: "#F0BC55", sheen: 1, shade: "#DCA664", fin: "#FFE2AA" },
    // Silvery white with a red spot on the crown.
    platinum: { base: "#EEF0F5", dot: RED, sheen: 0.9, shade: "#C4CADE", fin: "#F4F0FF" },
    // Black with red and white patches.
    showa: {
      base: "#2A272D",
      spots: [
        { color: CORAL, count: 3, size: 0.95 },
        { color: PEARL, count: 2, size: 0.55 },
      ],
      sheen: 0.55,
      shade: "#141216",
      fin: "#6A5A62",
    },
    // Blue-grey with a little orange.
    asagi: { base: "#A9B9CC", spots: [{ color: "#EE8A5E", count: 2, size: 0.55 }], sheen: 0.6, shade: "#7E8FA6", fin: "#E6EEF8" },
    // Metallic orange.
    tangerine: { base: "#F28A3C", sheen: 1, shade: "#C8662A", fin: "#FFC79A" },
    // Ink black with pale patches.
    midnight: { base: "#25272F", spots: [{ color: "#E9EBF2", count: 3, size: 0.75 }], sheen: 0.7, shade: "#121318", fin: "#8D93A6" },
  };

  // =====================================================================
  // 2. SETTINGS
  // Every setting and its default. Pass only the ones you want to change to
  // KoiPond.create(); anything you leave out comes from here (or from the preset).
  // Colours are hex. "Amount" settings are multipliers: 1 is the default, 2 is twice as strong.
  // =====================================================================

  const DEFAULTS = {
    // Start from one of the PRESETS below, then change anything else on top of it.
    preset: "dusk",

    koi: {
      count: 7, // koi swimming freely, not counting the ones that carry links
      countOnPhones: 4, // used instead when the pond is narrower than 700px
      types: ["sakura", "kohaku", "sanke", "blush", "sunrise"], // names from KOI_TYPES, or your own { base: ... } objects
      size: 0.24, // length of a koi as a share of the pond's shorter side
      minSize: 100, // px, smallest a koi can be
      maxSize: 230, // px, largest a koi can be
      speed: [24, 44], // px per second; each koi picks a speed in this range
      wiggle: 1, // how much the body and tail swish as they swim
      wander: 1, // how much they meander (0 swims in long smooth arcs)
      dive: true, // slowly rise toward the surface and sink again
      shy: true, // dart away from the pointer
    },

    // Koi that carry links, each with a caption that follows it around. [] for none.
    //   label   the caption's text
    //   href    where it goes
    //   koi     its look: a name from KOI_TYPES or your own { base: ... }
    //   x, y    where it likes to swim, as a share across and down the pond (0 to 1)
    //   tint    the caption's colour and the koi's glow
    //   ink     the caption's text colour
    //   target  "_blank" for a new tab, "_top" when the pond is inside an iframe
    links: [
      { label: "my work", href: "#work", koi: "gold", x: 0.36, y: 0.74, tint: "#F0BC55", ink: "#FBE9C4" },
      { label: "say hi", href: "#contact", koi: "platinum", x: 0.64, y: 0.74, tint: "#E6ECF6", ink: "#EEF1F6" },
    ],

    water: {
      middle: "#1C403D", // the open water in the middle
      edges: "#0B2023", // the water toward the banks
      background: "#12302F", // shows for a moment before the water is drawn
      haze: "#80B3A8", // milky clouds drifting through the water
      hazeAmount: 0.14, // 0 to 1
      light: "#9EDBCC", // the net of sunlight on the floor
      lightAmount: 1,
      glow: "#F08CAB", // the sky and lotuses reflected in the water
      glowAmount: 1,
      // Where those reflections sit (up to 6): x and y as a share across and down, size as a share of the height.
      glows: [
        { x: 0.167, y: 0.18, size: 0.37, strength: 0.17 },
        { x: 0.875, y: 0.78, size: 0.42, strength: 0.2 },
        { x: 0.82, y: 0.16, size: 0.29, strength: 0.12 },
        { x: 0.19, y: 0.89, size: 0.29, strength: 0.14 },
      ],
      sheen: "#FFDBE6", // the sky's sheen on the surface
      sheenAmount: 1,
      sparkle: "#FFEDF2", // glints of sun on the ripples
      sparkleAmount: 1,
      swell: 1, // gentle waves across the whole pond (0 is glassy)
      tint: "#10292A", // the colour koi fade into as they swim deeper
      sink: 1, // how much they fade (0 keeps them bright at every depth)
    },

    ripples: {
      fade: 0.982, // how long ripples last: 0.95 is short, 0.995 rings for ages (keep it under 1)
      bend: 1, // how strongly ripples bend the floor and the koi
      tap: 240, // the splash from a tap or click (0 for none)
      tapSize: 4, // how wide that splash is
      drag: 1, // the wake when you drag through the water (0 for none)
      wake: 6, // the ripples koi leave when they swim near the surface (0 for none)
      rain: true, // the odd drop landing on the pond
      rainEvery: [0.9, 2.4], // seconds between drops
      rainStrength: 70,
    },

    pads: {
      count: 7,
      countOnPhones: 4,
      size: [42, 86], // radius in px
      sizeOnPhones: [28, 52],
      // Leaf colours: each pad picks one. A plain hex like "#3F6F4C" works too; the lighter and
      // darker tones are worked out from it.
      colors: [
        { base: "#3F6F4C", light: "#6F9F6C", dark: "#24452F", vein: "#9CC496" },
        { base: "#46784F", light: "#78A874", dark: "#264A31", vein: "#A2C99A" },
        { base: "#3A6848", light: "#689866", dark: "#20402C", vein: "#96BE90" },
      ],
      lotusEvery: 2, // every 2nd pad has a lotus resting on it (1 for all of them, 0 for none)
      drops: true, // beads of water on the leaves
      drift: 1, // how fast pads float about
      push: true, // the pointer pushes pads and petals along
    },

    lotus: {
      petal: "#F6ECEA", // where the petals meet the middle
      blush: "#E9C4CD", // across the petals
      tip: "#C98D9F", // the petal tips
      centre: "#DCC489",
      stamens: "#C9A56A",
      pod: "#BFCB90",
      seeds: "#8E9E66",
    },

    petals: {
      count: 14,
      countOnPhones: 8,
      size: [6, 11], // px
      colors: ["#DDB4BF", "#ECD2D8"], // from the base of a petal to its tip
      vein: "#C495A3",
    },

    keepCenterClear: true, // koi and pads keep out of the middle, so words there stay readable
    allowScroll: false, // true lets phones scroll the page past the pond (for a pond partway down a page)
    navigate: null, // optional function(href) for links, e.g. your app's router; plain links work without it
  };

  // =====================================================================
  // 3. PRESETS
  // Ready-made looks. Each only lists what differs from the settings above.
  // =====================================================================

  const PRESETS = {
    // A koi pond at dusk: deep green water, pink sky light. The original.
    dusk: {},

    // Night: inky blue water, silver koi, white lotuses and a moon.
    moonlight: {
      koi: { types: ["platinum", "midnight", "kohaku", "asagi", "sakura"] },
      water: {
        middle: "#1A2A46",
        edges: "#070D1B",
        background: "#0E1729",
        haze: "#8D9CC6",
        hazeAmount: 0.12,
        light: "#B9CCF4",
        lightAmount: 0.9,
        glow: "#CDD5FA",
        glowAmount: 1,
        glows: [
          { x: 0.8, y: 0.17, size: 0.34, strength: 0.3 },
          { x: 0.14, y: 0.86, size: 0.36, strength: 0.08 },
        ],
        sheen: "#DCE4FF",
        sparkle: "#F4F7FF",
        sparkleAmount: 1.3,
        tint: "#0B1426",
      },
      pads: {
        colors: [
          { base: "#2E4F4A", light: "#5C807A", dark: "#18302D", vein: "#8DB1AA" },
          { base: "#335750", light: "#62887F", dark: "#1B3430", vein: "#93B8AE" },
          { base: "#2A4945", light: "#577A74", dark: "#162C29", vein: "#88ACA5" },
        ],
      },
      lotus: { petal: "#FBFAF8", blush: "#E6E5F0", tip: "#B9B5D6", centre: "#E2D49E", stamens: "#CDB97A", pod: "#C9D2A4", seeds: "#929C6E" },
      petals: { colors: ["#D6D4E8", "#F1F0F8"], vein: "#B4B0CE" },
    },

    // A sunny afternoon: clear jade water, bright sunlight, classic koi.
    daylight: {
      koi: { types: ["kohaku", "tangerine", "sanke", "showa", "gold"] },
      water: {
        middle: "#2D7770",
        edges: "#0F3E40",
        background: "#1D5552",
        haze: "#C4EADE",
        hazeAmount: 0.16,
        light: "#FFF3C4",
        lightAmount: 1.8,
        glow: "#FFE6A8",
        glowAmount: 1,
        glows: [
          { x: 0.86, y: 0.1, size: 0.42, strength: 0.16 },
          { x: 0.12, y: 0.9, size: 0.3, strength: 0.06 },
        ],
        sheen: "#EEF8FF",
        sheenAmount: 1.4,
        sparkle: "#FFFFFF",
        sparkleAmount: 1.6,
        tint: "#0E3A3A",
        sink: 0.8,
      },
      pads: {
        colors: [
          { base: "#4F8A4E", light: "#86B977", dark: "#2D5530", vein: "#B6D8A4" },
          { base: "#5A9553", light: "#91C27D", dark: "#335C33", vein: "#BEDDAA" },
          { base: "#477F49", light: "#7DB070", dark: "#294E2C", vein: "#AED09E" },
        ],
      },
      lotus: { petal: "#FFF3F4", blush: "#F6C3D2", tip: "#E07C9E", centre: "#F0D27C", stamens: "#DDB55A", pod: "#C9D98E", seeds: "#8FA45C" },
      petals: { colors: ["#F3C3D1", "#FFE8EF"], vein: "#E09AB0" },
    },
  };

  // =====================================================================
  // 4. HELPERS
  // =====================================================================

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const angleDiff = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
  const rand = (a, b) => a + Math.random() * (b - a);
  const TAU = Math.PI * 2;

  /** "#RRGGBB" or "#RGB" as [r, g, b] from 0 to 255. Anything else shows up magenta, so it's easy to spot. */
  function rgbOf(hex) {
    let h = String(hex).trim().replace(/^#/, "");
    if (h.length === 3) h = h.replace(/./g, (c) => c + c);
    if (!/^[0-9a-f]{6}/i.test(h)) {
      console.warn(`Koi Pond: "${hex}" isn't a hex colour like "#F08CAB".`);
      return [255, 0, 255];
    }
    const n = parseInt(h.slice(0, 6), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  /** A colour as "r,g,b", for building rgba() strings. */
  const rgbList = (hex) => rgbOf(hex).join(",");
  /** A colour as three numbers from 0 to 1, for the shaders. */
  const vec3 = (hex) => rgbOf(hex).map((v) => v / 255);
  /** Blends colour a toward colour b by t (0 to 1). */
  const mix = (a, b, t) => {
    const x = rgbOf(a);
    const y = rgbOf(b);
    return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
  };

  const isPlain = (v) => !!v && typeof v === "object" && !Array.isArray(v);
  /** Settings on top of settings: objects merge key by key, everything else (lists included) replaces. */
  function merge(base, extra) {
    if (!isPlain(extra)) return base;
    const out = { ...base };
    for (const key of Object.keys(extra)) {
      out[key] = isPlain(base[key]) && isPlain(extra[key]) ? merge(base[key], extra[key]) : extra[key];
    }
    return out;
  }

  /** The defaults, then the preset, then your own settings. */
  function resolve(user) {
    let name = user.preset || DEFAULTS.preset;
    if (!PRESETS[name]) {
      console.warn(`Koi Pond: there's no preset called "${name}". Try ${Object.keys(PRESETS).join(", ")}.`);
      name = DEFAULTS.preset;
    }
    return merge(merge(DEFAULTS, PRESETS[name]), user);
  }

  /** A koi type, by name or as an object, ready to paint. */
  function koiType(spec) {
    const t = typeof spec === "string" ? KOI_TYPES[spec] : spec;
    if (!isPlain(t)) {
      console.warn(`Koi Pond: there's no koi type called "${spec}". Try ${Object.keys(KOI_TYPES).join(", ")}.`);
      return koiType("kohaku");
    }
    const base = t.base || PEARL;
    return {
      base,
      head: t.head,
      cap: t.cap,
      saddle: t.saddle,
      dot: t.dot,
      spots: t.spots || [],
      sheen: clamp(t.sheen ?? 0.7, 0, 1),
      shade: rgbList(t.shade || mix(base, "#3C2846", 0.18)),
      fin: rgbList(t.fin || mix(base, "#FFFFFF", 0.45)),
      eye: t.eye || "#CFA45C",
    };
  }

  /** A leaf colour, filling in the lighter and darker tones when only a hex is given. */
  function leafOf(spec) {
    const base = typeof spec === "string" ? spec : spec.base;
    return {
      base,
      light: rgbList(spec.light || mix(base, "#FFFFFF", 0.25)),
      dark: rgbList(spec.dark || mix(base, "#000000", 0.42)),
      vein: rgbList(spec.vein || mix(base, "#FFFFFF", 0.5)),
    };
  }

  const layer = (w = TEX_W, h = TEX_H) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c.getContext("2d");
  };

  /** Traces a smooth closed curve through the points. */
  function smoothPath(g, pts) {
    const n = pts.length;
    g.beginPath();
    g.moveTo(pts[0].x, pts[0].y);
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n];
      const p1 = pts[i];
      const p2 = pts[(i + 1) % n];
      const p3 = pts[(i + 2) % n];
      g.bezierCurveTo(p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6, p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6, p2.x, p2.y);
    }
    g.closePath();
  }

  /** An organic patch of colour: an ellipse with a wavering edge. */
  function blob(cx, cy, rx, ry, rot = 0) {
    const s = [rand(0, TAU), rand(0, TAU), rand(0, TAU)];
    const radius = (a) => 1 + 0.16 * Math.sin(2 * a + s[0]) + 0.09 * Math.sin(3 * a + s[1]) + 0.05 * Math.sin(5 * a + s[2]);
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);
    return {
      path(g, scale = 1) {
        g.beginPath();
        for (let i = 0; i <= 72; i++) {
          const a = (i / 72) * TAU;
          const lx = Math.cos(a) * rx * radius(a) * scale;
          const ly = Math.sin(a) * ry * radius(a) * scale;
          g.lineTo(cx + lx * cos - ly * sin, cy + lx * sin + ly * cos);
        }
        g.closePath();
      },
      has(x, y) {
        const lx = ((x - cx) * cos + (y - cy) * sin) / rx;
        const ly = (-(x - cx) * sin + (y - cy) * cos) / ry;
        return Math.hypot(lx, ly) < radius(Math.atan2(ly, lx));
      },
    };
  }

  // =====================================================================
  // 5. KOI SKINS
  // Each koi is painted once, nose to the left, onto a texture (an "atlas"): body and tail across
  // the top, fins underneath. Every frame that skin is laid along the koi's bending spine.
  // The numbers below set the shape of every koi.
  // =====================================================================

  /** Points along each koi's spine. More bends more smoothly, at a small cost. */
  const SEGMENTS = 16;

  const TEX_W = 1024;
  const TEX_H = 512;
  /** The top band of the atlas holds the body and tail; the fins sit underneath. */
  const BAND = 400;
  const MID = BAND / 2;
  /** Lengths along a koi, in body lengths: a little room for whiskers, the snout, the spine, then the tail fin. */
  const LEAD = 0.03;
  const NOSE = 0.06;
  const SPINE = (SEGMENTS - 1) / SEGMENTS;
  /** How long the tail fin is. Longer is more like a butterfly koi. */
  const TAIL = 0.62;
  const TAIL_STEPS = 10;
  const BODY = NOSE + SPINE;
  const SPAN = LEAD + BODY + TAIL;
  /** Atlas pixels per body length. */
  const K = TEX_W / SPAN;
  /** How wide a koi is at its widest, in body lengths. Bigger is chubbier. */
  const WIDTH = 0.13;
  /** How far the body's strip reaches either side of the spine, in atlas pixels: the body, its whiskers and a margin. */
  const BODY_HALF = 0.17 * K;
  /** Where each fin sits in the atlas: its strip starts at x0, the fin's root is at x, and it reaches len px. */
  const PEC = { x0: 0, x: 10, len: 0.45 * K, half: 34, band: 44, y: 456 };
  const PEL = { x0: 320, x: 330, len: 0.2 * K, half: 16, band: 24, y: 456 };
  /**
   * The side fins, long and slender and swept back along the body. Outlines in body lengths from the
   * root: along the leading edge (toward the head) to the tip, then back along the trailing edge.
   * PEC is the big front pair, PEL the small pair further back.
   */
  const PEC_SHAPE = [
    [-0.014, -0.005], [0.054, -0.035], [0.135, -0.055], [0.23, -0.055], [0.329, -0.037], [0.422, 0],
    [0.444, 0.029], [0.387, 0.041], [0.294, 0.036], [0.191, 0.028], [0.1, 0.018], [0.019, 0.006],
  ];
  const PEL_SHAPE = [
    [-0.014, -0.006], [0.028, -0.015], [0.084, -0.018], [0.164, 0], [0.198, 0.021], [0.142, 0.024], [0.079, 0.018], [0.018, 0.008],
  ];

  /** Half-width of a koi seen from above at u (0 nose, 1 tail), as a share of its length. Used for shadows. */
  const profile = (u) =>
    u < 0.26 ? 0.07 + 0.095 * Math.sin((u / 0.26) * (Math.PI / 2)) : 0.165 * Math.pow(1 - (u - 0.26) / 0.74, 1.15) + 0.011;

  /** Half-width of the body at b (0 snout tip, 1 root of the tail), in body lengths. */
  const halfWidth = (b) => {
    if (b < 0.2) return WIDTH * 0.76 * Math.sqrt(Math.max(0, 1 - ((0.2 - b) / 0.2) ** 2));
    if (b < 0.4) return WIDTH * (0.76 + 0.24 * Math.sin(((b - 0.2) / 0.2) * (Math.PI / 2)));
    return WIDTH * (1 - 0.86 * ((b - 0.4) / 0.6) ** 1.8);
  };
  const bx = (b) => (LEAD + b * BODY) * K;

  /** Thin-film colours: the rainbow sheen on scales and fins. */
  const FILM = [
    [255, 186, 212],
    [255, 222, 168],
    [192, 244, 212],
    [176, 226, 255],
    [212, 196, 255],
  ];
  const film = (t) => {
    const i = Math.floor(t);
    const f = t - i;
    const a = FILM[((i % 5) + 5) % 5];
    const b = FILM[(((i + 1) % 5) + 5) % 5];
    return a.map((v, j) => Math.round(v + (b[j] - v) * f)).join(",");
  };
  const filmStops = (g, from, alpha) => {
    g.addColorStop(Math.max(0, from - 0.12), `rgba(${FILM[0].join(",")},0)`);
    FILM.forEach((c, i) => g.addColorStop(from + ((1 - from) * i) / (FILM.length - 1), `rgba(${c.join(",")},${alpha})`));
  };

  /**
   * Scales from the tail forward, so each one nearer the head overlaps the one behind it. The rows
   * stay the same in number and shrink toward the tail, and foreshorten down the curve of the flanks.
   * `shine` is how much each scale shows: most along the back, fading down the flanks and toward the tail.
   */
  function scaleGrid() {
    const rows = 11;
    const out = [];
    let col = 0;
    for (let b = 0.97; b > 0.22; col++) {
      const hw = halfWidth(b) * K;
      const step = clamp(hw * 0.24, 10, 30);
      for (let i = 0; i <= rows; i++) {
        const phi = -Math.PI / 2 + ((i + (col % 2) * 0.5) / rows) * Math.PI;
        if (Math.abs(phi) > Math.PI / 2 - 0.02) continue;
        // Scales start just behind the skull on the back and further back past the gill covers.
        const start = 0.22 + 0.07 * Math.abs(Math.sin(phi));
        if (b < start) continue;
        const ry = Math.max(1.5, (Math.PI / rows) * hw * Math.cos(phi) * 0.64);
        const shine = Math.cos(phi) ** 0.6 * clamp((1 - b) / 0.22, 0, 1) * clamp((b - start) / 0.06, 0.15, 1) * rand(0.7, 1.15);
        out.push({ x: bx(b), y: MID + Math.sin(phi) * hw, rx: step * 0.86, ry, shine });
      }
      b -= step / (BODY * K);
    }
    return out;
  }

  function paintBody(v) {
    const g = layer(TEX_W, BAND);
    const outline = () => {
      g.beginPath();
      for (let i = 0; i <= 120; i++) g.lineTo(bx(i / 120), MID - halfWidth(i / 120) * K);
      for (let i = 120; i >= 0; i--) g.lineTo(bx(i / 120), MID + halfWidth(i / 120) * K);
      g.closePath();
    };
    g.fillStyle = v.base;
    outline();
    g.fill();
    g.save();
    outline();
    g.clip();

    // A pearly blush, so pale skin is never flat.
    for (let i = 0; i < 16; i++) {
      const x = bx(rand(0.04, 0.96));
      const y = MID + rand(-0.7, 0.7) * WIDTH * K;
      const r = rand(0.05, 0.12) * K;
      const tint = i % 2 ? "255,212,222" : "212,230,255";
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, `rgba(${tint},.24)`);
      gr.addColorStop(1, `rgba(${tint},0)`);
      g.fillStyle = gr;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }

    // Patches of colour. Behind the head their edges follow the scales, scalloped like a real koi's.
    const scales = scaleGrid();
    const patch = (color, shape) => {
      g.fillStyle = color;
      g.filter = "blur(2.5px)";
      shape.path(g, 0.97);
      g.fill();
      g.filter = "blur(0.6px)";
      for (const s of scales) {
        if (!shape.has(s.x, s.y)) continue;
        g.beginPath();
        g.ellipse(s.x + s.rx * 0.25, s.y, s.rx * 0.9, s.ry * 0.85, 0, 0, TAU);
        g.fill();
      }
      g.filter = "none";
    };
    if (v.saddle) patch(v.saddle, blob(bx(0.58), MID, 0.34 * K, WIDTH * K * 0.74));
    for (const spot of v.spots) {
      for (let i = 0; i < (spot.count ?? 1); i++) {
        const size = spot.size ?? 1;
        const b = 0.14 + ((i + rand(0.15, 0.85)) / (spot.count ?? 1)) * 0.7;
        const rx = rand(0.08, 0.13) * K * size;
        const ry = rand(0.1, 0.16) * K * size;
        patch(spot.color, blob(bx(b), MID + rand(-0.4, 0.4) * halfWidth(b) * K, rx, ry, rand(-0.4, 0.4)));
      }
    }
    if (v.head) patch(v.head, blob(bx(0.09), MID, 0.18 * K, WIDTH * K * 0.95));
    if (v.cap) patch(v.cap, blob(bx(0.12), MID, 0.085 * K, 0.07 * K));
    if (v.dot) patch(v.dot, blob(bx(0.1), MID, 0.048 * K, 0.046 * K));

    // Scales: a relief map (darker where each tucks under the one ahead, bright at its free edge),
    // and a rim of thin-film colour along each edge.
    const relief = layer(TEX_W, BAND);
    relief.fillStyle = "rgb(128,128,128)";
    relief.fillRect(0, 0, TEX_W, BAND);
    const rims = layer(TEX_W, BAND);
    const drift = rand(0, 5);
    const grey = (level, shine) => {
      const c = Math.round(128 + (level - 128) * shine);
      return `rgb(${c},${c},${c})`;
    };
    for (const s of scales) {
      relief.save();
      relief.translate(s.x, s.y);
      relief.scale(s.rx, s.ry);
      // Lit from the free edge at the back; the front is tucked under the scale ahead.
      const gr = relief.createRadialGradient(-0.9, 0, 0, -0.9, 0, 1.9);
      gr.addColorStop(0, grey(92, s.shine));
      gr.addColorStop(0.6, grey(122, s.shine));
      gr.addColorStop(0.88, grey(190, s.shine));
      gr.addColorStop(1, grey(150, s.shine));
      relief.fillStyle = gr;
      relief.beginPath();
      relief.arc(0, 0, 1, 0, TAU);
      relief.fill();
      relief.restore();

      rims.globalCompositeOperation = "destination-out";
      rims.beginPath();
      rims.ellipse(s.x, s.y, s.rx, s.ry, 0, 0, TAU);
      rims.fill();
      rims.globalCompositeOperation = "source-over";
      rims.strokeStyle = `rgba(${film(drift + s.x / 260 + s.y / 110)},${(0.95 * s.shine).toFixed(2)})`;
      rims.lineWidth = clamp(Math.min(s.rx, s.ry) * 0.26, 1.5, 4.5);
      rims.beginPath();
      rims.ellipse(s.x, s.y, s.rx * 0.88, s.ry * 0.88, 0, -0.95, 0.95);
      rims.stroke();
      // Now and then a scale catches the sun outright.
      if (Math.random() < 0.12 * v.sheen) {
        rims.fillStyle = `rgba(255,255,255,${(0.55 * s.shine).toFixed(2)})`;
        rims.beginPath();
        rims.ellipse(s.x + s.rx * 0.35, s.y, s.rx * 0.45, s.ry * 0.5, 0, 0, TAU);
        rims.fill();
      }
    }
    g.globalCompositeOperation = "hard-light";
    g.globalAlpha = 0.45 + 0.5 * v.sheen;
    g.drawImage(relief.canvas, 0, 0);
    g.globalCompositeOperation = "source-over";
    g.globalAlpha = 0.2 + 0.45 * v.sheen;
    g.filter = "blur(0.7px)";
    g.drawImage(rims.canvas, 0, 0);
    g.globalAlpha = 1;

    // Roundness: the flanks fall away into shade and the spine catches the light.
    g.globalCompositeOperation = "multiply";
    g.filter = `blur(${(0.035 * K).toFixed(1)}px)`;
    g.strokeStyle = `rgb(${v.shade})`;
    g.lineWidth = 0.08 * K;
    outline();
    g.stroke();
    g.globalCompositeOperation = "screen";
    g.filter = `blur(${(0.028 * K).toFixed(1)}px)`;
    g.strokeStyle = "rgba(255,255,255,.4)";
    g.lineWidth = 0.05 * K;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(bx(0.06), MID);
    g.lineTo(bx(0.82), MID);
    g.stroke();

    // Gill covers.
    g.globalCompositeOperation = "multiply";
    g.filter = "blur(3px)";
    g.strokeStyle = `rgb(${v.shade})`;
    g.lineWidth = 5;
    for (const side of [-1, 1]) {
      g.beginPath();
      g.moveTo(bx(0.17), MID + side * halfWidth(0.17) * K * 0.6);
      g.quadraticCurveTo(bx(0.215), MID + side * halfWidth(0.2) * K * 0.82, bx(0.215), MID + side * halfWidth(0.215) * K * 1.02);
      g.stroke();
    }
    g.globalCompositeOperation = "source-over";

    // The folded dorsal fin, a pale ridge down the back.
    g.filter = "blur(1.2px)";
    g.strokeStyle = "rgba(255,255,255,.26)";
    g.lineWidth = 7;
    g.beginPath();
    g.moveTo(bx(0.36), MID);
    g.lineTo(bx(0.7), MID);
    g.stroke();

    // Lips, nostrils and eyes.
    g.filter = "blur(4px)";
    g.fillStyle = "rgba(255,150,160,.35)";
    g.beginPath();
    g.ellipse(bx(0.01), MID, 0.03 * K, 0.06 * K, 0, 0, TAU);
    g.fill();
    g.filter = "none";
    for (const side of [-1, 1]) {
      g.fillStyle = "rgba(90,52,52,.4)";
      g.beginPath();
      g.ellipse(bx(0.045), MID + side * halfWidth(0.045) * K * 0.45, 3.5, 2.5, 0, 0, TAU);
      g.fill();
      const ex = bx(0.1);
      const ey = MID + side * halfWidth(0.1) * K * 0.8;
      const er = 0.017 * K;
      g.filter = "blur(3px)";
      g.fillStyle = "rgba(110,70,70,.28)";
      g.beginPath();
      g.arc(ex, ey, er * 1.5, 0, TAU);
      g.fill();
      g.filter = "none";
      g.fillStyle = v.eye;
      g.beginPath();
      g.arc(ex, ey, er, 0, TAU);
      g.fill();
      g.fillStyle = "#15100E";
      g.beginPath();
      g.arc(ex, ey, er * 0.78, 0, TAU);
      g.fill();
      g.fillStyle = "rgba(255,255,255,.95)";
      g.beginPath();
      g.arc(ex - er * 0.28, ey - side * er * 0.25, er * 0.3, 0, TAU);
      g.fill();
    }
    g.restore();

    // Whiskers.
    g.strokeStyle = "rgba(244,206,196,.75)";
    g.lineWidth = 3;
    g.lineCap = "round";
    for (const side of [-1, 1]) {
      g.beginPath();
      g.moveTo(bx(0.03), MID + side * halfWidth(0.03) * K * 0.8);
      g.quadraticCurveTo(bx(0) - 4, MID + side * 0.045 * K, bx(0) - 0.022 * K, MID + side * 0.058 * K);
      g.stroke();
    }
    return g.canvas;
  }

  /** A translucent membrane: body colour at the root fading to pearl, a rainbow film, fine rays and a soft bright rim. */
  function membrane(g, v, path, reach, rays) {
    path();
    const m = g.createRadialGradient(0, 0, 0, 0, 0, reach);
    m.addColorStop(0, `rgba(${v.fin},.78)`);
    m.addColorStop(0.25, `rgba(${v.fin},.44)`);
    m.addColorStop(0.6, "rgba(255,255,255,.27)");
    m.addColorStop(1, "rgba(255,255,255,.17)");
    g.fillStyle = m;
    g.fill();
    g.globalCompositeOperation = "source-atop";
    const f = g.createRadialGradient(0, 0, 0, 0, 0, reach);
    filmStops(f, 0.4, 0.26);
    g.fillStyle = f;
    g.fillRect(-reach, -reach, reach * 2, reach * 2);
    rays();
    g.filter = "blur(3px)";
    g.strokeStyle = "rgba(255,255,255,.36)";
    g.lineWidth = 7;
    path();
    g.stroke();
    g.filter = "none";
    g.globalCompositeOperation = "source-over";
  }

  /** The tail: a long, broad veil that forks softly, its trailing edge rippling between the rays. */
  function paintTail(atlas, v) {
    const g = layer(TEX_W, BAND);
    // Points in body lengths: x along the koi (1 is the root of the tail), y across, measured from the root.
    const x0 = 0.95;
    const tipU = { x: 1.56, y: -0.3 };
    const tipD = { x: 1.6, y: 0.27 };
    const fork = { x: 1.34, y: 0.02 };
    const w1 = rand(0, TAU);
    const w2 = rand(0, TAU);
    const pts = [{ x: x0, y: -0.02 }];
    for (let i = 1; i < 9; i++) pts.push({ x: x0 + (tipU.x - x0) * (i / 9), y: -0.02 + (tipU.y + 0.02) * (i / 9) ** 0.55 });
    const trail = [tipU];
    for (let i = 1; i < 14; i++) {
      const u = i / 14;
      const [a, b, f] = u < 0.5 ? [tipU, fork, u * 2] : [fork, tipD, (u - 0.5) * 2];
      trail.push({
        x: a.x + (b.x - a.x) * f + 0.08 * Math.sin(f * Math.PI) + 0.012 * Math.sin(u * 19 + w1) + 0.008 * Math.sin(u * 31 + w2),
        y: a.y + (b.y - a.y) * f,
      });
    }
    trail.push(tipD);
    pts.push(...trail);
    for (let i = 8; i > 0; i--) pts.push({ x: x0 + (tipD.x - x0) * (i / 9), y: 0.02 + (tipD.y - 0.02) * (i / 9) ** 0.55 });
    pts.push({ x: x0, y: 0.02 });
    const at = (p) => ({ x: (p.x - x0) * BODY * K, y: p.y * K });
    const outline = pts.map(at);
    g.save();
    g.translate(bx(x0), MID);
    membrane(g, v, () => smoothPath(g, outline), (tipD.x - x0) * K, () => {
      g.strokeStyle = "rgba(255,255,255,.45)";
      g.lineWidth = 2.4;
      trail.forEach((e, i) => {
        const end = at(e);
        g.beginPath();
        g.moveTo(0, (-0.016 + (i / (trail.length - 1)) * 0.032) * K);
        g.quadraticCurveTo(end.x * 0.5, end.y * 0.38, end.x * 0.985, end.y * 0.985);
        g.stroke();
      });
    });
    g.restore();
    atlas.drawImage(g.canvas, 0, 0);
  }

  /** A side fin from its outline: sheer, rayed, with a brighter leading ray. */
  function paintBlade(atlas, v, f, shape) {
    const g = layer();
    const pts = shape.map(([x, y]) => ({ x: x * K, y: y * K * (y > 0 ? rand(0.9, 1.08) : 1) }));
    g.save();
    g.translate(f.x, f.y);
    membrane(g, v, () => smoothPath(g, pts), f.len, () => {
      pts.slice(1, -1).forEach((e, i) => {
        g.strokeStyle = i === 0 ? "rgba(255,255,255,.75)" : "rgba(255,255,255,.5)";
        g.lineWidth = i === 0 ? 4 : 2;
        g.beginPath();
        g.moveTo(0, 0);
        g.quadraticCurveTo(e.x * 0.5, e.y * 0.6, e.x * 0.97, e.y * 0.97);
        g.stroke();
      });
    });
    g.restore();
    atlas.drawImage(g.canvas, 0, 0);
  }

  /** One koi seen from above, nose to the left: body and tail across the top of the atlas, fins below. */
  function paintKoi(v) {
    const atlas = layer();
    paintTail(atlas, v);
    atlas.drawImage(paintBody(v), 0, 0);
    paintBlade(atlas, v, PEC, PEC_SHAPE);
    paintBlade(atlas, v, PEL, PEL_SHAPE);
    return atlas.canvas;
  }

  // =====================================================================
  // 6. SURFACE: lily pads, lotuses, petals and water beads
  // =====================================================================

  function padSprite(r, dpr, leaves, withDrops) {
    const size = Math.ceil(r * 2.2);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = Math.ceil(size * dpr);
    const g = canvas.getContext("2d");
    g.scale(dpr, dpr);
    g.translate(size / 2, size / 2);
    const leaf = leaves[Math.floor(Math.random() * leaves.length)];
    const notch = rand(0.07, 0.12);
    const s1 = rand(0, TAU);
    const s2 = rand(0, TAU);
    const edge = (a) => r * (1 + 0.012 * Math.sin(a * 6 + s1) + 0.008 * Math.sin(a * 11 + s2));
    const outline = (scale = 1) => {
      g.beginPath();
      g.moveTo(r * 0.03, 0);
      for (let a = notch; a <= TAU - notch + 1e-6; a += 0.03) g.lineTo(Math.cos(a) * edge(a) * scale, Math.sin(a) * edge(a) * scale);
      g.closePath();
    };

    g.fillStyle = leaf.base;
    outline();
    g.fill();
    g.save();
    outline();
    g.clip();

    // Soft, painterly mottling rather than one smooth gradient.
    for (let i = 0; i < 28; i++) {
      const a = rand(0, TAU);
      const d = rand(0, 0.9) * r;
      const br = rand(0.15, 0.42) * r;
      const x = Math.cos(a) * d;
      const y = Math.sin(a) * d;
      const tone = i % 3 === 0 ? leaf.dark : leaf.light;
      const gr = g.createRadialGradient(x, y, 0, x, y, br);
      gr.addColorStop(0, `rgba(${tone},${rand(0.1, 0.2).toFixed(2)})`);
      gr.addColorStop(1, `rgba(${tone},0)`);
      g.fillStyle = gr;
      g.fillRect(x - br, y - br, br * 2, br * 2);
    }
    const glow = g.createRadialGradient(0, 0, 0, 0, 0, r * 0.75);
    glow.addColorStop(0, `rgba(${leaf.light},.4)`);
    glow.addColorStop(1, `rgba(${leaf.light},0)`);
    g.fillStyle = glow;
    g.fillRect(-r, -r, r * 2, r * 2);

    // Veins from the middle, the leaf faintly faceted between them.
    const veins = Math.round(rand(17, 23));
    const angles = Array.from({ length: veins }, (_, i) => notch + 0.1 + ((i + (i && i < veins - 1 ? rand(-0.25, 0.25) : 0)) / (veins - 1)) * (TAU - notch * 2 - 0.2));
    angles.forEach((a, i) => {
      if (i === veins - 1) return;
      g.fillStyle = i % 2 ? "rgba(255,255,255,.018)" : "rgba(0,40,0,.018)";
      g.beginPath();
      g.moveTo(0, 0);
      g.arc(0, 0, r * 1.1, a, angles[i + 1]);
      g.closePath();
      g.fill();
    });
    g.filter = `blur(${(r * 0.004).toFixed(2)}px)`;
    for (const a of angles) {
      const end = edge(a) * rand(0.86, 0.94);
      const bend = rand(-0.1, 0.1);
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const w0 = r * 0.011;
      const w1 = r * 0.002;
      const mx = Math.cos(a + bend) * end * 0.5;
      const my = Math.sin(a + bend) * end * 0.5;
      g.fillStyle = `rgba(${leaf.vein},${rand(0.22, 0.36).toFixed(2)})`;
      g.beginPath();
      g.moveTo(-sa * w0, ca * w0);
      g.quadraticCurveTo(mx - sa * w0 * 0.6, my + ca * w0 * 0.6, ca * end - sa * w1, sa * end + ca * w1);
      g.lineTo(ca * end + sa * w1, sa * end - ca * w1);
      g.quadraticCurveTo(mx + sa * w0 * 0.6, my - ca * w0 * 0.6, sa * w0, -ca * w0);
      g.closePath();
      g.fill();
      g.strokeStyle = `rgba(${leaf.vein},.18)`;
      g.lineWidth = r * 0.004;
      const fork = rand(0.55, 0.75);
      for (const side of [-1, 1]) {
        const spread = rand(0.04, 0.08);
        g.beginPath();
        g.moveTo(ca * end * fork, sa * end * fork);
        g.quadraticCurveTo(
          Math.cos(a + side * spread * 0.4) * end * 0.9, Math.sin(a + side * spread * 0.4) * end * 0.9,
          Math.cos(a + side * spread) * end * 1.04, Math.sin(a + side * spread) * end * 1.04,
        );
        g.stroke();
      }
    }
    g.fillStyle = `rgba(${leaf.vein},.6)`;
    g.beginPath();
    g.arc(0, 0, r * 0.025, 0, TAU);
    g.fill();

    // The rim curls up a little: a touch darker just inside, with a lighter lip.
    g.filter = `blur(${(r * 0.035).toFixed(1)}px)`;
    g.strokeStyle = `rgba(${leaf.dark},.3)`;
    g.lineWidth = r * 0.07;
    outline();
    g.stroke();
    g.filter = `blur(${(r * 0.01).toFixed(1)}px)`;
    g.strokeStyle = `rgba(${leaf.light},.32)`;
    g.lineWidth = r * 0.02;
    outline(0.975);
    g.stroke();
    g.restore();

    const drops = [];
    const count = withDrops ? Math.floor(rand(2, 6)) : 0;
    for (let i = 0; i < count; i++) {
      const a = rand(notch + 0.4, TAU - notch - 0.4);
      const d = rand(0.18, 0.78);
      const s = r * rand(0.05, 0.1);
      drops.push({ a, d, s });
      // Some big beads keep a few tiny ones company.
      if (Math.random() < 0.5) {
        for (let j = 0; j < Math.floor(rand(1, 4)); j++) {
          drops.push({ a: a + rand(-0.25, 0.25), d: clamp(d + rand(-0.12, 0.12), 0.12, 0.85), s: r * rand(0.018, 0.032) });
        }
      }
    }
    return { sprite: canvas, drops };
  }

  /** A lotus seen from above: rings of petals around a soft golden centre. */
  function paintLotus(R, dpr, c) {
    const size = Math.ceil(R * 2.3);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = Math.ceil(size * dpr);
    const g = canvas.getContext("2d");
    g.scale(dpr, dpr);
    g.translate(size / 2, size / 2);
    const line = rgbList(mix(c.tip, "#000000", 0.12));
    // Outer ring first, so each ring further in sits on top: [petals, length, width, offset].
    const rings = [
      [11, 1, 0.36, 0],
      [9, 0.8, 0.34, 0.5],
      [7, 0.58, 0.32, 0.25],
      [6, 0.4, 0.3, 0.7],
    ];
    rings.forEach(([count, length, width, offset], ring) => {
      for (let i = 0; i < count; i++) {
        const L = R * length * rand(0.92, 1.05);
        const W = L * width;
        const petal = new Path2D(`M0 0C${L * 0.25} ${-W * 0.9} ${L * 0.75} ${-W * 0.85} ${L} 0C${L * 0.75} ${W * 0.85} ${L * 0.25} ${W * 0.9} 0 0Z`);
        g.save();
        g.rotate(((i + offset) / count) * TAU + rand(-0.09, 0.09));
        const fill = g.createLinearGradient(0, 0, L, 0);
        fill.addColorStop(0, c.petal);
        fill.addColorStop(ring < 2 ? 0.55 : 0.7, c.blush);
        fill.addColorStop(1, ring < 3 ? c.tip : c.blush);
        g.fillStyle = fill;
        g.fill(petal);
        g.strokeStyle = `rgba(${line},.25)`;
        g.lineWidth = R * 0.008;
        g.stroke(petal);
        g.strokeStyle = "rgba(255,255,255,.45)";
        g.lineWidth = R * 0.012;
        g.beginPath();
        g.moveTo(L * 0.08, 0);
        g.quadraticCurveTo(L * 0.5, -W * 0.08, L * 0.9, 0);
        g.stroke();
        g.restore();
      }
    });
    g.fillStyle = c.centre;
    g.beginPath();
    g.arc(0, 0, R * 0.2, 0, TAU);
    g.fill();
    g.fillStyle = c.stamens;
    for (let i = 0; i < 18; i++) {
      g.beginPath();
      g.arc(Math.cos((i / 18) * TAU) * R * 0.2, Math.sin((i / 18) * TAU) * R * 0.2, R * 0.03, 0, TAU);
      g.fill();
    }
    g.fillStyle = c.pod;
    g.beginPath();
    g.arc(0, 0, R * 0.12, 0, TAU);
    g.fill();
    g.fillStyle = c.seeds;
    for (let i = 0; i < 6; i++) {
      g.beginPath();
      g.arc(Math.cos((i / 6) * TAU) * R * 0.06, Math.sin((i / 6) * TAU) * R * 0.06, R * 0.014, 0, TAU);
      g.fill();
    }
    return canvas;
  }

  const PETAL = 64;
  const PETAL_S = PETAL * 0.3;

  /** A single fallen petal, notched at its tip. */
  function paintPetal(p) {
    const g = layer(PETAL, PETAL);
    const s = PETAL_S;
    g.translate(PETAL / 2, PETAL / 2);
    const shape = new Path2D(`M0 ${s}C${-s * 0.9} ${s * 0.4} ${-s * 0.7} ${-s * 0.7} ${-s * 0.18} ${-s * 0.9}L0 ${-s * 0.62}L${s * 0.18} ${-s * 0.9}C${s * 0.7} ${-s * 0.7} ${s * 0.9} ${s * 0.4} 0 ${s}Z`);
    const fill = g.createLinearGradient(0, s, 0, -s);
    fill.addColorStop(0, p.colors[0]);
    fill.addColorStop(1, p.colors[1] || p.colors[0]);
    g.fillStyle = fill;
    g.fill(shape);
    g.strokeStyle = `rgba(${rgbList(p.vein || mix(p.colors[0], "#000000", 0.12))},.6)`;
    g.lineWidth = s * 0.06;
    g.beginPath();
    g.moveTo(0, s * 0.8);
    g.quadraticCurveTo(s * 0.1, 0, 0, -s * 0.5);
    g.stroke();
    return g.canvas;
  }

  /** A soft round glow in a link koi's colour, stretched along its koi. */
  function paintGlow(tint) {
    const g = layer(64, 64);
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, `rgba(${tint},1)`);
    gr.addColorStop(0.45, `rgba(${tint},0.45)`);
    gr.addColorStop(1, `rgba(${tint},0)`);
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    return g.canvas;
  }

  const DROP = 128;
  const DROP_R = 40;

  /** A bead of water lit from the top left: a glossy highlight, light gathered on the far side, a soft shadow. */
  function paintDrop() {
    const g = layer(DROP, DROP);
    const R = DROP_R;
    g.translate(DROP / 2, DROP / 2);
    g.filter = `blur(${R * 0.14}px)`;
    g.fillStyle = "rgba(10,36,20,.45)";
    g.beginPath();
    g.ellipse(R * 0.2, R * 0.28, R, R * 0.96, 0, 0, TAU);
    g.fill();
    g.filter = "none";
    const body = g.createRadialGradient(R * 0.22, R * 0.3, 0, 0, 0, R);
    body.addColorStop(0, "rgba(214,240,200,.6)");
    body.addColorStop(0.45, "rgba(150,196,140,.22)");
    body.addColorStop(0.85, "rgba(60,104,62,.2)");
    body.addColorStop(1, "rgba(26,56,34,.55)");
    g.fillStyle = body;
    g.beginPath();
    g.arc(0, 0, R, 0, TAU);
    g.fill();
    g.strokeStyle = "rgba(255,255,255,.55)";
    g.lineWidth = R * 0.08;
    g.lineCap = "round";
    g.beginPath();
    g.arc(0, 0, R * 0.8, 0.3, 1.35);
    g.stroke();
    g.save();
    g.translate(-R * 0.36, -R * 0.4);
    g.rotate(-0.7);
    g.fillStyle = "rgba(255,255,255,.96)";
    g.beginPath();
    g.ellipse(0, 0, R * 0.3, R * 0.17, 0, 0, TAU);
    g.fill();
    g.restore();
    g.fillStyle = "rgba(255,255,255,.85)";
    g.beginPath();
    g.arc(-R * 0.02, -R * 0.58, R * 0.07, 0, TAU);
    g.fill();
    return g.canvas;
  }

  // =====================================================================
  // 7. POND FLOOR
  // =====================================================================

  /** The pond floor as light and dark around mid grey: silt, soft stones and grain. The water shader tints it. */
  function paintFloor(ctx, w, h) {
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < (w * h) / 6000; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = rand(40, 200);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      const tone = i % 2 ? "190,190,190" : "40,40,40";
      g.addColorStop(0, `rgba(${tone},${rand(0.06, 0.16).toFixed(2)})`);
      g.addColorStop(1, `rgba(${tone},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    for (let i = 0; i < (w * h) / 7000; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const rx = rand(3, 12);
      const ry = rx * rand(0.55, 0.85);
      const rot = Math.random() * Math.PI;
      ctx.filter = "blur(2px)";
      ctx.fillStyle = "rgba(20,20,20,.3)";
      ctx.beginPath();
      ctx.ellipse(x + 1.5, y + 2, rx, ry, rot, 0, TAU);
      ctx.fill();
      ctx.filter = "none";
      const g = ctx.createLinearGradient(x - rx, y - ry, x + rx, y + ry);
      g.addColorStop(0, "rgba(176,176,176,.75)");
      g.addColorStop(1, "rgba(92,92,92,.8)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, rot, 0, TAU);
      ctx.fill();
    }
    for (let i = 0; i < (w * h) / 60; i++) {
      ctx.fillStyle = i % 2 ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.05)";
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
  }

  // =====================================================================
  // 8. WATER (WebGL)
  // Two passes each frame: the koi are drawn into a layer of their own (MESH_*), then the WATER
  // shader draws the floor, light, koi, reflections and surface over the whole pond.
  // The u... values are filled in from your settings (see `applyLook` in section 10).
  // =====================================================================

  /** How many reflections `water.glows` can hold. */
  const MAX_GLOWS = 6;

  const QUAD_VERTEX = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

  const WATER = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uFloor;
uniform sampler2D uFish;
uniform sampler2D uShadow;
uniform highp sampler2D uHeight;
uniform vec2 uSim;
uniform vec2 uView;
uniform float uTime;
// From your settings.
uniform vec3 uMiddle;
uniform vec3 uEdges;
uniform vec3 uHaze;
uniform float uHazeAmount;
uniform vec3 uLight;
uniform float uLightAmount;
uniform vec3 uGlowColor;
uniform float uGlowAmount;
uniform vec4 uGlows[${MAX_GLOWS}];
uniform vec3 uSheen;
uniform float uSheenAmount;
uniform vec3 uSparkle;
uniform float uSparkleAmount;
uniform float uSwell;
uniform float uBend;

float height(vec2 uv) {
  vec2 p = clamp(uv, 0.0, 1.0) * uSim - 0.5;
  ivec2 i = ivec2(floor(p));
  vec2 f = fract(p);
  ivec2 m = ivec2(uSim) - 1;
  float a = texelFetch(uHeight, clamp(i, ivec2(0), m), 0).r;
  float b = texelFetch(uHeight, clamp(i + ivec2(1, 0), ivec2(0), m), 0).r;
  float c = texelFetch(uHeight, clamp(i + ivec2(0, 1), ivec2(0), m), 0).r;
  float d = texelFetch(uHeight, clamp(i + ivec2(1, 1), ivec2(0), m), 0).r;
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash2(i).x, hash2(i + vec2(1.0, 0.0)).x, f.x), mix(hash2(i + vec2(0.0, 1.0)).x, hash2(i + vec2(1.0)).x, f.x), f.y);
}

// Distance to the nearest edge of a slowly drifting cell pattern.
float edges(vec2 p, float t) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float d1 = 9.0;
  float d2 = 9.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y));
      vec2 h = hash2(i + o);
      vec2 r = o + 0.5 + 0.4 * sin(t * (0.6 + 0.6 * h) + 6.2831 * h) - f;
      float d = dot(r, r);
      if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) { d2 = d; }
    }
  }
  return sqrt(d2) - sqrt(d1);
}

// Sunlight focused by the moving surface into a wandering net of soft, bright threads.
float caustics(vec2 p, float t) {
  vec2 w = vec2(noise(p * 1.8 + vec2(t * 0.2, 0.0)), noise(p * 1.8 + vec2(5.2, -t * 0.17)));
  p += (w - 0.5) * 0.55;
  float e = edges(p, t);
  float thread = exp(-e * e * 420.0);
  float pool = exp(-e * 6.0) * 0.3;
  return (thread + pool) * (0.4 + 0.8 * noise(p * 0.9 - t * 0.1));
}

// A gentle swell across the whole pond; returns the slope of the surface.
vec2 swell(vec2 p, float t) {
  vec2 s = vec2(0.0);
  vec2 k = vec2(0.042, 0.017);
  s += k * cos(dot(k, p) - t * 1.1) * 0.6;
  k = vec2(-0.021, 0.051);
  s += k * cos(dot(k, p) - t * 1.4 + 1.3) * 0.5;
  k = vec2(0.071, -0.047);
  s += k * cos(dot(k, p) - t * 1.9 + 2.1) * 0.25;
  k = vec2(-0.11, -0.083);
  s += k * cos(dot(k, p) - t * 2.6 + 0.7) * 0.12;
  return s;
}

// A soft round glow, for reflections.
float glow(vec2 q, vec2 c, float r) {
  vec2 d = (q - c) / r;
  return exp(-dot(d, d) * 2.5);
}

void main() {
  vec2 p = vUv * uView;
  vec2 px = 1.0 / uView;
  vec2 cell = 1.0 / uSim;
  // Ripples, measured over a couple of cells so a koi's wake bends things smoothly rather than in specks.
  vec2 g = vec2(
    height(vUv + vec2(cell.x, 0.0) * 2.0) - height(vUv - vec2(cell.x, 0.0) * 2.0),
    height(vUv + vec2(0.0, cell.y) * 2.0) - height(vUv - vec2(0.0, cell.y) * 2.0)
  ) * 0.5;
  vec2 wave = swell(p, uTime) * uSwell;
  vec2 slope = g * 0.01 * uBend + wave;
  vec2 floorUv = vUv + slope * 90.0 * px;
  vec2 fishUv = vUv + (g * 0.004 * uBend + wave) * 55.0 * px;
  float aspect = uView.x / uView.y;

  // The water, a little lighter in the middle and darker toward the banks, with a milky haze.
  float bank = smoothstep(0.3, 0.9, length((vUv - vec2(0.5, 0.46)) * vec2(1.0, 1.25)));
  vec3 water = mix(uMiddle, uEdges, bank);
  float detail = texture(uFloor, floorUv).r;
  float shade = texture(uShadow, floorUv).a;
  vec3 col = water * (0.72 + 0.56 * detail) * (1.0 - shade * 0.5);
  float milk = noise(p / 320.0 + vec2(uTime * 0.012, 0.0)) * noise(p / 180.0 + 7.0 - uTime * 0.008);
  col = mix(col, uHaze, milk * uHazeAmount);
  float light = caustics(floorUv * uView / 170.0, uTime * 0.5);
  col += uLight * light * 0.022 * uLightAmount * (1.0 - shade);

  // The koi, bent by the surface and crossed by the same faint light. Each is already veiled
  // and softened by how deep it swims.
  vec4 fish = texture(uFish, fishUv);
  col = col * (1.0 - fish.a) + fish.rgb * (0.97 + light * 0.1);

  // Light from the sky and the lotuses, wavering with the surface.
  vec2 q = (vUv + slope * 40.0 * px) * vec2(aspect, 1.0);
  float pink = 0.0;
  for (int i = 0; i < ${MAX_GLOWS}; i++) {
    pink += uGlows[i].w * glow(q, vec2(uGlows[i].x * aspect, uGlows[i].y), uGlows[i].z);
  }
  pink *= (0.7 + 0.6 * noise(q * 2.5 + uTime * 0.04)) * uGlowAmount;
  col = mix(col, uGlowColor, clamp(pink, 0.0, 1.0));

  // The surface: ripples catch the light, a faint sheen of sky, and the odd glint.
  vec2 sunward = normalize(vec2(-0.55, -0.85));
  col *= 1.0 + clamp(dot(-g, sunward) * 0.008, -0.12, 0.2);
  float sky = noise((p + slope * 400.0) * vec2(0.0025, 0.006) + vec2(uTime * 0.03, -uTime * 0.01));
  col = mix(col, uSheen, clamp((0.02 + smoothstep(0.55, 0.95, sky) * 0.05) * uSheenAmount, 0.0, 1.0));
  vec3 normal = normalize(vec3(-slope * 2.2, 1.0));
  vec3 sun = normalize(vec3(-0.25, -0.4, 1.0));
  float spec = pow(max(dot(reflect(-sun, normal), vec3(0.0, 0.0, 1.0)), 0.0), 400.0);
  col += uSparkle * spec * 0.7 * uSparkleAmount;
  outColor = vec4(col, 1.0);
}`;

  const MESH_VERTEX = `#version 300 es
in vec2 aPos;
in vec2 aUv;
uniform vec2 uView;
out vec2 vUv;
void main() {
  vUv = aUv;
  gl_Position = vec4(aPos / uView * 2.0 - 1.0, 0.0, 1.0);
}`;

  const MESH_FRAGMENT = `#version 300 es
precision mediump float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uSkin;
uniform float uDepth;
uniform vec3 uTint;
uniform float uSink;
void main() {
  // The deeper a koi swims, the softer it looks and the further it sinks into the water's colour.
  vec4 c = texture(uSkin, vUv, uDepth * 2.2);
  c.rgb = mix(c.rgb, uTint * c.a, clamp((0.08 + uDepth * 0.55) * uSink, 0.0, 1.0));
  outColor = c;
}`;

  const SKIN_UNIT = 4;
  const WATER_SETTINGS = [
    "uMiddle", "uEdges", "uHaze", "uHazeAmount", "uLight", "uLightAmount", "uGlowColor", "uGlowAmount",
    "uGlows", "uSheen", "uSheenAmount", "uSparkle", "uSparkleAmount", "uSwell", "uBend",
  ];

  function setupGl(canvas) {
    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, premultipliedAlpha: false });
    if (!gl) return null;
    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (gl.getShaderParameter(s, gl.COMPILE_STATUS)) return s;
      // Shows up in the browser's console (right click → Inspect → Console) if a shader edit has a typo.
      console.error("Koi Pond: a shader didn't compile.\n" + gl.getShaderInfoLog(s));
      return null;
    };
    const link = (vsrc, fsrc) => {
      const vs = compile(gl.VERTEX_SHADER, vsrc);
      const fs = compile(gl.FRAGMENT_SHADER, fsrc);
      if (!vs || !fs) return null;
      const p = gl.createProgram();
      gl.attachShader(p, vs);
      gl.attachShader(p, fs);
      gl.linkProgram(p);
      return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
    };
    const water = link(QUAD_VERTEX, WATER);
    const mesh = link(MESH_VERTEX, MESH_FRAGMENT);
    if (!water || !mesh) return null;

    const quad = gl.createVertexArray();
    gl.bindVertexArray(quad);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(water, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const strips = gl.createVertexArray();
    gl.bindVertexArray(strips);
    const stripBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, stripBuffer);
    const mPos = gl.getAttribLocation(mesh, "aPos");
    const mUv = gl.getAttribLocation(mesh, "aUv");
    gl.enableVertexAttribArray(mPos);
    gl.vertexAttribPointer(mPos, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(mUv);
    gl.vertexAttribPointer(mUv, 2, gl.FLOAT, false, 16, 8);
    gl.bindVertexArray(null);

    gl.useProgram(mesh);
    gl.uniform1i(gl.getUniformLocation(mesh, "uSkin"), SKIN_UNIT);
    gl.useProgram(water);
    const texture = (unit, name, filter) => {
      const t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1i(gl.getUniformLocation(water, name), unit);
      return t;
    };
    const settings = {};
    for (const name of WATER_SETTINGS) settings[name] = gl.getUniformLocation(water, name);
    return {
      gl,
      water,
      mesh,
      quad,
      strips,
      stripBuffer,
      floor: texture(0, "uFloor", gl.LINEAR),
      fish: texture(1, "uFish", gl.LINEAR),
      shadow: texture(2, "uShadow", gl.LINEAR),
      height: texture(3, "uHeight", gl.NEAREST),
      target: gl.createFramebuffer(),
      uSim: gl.getUniformLocation(water, "uSim"),
      uView: gl.getUniformLocation(water, "uView"),
      uTime: gl.getUniformLocation(water, "uTime"),
      settings,
      uMeshView: gl.getUniformLocation(mesh, "uView"),
      uDepth: gl.getUniformLocation(mesh, "uDepth"),
      uTint: gl.getUniformLocation(mesh, "uTint"),
      uSink: gl.getUniformLocation(mesh, "uSink"),
    };
  }

  function upload(g, unit, tex, source) {
    const { gl } = g;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  }

  /** Sizes the koi layer to the view. */
  function sizeTarget(g, w, h) {
    const { gl } = g;
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, g.fish);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, g.target);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, g.fish, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  function skinTexture(g, canvas) {
    const { gl } = g;
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + SKIN_UNIT);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  // =====================================================================
  // 9. KOI BODIES
  // =====================================================================

  /** The koi's spine this frame, swishing more toward the tail, with its widths and normals. */
  function shapeOf(k, t, wiggle) {
    const c = [];
    const n = [];
    const w = [];
    for (let i = 0; i < SEGMENTS; i++) {
      const a = k.spine[Math.max(0, i - 1)];
      const b = k.spine[Math.min(SEGMENTS - 1, i + 1)];
      const tx = a.x - b.x;
      const ty = a.y - b.y;
      const len = Math.hypot(tx, ty) || 1;
      const nx = -ty / len;
      const ny = tx / len;
      const u = i / (SEGMENTS - 1);
      const swish = Math.sin(t * (k.speed / 8) - i * 0.5 + k.phase) * k.length * 0.03 * wiggle * Math.pow(u, 1.4);
      c.push({ x: k.spine[i].x + nx * swish, y: k.spine[i].y + ny * swish });
      n.push({ x: nx, y: ny });
      w.push(k.length * profile(u));
    }
    const fx = c[0].x - c[1].x;
    const fy = c[0].y - c[1].y;
    const fl = Math.hypot(fx, fy) || 1;
    return { c, n, w, fwd: { x: fx / fl, y: fy / fl } };
  }

  /** The body's silhouette, for its shadow on the floor. */
  function bodyPath(ctx, s, scale = 1, dx = 0, dy = 0) {
    const { c, n, w, fwd } = s;
    const last = SEGMENTS - 1;
    const side = (i, dir) => ({
      x: c[i].x + n[i].x * w[i] * scale * dir + dx,
      y: c[i].y + n[i].y * w[i] * scale * dir + dy,
    });
    const nose = { x: c[0].x + fwd.x * w[0] * 1.15 + dx, y: c[0].y + fwd.y * w[0] * 1.15 + dy };
    ctx.beginPath();
    const l0 = side(0, 1);
    ctx.moveTo(l0.x, l0.y);
    for (let i = 1; i < last; i++) {
      const p = side(i, 1);
      const q = side(i + 1, 1);
      ctx.quadraticCurveTo(p.x, p.y, (p.x + q.x) / 2, (p.y + q.y) / 2);
    }
    ctx.lineTo(c[last].x + dx, c[last].y + dy);
    for (let i = last - 1; i > 0; i--) {
      const p = side(i, -1);
      const q = side(i - 1, -1);
      ctx.quadraticCurveTo(p.x, p.y, (p.x + q.x) / 2, (p.y + q.y) / 2);
    }
    const r0 = side(0, -1);
    ctx.lineTo(r0.x, r0.y);
    ctx.bezierCurveTo(
      r0.x + fwd.x * w[0] * 0.8, r0.y + fwd.y * w[0] * 0.8,
      nose.x - n[0].x * w[0] * scale * 0.7, nose.y - n[0].y * w[0] * scale * 0.7,
      nose.x, nose.y,
    );
    ctx.bezierCurveTo(
      nose.x + n[0].x * w[0] * scale * 0.7, nose.y + n[0].y * w[0] * scale * 0.7,
      l0.x + fwd.x * w[0] * 0.8, l0.y + fwd.y * w[0] * 0.8,
      l0.x, l0.y,
    );
    ctx.closePath();
  }

  /** A point b of the way down the body (0 snout, 1 tail root), with the direction toward the tail and its normal. */
  function along(s, b) {
    const f = clamp((b * BODY - NOSE) * SEGMENTS, 0, SEGMENTS - 1.001);
    const i = Math.floor(f);
    const p = s.c[i];
    const q = s.c[i + 1];
    const tx = q.x - p.x;
    const ty = q.y - p.y;
    const l = Math.hypot(tx, ty) || 1;
    return { x: p.x + tx * (f - i), y: p.y + ty * (f - i), tx: tx / l, ty: ty / l, nx: -ty / l, ny: tx / l };
  }

  // =====================================================================
  // 10. THE POND
  // =====================================================================

  /** Ripples are worked out on a grid of cells this many px across. */
  const CELL = 3;

  /** Settings `update` can change on the fly. Changing any other one re-stocks the pond with new koi and pads. */
  const LIVE = ["water", "ripples", "koi.wiggle", "koi.wander", "koi.dive", "koi.shy", "pads.push", "keepCenterClear", "allowScroll", "navigate"];
  /** Every setting in an object, as paths like "water.glow". */
  const pathsOf = (obj, prefix = "") =>
    Object.keys(obj).flatMap((key) => (isPlain(obj[key]) ? pathsOf(obj[key], prefix + key + ".") : [prefix + key]));

  /**
   * Fills `container` with a koi pond and starts it swimming. Give the element a size (for
   * example `height: 100vh`); anything already inside it stays on top of the water.
   * Returns the pond, with `update(settings)`, `splash(x, y)` and `destroy()`.
   */
  function create(container, settings) {
    if (!container || !container.appendChild) throw new Error("KoiPond.create(element, settings): pass the element the pond should fill.");
    let user = merge({}, settings || {});
    let opts = resolve(user);

    if (getComputedStyle(container).position === "static") container.style.position = "relative";
    container.classList.add("koi-pond");
    const canvasFor = (className, z) => {
      const c = document.createElement("canvas");
      c.className = className;
      c.setAttribute("aria-hidden", "true");
      c.style.cssText = `position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;z-index:${z}`;
      return c;
    };
    let view = canvasFor("koi-pond__water", 0);
    const top = canvasFor("koi-pond__surface", 1);
    container.prepend(view, top);

    const tctx = top.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gfx = setupGl(view);
    if (!gfx) {
      // No WebGL2 here: a plainer pond on a fresh 2D canvas.
      const plain = canvasFor("koi-pond__water", 0);
      view.replaceWith(plain);
      view = plain;
    }
    const flat = gfx ? null : view.getContext("2d");
    const floorCanvas = document.createElement("canvas");
    const shadowCanvas = document.createElement("canvas");
    const shctx = shadowCanvas.getContext("2d");
    const drop = paintDrop();
    let petalSprite = null;
    // Painted skins outlive a resize; koi i keeps skin i while its type is the same.
    const skins = [];

    // Your settings, turned into what the drawing code needs. Rebuilt by `update`.
    let types = [];
    let leaves = [];
    let lotus = null;
    let guides = [];
    let glows = [];
    let captionPos = [];
    let hits = [];
    let captions = [];

    let vw = 1;
    let vh = 1;
    let dpr = 1;
    let simW = 2;
    let simH = 2;
    let current = new Float32Array(4);
    let previous = new Float32Array(4);
    let koi = [];
    let pads = [];
    let petals = [];
    let verts = new Float32Array(4);
    let used = 0;
    const runs = [];
    // Where the pointer is, when it last moved, and how fast it's going (px/s).
    const pointer = { x: -999, y: -999, seen: -10, vx: 0, vy: 0 };
    // Which link koi the pointer or focus is on (it slows down), or -1.
    let hovering = -1;
    let visible = true;

    const disturb = (x, y, radius, strength) => {
      const cx = Math.round(x / CELL);
      const cy = Math.round(y / CELL);
      for (let j = -radius; j <= radius; j++) {
        for (let i = -radius; i <= radius; i++) {
          const px = cx + i;
          const py = cy + j;
          if (px < 1 || py < 1 || px >= simW - 1 || py >= simH - 1 || i * i + j * j > radius * radius) continue;
          current[py * simW + px] += strength;
        }
      }
    };

    /** Sends the water settings to the shaders, and the background and scrolling to the page. */
    const applyLook = () => {
      const w = opts.water;
      container.style.backgroundColor = w.background;
      container.style.touchAction = opts.allowScroll ? "pan-y" : "none";
      if (!gfx) return;
      const { gl, settings: u } = gfx;
      gl.useProgram(gfx.water);
      gl.uniform3fv(u.uMiddle, vec3(w.middle));
      gl.uniform3fv(u.uEdges, vec3(w.edges));
      gl.uniform3fv(u.uHaze, vec3(w.haze));
      gl.uniform1f(u.uHazeAmount, w.hazeAmount);
      gl.uniform3fv(u.uLight, vec3(w.light));
      gl.uniform1f(u.uLightAmount, w.lightAmount);
      gl.uniform3fv(u.uGlowColor, vec3(w.glow));
      gl.uniform1f(u.uGlowAmount, w.glowAmount);
      const spots = new Float32Array(MAX_GLOWS * 4);
      (w.glows || []).slice(0, MAX_GLOWS).forEach((s, i) => {
        spots.set([s.x ?? 0.5, s.y ?? 0.5, Math.max(0.01, s.size ?? 0.3), s.strength ?? 0.15], i * 4);
      });
      for (let i = (w.glows || []).length; i < MAX_GLOWS; i++) spots.set([0.5, 0.5, 1, 0], i * 4);
      gl.uniform4fv(u.uGlows, spots);
      gl.uniform3fv(u.uSheen, vec3(w.sheen));
      gl.uniform1f(u.uSheenAmount, w.sheenAmount);
      gl.uniform3fv(u.uSparkle, vec3(w.sparkle));
      gl.uniform1f(u.uSparkleAmount, w.sparkleAmount);
      gl.uniform1f(u.uSwell, w.swell);
      gl.uniform1f(u.uBend, opts.ripples.bend);
      gl.useProgram(gfx.mesh);
      gl.uniform3fv(gfx.uTint, vec3(w.tint));
      gl.uniform1f(gfx.uSink, w.sink);
    };

    const makeKoi = (guideIndex, i) => {
      const guide = guideIndex >= 0;
      const k = opts.koi;
      const variety = guide ? guides[guideIndex].variety : types[i % types.length];
      const length = clamp(Math.min(vw, vh) * k.size, k.minSize, k.maxSize) * (guide ? 1.05 : rand(0.85, 1.15));
      const heading = rand(0, TAU);
      const head = guide
        ? { x: vw * (guides[guideIndex].homeX + rand(-0.06, 0.06)), y: vh * (guides[guideIndex].homeY - 0.04) }
        : { x: vw * rand(0.15, 0.85), y: vh * rand(0.15, 0.85) };
      const seg = length / SEGMENTS;
      return {
        spine: Array.from({ length: SEGMENTS }, (_, s) => ({ x: head.x - Math.cos(heading) * seg * s, y: head.y - Math.sin(heading) * seg * s })),
        heading,
        turn: 0,
        // Link koi swim a touch slower than most, so their captions are easy to catch.
        speed: guide ? k.speed[0] + (k.speed[1] - k.speed[0]) * 0.4 : rand(k.speed[0], k.speed[1]),
        length,
        variety,
        skin: null,
        phase: rand(0, TAU),
        guide,
        guideIndex,
        // Its full length; it looks a little smaller the deeper it swims.
        size: length,
        // 0 just under the surface, 1 down in the deep. Each koi drifts slowly between the two.
        depth: 0.5,
        // Every koi rises and sinks over half a minute or so; the link koi, whose captions follow
        // them, keep to the upper water so they're always easy to see.
        dive: { mid: guide ? 0.2 : 0.5, reach: guide ? 0.25 : 0.6, rate: TAU / rand(30, 55), phase: rand(0, TAU) },
        wakeAt: 0,
      };
    };

    /** Paints at most one missing skin a frame, so the first frame isn't held up. */
    const dress = () => {
      const i = koi.findIndex((k) => !k.skin);
      if (i < 0) return;
      const k = koi[i];
      const old = skins[i];
      if (old && old.texture && gfx) gfx.gl.deleteTexture(old.texture);
      const canvas = paintKoi(k.variety);
      k.skin = skins[i] = { variety: k.variety, canvas, texture: gfx ? skinTexture(gfx, canvas) : null };
    };

    const spawn = () => {
      const small = vw < 700;
      const k = opts.koi;
      koi = [...guides.map((_, g) => makeKoi(g, 0)), ...Array.from({ length: Math.max(0, small ? k.countOnPhones : k.count) }, (_, i) => makeKoi(-1, i))];
      koi.forEach((fish, i) => {
        if (skins[i] && skins[i].variety === fish.variety) fish.skin = skins[i];
      });
      for (let i = koi.length; i < skins.length; i++) if (skins[i] && skins[i].texture && gfx) gfx.gl.deleteTexture(skins[i].texture);
      skins.length = Math.min(skins.length, koi.length);
      verts = new Float32Array(Math.max(1, koi.length) * 400 * 4);

      const p = opts.pads;
      const count = small ? p.countOnPhones : p.count;
      const [r0, r1] = small ? p.sizeOnPhones : p.size;
      pads = [];
      for (let tries = 0; tries < count * 8 && pads.length < count; tries++) {
        const r = rand(r0, r1);
        const x = rand(0, vw);
        const y = rand(0, vh);
        if (opts.keepCenterClear && Math.abs(x - vw / 2) < vw * 0.3 && Math.abs(y - vh * 0.45) < vh * 0.2) continue;
        if (pads.some((o) => Math.hypot(o.x - x, o.y - y) < o.r + r + 8)) continue;
        const { sprite, drops } = padSprite(r, dpr, leaves, p.drops);
        // Some pads have a lotus resting against them.
        const withLotus = p.lotusEvery > 0 && pads.length % p.lotusEvery === 0;
        const flower = withLotus ? { a: rand(0, TAU), d: rand(0.75, 0.95), r: r * rand(0.55, 0.68), turn: rand(0, TAU), sprite: paintLotus(r * 0.68, dpr, lotus) } : null;
        pads.push({ x, y, r, rot: rand(0, TAU), spin: rand(-0.03, 0.03), vx: rand(-3, 3) * p.drift, vy: rand(-2, 2) * p.drift, sprite, drops, lotus: flower });
      }
      const f = opts.petals;
      petals = Array.from({ length: Math.max(0, small ? f.countOnPhones : f.count) }, () => ({
        x: rand(0, vw),
        y: rand(0, vh),
        rot: rand(0, TAU),
        spin: rand(-0.15, 0.15),
        vx: rand(-4, 4),
        vy: rand(-3, 3),
        s: rand(f.size[0], f.size[1]),
      }));
    };

    const resize = () => {
      // The pond's own size, which on phones can change as the address bar comes and goes.
      vw = Math.max(1, container.clientWidth);
      vh = Math.max(1, container.clientHeight);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const glScale = Math.min(1.5, window.devicePixelRatio || 1);
      view.width = Math.round(vw * glScale);
      view.height = Math.round(vh * glScale);
      floorCanvas.width = vw;
      floorCanvas.height = vh;
      shadowCanvas.width = Math.ceil(vw / 4);
      shadowCanvas.height = Math.ceil(vh / 4);
      simW = Math.max(3, Math.ceil(vw / CELL));
      simH = Math.max(3, Math.ceil(vh / CELL));
      current = new Float32Array(simW * simH);
      previous = new Float32Array(simW * simH);
      top.width = Math.round(vw * dpr);
      top.height = Math.round(vh * dpr);
      tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintFloor(floorCanvas.getContext("2d"), vw, vh);
      if (gfx) {
        upload(gfx, 0, gfx.floor, floorCanvas);
        sizeTarget(gfx, view.width, view.height);
      }
      spawn();
    };

    const swim = (k, dt, t) => {
      const head = k.spine[0];
      const o = opts.koi;
      // Rising and sinking: lingering a while at the top and the bottom, and a little smaller when deep.
      // This runs on the swim clock, so a koi never jumps between depths after the tab has been away.
      const { mid, reach, rate, phase } = k.dive;
      k.depth = o.dive ? clamp(mid + reach * Math.sin(clock * rate + phase) + 0.12 * Math.sin(clock * rate * 2.3 + phase * 1.7), 0, 1) : k.guide ? 0.15 : 0.3;
      k.length = k.size * (1 - 0.22 * k.depth);
      k.turn = clamp((k.turn + rand(-1.2, 1.2) * o.wander * dt) * (1 - dt * 0.4), -0.7, 0.7);
      let desired = k.heading + k.turn;
      const margin = Math.min(vw, vh) * 0.1;
      if (head.x < margin || head.x > vw - margin || head.y < margin || head.y > vh - margin) {
        desired += angleDiff(Math.atan2(vh / 2 - head.y, vw / 2 - head.x), desired) * 0.7;
      }
      if (opts.keepCenterClear && !k.guide && Math.abs(head.x - vw / 2) < vw * 0.3 && Math.abs(head.y - vh * 0.45) < vh * 0.14) {
        desired += angleDiff(head.y < vh * 0.45 ? -Math.PI / 2 : Math.PI / 2, desired) * 0.35;
      }
      if (k.guide) {
        const home = guides[k.guideIndex];
        const homeX = vw * home.homeX;
        const homeY = vh * home.homeY;
        if (head.y < homeY - vh * 0.19 || head.y > homeY + vh * 0.16 || Math.abs(head.x - homeX) > vw * 0.22) {
          desired += angleDiff(Math.atan2(homeY - head.y, homeX - head.x), desired) * 0.5;
        }
        // Link koi keep their distance so their captions don't pile up.
        for (const other of koi) {
          if (other === k || !other.guide) continue;
          const p = other.spine[0];
          if (Math.hypot(p.x - head.x, p.y - head.y) < Math.min(vw, vh) * 0.24) {
            desired += angleDiff(Math.atan2(head.y - p.y, head.x - p.x), desired) * 0.3;
          }
        }
      }
      const held = k.guide && hovering === k.guideIndex;
      let boost = 1;
      if (o.shy && t - pointer.seen < 1 && Math.hypot(head.x - pointer.x, head.y - pointer.y) < 160 && !held) {
        desired += angleDiff(Math.atan2(head.y - pointer.y, head.x - pointer.x), desired) * 0.75;
        boost = 2;
      }
      const speed = k.speed * boost * (held ? 0.2 : 1) * (reduced ? 0.4 : 1) * (1 - 0.2 * k.depth);
      // Never turn tighter than about a third of a body length, so the body bends rather than folds.
      const maxTurn = (speed / (k.length * 0.3)) * dt;
      k.heading += clamp(angleDiff(desired, k.heading) * Math.min(1, dt * 1.3), -maxTurn, maxTurn);
      head.x += Math.cos(k.heading) * speed * dt;
      head.y += Math.sin(k.heading) * speed * dt;
      const seg = k.length / SEGMENTS;
      for (let i = 1; i < SEGMENTS; i++) {
        const a = k.spine[i - 1];
        const b = k.spine[i];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1;
        b.x = a.x + (dx / d) * seg;
        b.y = a.y + (dy / d) * seg;
      }
      // Only a koi near the surface stirs it.
      if (!reduced && opts.ripples.wake > 0 && t > k.wakeAt && k.depth < 0.45) {
        disturb(head.x, head.y, 2, opts.ripples.wake * (1 - k.depth / 0.45));
        k.wakeAt = t + rand(0.35, 0.7);
      }
    };

    /** The ripples: each cell moves toward the average of its neighbours, and slowly settles. */
    const ripple = () => {
      const fade = clamp(opts.ripples.fade, 0.8, 0.998);
      for (let y = 1; y < simH - 1; y++) {
        for (let x = 1; x < simW - 1; x++) {
          const i = y * simW + x;
          previous[i] = (current[i - 1] + current[i + 1] + current[i - simW] + current[i + simW]) * 0.5 - previous[i];
          previous[i] *= fade;
        }
      }
      const swap = current;
      current = previous;
      previous = swap;
    };

    const put = (x, y, u, v) => {
      verts[used++] = x;
      verts[used++] = y;
      verts[used++] = u;
      verts[used++] = v;
    };

    /**
     * Lays a strip of skin along `pts`. At point i it spans halves[i] atlas pixels either side of atlas
     * row `row`, from texture column us[i], scaled to the screen by `scale`; `flip` mirrors it across.
     */
    const ribbon = (pts, us, halves, row, scale, flip = false) => {
      let ax = 0;
      let ay = 0;
      let bx0 = 0;
      let by0 = 0;
      let av = 0;
      let bv = 0;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[Math.max(0, i - 1)];
        const b = pts[Math.min(pts.length - 1, i + 1)];
        const l = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        const half = halves[i] * scale;
        const nx = (-(b.y - a.y) / l) * half;
        const ny = ((b.x - a.x) / l) * half;
        const vTop = (row + (flip ? halves[i] : -halves[i])) / TEX_H;
        const vBottom = (row + (flip ? -halves[i] : halves[i])) / TEX_H;
        const p = pts[i];
        if (i > 0) {
          const u0 = us[i - 1];
          const u1 = us[i];
          put(ax, ay, u0, av);
          put(bx0, by0, u0, bv);
          put(p.x - nx, p.y - ny, u1, vTop);
          put(bx0, by0, u0, bv);
          put(p.x + nx, p.y + ny, u1, vBottom);
          put(p.x - nx, p.y - ny, u1, vTop);
        }
        ax = p.x - nx;
        ay = p.y - ny;
        bx0 = p.x + nx;
        by0 = p.y + ny;
        av = vTop;
        bv = vBottom;
      }
    };

    /** A fin as a strip from its root along `dir`, curling a little more with each step. */
    const fin = (f, root, dir, curl, L, steps, flip) => {
      const scale = L / K;
      const pts = [{ x: root.x - Math.cos(dir) * (f.x - f.x0) * scale, y: root.y - Math.sin(dir) * (f.x - f.x0) * scale }, root];
      const us = [f.x0 / TEX_W, f.x / TEX_W];
      const seg = (f.len + 10) / steps;
      let ang = dir;
      let p = root;
      for (let j = 1; j <= steps; j++) {
        ang += curl(j);
        p = { x: p.x + Math.cos(ang) * seg * scale, y: p.y + Math.sin(ang) * seg * scale };
        pts.push(p);
        us.push((f.x + seg * j) / TEX_W);
      }
      ribbon(pts, us, pts.map(() => f.band), f.y, scale, flip);
    };

    /** Lays one koi's fins, then its body and tail, into the vertex list. */
    const lay = (k, s, t) => {
      const L = k.length;
      const { c, fwd } = s;
      const last = SEGMENTS - 1;
      // [fin, where along the body, how far out on the flank, how wide it opens, how much it beats, steps]
      for (const [f, b, reach, open, sway, steps] of [
        [PEL, 0.55, 0.66, 0.41, 0.06, 4],
        [PEC, 0.2, 0.85, 0.33, 0.12, 6],
      ]) {
        const at = along(s, b);
        const back = Math.atan2(at.ty, at.tx);
        for (const side of [1, -1]) {
          const hw = halfWidth(b) * L * reach;
          const root = { x: at.x + at.nx * side * hw, y: at.y + at.ny * side * hw };
          const turn = Math.sign(angleDiff(Math.atan2(at.ny * side, at.nx * side), back));
          const beat = t * 2.3 + k.phase + (side > 0 ? 0 : 1.1);
          const dir = back + turn * (open + Math.sin(beat) * sway);
          // The leading ray belongs on the side facing the head.
          const flip = fwd.x * -Math.sin(dir) + fwd.y * Math.cos(dir) > 0;
          fin(f, root, dir, (j) => -turn * (0.012 + 0.02 * Math.sin(beat - j * 0.8)), L, steps, flip);
        }
      }

      // The strip hugs the body and only opens out where the tail fans, so it never folds over itself on a turn.
      const pts = [];
      const us = [];
      const halves = [];
      const ahead = (d) => ({ x: c[0].x + fwd.x * d * L, y: c[0].y + fwd.y * d * L });
      pts.push(ahead(LEAD + NOSE), ahead(NOSE * 0.5));
      us.push(0, (LEAD + NOSE * 0.5) / SPAN);
      halves.push(BODY_HALF, BODY_HALF);
      for (let i = 0; i < SEGMENTS; i++) {
        pts.push(c[i]);
        us.push((LEAD + NOSE + i / SEGMENTS) / SPAN);
        halves.push(BODY_HALF);
      }
      // The tail carries on past the spine, fluttering more toward its tips.
      const wiggle = opts.koi.wiggle;
      let ang = Math.atan2(c[last].y - c[last - 1].y, c[last].x - c[last - 1].x);
      let p = c[last];
      for (let j = 1; j <= TAIL_STEPS; j++) {
        ang += (Math.sin(t * (k.speed / 8) - (last + j) * 0.5 + k.phase - 1.2) * 0.06 + Math.sin(t * 1.9 - j * 0.9 + k.phase) * 0.022) * wiggle;
        p = { x: p.x + Math.cos(ang) * (TAIL / TAIL_STEPS) * L, y: p.y + Math.sin(ang) * (TAIL / TAIL_STEPS) * L };
        pts.push(p);
        us.push((LEAD + BODY + (j / TAIL_STEPS) * TAIL) / SPAN);
        halves.push(BODY_HALF + (MID - BODY_HALF) * Math.min(1, j / TAIL_STEPS / 0.5) ** 0.6);
      }
      ribbon(pts, us, halves, MID, L / K);
    };

    const drawShadows = (shapes) => {
      shctx.setTransform(1, 0, 0, 1, 0, 0);
      shctx.clearRect(0, 0, shadowCanvas.width, shadowCanvas.height);
      shctx.setTransform(0.25, 0, 0, 0.25, 0, 0);
      shctx.filter = "blur(2px)";
      shctx.fillStyle = "rgba(0,0,0,.85)";
      // A koi high in the water casts its shadow further off and fainter; a deep one, close and dark.
      koi.forEach((k, i) => {
        if (!k.skin) return;
        const lift = 1.35 - 0.95 * k.depth;
        shctx.globalAlpha = 0.55 + 0.45 * k.depth;
        bodyPath(shctx, shapes[i], 1.1, k.length * 0.09 * lift, k.length * 0.14 * lift);
        shctx.fill();
      });
      shctx.globalAlpha = 1;
      for (const p of pads) {
        shctx.beginPath();
        shctx.arc(p.x + p.r * 0.22, p.y + p.r * 0.3, p.r, 0, TAU);
        shctx.fill();
      }
      shctx.filter = "none";
    };

    const drawTop = (dt, t) => {
      tctx.clearRect(0, 0, vw, vh);
      const push = opts.pads.push;
      // A faint glow of its own colour around each link koi, brighter while its caption is hovered
      // and fainter as it sinks.
      guides.forEach((_, gi) => {
        const g = koi[gi];
        if (!g || !g.skin) return;
        const head = g.spine[0];
        const tail = g.spine[SEGMENTS - 1];
        const mid = g.spine[SEGMENTS >> 1];
        tctx.save();
        tctx.globalAlpha = (hovering === gi ? 0.22 : 0.11) * (1 - 0.7 * g.depth);
        tctx.translate(mid.x, mid.y);
        tctx.rotate(Math.atan2(tail.y - head.y, tail.x - head.x));
        tctx.scale(g.length * 0.85, g.length * 0.32);
        tctx.drawImage(glows[gi], -1, -1, 2, 2);
        tctx.restore();
      });
      for (const p of pads) {
        const d = Math.hypot(p.x - pointer.x, p.y - pointer.y);
        // Pads get carried a little the way the pointer drags past, and nudged aside.
        if (push && t - pointer.seen < 0.3 && d < p.r + 50 && d > 0) {
          const near = 1 - d / (p.r + 50);
          p.vx += (pointer.vx * 0.3 + ((p.x - pointer.x) / d) * 20) * near * dt;
          p.vy += (pointer.vy * 0.3 + ((p.y - pointer.y) / d) * 20) * near * dt;
          p.spin += ((p.x - pointer.x) * pointer.vy - (p.y - pointer.y) * pointer.vx) / (d * 4000) * near * dt;
        }
        p.vx *= 1 - dt * 0.3;
        p.vy *= 1 - dt * 0.3;
        p.spin *= 1 - dt * 0.2;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.spin * dt;
        const m = p.r * 1.3;
        if (p.x < -m) p.x = vw + m;
        if (p.x > vw + m) p.x = -m;
        if (p.y < -m) p.y = vh + m;
        if (p.y > vh + m) p.y = -m;
        const size = Math.ceil(p.r * 2.2);
        tctx.save();
        tctx.translate(p.x, p.y);
        tctx.rotate(p.rot);
        // Shadow offsets ignore the rotation, so the sun stays put as the pad turns.
        tctx.shadowColor = "rgba(2,10,11,.5)";
        tctx.shadowBlur = 14 * dpr;
        tctx.shadowOffsetX = 3 * dpr;
        tctx.shadowOffsetY = 5 * dpr;
        tctx.drawImage(p.sprite, -size / 2, -size / 2, size, size);
        tctx.restore();
        // Beads stay lit from the same side however the pad has turned.
        for (const b of p.drops) {
          const a = b.a + p.rot;
          const s = b.s * (DROP / DROP_R);
          tctx.drawImage(drop, p.x + Math.cos(a) * b.d * p.r - s / 2, p.y + Math.sin(a) * b.d * p.r - s / 2, s, s);
        }
        if (p.lotus) {
          const l = p.lotus;
          const a = l.a + p.rot;
          const size = l.r * 2.3;
          tctx.save();
          tctx.translate(p.x + Math.cos(a) * l.d * p.r, p.y + Math.sin(a) * l.d * p.r);
          tctx.rotate(l.turn + p.rot);
          tctx.shadowColor = "rgba(2,10,11,.45)";
          tctx.shadowBlur = 16 * dpr;
          tctx.shadowOffsetX = 4 * dpr;
          tctx.shadowOffsetY = 7 * dpr;
          tctx.drawImage(l.sprite, -size / 2, -size / 2, size, size);
          tctx.restore();
        }
      }
      // Petals drift on the surface and get swept along by the pointer.
      for (const f of petals) {
        const d = Math.hypot(f.x - pointer.x, f.y - pointer.y);
        if (push && t - pointer.seen < 0.3 && d < 80 && d > 0) {
          const near = 1 - d / 80;
          f.vx += (pointer.vx * 0.8 + ((f.x - pointer.x) / d) * 30) * near * dt;
          f.vy += (pointer.vy * 0.8 + ((f.y - pointer.y) / d) * 30) * near * dt;
          f.spin += ((f.x - pointer.x) * pointer.vy - (f.y - pointer.y) * pointer.vx) / (d * 600) * near * dt;
        }
        f.vx *= 1 - dt * 0.25;
        f.vy *= 1 - dt * 0.25;
        f.x += (f.vx + Math.sin(t * 0.3 + f.rot) * 2) * dt;
        f.y += f.vy * dt;
        f.rot += f.spin * dt;
        if (f.x < -20) f.x = vw + 20;
        if (f.x > vw + 20) f.x = -20;
        if (f.y < -20) f.y = vh + 20;
        if (f.y > vh + 20) f.y = -20;
        const size = PETAL * (f.s / PETAL_S);
        tctx.save();
        tctx.translate(f.x, f.y);
        tctx.rotate(f.rot);
        tctx.shadowColor = "rgba(2,10,11,.35)";
        tctx.shadowBlur = 3 * dpr;
        tctx.shadowOffsetX = 1.5 * dpr;
        tctx.shadowOffsetY = 2.5 * dpr;
        tctx.drawImage(petalSprite, -size / 2, -size / 2, size, size);
        tctx.restore();
      }
    };

    const render = (shapes, t) => {
      if (gfx) {
        const { gl } = gfx;
        used = 0;
        runs.length = 0;
        // Deepest first, so a koi rising toward the surface passes over the ones below it.
        const order = koi.map((_, i) => i).sort((a, b) => koi[b].depth - koi[a].depth);
        for (const i of order) {
          const k = koi[i];
          if (!k.skin || !k.skin.texture) continue;
          const start = used / 4;
          lay(k, shapes[i], t);
          runs.push({ texture: k.skin.texture, start, count: used / 4 - start, depth: k.depth });
        }

        // The koi into a layer of their own.
        gl.bindFramebuffer(gl.FRAMEBUFFER, gfx.target);
        gl.viewport(0, 0, view.width, view.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(gfx.mesh);
        gl.uniform2f(gfx.uMeshView, vw, vh);
        gl.bindVertexArray(gfx.strips);
        gl.bindBuffer(gl.ARRAY_BUFFER, gfx.stripBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, verts.subarray(0, used), gl.DYNAMIC_DRAW);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.activeTexture(gl.TEXTURE0 + SKIN_UNIT);
        for (const run of runs) {
          gl.uniform1f(gfx.uDepth, run.depth);
          gl.bindTexture(gl.TEXTURE_2D, run.texture);
          gl.drawArrays(gl.TRIANGLES, run.start, run.count);
        }
        gl.disable(gl.BLEND);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // Then the water over everything.
        gl.viewport(0, 0, view.width, view.height);
        gl.useProgram(gfx.water);
        gl.bindVertexArray(gfx.quad);
        upload(gfx, 2, gfx.shadow, shadowCanvas);
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, gfx.height);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, simW, simH, 0, gl.RED, gl.FLOAT, current);
        gl.uniform2f(gfx.uSim, simW, simH);
        gl.uniform2f(gfx.uView, vw, vh);
        gl.uniform1f(gfx.uTime, t);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      } else if (flat) {
        flat.setTransform(view.width / vw, 0, 0, view.height / vh, 0, 0);
        flat.drawImage(floorCanvas, 0, 0);
        flat.fillStyle = `rgba(${rgbList(opts.water.tint)},.82)`;
        flat.fillRect(0, 0, vw, vh);
        flat.drawImage(shadowCanvas, 0, 0, vw, vh);
        koi.forEach((k, i) => {
          if (!k.skin) return;
          const { c, fwd } = shapes[i];
          const L = k.length;
          flat.save();
          flat.translate(c[0].x + fwd.x * (LEAD + NOSE) * L, c[0].y + fwd.y * (LEAD + NOSE) * L);
          flat.rotate(Math.atan2(-fwd.y, -fwd.x));
          flat.drawImage(k.skin.canvas, 0, 0, TEX_W, BAND, 0, -MID * (L / K), SPAN * L, BAND * (L / K));
          flat.restore();
        });
      }
    };

    /** Keeps each link's hit area on its koi and its caption beside the koi's head. */
    const placeGuides = (dt) => {
      guides.forEach((_, gi) => {
        const g = koi[gi];
        const hit = hits[gi];
        const caption = captions[gi];
        const pos = captionPos[gi];
        if (!g || !hit || !caption) return;
        const body = g.spine[3];
        hit.style.transform = `translate(${body.x - 55}px, ${body.y - 55}px)`;
        // The caption rides beside the koi's head, on the side away from its body, so it reads as the
        // koi's own. It only changes sides once the koi has clearly turned.
        const head = g.spine[0];
        const neck = g.spine[4];
        const back = (neck.x - head.x) / (Math.hypot(neck.x - head.x, neck.y - head.y) || 1);
        if (back > 0.35) pos.side = -1;
        else if (back < -0.35) pos.side = 1;
        const cw = caption.offsetWidth;
        const ch = caption.offsetHeight;
        const gap = g.length * 0.1 + 12;
        const tx = clamp(pos.side > 0 ? head.x + gap : head.x - gap - cw, 12, vw - cw - 12);
        const ty = clamp(head.y - ch / 2, 12, vh - ch - 16);
        if (!pos.ready) {
          pos.x = tx;
          pos.y = ty;
          pos.ready = true;
        }
        // Close enough behind to keep up with the koi, while a change of side still glides across.
        pos.x += (tx - pos.x) * Math.min(1, dt * 14);
        pos.y += (ty - pos.y) * Math.min(1, dt * 14);
        caption.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
        // It fades a little as its koi sinks.
        caption.style.opacity = (1 - 0.55 * g.depth).toFixed(2);
      });
    };

    /** A big splash where a link koi is, as you follow its link. */
    const splashGuide = (gi) => {
      const fish = koi[gi];
      if (fish) disturb(fish.spine[2].x, fish.spine[2].y, 5, 320);
    };

    /** The link koi's hit areas and captions: real links, so they work with a keyboard and screen readers. */
    const buildLinks = () => {
      for (const el of [...hits, ...captions]) el.remove();
      hits = [];
      captions = [];
      guides.forEach((g, gi) => {
        const follow = (e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
          splashGuide(gi);
          // Links that open somewhere else (a new tab, or the page around an iframe) go straight away.
          if (g.target && g.target !== "_self") return;
          e.preventDefault();
          window.setTimeout(() => {
            if (typeof opts.navigate === "function") opts.navigate(g.href);
            else window.location.href = g.href;
          }, 220);
        };
        const startHover = () => {
          hovering = gi;
        };
        const endHover = () => {
          hovering = -1;
        };
        const make = (className) => {
          const a = document.createElement("a");
          a.className = className;
          a.href = g.href;
          if (g.target) a.target = g.target;
          if (g.target === "_blank") a.rel = "noopener";
          a.addEventListener("click", follow);
          a.addEventListener("pointerenter", startHover);
          a.addEventListener("pointerleave", endHover);
          container.append(a);
          return a;
        };
        const hit = make("koi-pond__hit");
        hit.tabIndex = -1;
        hit.setAttribute("aria-hidden", "true");
        hit.style.cssText = "position:absolute;left:0;top:0;z-index:4;width:110px;height:110px;border-radius:999px;cursor:pointer;touch-action:manipulation";
        const caption = make("koi-pond__link");
        caption.style.position = "absolute";
        caption.style.left = "0";
        caption.style.top = "0";
        caption.style.zIndex = "4";
        caption.style.setProperty("--tint", g.tint);
        caption.style.setProperty("--ink", g.ink);
        caption.textContent = g.label;
        caption.insertAdjacentHTML(
          "beforeend",
          '<svg aria-hidden="true" width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5l5-5M4.5 3.5h4v4"/></svg>',
        );
        caption.addEventListener("focus", startHover);
        caption.addEventListener("blur", endHover);
        hits.push(hit);
        captions.push(caption);
      });
    };

    // The same type always gives back the same object, so koi keep their painted skins across updates.
    const typeCache = new Map();
    const typeOf = (spec) => {
      const key = typeof spec === "string" ? spec : JSON.stringify(spec);
      if (!typeCache.has(key)) typeCache.set(key, koiType(spec));
      return typeCache.get(key);
    };

    /** Turns the settings into koi types, leaf colours, lotus colours and links. */
    const prepare = () => {
      const listed = Array.isArray(opts.koi.types) && opts.koi.types.length ? opts.koi.types : ["kohaku"];
      types = listed.map(typeOf);
      leaves = (opts.pads.colors && opts.pads.colors.length ? opts.pads.colors : DEFAULTS.pads.colors).map(leafOf);
      lotus = { ...DEFAULTS.lotus, ...opts.lotus };
      petalSprite = paintPetal(opts.petals);
      guides = (opts.links || []).map((l, i, all) => ({
        href: l.href || "#",
        label: l.label || "",
        target: l.target,
        variety: typeOf(l.koi || "gold"),
        homeX: clamp(l.x ?? (i + 1) / (all.length + 1), 0.05, 0.95),
        homeY: clamp(l.y ?? 0.74, 0.2, 0.9),
        tint: rgbList(l.tint || "#F0BC55"),
        ink: l.ink || "#FFFFFF",
      }));
      glows = guides.map((g) => paintGlow(g.tint));
      captionPos = guides.map((_, gi) => ({ x: 0, y: 0, side: gi === 0 ? -1 : 1, ready: false }));
      hovering = -1;
      buildLinks();
    };

    const onMove = (e) => {
      const now = performance.now() / 1000;
      const box = container.getBoundingClientRect();
      const x = e.clientX - box.left;
      const y = e.clientY - box.top;
      const dx = x - pointer.x;
      const dy = y - pointer.y;
      // A continuing stroke drags through the water; a pointer just arriving doesn't.
      if (now - pointer.seen < 0.2) {
        const span = Math.max(0.008, now - pointer.seen);
        const speed = Math.hypot(dx, dy) / span;
        const cap = speed > 700 ? 700 / speed : 1;
        pointer.vx += ((dx / span) * cap - pointer.vx) * 0.5;
        pointer.vy += ((dy / span) * cap - pointer.vy) * 0.5;
        drag(pointer.x, pointer.y, x, y);
      } else {
        pointer.vx = 0;
        pointer.vy = 0;
      }
      pointer.x = x;
      pointer.y = y;
      pointer.seen = now;
    };

    /**
     * The pointer drawn through the water: a deep groove cut along its path, deeper the faster it
     * goes. Each stretch spreads out as it's left behind, opening into a wake that trails the way the
     * pointer went.
     */
    const drag = (x0, y0, x1, y1) => {
      const depth = opts.ripples.drag;
      const dist = Math.hypot(x1 - x0, y1 - y0);
      if (dist < 2 || depth <= 0) return;
      const steps = Math.min(48, Math.ceil(dist / CELL));
      const cut = clamp(dist * 0.35, 4, 16) * depth;
      for (let i = 1; i <= steps; i++) disturb(x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps, 1, -cut);
    };

    // A tap drops a splash; pressing to drag doesn't, so a drag leaves only its wake.
    const press = { x: 0, y: 0, down: false };
    const onDown = (e) => {
      press.x = e.clientX;
      press.y = e.clientY;
      press.down = true;
    };
    const onUp = (e) => {
      if (press.down && opts.ripples.tap > 0 && Math.hypot(e.clientX - press.x, e.clientY - press.y) < 8) {
        const box = container.getBoundingClientRect();
        disturb(e.clientX - box.left, e.clientY - box.top, Math.round(opts.ripples.tapSize), opts.ripples.tap);
      }
      press.down = false;
    };
    const onCancel = () => {
      press.down = false;
    };

    let raf = 0;
    let last = performance.now();
    // Time that only moves on while the pond is running, a frame at a time.
    let clock = 0;
    let nextDrop = 0;
    let resizeTimer = 0;

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      const t = now / 1000;
      // Frame times can arrive slightly out of order; never step backwards.
      const dt = clamp((now - last) / 1000, 0, 0.05);
      last = now;
      // Scrolled out of sight: rest until it's back.
      if (!visible) return;
      clock += dt;
      const r = opts.ripples;
      if (!reduced && r.rain && t > nextDrop) {
        disturb(rand(0, vw), rand(0, vh), 1, r.rainStrength);
        nextDrop = t + rand(r.rainEvery[0], r.rainEvery[1]);
      }
      dress();
      for (const k of koi) swim(k, dt, t);
      ripple();
      const shapes = koi.map((k) => shapeOf(k, t, opts.koi.wiggle));
      drawShadows(shapes);
      render(shapes, t);
      drawTop(dt, t);
      placeGuides(dt);
    };

    prepare();
    applyLook();
    resize();

    // Resize with the element, not just the window, so a pond in any layout keeps its shape.
    const sized = new ResizeObserver(() => {
      if (container.clientWidth === vw && container.clientHeight === vh) return;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 200);
    });
    sized.observe(container);
    const seen = new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1].isIntersecting;
    });
    seen.observe(container);
    // A pond still without a height once the page has settled can't be seen.
    const check = window.setTimeout(() => {
      if (container.clientHeight < 10) console.warn("Koi Pond: the pond's element has no height, so there's nothing to see. Give it one, like height: 100vh.");
    }, 1500);
    container.addEventListener("pointermove", onMove, { passive: true });
    container.addEventListener("pointerdown", onDown, { passive: true });
    container.addEventListener("pointerup", onUp, { passive: true });
    container.addEventListener("pointercancel", onCancel, { passive: true });
    raf = requestAnimationFrame(loop);

    return {
      /** The settings in use: the defaults, the preset and yours, merged. */
      get settings() {
        return opts;
      },
      /**
       * Changes settings while the pond runs, e.g. pond.update({ water: { glow: "#FFD27A" } }).
       * The settings in LIVE change straight away; any other re-stocks the pond with new koi and pads.
       */
      update(changes) {
        user = merge(user, changes || {});
        opts = resolve(user);
        applyLook();
        if (pathsOf(changes || {}).some((path) => !LIVE.some((live) => path === live || path.startsWith(live + ".")))) {
          prepare();
          spawn();
        }
      },
      /** A splash at x, y (px from the pond's top left corner). */
      splash(x, y, strength = 240) {
        disturb(x, y, 4, strength);
      },
      /** Stops the pond and takes it off the page. */
      destroy() {
        cancelAnimationFrame(raf);
        window.clearTimeout(resizeTimer);
        window.clearTimeout(check);
        sized.disconnect();
        seen.disconnect();
        container.removeEventListener("pointermove", onMove);
        container.removeEventListener("pointerdown", onDown);
        container.removeEventListener("pointerup", onUp);
        container.removeEventListener("pointercancel", onCancel);
        for (const el of [view, top, ...hits, ...captions]) el.remove();
        container.classList.remove("koi-pond");
        if (gfx) {
          const lose = gfx.gl.getExtension("WEBGL_lose_context");
          if (lose) lose.loseContext();
        }
      },
    };
  }

  // =====================================================================
  // 11. EXPORTS
  // =====================================================================

  const KoiPond = {
    version: "1.0.0",
    create,
    defaults: DEFAULTS,
    presets: PRESETS,
    types: KOI_TYPES,
    /** Paints one koi type (a name or your own { base: ... }) as a canvas, nose to the left. Handy for previews. */
    paintKoi: (type) => paintKoi(koiType(type)),
    /** The settings a pond would use for these settings of yours. */
    resolve: (settings) => resolve(merge({}, settings || {})),
  };

  if (typeof window !== "undefined") window.KoiPond = KoiPond;
  if (typeof module === "object" && module && module.exports) module.exports = KoiPond;
})();
