/* Wires the screens together: view switching, reset, start-up. */
const App = (() => {
  function setView(view) {
    State.mutate((state) => { state.view = view; });
  }

  function applyView(state) {
    document.body.dataset.view = state.view;
    U.$$('[data-view-tab]').forEach((tab) => {
      const active = tab.dataset.viewTab === state.view || (tab.dataset.viewTab === 'sort' && state.view === 'inbox' && tab.closest('.phone-switch'));
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  function init() {
    try {
      U.$$('[data-view-tab]').forEach((tab) => tab.addEventListener('click', () => setView(tab.dataset.viewTab)));
      U.$('#reset-btn').addEventListener('click', () => { State.reset(); U.toast('Demo reset.'); });
      State.subscribe(applyView);
      Sort.init(); Inbox.init(); Summary.init(); Chat.init(); Tour.init();
      const state = State.get();
      [applyView, Sort.render, Inbox.render, Summary.render, Chat.render].forEach((fn) => fn(state));
    } catch (error) {
      U.fail('The demo could not start. Reload the page, or clear this site’s data.', error);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('error', (event) => console.error('Unexpected error', event.error || event.message));

  return { setView };
})();
