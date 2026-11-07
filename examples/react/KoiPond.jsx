"use client";

/*
 * Koi Pond Kit for React and Next.js (JavaScript). Using TypeScript? Use KoiPond.tsx instead.
 *
 * 1. Put koi-pond.js and koi-pond.css in your project's public/ folder.
 * 2. Load the CSS once, e.g. in app/layout.jsx:  <link rel="stylesheet" href="/koi-pond.css" />
 * 3. Use it anywhere in a client component:
 *
 *      <KoiPond settings={{ preset: "moonlight", links: [...] }}>
 *        <h1 style={{ position: "relative", zIndex: 3 }}>hi, i'm …</h1>
 *      </KoiPond>
 *
 *    Anything inside sits on the water; give it position: relative (or absolute) and z-index: 3.
 *    With Next.js, pass navigate: (href) => router.push(href) in settings so link koi use your router.
 */

import { useEffect, useRef } from "react";

let loading = null;

/** Adds koi-pond.js to the page once, however many ponds there are. */
function load(src) {
  if (window.KoiPond) return Promise.resolve(window.KoiPond);
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => (window.KoiPond ? resolve(window.KoiPond) : reject(new Error(`${src} loaded but didn't set up KoiPond`)));
    script.onerror = () => {
      loading = null;
      reject(new Error(`Couldn't load ${src}. Is koi-pond.js in your public folder?`));
    };
    document.head.append(script);
  });
  return loading;
}

/**
 * @param {{ settings?: object, src?: string, className?: string, style?: object, children?: any }} props
 * `settings` is your look and links, the same as in index.html. It's read once, when the pond is made.
 */
export function KoiPond({ settings, src = "/koi-pond.js", className, style, children }) {
  const ref = useRef(null);
  const pond = useRef(null);

  useEffect(() => {
    let gone = false;
    load(src).then((kit) => {
      if (!gone && ref.current) pond.current = kit.create(ref.current, settings);
    }, console.error);
    return () => {
      gone = true;
      pond.current?.destroy();
      pond.current = null;
    };
    // The pond is made once. To change it while it runs, call pond.current?.update({ ... }).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return (
    <div ref={ref} className={className} style={{ width: "100%", height: "100svh", ...style }}>
      {children}
    </div>
  );
}

export default KoiPond;
