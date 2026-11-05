/* Small shared helpers: DOM building, time parsing, icons. */
(function () {
  const B = (window.B = window.B || {});

  /** Builds an element: el('button', { class: 'x', 'data-act': 'y' }, 'text' | node | [children]). */
  B.el = function (tag, attrs, children) {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([key, value]) => { if (value !== false && value != null) node.setAttribute(key, value === true ? '' : value); });
    [].concat(children == null ? [] : children).filter((child) => child != null && child !== false).forEach((child) => node.append(child instanceof Node ? child : document.createTextNode(String(child))));
    return node;
  };

  B.$ = (selector, root) => (root || document).querySelector(selector);
  B.$$ = (selector, root) => Array.from((root || document).querySelectorAll(selector));

  /** "9:00 AM" -> minutes since midnight. */
  B.toMinutes = function (time) {
    const match = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(time);
    if (!match) { console.warn('concept-b: unreadable time', time); return 0; }
    return (Number(match[1]) % 12) * 60 + Number(match[2]) + (match[3] === 'PM' ? 720 : 0);
  };

  /** Reply-by text: 5:00 PM is spoken as "end of day". */
  B.dueText = (replyBy) => (replyBy.time === '5:00 PM' ? 'end of day' : replyBy.time);

  /** Logs and shows a message for failures a person can act on. */
  B.reportProblem = function (message, error) {
    console.warn('concept-b: ' + message, error || '');
    if (B.toast) B.toast(message);
  };

  const svg = (path) => `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  B.icons = {
    mic: svg('<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),
    speaker: svg('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>'),
    stop: svg('<rect x="6" y="6" width="12" height="12" rx="2"/>'),
    clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    help: svg('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .8-1 1.7M12 17h.01"/>'),
    up: svg('<path d="M12 19V5M6 11l6-6 6 6"/>'),
    down: svg('<path d="M12 5v14M6 13l6 6 6-6"/>'),
    left: svg('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
    right: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    undo: svg('<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>'),
    check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    listen: svg('<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>'),
    day: svg('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    sort: svg('<rect x="5" y="6" width="14" height="14" rx="3"/><path d="M8 3h8"/>'),
    work: svg('<path d="M5 20V10M12 20V4M19 20v-7"/>'),
  };
})();
