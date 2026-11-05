/* Screen 1: Verbal updates. Reads one email at a time, lets the user answer by voice (simulated or real). */
(function () {
  const B = (window.B = window.B || {});
  const { el, icons } = B;
  const root = () => B.$('#screen-reader');

  /* Local, per-visit state: which phase the reply is in and whether the summary is being read aloud. */
  const local = { phase: 'idle', text: '', editing: false, reading: false, useRealMic: false, cancelDictation: null };

  const current = () => B.DATA.emails[B.state.readerIndex];

  function waveform() {
    const bars = Array.from({ length: 29 }, (_, i) => {
      const height = 28 + Math.round(Math.abs(Math.sin(i * 1.7) * 46 + Math.cos(i * 0.6) * 18));
      return el('span', { class: 'bar', style: `--h:${Math.min(height, 100)}%;--d:${(i % 7) * 0.11}s` });
    });
    return el('div', { class: 'wave', 'aria-hidden': 'true' }, bars);
  }

  function replyByLabel(email) {
    const replyBy = B.replyByOf(email.id);
    return replyBy ? 'Reply by ' + replyBy.day + ' ' + B.dueText(replyBy) : 'No reply-by yet';
  }

  function goTo(index) {
    stopEverything();
    B.change((state) => { state.readerIndex = index; });
  }

  function stopEverything() {
    B.stopSpeaking();
    if (local.cancelDictation) local.cancelDictation();
    Object.assign(local, { phase: 'idle', text: '', editing: false, reading: false, cancelDictation: null });
  }

  function advance(kind) {
    const email = current();
    B.change((state) => { state.mail[email.id][kind === 'skip' ? 'skipped' : 'read'] = true; });
    goTo(Math.min(B.state.readerIndex + 1, B.DATA.emails.length));
  }

  function toggleReadAloud() {
    if (local.reading) { B.stopSpeaking(); return; }
    local.reading = true;
    paintReadingState();
    const email = current();
    B.speak(email.from + '. ' + email.summary, () => { local.reading = false; paintReadingState(); });
  }

  /** Cheap partial update so the waveform and button react without rebuilding the screen. */
  function paintReadingState() {
    const section = root();
    section.classList.toggle('is-reading', local.reading);
    const button = B.$('#read-aloud', section);
    if (button) button.replaceChildren(B.el('span', { class: 'ico' }), local.reading ? 'Stop' : 'Read aloud');
    if (button) { button.firstChild.innerHTML = local.reading ? icons.stop : icons.speaker; button.setAttribute('aria-pressed', String(local.reading)); }
  }

  function startReply() {
    if (local.phase === 'listening') return;
    B.stopSpeaking();
    const email = current();
    Object.assign(local, { phase: 'listening', text: '', editing: false, reading: false });
    render();
    local.cancelDictation = B.dictate(email.cannedReply, local.useRealMic,
      (text) => { local.text = text; const node = B.$('#transcript', root()); if (node) node.textContent = text; },
      (text) => { local.text = text; local.phase = 'review'; local.cancelDictation = null; render(); });
  }

  function sendReply() {
    const email = current();
    const text = local.editing ? B.$('#reply-edit', root()).value.trim() : local.text;
    if (!text) { B.toast('Type or say a reply first.'); return; }
    stopEverything();
    B.markReplied(email.id, text);
    B.toast('Reply sent to ' + email.from + ' (simulated).');
  }

  function replyPanel(email) {
    if (local.phase === 'idle') return null;
    const listening = local.phase === 'listening';
    const body = local.editing
      ? el('textarea', { id: 'reply-edit', class: 'reply-edit', rows: '3', 'aria-label': 'Edit your reply' }, local.text)
      : el('p', { id: 'transcript', class: 'transcript' + (listening ? ' typing' : '') }, local.text);
    const actions = listening
      ? [actionButton('cancel-reply', 'Cancel', cancelReply, 'btn-ghost')]
      : [
        actionButton('send-reply', 'Send (simulated)', sendReply, 'btn-primary'),
        actionButton('edit-reply', local.editing ? 'Done editing' : 'Edit', toggleEdit, 'btn-ghost'),
        actionButton('cancel-reply', 'Cancel', cancelReply, 'btn-ghost'),
      ];
    return el('div', { id: 'dictation', class: 'dictation', 'aria-live': 'polite' }, [
      el('p', { class: 'dictation-label' }, (listening ? 'Listening… ' : 'Your reply to ') + email.from),
      body,
      el('div', { class: 'dictation-actions' }, actions),
    ]);
  }

  function actionButton(id, label, handler, kind) {
    const button = el('button', { type: 'button', id, class: 'btn ' + kind }, label);
    button.addEventListener('click', handler);
    return button;
  }

  function cancelReply() { stopEverything(); render(); }

  function toggleEdit() {
    if (local.editing) local.text = B.$('#reply-edit', root()).value;
    local.editing = !local.editing;
    render();
    if (local.editing) B.$('#reply-edit', root()).focus();
  }

  function finished() {
    return el('div', { class: 'reader-body done' }, [
      el('p', { class: 'now-label' }, 'All caught up'),
      el('h1', { class: 'headline' }, 'That was all 9 emails.'),
      el('p', { class: 'spoken' }, 'Your reply deadlines are on the calendar. Swipe through the rest on the Sort tab.'),
      actionButton('restart-reading', 'Start over', () => goTo(0), 'btn-primary'),
    ]);
  }

  function render() {
    const section = root();
    if (!section) return;
    if (local.phase === 'listening' && B.$('#dictation', section)) return;
    const total = B.DATA.emails.length;
    const index = B.state.readerIndex;
    section.classList.toggle('is-reading', local.reading);
    section.classList.toggle('is-listening', local.phase === 'listening');
    const header = el('header', { class: 'topbar' }, [
      el('span', { class: 'caps' }, 'Voice mode'),
      el('span', { id: 'reader-counter', class: 'counter' }, Math.min(index + 1, total) + ' of ' + total),
      B.helpButton(),
    ]);
    if (index >= total) { section.replaceChildren(header, finished()); return; }

    const email = current();
    const status = B.state.mail[email.id];
    const readAloud = el('button', { type: 'button', id: 'read-aloud', class: 'pill-btn', 'aria-pressed': String(local.reading) }, [el('span', { class: 'ico' }), local.reading ? 'Stop' : 'Read aloud']);
    readAloud.firstChild.innerHTML = local.reading ? icons.stop : icons.speaker;
    readAloud.addEventListener('click', toggleReadAloud);
    const replyBy = el('button', { type: 'button', id: 'set-replyby', class: 'pill-btn', 'data-email': email.id }, [el('span', { class: 'ico' }), replyByLabel(email) + ' · Set']);
    replyBy.firstChild.innerHTML = icons.clock;
    replyBy.addEventListener('click', () => B.openReplyBy(email.id));

    const mic = el('button', { type: 'button', id: 'mic', class: 'mic', 'aria-label': 'Tap to reply by voice' });
    mic.innerHTML = icons.mic;
    mic.addEventListener('click', startReply);
    const real = el('input', { type: 'checkbox', id: 'real-mic' });
    real.checked = local.useRealMic;
    real.addEventListener('change', () => { local.useRealMic = real.checked; });

    const body = el('div', { class: 'reader-body' }, [
      el('p', { class: 'now-label' }, 'Now reading'),
      el('h1', { id: 'reader-headline', class: 'headline' }, email.headline),
      el('p', { id: 'reader-summary', class: 'spoken' }, email.summary),
      el('div', { class: 'pill-btn-row' }, [readAloud, replyBy]),
      waveform(),
      status.replied ? el('p', { id: 'replied-badge', class: 'replied-badge' }, [el('span', { class: 'ico' }), 'Replied']) : null,
      replyPanel(email) || el('div', { class: 'mic-wrap' }, [mic, el('p', { class: 'mic-label' }, status.replied ? 'Tap to reply again' : 'Tap to reply'), el('p', { class: 'mic-sub' }, 'Say your reply')]),
      el('label', { class: 'real-mic' }, [real, ' Use my real microphone']),
      el('div', { class: 'nav-row' }, [actionButton('skip', 'Skip', () => advance('skip'), 'btn-outline'), actionButton('next', 'Next', () => advance('next'), local.phase === 'idle' ? 'btn-primary' : 'btn-outline')]),
    ]);
    const badge = B.$('.replied-badge .ico', body);
    if (badge) badge.innerHTML = icons.check;
    section.replaceChildren(header, body);
  }

  B.reader = { render, jumpTo(emailId) { goTo(Math.max(0, B.DATA.emails.findIndex((email) => email.id === emailId))); }, stop: stopEverything };
})();
