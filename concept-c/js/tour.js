/* Short dismissable guided hint. Replay with the "?" button. */
const Tour = (() => {
  const SEEN_KEY = 'concept-c-tour-seen';
  let step = 0;
  const root = () => U.$('#tour');

  function show() {
    const item = DATA.tour[step];
    const last = step === DATA.tour.length - 1;
    root().hidden = false;
    root().innerHTML = `<p class="tour-step">Step ${step + 1} of ${DATA.tour.length}</p><h2>${U.esc(item.title)}</h2><p>${U.esc(item.text)}</p>
      <div class="tour-actions"><button type="button" class="link-btn" data-tour="close">Skip</button>
      <button type="button" class="btn-mini btn-mini-primary" data-tour="${last ? 'close' : 'next'}">${last ? 'Got it' : 'Next'}</button></div>`;
  }

  function close() {
    root().hidden = true;
    try { localStorage.setItem(SEEN_KEY, '1'); } catch (error) { console.warn('Could not remember that the tour was seen.', error); }
  }

  function start() { step = 0; show(); }

  function init() {
    root().addEventListener('click', (event) => {
      const action = event.target.closest('[data-tour]');
      if (!action) return;
      if (action.dataset.tour === 'next') { step += 1; show(); } else close();
    });
    U.$('#tour-btn').addEventListener('click', start);
    let seen = false;
    try { seen = localStorage.getItem(SEEN_KEY) === '1'; } catch (error) { console.warn('Could not read tour state.', error); }
    if (!seen && !/[?&]notour\b/.test(location.search)) start();
  }

  return { init, start };
})();
