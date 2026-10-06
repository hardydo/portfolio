export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

type ElementType<T extends Element> = { new (): T; prototype: T };

/** The first match, or null if there is none or it is not an element of `type`. */
export function qs(selector: string, root?: ParentNode): HTMLElement | null;
export function qs<T extends Element>(selector: string, root: ParentNode, type: ElementType<T>): T | null;
export function qs(selector: string, root: ParentNode = document, type: ElementType<Element> = HTMLElement) {
  const node = root.querySelector(selector);
  return node instanceof type ? node : null;
}

/** Every match that is an element of `type`. */
export function qsa(selector: string, root?: ParentNode): HTMLElement[];
export function qsa<T extends Element>(selector: string, root: ParentNode, type: ElementType<T>): T[];
export function qsa(selector: string, root: ParentNode = document, type: ElementType<Element> = HTMLElement) {
  return [...root.querySelectorAll(selector)].filter((node) => node instanceof type);
}

export function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Switches every section to its text layout; each feature's stylesheet carries its own .no-webgl rules. */
export function markNoWebGL(): void {
  document.documentElement.classList.add('no-webgl');
}
