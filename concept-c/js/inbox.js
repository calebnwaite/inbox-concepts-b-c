/* Desktop inbox: sections, animated live reordering (FLIP), hand-off suggestions. */
const Inbox = (() => {
  const rows = new Map();        // email id -> persistent row element
  const sectionOf = new Map();   // email id -> 'priority' | 'rest' as last rendered
  let pending = null;            // { id } while a suggestion awaits confirmation

  function suggestionHtml(email, state) {
    const action = state.actions[email.id];
    if (action) {
      return `<span class="chip chip-done" data-status="${action.type}">✓ ${U.esc(email.suggest.done)}</span>
        <button class="link-btn" data-act="undo-suggest" data-id="${email.id}">Undo</button>`;
    }
    if (!email.suggest || state.dismissed[email.id]) return '';
    if (pending === email.id) {
      const question = email.suggest.type === 'forward' ? `Forward to ${DATA.handoff} (simulated)?` : 'Set a follow-up reminder for Monday?';
      return `<span class="confirm-text">${question}</span>
        <button class="btn-mini btn-mini-primary" data-act="confirm-suggest" data-id="${email.id}">Confirm</button>
        <button class="btn-mini" data-act="cancel-suggest" data-id="${email.id}">Cancel</button>`;
    }
    return `<button class="suggest-btn" data-act="suggest" data-id="${email.id}" data-type="${email.suggest.type}">${U.esc(email.suggest.label)}</button>
      <button class="dismiss-btn" data-act="dismiss-suggest" data-id="${email.id}" aria-label="Dismiss suggestion: ${U.esc(email.suggest.label)}" title="Dismiss">×</button>`;
  }

  function rowHtml(email, state, section) {
    const sender = DATA.senders[email.sender];
    const reason = Learning.priorityReason(state, email);
    const badge = reason === 'swiped' ? '<span class="badge badge-swiped">Swiped</span>' : reason === 'learned' ? '<span class="badge badge-learned">Learned</span>' : '';
    const later = state.decisions[email.id] === 'later' ? '<span class="badge badge-later">Later</span>' : '';
    const extra = section === 'rest' ? suggestionHtml(email, state) : '';
    return `<div class="row-main"><span class="row-sender">${U.esc(sender.short)}</span>
      <span class="row-subject"><span class="subject-text">${U.esc(email.subject)}</span>${badge}${later}</span><span class="row-time">${U.esc(email.time)}</span></div>
      ${extra ? `<div class="row-extra">${extra}</div>` : ''}`;
  }

  function rowFor(email) {
    if (!rows.has(email.id)) {
      const node = document.createElement('li');
      node.className = 'row';
      node.dataset.id = email.id;
      rows.set(email.id, node);
    }
    return rows.get(email.id);
  }

  /* FLIP: measure, reorder in the DOM, then animate each row from its old spot. */
  function reorder(container, list, state, section) {
    list.forEach((email) => {
      const node = rowFor(email);
      node.innerHTML = rowHtml(email, state, section);
      node.dataset.section = section;
      container.appendChild(node);
    });
    return list.map((email) => rows.get(email.id));
  }

  function animateMoves(nodes, before) {
    if (U.reducedMotion()) return;
    nodes.forEach((node) => {
      const id = node.dataset.id;
      const old = before.get(id);
      const now = node.getBoundingClientRect();
      if (old && (old.top !== now.top || old.left !== now.left) && node.animate) {
        node.animate([{ transform: `translate(${old.left - now.left}px, ${old.top - now.top}px)` }, { transform: 'none' }],
          { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' });
      }
      if (sectionOf.get(id) && sectionOf.get(id) !== node.dataset.section && node.animate) {
        node.animate([{ backgroundColor: 'rgba(196,87,42,.22)' }, { backgroundColor: 'rgba(196,87,42,0)' }], { duration: 1400, easing: 'ease-out' });
      }
      sectionOf.set(id, node.dataset.section);
    });
  }

  function render(state) {
    const { priority, rest } = Learning.sortInbox(state);
    const before = new Map();
    rows.forEach((node, id) => { if (node.isConnected) before.set(id, node.getBoundingClientRect()); });
    const priorityList = U.$('#list-priority'), restList = U.$('#list-rest');
    const nodes = reorder(priorityList, priority, state, 'priority').concat(reorder(restList, rest, state, 'rest'));
    U.$('#priority-empty').hidden = priority.length > 0;
    U.$('#priority-count').textContent = priority.length;
    U.$('#rest-count').textContent = rest.length;
    animateMoves(nodes, before);
    Why.render(state, priority);
  }

  function onClick(event) {
    const button = event.target.closest('[data-act]');
    if (!button) return;
    const id = button.dataset.id;
    const act = button.dataset.act;
    if (act === 'suggest') pending = id;
    else if (act === 'cancel-suggest') pending = null;
    else if (act === 'confirm-suggest') {
      pending = null;
      const type = DATA.byId[id].suggest.type;
      State.mutate((state) => { state.actions[id] = { type }; });
      U.toast(DATA.byId[id].suggest.done);
      return;
    } else if (act === 'dismiss-suggest') { State.mutate((state) => { state.dismissed[id] = true; }); return; }
    else if (act === 'undo-suggest') { State.mutate((state) => { delete state.actions[id]; }); return; }
    else return;
    render(State.get());
  }

  function init() {
    U.$('#inbox').addEventListener('click', onClick);
    State.subscribe(render);
  }

  return { init, render };
})();
