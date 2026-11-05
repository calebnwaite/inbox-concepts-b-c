/* Phone screen 3: the daily summary, built from the same shared state as the inbox. */
const Summary = (() => {
  function depthHtml(email, state) {
    const sender = DATA.senders[email.sender];
    return `<article class="depth-item"><h3><span class="who">${U.esc(sender.short)}</span> ${U.esc(email.subject)}</h3>
      <p>${U.esc(email.depth)}</p>${Thumbs.listHtml(email.attach)}</article>`;
  }

  function quickHtml(email, state) {
    const action = state.actions[email.id];
    const note = action ? ` <em>${U.esc(email.suggest.done)}</em>` : '';
    return `<li>${U.esc(email.quick)}${note}</li>`;
  }

  function render(state) {
    const { priority, rest } = Learning.sortInbox(state);
    U.$('#summary-priority').innerHTML = priority.length
      ? priority.map((email) => depthHtml(email, state)).join('')
      : '<p class="empty-note">Nothing marked priority yet. Swipe on the Sort tab and it will show up here in depth.</p>';
    U.$('#summary-rest').innerHTML = rest.map((email) => quickHtml(email, state)).join('');
  }

  function init() { State.subscribe(render); }

  return { init, render };
})();
