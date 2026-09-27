import { quadOut } from "svelte/easing";
import { TransitionConfig } from "svelte/transition";

export function popAway(node: Element, { delay = 0, duration = 400 }): TransitionConfig {
  const o = +getComputedStyle(node).opacity;
  const elementY = node.getBoundingClientRect().top + window.scrollY;

  const quad = (x: number) => x ** 2 + x + 2;

  return {
    delay,
    duration,
    css: (t, u) => {
      const eased = quadOut(t);

      return `
        z-index: 100;
        transform: translate(-${quad(eased) * 20}px, -${eased * 20}px);
    `;
    },
  };
}
