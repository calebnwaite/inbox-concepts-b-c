/* Screen 4: Folders + workload. Numbers move as emails are replied to or sorted. */
(function () {
  const B = (window.B = window.B || {});
  const { el } = B;

  const STATS = [
    { key: 'priority', label: 'Priority', accent: true },
    { key: 'project', label: 'Project' },
    { key: 'updates', label: 'Updates' },
    { key: 'forwards', label: 'Forwards' },
    { key: 'replyBy', label: 'Reply by' },
    { key: 'track', label: 'Track' },
  ];
  const FOLDERS = [['forward', 'Forwarded'], ['reply', 'Replied'], ['save', 'Saved'], ['delete', 'Deleted']];

  function statCard(stat, value) {
    return el('div', { class: 'stat-card', 'data-stat': stat.key }, [
      el('span', { class: 'stat-label' }, stat.label),
      el('span', { class: 'stat-value', 'data-value': value }, value + '%'),
      el('div', { class: 'bar-track', role: 'progressbar', 'aria-label': stat.label, 'aria-valuenow': String(value), 'aria-valuemin': '0', 'aria-valuemax': '100' },
        el('div', { class: 'bar-fill' + (stat.accent ? ' accent' : ''), style: 'width:' + value + '%' })),
    ]);
  }

  function render() {
    const section = B.$('#screen-workload');
    if (!section) return;
    const numbers = B.workload();
    const heaviest = ['priority', 'project', 'updates'].reduce((best, key) => (numbers[key] > numbers[best] ? key : best), 'priority');
    const heavyLabel = STATS.find((stat) => stat.key === heaviest).label;
    const due = B.repliesDueBeforeWednesday();
    const counts = B.folderCounts();

    const reset = el('button', { type: 'button', id: 'reset-demo', class: 'btn btn-ghost-dark' }, 'Reset demo');
    reset.addEventListener('click', () => { B.resetDemo(); B.toast('Demo reset to the sample inbox.'); });
    const tour = el('button', { type: 'button', id: 'replay-tour', class: 'btn btn-ghost-dark' }, 'Replay tour');
    tour.addEventListener('click', () => B.tour.start());

    section.replaceChildren(
      el('header', { class: 'topbar light' }, [el('div', {}, [el('p', { class: 'eyebrow' }, 'This week'), el('h1', { class: 'title' }, 'Workload')]), B.helpButton()]),
      el('div', { id: 'stat-grid', class: 'stat-grid' }, STATS.map((stat) => statCard(stat, numbers[stat.key]))),
      el('div', { id: 'folders', class: 'folders' }, FOLDERS.map(([key, label]) => el('div', { class: 'folder', 'data-folder': key }, [el('span', { class: 'folder-count' }, String(counts[key])), el('span', { class: 'folder-label' }, label)]))),
      el('p', { id: 'workload-note', class: 'footnote' }, heavyLabel + ' is running heavy, ' + due + (due === 1 ? ' reply is' : ' replies are') + ' due before Wednesday.'),
      el('div', { class: 'screen-foot row' }, [tour, reset]),
    );
  }

  B.workloadScreen = { render };
})();
