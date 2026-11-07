import { createRoot } from "react-dom/client";
import App, { type Project } from "./App";
import "./index.css";

// Read the portfolio's project content before React replaces the fallback grid.
const root = document.getElementById("projects-root")!;
const projects: Project[] = [...root.querySelectorAll<HTMLElement>(".project")].map(card => {
  const pill = card.querySelector<HTMLElement>(".project-copy > .pill")!;
  return {
    title: card.querySelector("h3")!.textContent!,
    icon: card.querySelector("img")!.getAttribute("src")!,
    paragraphs: [...card.querySelectorAll(".project-copy > p")].map(p => ({
      text: p.textContent!.replace(/\s+/g, " ").trim(),
      emphasis: !!p.querySelector("strong"),
    })),
    pill: pill.textContent!,
    href: pill.getAttribute("href") || undefined,
  };
});
createRoot(root).render(<App projects={projects} />);
