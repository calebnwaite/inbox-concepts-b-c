/* One shared store for the phone and the desktop. Lives in memory, saved to localStorage, synced across tabs. */
const State = (() => {
  const KEY = 'concept-c-state-v1';
  const listeners = new Set();
  let state = load();

  function seed() {
    return { decisions: {}, order: [], actions: {}, dismissed: {}, chat: [], view: 'sort' };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return { ...seed(), ...JSON.parse(raw) };
    } catch (error) {
      console.error('Saved demo data was unreadable; starting fresh.', error);
    }
    return seed();
  }

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (error) {
      console.error('Could not save demo data (private mode or storage full); changes last until reload.', error);
    }
  }

  function notify() {
    listeners.forEach((fn) => U.safely('screen', () => fn(state)));
  }

  window.addEventListener('storage', (event) => {
    if (event.key === KEY) { state = load(); notify(); }
  });

  return {
    get: () => state,
    subscribe(fn) { listeners.add(fn); },
    mutate(fn) { fn(state); persist(); notify(); },
    reset() {
      try { localStorage.removeItem(KEY); } catch (error) { console.error('Could not clear saved demo data.', error); }
      state = seed();
      notify();
    },
  };
})();
