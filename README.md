# Koi Pond Kit

An interactive koi pond for your website. Koi swim, rise and sink; you can tap the water to make it splash and drag through it to leave a wake; lily pads, lotuses and petals drift on top. No installs, no accounts, nothing to build.

Everything is explained in **Koi-Pond-Kit-Guide.pdf**. Here's the short version.

## Start in 2 minutes

1. **Open `index.html`** in Chrome, Safari, Edge or Firefox. That's your pond.
2. **Open `playground.html`** to try colours, ripples and koi. When you like it, press **Copy my settings**.
3. **Open `index.html` in a text editor** (VS Code is free; TextEdit and Notepad work too) and paste over the `const look = { … };` block. Change your name and links while you're there: look for ✏️.
4. **Put it online.** The quickest way: drag this whole folder onto [app.netlify.com/drop](https://app.netlify.com/drop). The guide covers Vercel, GitHub Pages, Squarespace, Wix, Framer, Webflow, Shopify and React / Next.js too.

## What's in here

| File | What it is |
| --- | --- |
| `index.html` | Your pond page. Open it, edit it, publish it. |
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
