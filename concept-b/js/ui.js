/* Shared overlays: toast with optional action, and the "Set reply-by" bottom sheet. */
(function () {
  const B = (window.B = window.B || {});
  const { el } = B;
  let toastTimer = null;

  /** Brief message at the bottom of the app; an optional action button (for example Undo). */
  B.toast = function (message, action) {
    const host = B.$('#toast');
    if (!host) { console.warn('concept-b: toast host missing:', message); return; }
    host.replaceChildren(el('span', { class: 'toast-text' }, message));
    if (action) {
      const button = el('button', { class: 'toast-action', type: 'button' }, action.label);
      button.addEventListener('click', () => { host.classList.remove('show'); action.run(); });
      host.append(button);
    }
    host.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => host.classList.remove('show'), action ? 5000 : 2600);
  };

  /** Opens the reply-by sheet for an email; saving puts the deadline on the calendar. */
  B.openReplyBy = function (emailId) {
    const root = B.$('#sheet-root');
    const email = B.emailById(emailId);
    const current = B.replyByOf(emailId) || { day: B.DATA.today, time: '5:00 PM' };
    let day = current.day;
    const close = () => { root.replaceChildren(); root.classList.remove('open'); };

    const dayButtons = B.DATA.days.map((name) => {
      const button = el('button', { type: 'button', class: 'pill' + (name === day ? ' selected' : ''), 'data-day': name, 'aria-pressed': String(name === day) }, name);
      button.addEventListener('click', () => {
        day = name;
        B.$$('[data-day]', root).forEach((other) => { const on = other.dataset.day === day; other.classList.toggle('selected', on); other.setAttribute('aria-pressed', String(on)); });
      });
      return button;
    });
    const select = el('select', { id: 'replyby-time', class: 'time-select', 'aria-label': 'Reply-by time' },
      B.DATA.timeOptions.map((time) => el('option', { value: time }, time === '5:00 PM' ? '5:00 PM (end of day)' : time)));
    select.value = B.DATA.timeOptions.includes(current.time) ? current.time : '5:00 PM';

    const save = el('button', { type: 'button', class: 'btn btn-primary', id: 'replyby-save' }, 'Add to calendar');
    save.addEventListener('click', () => {
      B.setReplyBy(emailId, day, select.value);
      close();
      B.toast('Reply to ' + email.from + ' due ' + B.DATA.dayNames[day] + ' by ' + B.dueText({ time: select.value }) + '. Added to your calendar.');
    });
    const cancel = el('button', { type: 'button', class: 'btn btn-quiet', id: 'replyby-cancel' }, 'Cancel');
    cancel.addEventListener('click', close);

    const sheet = el('div', { class: 'sheet', role: 'dialog', 'aria-label': 'Set reply-by' }, [
      el('div', { class: 'sheet-grab' }),
      el('h2', { class: 'sheet-title' }, 'Set reply-by'),
      el('p', { class: 'sheet-sub' }, email.from + ' · ' + email.subject),
      el('div', { class: 'pill-row' }, dayButtons),
      select,
      el('div', { class: 'sheet-actions' }, [cancel, save]),
    ]);
    const scrim = el('div', { class: 'scrim' });
    scrim.addEventListener('click', close);
    root.replaceChildren(scrim, sheet);
    root.classList.add('open');
  };
})();
