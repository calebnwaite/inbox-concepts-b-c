/* Screen 3: Easy swipe organizer. Forward up, Reply right, Save down, Delete left; buttons do the same. */
(function () {
  const B = (window.B = window.B || {});
  const { el, icons } = B;

  const ACTIONS = {
    up: { action: 'forward', label: 'Forward', icon: 'up' },
    right: { action: 'reply', label: 'Reply', icon: 'right' },
    down: { action: 'save', label: 'Save', icon: 'down' },
    left: { action: 'delete', label: 'Delete', icon: 'left' },
  };

  function toastFor(action, email) {
    if (action === 'forward') return 'Forwarded to ' + email.forwardTo + ' (simulated).';
    if (action === 'reply') return 'Quick reply sent to ' + email.from + ' (simulated).';
    if (action === 'save') return 'Saved to the ' + (email.cat === 'update' ? 'Updates' : 'Project') + ' folder.';
    return 'Moved to Deleted.';
  }

  /** Applies a swipe/button action to the email on top of the pile and remembers how to undo it. */
  function apply(direction, email) {
    const { action } = ACTIONS[direction];
    const before = JSON.parse(JSON.stringify(B.state.mail[email.id]));
    B.change((state) => {
      state.undo.push({ id: email.id, before });
      const status = state.mail[email.id];
      status.sorted = true;
      status.action = action;
      if (action === 'reply') { status.replied = true; status.replyText = email.cannedReply; }
    });
    B.toast(toastFor(action, email), { label: 'Undo', run: undo });
  }

  function undo() {
    const last = B.state.undo[B.state.undo.length - 1];
    if (!last) { B.toast('Nothing to undo.'); return; }
    B.change((state) => { state.undo.pop(); state.mail[last.id] = last.before; });
    B.toast('Put back in your pile.');
  }

  function emailCard(email, status) {
    const card = el('article', { id: 'swipe-card', class: 'swipe-card', 'data-email': email.id, 'aria-label': 'Email from ' + email.fullName + ': ' + email.subject }, [
      el('p', { class: 'card-meta' }, email.fullName + ' · ' + email.role + ' · ' + email.time),
      el('h2', { class: 'card-title' }, email.subject),
      el('p', { class: 'ai-label' }, 'AI summary'),
      el('p', { class: 'card-summary' }, email.summary),
      el('p', { class: 'card-body' }, email.body),
      email.attachments ? el('p', { class: 'card-attach' }, email.attachments) : null,
      status.replied ? el('p', { class: 'card-replied' }, 'Already replied') : null,
    ]);
    return card;
  }

  function highlight(stage, direction, pull) {
    B.$$('.edge', stage).forEach((edge) => {
      const on = edge.dataset.dir === direction;
      edge.style.setProperty('--pull', on ? pull.toFixed(2) : '0');
      edge.classList.toggle('active', on && pull >= 1);
    });
  }

  function emptyState() {
    const again = el('button', { type: 'button', id: 'sort-again', class: 'btn btn-dark' }, 'Start the demo over');
    again.addEventListener('click', () => B.resetDemo());
    const back = el('button', { type: 'button', id: 'undo-empty', class: 'btn btn-ghost-dark' }, [el('span', { class: 'ico' }), 'Undo last']);
    back.firstChild.innerHTML = icons.undo;
    back.addEventListener('click', undo);
    const counts = B.folderCounts();
    const check = el('div', { class: 'empty-check' });
    check.innerHTML = icons.check;
    return el('div', { id: 'sort-empty', class: 'sort-empty' }, [
      check,
      el('h2', { class: 'title' }, 'Inbox sorted'),
      el('p', { class: 'muted' }, counts.forward + ' forwarded · ' + counts.reply + ' replied · ' + counts.save + ' saved · ' + counts.delete + ' deleted'),
      el('div', { class: 'empty-actions' }, [back, again]),
    ]);
  }

  function actionButton(direction) {
    const { label, icon, action } = ACTIONS[direction];
    const button = el('button', { type: 'button', class: 'act-btn', 'data-act': action, 'data-dir': direction, 'aria-label': label + ' (swipe ' + direction + ')' }, [el('span', { class: 'ico' }), el('span', {}, label)]);
    button.firstChild.innerHTML = icons[icon];
    return button;
  }

  function render() {
    const section = B.$('#screen-organizer');
    if (!section) return;
    const queue = B.queue();
    const header = el('header', { class: 'topbar light' }, [el('p', { id: 'left-count', class: 'eyebrow' }, queue.length + ' left to sort'), B.helpButton()]);
    if (!queue.length) { section.replaceChildren(header, emptyState()); return; }

    const email = queue[0];
    const card = emailCard(email, B.state.mail[email.id]);
    const stage = el('div', { class: 'stage', id: 'stage' }, [
      ...Object.entries(ACTIONS).map(([direction, info]) => {
        const edge = el('span', { class: 'edge edge-' + direction, 'data-dir': direction }, [info.label.toUpperCase(), el('i', { class: 'ico' })]);
        edge.lastChild.innerHTML = icons[info.icon];
        return edge;
      }),
      queue.length > 1 ? el('div', { class: 'swipe-card behind', 'aria-hidden': 'true' }) : null,
      card,
    ]);
    B.attachSwipe(card, {
      onMove: (dx, dy, direction, pull) => highlight(stage, direction, pull),
      onRelease: (direction) => { if (!direction) highlight(stage, null, 0); },
      onFling: (direction) => apply(direction, email),
    });

    const buttons = el('div', { class: 'act-row' }, ['up', 'right', 'down', 'left'].map(actionButton));
    buttons.addEventListener('click', (event) => {
      const button = event.target.closest('.act-btn');
      if (!button || card.classList.contains('flung')) return;
      highlight(stage, button.dataset.dir, 1);
      B.flingCard(card, button.dataset.dir, () => apply(button.dataset.dir, email));
    });
    const undoButton = el('button', { type: 'button', id: 'undo', class: 'pill-btn dark-text', disabled: !B.state.undo.length }, [el('span', { class: 'ico' }), 'Undo']);
    undoButton.firstChild.innerHTML = icons.undo;
    undoButton.addEventListener('click', undo);
    const replyBy = el('button', { type: 'button', id: 'organizer-replyby', class: 'pill-btn dark-text' }, [el('span', { class: 'ico' }), 'Set reply-by']);
    replyBy.firstChild.innerHTML = icons.clock;
    replyBy.addEventListener('click', () => B.openReplyBy(email.id));

    section.replaceChildren(header, stage, el('p', { class: 'hint' }, 'Swipe in any direction'), buttons, el('div', { class: 'pill-btn-row' }, [undoButton, replyBy]));
  }

  B.organizer = { render };
})();
