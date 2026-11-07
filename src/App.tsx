import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import CoverflowGallery from "./components/originkit/ui/coverflowgallery-variant-4";

export interface Project {
  title: string;
  icon: string;
  paragraphs: { text: string; emphasis: boolean }[];
  pill: string;
  href?: string;
}

export default function App({ projects }: { projects: Project[] }) {
  const host = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(340);
  const [gap, setGap] = useState(8);
  const [reduced, setReduced] = useState(false);
  const [height, setHeight] = useState(540);

  // Match every card to the tallest description instead of leaving a fixed empty area.
  useLayoutEffect(() => {
    const element = host.current!;
    let live = true;
    const measure = () => {
      if (!live) return;
      const heights = [...element.querySelectorAll<HTMLElement>(".project")].map(card => {
        const copy = card.querySelector<HTMLElement>(".project-copy")!;
        const padding = getComputedStyle(copy);
        const content = [...copy.children].reduce((total, child) => {
          const style = getComputedStyle(child);
          const top = child.classList.contains("pill") ? 0 : parseFloat(style.marginTop) || 0;
          return total + (child as HTMLElement).offsetHeight + top + (parseFloat(style.marginBottom) || 0);
        }, 0);
        return card.querySelector<HTMLElement>(".project-heading")!.offsetHeight + content +
          parseFloat(padding.paddingTop) + parseFloat(padding.paddingBottom) + 2;
      });
      setHeight(Math.ceil(Math.max(360, ...heights)));
    };
    const sized = new ResizeObserver(measure);
    element.querySelectorAll(".project-heading, .project-copy > *").forEach(child => sized.observe(child));
    measure();
    document.fonts.ready.then(measure);
    return () => { live = false; sized.disconnect(); };
  }, [width, projects]);

  useEffect(() => {
    const element = host.current!;
    const sized = new ResizeObserver(() => {
      setWidth(Math.min(360, element.clientWidth - 32));
      setGap(Math.min(13.5, Math.max(8, (element.clientWidth - 360) / 60)));
    });
    sized.observe(element);
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduced(motion.matches);
    updateMotion();
    motion.addEventListener("change", updateMotion);
    return () => {
      sized.disconnect();
      motion.removeEventListener("change", updateMotion);
    };
  }, []);

  return (
    <div ref={host} className="project-carousel">
      <div className="project-carousel-stage" style={{ height: height + 96 }}>
        <CoverflowGallery
          slides={projects.map(project => ({ title: project.title }))}
          cardWidth={width} cardHeight={height} radius={3} gap={gap} tilt={-3} sideTilt={0}
          opacity={65} autoplay={false} showTitle={false} showNavigation
          transition={{ duration: reduced ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
          renderSlide={(_slide: unknown, index: number, active: boolean) => {
            const project = projects[index];
            return (
              <article className={`project project-theme-${index}${active ? " is-selected" : ""}`}
                style={{ "--project-card-height": `${height}px` } as CSSProperties}>
                <div className="project-heading">
                <div className="project-art" aria-hidden="true">
                  <div className="project-app-icon"><img src={project.icon} alt="" width="120" height="120" /></div>
                </div>
                  <h3>{project.title}</h3>
                </div>
                <div className="project-copy">
                  {project.paragraphs.map((paragraph, i) => (
                    <p key={i}
                      className={`project-description${active ? " reveal" : ""}`}
                      aria-hidden={!active}
                      style={{ animationDelay: `${0.25 + i * 0.16}s` }}>
                      {paragraph.emphasis ? <strong>{paragraph.text}</strong> : paragraph.text}
                    </p>
                  ))}
                  {project.href ? (
                    <a className="pill" href={project.href} target="_blank" rel="noopener noreferrer"
                      aria-label={`${project.title} on GitHub (opens in a new tab)`}
                      tabIndex={active ? 0 : -1} onClick={event => event.stopPropagation()}>{project.pill}</a>
                  ) : <span className="pill">{project.pill}</span>}
                </div>
              </article>
            );
          }}
        />
      </div>
    </div>
  );
}
