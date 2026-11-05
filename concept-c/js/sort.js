/* Phone screen 1: the Sort card stack. Writes decisions to the shared state. */
const Sort = (() => {
  const root = () => U.$('#sort-screen');
  const STACK_DEPTH = 3;

  function cardHtml(email) {
    const sender = DATA.senders[email.sender];
    return `<div class="stamp stamp-later">LATER</div><div class="stamp stamp-priority">PRIORITY</div>
      <div class="card-meta">From: ${U.esc(sender.name)} · ${U.esc(email.time)}</div>
      <h2 class="card-subject">${U.esc(email.subject)}</h2>
      <p class="card-preview">${U.esc(email.preview)}</p>${Thumbs.listHtml(email.attach)}`;
  }

  function decide(emailId, direction) {
    State.mutate((state) => {
      state.decisions[emailId] = direction > 0 ? 'priority' : 'later';
      state.order.push(emailId);
    });
  }

  function undo() {
    State.mutate((state) => {
      const last = state.order.pop();
      if (last) delete state.decisions[last];
    });
  }

  /* Detach the top card so it can fly away while the stack and inbox update at once. */
  function commit(card, emailId, direction) {
    const ghost = card;
    ghost.classList.add('leaving');
    ghost.style.pointerEvents = 'none';
    decide(emailId, direction);
    Swipe.flyOff(ghost, direction).then(() => ghost.remove());
  }

  function highlightEdges(dx) {
    const screen = root();
    const strength = Math.min(1, Math.abs(dx) / 100);
    screen.style.setProperty('--later', dx < 0 ? strength : 0);
    screen.style.setProperty('--priority', dx > 0 ? strength : 0);
  }

  function renderStack(state, queue) {
    const stack = U.$('.stack', root());
    U.$$('.card:not(.leaving)', stack).forEach((node) => node.remove());
    queue.slice(0, STACK_DEPTH).reverse().forEach((email, index, shown) => {
      const depth = shown.length - 1 - index;
      const card = document.createElement('article');
      card.className = `card depth-${depth}`;
      card.dataset.id = email.id;
      card.innerHTML = cardHtml(email);
      stack.appendChild(card);
      if (depth === 0) {
        card.setAttribute('aria-label', `Email: ${email.subject}. Swipe right for priority, left for later.`);
        Swipe.attach(card, { onMove: highlightEdges, onCommit: (direction) => { highlightEdges(0); commit(card, email.id, direction); } });
      }
    });
  }

  function render(state) {
    const queue = Learning.queue(state);
    const screen = root();
    U.$('.sort-count', screen).textContent = queue.length ? `${queue.length} left` : 'All sorted';
    screen.classList.toggle('is-empty', queue.length === 0);
    U.$('[data-act="undo"]', screen).disabled = state.order.length === 0;
    U.$$('[data-act="later"],[data-act="priority"]', screen).forEach((button) => { button.disabled = queue.length === 0; });
    U.$('.sort-done-text', screen).textContent = `You marked ${Object.values(state.decisions).filter((d) => d === 'priority').length} as priority and ${Object.values(state.decisions).filter((d) => d === 'later').length} for later.`;
    renderStack(state, queue);
  }

  function swipeTopCard(direction) {
    const card = U.$('.card.depth-0:not(.leaving)', root());
    if (!card) return;
    card.style.transition = 'none';
    commit(card, card.dataset.id, direction);
  }

  function init() {
    const screen = root();
    U.$('[data-act="later"]', screen).addEventListener('click', () => swipeTopCard(-1));
    U.$('[data-act="priority"]', screen).addEventListener('click', () => swipeTopCard(1));
    U.$('[data-act="undo"]', screen).addEventListener('click', undo);
    U.$('[data-act="to-summary"]', screen).addEventListener('click', () => App.setView('summary'));
    screen.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') swipeTopCard(1);
      if (event.key === 'ArrowLeft') swipeTopCard(-1);
    });
    State.subscribe(render);
  }

  return { init, render };
})();
