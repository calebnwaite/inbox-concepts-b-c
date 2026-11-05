/* Canned, keyword-matched chatbot answers. They read the shared state, so they follow the swipes. */
const Answers = (() => {
  const names = (list) => list.map((email) => `“${email.subject}”`).join(', ');
  const priorityOf = (state) => Learning.sortInbox(state).priority;

  const topics = [
    { words: ['reply', 'respond', 'answer today', 'waiting on me'], answer: (state) => {
      const needs = priorityOf(state).filter((email) => email.needsReply);
      return needs.length
        ? `${needs.length} priority email${needs.length > 1 ? 's need' : ' needs'} a reply today: ${names(needs)}.${needs.some((email) => email.id === 'e1') ? ' The inspection confirmation is the most urgent because Dana is holding the slot.' : ''}`
        : 'Nothing priority needs a reply yet. Swipe a few emails to Priority and I will tell you which ones are waiting on you.';
    } },
    { words: ['corey', 'supplier', 'lumber', 'rebar', 'pour'], answer: (state) => {
      const emails = DATA.emails.filter((email) => email.sender === 'corey');
      const lines = emails.map((email) => `${email.quick.replace(/^[^:]+: /, '')}`);
      const score = Math.round(Learning.senderScore(state, 'corey') * 100);
      return `Corey sent ${emails.length} emails: ${lines.join('; ')}. Only the pour needs an answer from you. I’m ${score}% sure his emails are priority for you.`;
    } },
    { words: ['change order', 'co-12', 'co 12', '4b', 'priya', 'electrical'], answer: () =>
      'Change order 12 for unit 4B adds $41,200. Priya, the owner’s rep, asks why electrical rose $8,400 and wants a breakdown before approving. The revised unit 4B plan and a CO-12 summary are attached.' },
    { words: ['inspection', 'inspector', 'dana', 'framing'], answer: () =>
      'The city moved the framing inspection from Friday to Wednesday at 10 AM. Level 2 framing in unit 4B needs to be finished and fire-blocked by then, and Dana wants your confirmation today.' },
    { words: ['thomas', 'forward', 'hand off', 'hand-off', 'delegate'], answer: (state) => {
      const open = DATA.emails.filter((email) => email.suggest && email.suggest.type === 'forward' && !state.actions[email.id]);
      return open.length ? `I’d hand these to Thomas: ${names(open)}. You can do it from the “Forward to Thomas?” buttons in the inbox.` : 'Everything I suggested handing off is already forwarded to Thomas (simulated).';
    } },
    { words: ['summar', 'priority', 'overview', 'catch me up', 'what matters'], answer: (state) => {
      const list = priorityOf(state);
      return list.length ? `You have ${list.length} priority emails: ${list.map((email) => email.quick).join('; ')}.` : 'No priority emails yet. Swipe on the Sort tab and I will summarize them.';
    } },
  ];

  const fallback = 'I can answer questions about today’s email: what needs a reply, anything from Corey, the change order, the inspection, or a summary of your priority email. Try one of the suggestions below.';

  function answer(state, question) {
    const text = question.toLowerCase();
    const topic = topics.find((entry) => entry.words.some((word) => text.includes(word)));
    return topic ? topic.answer(state) : fallback;
  }

  return { answer, fallback };
})();
