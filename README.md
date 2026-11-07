# Koi Pond Kit

## Portfolio with Originkit project carousel

The main page is the pond portfolio, with Originkit Coverflow Gallery variant 4 animating the project cards. React mounts only inside `#projects-root`; the existing pond, journey, and contact form remain in `index.html`. Project content is read from that page's fallback cards, so edit names, icons, descriptions, and links there.

You can open `index.html` directly from disk: it loads the bundled carousel from `assets/project-carousel.js` and `assets/project-carousel.css`. Keep those files with the page. After changing the React or carousel CSS source, run `npm run build:carousel` to refresh them; editing project content in `index.html` does not require a rebuild.

The downloaded component lives at `src/components/originkit/ui/coverflowgallery-variant-4.tsx`. Its original coverflow transforms are retained, with custom card rendering, navigation buttons, and corrected default-prop types added for the portfolio. Use the buttons, click a card, or focus the carousel and press the arrow keys. Reduced-motion preferences remove its transitions.

With Node.js installed:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. `/portfolio.html` preserves the earlier portfolio with its static project grid and still opens directly from disk.

For this checkout's portable Windows Node runtime, start development from PowerShell with:

```powershell
$env:Path = "$PWD\.tools\node-v26.13.0-win-x64;$env:Path"
npm.cmd run dev
```

`npm run build` produces `dist/`, including the preserved portfolio and pond assets. `npm run preview` serves that build. `npm run typecheck` checks the app and component types.

The Originkit key was used only in the installation process environment. It is not required to run the gallery.

## Original pond kit

An interactive koi pond for your website. Koi swim, rise and sink; you can tap the water to make it splash and drag through it to leave a wake; lily pads, lotuses and petals drift on top. No installs, no accounts, nothing to build.

Everything is explained in **Koi-Pond-Kit-Guide.pdf**. Here's the short version.

## Start in 2 minutes

1. **Open `portfolio.html`** in Chrome, Safari, Edge or Firefox. That's your pond.
2. **Open `playground.html`** to try colours, ripples and koi. When you like it, press **Copy my settings**.
3. **Open `portfolio.html` in a text editor** (VS Code is free; TextEdit and Notepad work too) and paste over the `const look = { … };` block. Change your name and links while you're there: look for ✏️.
4. **Put it online.** The quickest way: drag this whole folder onto [app.netlify.com/drop](https://app.netlify.com/drop). The guide covers Vercel, GitHub Pages, Squarespace, Wix, Framer, Webflow, Shopify and React / Next.js too.

## What's in here

| File | What it is |
| --- | --- |
| `index.html` | The React gallery's entry page. Run with Vite. |
| `portfolio.html` | Your preserved pond portfolio. Open it, edit it, publish it. |
| `playground.html` | Try settings live, then copy them into `index.html`. Your site doesn't need it. |
| `koi-pond.js` | The pond itself. Every setting and its default is at the top. |
| `koi-pond.css` | The vignette around the edges and the link captions. |
| `examples/react/` | A `<KoiPond>` component for React and Next.js (`.tsx` and `.jsx`). |
| `AGENTS.md` | A map of the code written for AI helpers. |
| `LICENSE.txt` | What you can and can't do with the kit. |

## Customising with AI

Give your AI (ChatGPT, Claude, Cursor, Copilot…) **`AGENTS.md`** and **`koi-pond.js`**, plus the guide if it reads PDFs, then say what you want: "make all the koi black with gold spots", "make the ripples bigger and last longer". The guide has a starter prompt and a page of ideas to copy.

## Something's not right?

- **A blank or plain page**: keep `koi-pond.js` and `koi-pond.css` in the same folder as `index.html`.
- **It works on your computer but not online**: upload all the files, not just `index.html`.
- **Your change didn't show**: save the file, then refresh the page. Right click → Inspect → Console shows any mistakes.

More in the guide's troubleshooting page.
