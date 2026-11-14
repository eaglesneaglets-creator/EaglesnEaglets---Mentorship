import '@testing-library/jest-dom';

// ---------------------------------------------------------------------------
// Browser APIs jsdom lacks but Radix / shadcn primitives (DropdownMenu,
// Popover, Select, Tooltip, Sidebar) rely on.
// ---------------------------------------------------------------------------
if (typeof window !== 'undefined') {
  if (!window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  if (!window.matchMedia) {
    window.matchMedia = (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() { return false; },
    });
  }

  const proto = window.HTMLElement?.prototype;
  if (proto) {
    if (!proto.hasPointerCapture) proto.hasPointerCapture = () => false;
    if (!proto.setPointerCapture) proto.setPointerCapture = () => {};
    if (!proto.releasePointerCapture) proto.releasePointerCapture = () => {};
    if (!proto.scrollIntoView) proto.scrollIntoView = () => {};
  }
}
