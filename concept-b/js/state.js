/* One shared store (memory + localStorage) used by every screen. Views subscribe and re-render on change. */
(function () {
  const B = (window.B = window.B || {});
  const KEY = 'concept-b-state-v1';
  const listeners = [];

  /** Sample-data starting point. */
  function seed() {
    const mail = {};
    B.DATA.emails.forEach((email) => {
      mail[email.id] = { replied: !!email.seedReplied, sorted: false, action: null, skipped: false, read: false, replyBy: null, replyText: email.seedReplied ? email.cannedReply : '' };
    });
    return { readerIndex: 0, mail, undo: [] };
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (saved && saved.mail && B.DATA.emails.every((email) => saved.mail[email.id])) return saved;
    } catch (error) {
      console.warn('concept-b: saved demo state could not be read, starting fresh', error);
    }
    return seed();
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(B.state)); } catch (error) { console.warn('concept-b: demo state could not be saved (private mode or blocked storage)', error); }
  }

  B.state = load();

  /** Runs a mutation, saves, and tells every view. */
  B.change = function (mutate) {
    mutate(B.state);
    save();
    listeners.forEach((listener) => {
      try { listener(); } catch (error) { console.error('concept-b: a screen failed to update', error); }
    });
  };

  B.subscribe = (listener) => listeners.push(listener);

  /** Restores the sample data (also clears the tour flag so the guide shows again). */
  B.resetDemo = function () {
    try { localStorage.removeItem('concept-b-tour-seen'); } catch (error) { console.warn('concept-b: tour flag could not be cleared', error); }
    if (B.reader) B.reader.stop();
    B.change((state) => Object.assign(state, seed()));
  };

  /** Marks an email replied (reader dictation, quick reply swipe). */
  B.markReplied = (id, text) => B.change((state) => {
    Object.assign(state.mail[id], { replied: true, sorted: true, action: state.mail[id].action || 'reply', replyText: text });
  });

  /** Sets the user's reply-by time for an email (shows on the calendar). */
  B.setReplyBy = (id, day, time) => B.change((state) => { state.mail[id].replyBy = { day, time }; });
})();
