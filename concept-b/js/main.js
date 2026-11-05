/* Shell: bottom tab bar, screen switching, first render. Loaded last. */
(function () {
  const B = (window.B = window.B || {});
  const SCREENS = [
    { id: 'reader', label: 'Listen', icon: 'listen', caption: 'Verbal updates', text: 'Your phone reads each email aloud. Tap the mic to answer by voice, skip, or set a reply-by time.' },
    { id: 'calendar', label: 'Day', icon: 'day', caption: 'Automatic calendar', text: 'Reply deadlines land on your calendar by themselves and get struck through once you reply.' },
    { id: 'organizer', label: 'Sort', icon: 'sort', caption: 'Easy swipe organizer', text: 'Clear the inbox with four swipes: forward up, reply right, save down, delete left.' },
    { id: 'workload', label: 'Work', icon: 'work', caption: 'Folders + workload', text: 'See what is heavy this week. The numbers move as you reply and sort.' },
  ];
  let active = 'reader';

  /** Shows one screen and highlights its tab. */
  B.showScreen = function (id) {
    const info = SCREENS.find((screen) => screen.id === id);
    if (!info) { console.warn('concept-b: unknown screen', id); return; }
    active = id;
    B.$('#device').dataset.screen = id;
    SCREENS.forEach((screen) => {
      B.$('#screen-' + screen.id).hidden = screen.id !== id;
      const tab = B.$('[data-tab="' + screen.id + '"]');
      tab.classList.toggle('active', screen.id === id);
      tab.setAttribute('aria-selected', String(screen.id === id));
    });
    B.$('#caption-title').textContent = info.caption;
    B.$('#caption-text').textContent = info.text;
    if (id !== 'reader') B.reader.stop();
    if (id !== 'calendar') { B.stopSpeaking(); B.calendar.stop(); }
    B.$('#screen-' + id).scrollTop = 0;
  };

  function renderAll() {
    B.reader.render();
    B.calendar.render();
    B.organizer.render();
    B.workloadScreen.render();
  }

  function buildTabs() {
    const bar = B.$('#tabbar');
    SCREENS.forEach((screen) => {
      const tab = B.el('button', { type: 'button', class: 'tab', role: 'tab', 'data-tab': screen.id }, [B.el('span', { class: 'ico' }), B.el('span', { class: 'tab-label' }, screen.label)]);
      tab.firstChild.innerHTML = B.icons[screen.icon];
      tab.addEventListener('click', () => B.showScreen(screen.id));
      bar.append(tab);
    });
  }

  function start() {
    buildTabs();
    B.subscribe(renderAll);
    renderAll();
    B.showScreen(active);
    B.$('#caption-reset').addEventListener('click', () => { B.resetDemo(); B.toast('Demo reset to the sample inbox.'); });
    B.$('#caption-tour').addEventListener('click', () => B.tour.start());
    B.tour.startIfNew();
  }

  try {
    start();
  } catch (error) {
    console.error('concept-b: the prototype failed to start', error);
    document.body.insertAdjacentHTML('afterbegin', '<p class="fatal">Something went wrong starting the prototype. Reload the page, or clear this site\'s saved data and try again.</p>');
  }
})();
