/* Per-sender learning: every swipe nudges a confidence score for that sender. */
const Learning = (() => {
  const PRIORITY_THRESHOLD = 0.65;

  function counts(state, senderKey) {
    const past = DATA.history[senderKey] || { right: 0, left: 0 };
    let right = past.right, left = past.left;
    DATA.emails.forEach((email) => {
      if (email.sender !== senderKey) return;
      if (state.decisions[email.id] === 'priority') right++;
      if (state.decisions[email.id] === 'later') left++;
    });
    return { right, left };
  }

  /* Laplace-smoothed share of this sender's emails you marked priority, 0..1. */
  function senderScore(state, senderKey) {
    const { right, left } = counts(state, senderKey);
    return (right + 1) / (right + left + 2);
  }

  /* Why an email sits where it does: 'swiped' | 'learned' | null (not priority). */
  function priorityReason(state, email) {
    const decision = state.decisions[email.id];
    if (decision === 'priority') return 'swiped';
    if (decision === 'later') return null;
    return senderScore(state, email.sender) >= PRIORITY_THRESHOLD ? 'learned' : null;
  }

  function rankValue(state, email) {
    return senderScore(state, email.sender) + (state.decisions[email.id] === 'priority' ? 1 : 0);
  }

  /* Returns { priority: [email], rest: [email] }, each in display order. */
  function sortInbox(state) {
    const priority = [], rest = [];
    DATA.emails.forEach((email) => (priorityReason(state, email) ? priority : rest).push(email));
    priority.sort((a, b) => rankValue(state, b) - rankValue(state, a) || b.mins - a.mins);
    const restRank = (email) => (state.decisions[email.id] === 'later' ? -1 : 0);
    rest.sort((a, b) => restRank(b) - restRank(a) || b.mins - a.mins);
    return { priority, rest };
  }

  /* Overall sorting confidence, 0..100: grows with every swipe. */
  function confidence(state) {
    return Math.min(96, 42 + state.order.length * 5);
  }

  function reasonText(state, email) {
    const reason = priorityReason(state, email);
    const { right, left } = counts(state, email.sender);
    const name = DATA.senders[email.sender].short;
    if (reason === 'swiped') return `You swiped this right. ${name} now has ${right} priority marks.`;
    if (reason === 'learned') return `Not swiped yet. You marked ${right} of ${right + left} from ${name} as priority.`;
    return '';
  }

  const queue = (state) => DATA.emails.filter((email) => !state.decisions[email.id]);

  return { counts, senderScore, priorityReason, sortInbox, confidence, reasonText, queue };
})();
