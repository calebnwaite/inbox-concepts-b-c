/* Short guided tour: one card per screen. Shows once on first visit; "?" (or Replay tour) shows it again. */
(function () {
  const B = (window.B = window.B || {});
  const { el, icons } = B;
  const SEEN_KEY = 'concept-b-tour-seen';

  const STEPS = [
    { screen: 'reader', title: 'Listen and answer by voice', text: 'Your phone reads each email aloud. Tap the mic to dictate a reply (simulated), or set a reply-by time.' },
    { screen: 'calendar', title: 'Deadlines land on your calendar', text: 'Every reply-by shows up here by itself, and gets struck through once you reply. Tap "Read my day aloud" to hear it.' },
    { screen: 'organizer', title: 'Sort with four swipes', text: 'Drag the card: up to forward, right to reply, down to save, left to delete. The buttons do the same.' },
    { screen: 'workload', title: 'See your week at a glance', text: 'These numbers move as you reply and sort. Reset demo puts the sample inbox back.' },
  ];
  let step = 0;

  /** The "?" button each screen puts in its top bar. */
  B.helpButton = function () {
    const button = el('button', { type: 'button', class: 'icon-btn help-btn', 'data-act': 'help', 'aria-label': 'Show the guided tour' });
    button.innerHTML = icons.help;
    button.addEventListener('click', () => B.tour.start());
    return button;
  };

  function close() {
    B.$('#tour-root').replaceChildren();
    try { localStorage.setItem(SEEN_KEY, '1'); } catch (error) { console.warn('concept-b: tour flag could not be saved', error); }
  }

  function show() {
    const info = STEPS[step];
    B.showScreen(info.screen);
    const last = step === STEPS.length - 1;
    const next = el('button', { type: 'button', id: 'tour-next', class: 'btn btn-primary' }, last ? 'Got it' : 'Next');
    next.addEventListener('click', () => { if (last) close(); else { step += 1; show(); } });
    const skip = el('button', { type: 'button', id: 'tour-skip', class: 'btn btn-quiet' }, 'Skip tour');
    skip.addEventListener('click', close);
    B.$('#tour-root').replaceChildren(el('div', { class: 'tour-card', role: 'dialog', 'aria-label': 'Guided tour' }, [
      el('p', { class: 'tour-step' }, 'Step ' + (step + 1) + ' of ' + STEPS.length),
      el('h2', { class: 'tour-title' }, info.title),
      el('p', { class: 'tour-text' }, info.text),
      el('div', { class: 'tour-actions' }, [skip, next]),
    ]));
  }

  B.tour = {
    start() { step = 0; show(); },
    /** Shows the tour on the first visit only. */
    startIfNew() {
      let seen = false;
      try { seen = localStorage.getItem(SEEN_KEY) === '1'; } catch (error) { console.warn('concept-b: tour flag could not be read', error); }
      if (!seen) B.tour.start();
    },
  };
})();
