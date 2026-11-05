/* Derived views of the shared state: queue, deadlines, calendar items, workload stats. */
(function () {
  const B = (window.B = window.B || {});
  const emailById = (id) => B.DATA.emails.find((email) => email.id === id);
  B.emailById = emailById;

  /** The deadline in force: the user's choice, else the email's default, else null. */
  B.replyByOf = (id, state) => (state || B.state).mail[id].replyBy || emailById(id).replyBy;

  /** Emails still to sort, in the order the swipe card shows them. */
  B.queue = (state) => B.DATA.emails
    .filter((email) => !(state || B.state).mail[email.id].sorted)
    .sort((a, b) => (a.queueRank ?? 99) - (b.queueRank ?? 99));

  /** Calendar entries for a day, in time order. Reply items come from emails and follow their replied state. */
  B.calendarItems = function (day) {
    const items = B.DATA.events.filter((event) => event.day === day).map((event) => ({ ...event, kind: 'event' }));
    B.DATA.emails.forEach((email) => {
      const replyBy = B.replyByOf(email.id);
      const status = B.state.mail[email.id];
      if (!replyBy || replyBy.day !== day || status.action === 'delete') return;
      items.push({
        id: 'reply-' + email.id, kind: 'reply', day, time: replyBy.time, emailId: email.id, replied: status.replied,
        title: 'Reply to ' + email.from, note: status.replied ? 'Replied' : 'Due by ' + B.dueText(replyBy),
      });
    });
    return items.sort((a, b) => B.toMinutes(a.time) - B.toMinutes(b.time));
  };

  /** Number of unreplied reply-by deadlines that fall before Wednesday. */
  B.repliesDueBeforeWednesday = () => B.DATA.emails.filter((email) => {
    const replyBy = B.replyByOf(email.id);
    const status = B.state.mail[email.id];
    return replyBy && B.DATA.beforeWednesday.includes(replyBy.day) && !status.replied && status.action !== 'delete';
  }).length;

  /** Counts per swipe action (the folders). */
  B.folderCounts = function () {
    const counts = { forward: 0, reply: 0, save: 0, delete: 0 };
    B.DATA.emails.forEach((email) => { const action = B.state.mail[email.id].action; if (action in counts) counts[action] += 1; });
    return counts;
  };

  /* Workload: starts at the mockup's numbers and moves as emails are handled. */
  const WORKLOAD_START = { priority: 32, project: 80, updates: 53, forwards: 23, replyBy: 40, track: 83 };

  function workloadShift(state) {
    const shift = { priority: 0, project: 0, updates: 0, forwards: 0, replyBy: 0, track: 0 };
    const catKey = { priority: 'priority', project: 'project', update: 'updates' };
    B.DATA.emails.forEach((email) => {
      const status = state.mail[email.id];
      if (!(status.sorted || status.replied)) return;
      shift[catKey[email.cat]] -= 8;
      shift.track += 3;
      if (status.action === 'forward') shift.forwards += 12;
      if (status.replied && B.replyByOf(email.id, state)) shift.replyBy -= 10;
    });
    return shift;
  }

  /** The six workload numbers (percent) relative to the sample data's starting point. */
  B.workload = function () {
    const base = workloadShift(seedState());
    const now = workloadShift(B.state);
    const result = {};
    Object.keys(WORKLOAD_START).forEach((key) => { result[key] = Math.max(4, Math.min(99, WORKLOAD_START[key] + now[key] - base[key])); });
    return result;
  };

  function seedState() {
    const mail = {};
    B.DATA.emails.forEach((email) => { mail[email.id] = { replied: !!email.seedReplied, sorted: false, action: null, replyBy: null }; });
    return { mail };
  }
})();
