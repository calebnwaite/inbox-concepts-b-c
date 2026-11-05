/* Small shared helpers. */
const U = (() => {
  const escapes = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (text) => String(text).replace(/[&<>"']/g, (c) => escapes[c]);
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function toast(message) {
    const node = $('#toast');
    if (!node) return;
    node.textContent = message;
    node.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove('show'), 3200);
  }

  /* Every failure is logged and shown with a way forward. */
  function fail(message, error) {
    console.error(message, error);
    toast(message);
  }

  /* Run a screen's render function, containing any failure to that screen. */
  function safely(name, fn) {
    try { fn(); } catch (error) { fail(`The ${name} could not update. Try Reset demo.`, error); }
  }

  return { esc, $, $$, toast, fail, safely, reducedMotion };
})();
