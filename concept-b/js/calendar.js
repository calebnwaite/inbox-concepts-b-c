/* Screen 2: Automatic calendar. Reply-by deadlines from emails appear here; replied ones are struck through. */
(function () {
  const B = (window.B = window.B || {});
  const { el, icons } = B;
  let day = B.DATA.today;
  let reading = false;

  const itemSentence = (item) => item.title + (item.kind === 'reply' && !item.replied ? ', due by ' + item.note.replace('Due by ', '') : item.replied ? ', already replied' : item.note ? ', ' + item.note : '') + ' at ' + item.time;

  function readDayAloud() {
    if (reading) { B.stopSpeaking(); return; }
    const items = B.calendarItems(day);
    const text = items.length
      ? 'Your ' + B.DATA.dayNames[day] + '. ' + items.map(itemSentence).join('. ') + '.'
      : 'Nothing on your ' + B.DATA.dayNames[day] + ' calendar.';
    reading = true;
    render();
    B.speak(text, () => { reading = false; render(); });
  }

  function card(item) {
    const open = item.kind === 'reply';
    const node = el(open ? 'button' : 'div', {
      type: open ? 'button' : false, class: 'cal-card' + (item.kind === 'reply' ? ' is-reply' : '') + (item.replied ? ' is-replied' : ''),
      'data-item': item.id, 'aria-label': open ? item.title + ', ' + item.note + '. Open in reader' : false,
    }, [el('span', { class: 'cal-title' }, item.title), el('span', { class: 'cal-note' }, item.replied ? 'Replied · Sent' : item.note)]);
    if (open) node.addEventListener('click', () => { B.showScreen('reader'); B.reader.jumpTo(item.emailId); });
    return node;
  }

  function render() {
    const section = B.$('#screen-calendar');
    if (!section) return;
    const tabs = B.DATA.days.map((name) => {
      const tab = el('button', { type: 'button', class: 'pill' + (name === day ? ' selected' : ''), 'data-day': name, role: 'tab', 'aria-selected': String(name === day) }, name);
      tab.addEventListener('click', () => { day = name; B.stopSpeaking(); render(); });
      return tab;
    });
    const items = B.calendarItems(day);
    const rows = items.length
      ? items.map((item) => el('li', { class: 'cal-row' }, [el('span', { class: 'cal-time' }, item.time), card(item)]))
      : [el('li', { class: 'cal-empty' }, 'Nothing scheduled. Set a reply-by on an email and it lands here.')];
    const aloud = el('button', { type: 'button', id: 'read-day', class: 'btn btn-dark btn-wide', 'aria-pressed': String(reading) }, [el('span', { class: 'ico' }), reading ? 'Stop reading' : 'Read my day aloud']);
    aloud.firstChild.innerHTML = reading ? icons.stop : icons.speaker;
    aloud.addEventListener('click', readDayAloud);

    section.replaceChildren(
      el('header', { class: 'topbar light' }, [el('div', {}, [el('p', { class: 'eyebrow' }, "Today's itinerary"), el('h1', { id: 'cal-day-name', class: 'title' }, B.DATA.dayNames[day])]), B.helpButton()]),
      el('div', { class: 'pill-row', role: 'tablist', 'aria-label': 'Day' }, tabs),
      el('ol', { id: 'timeline', class: 'timeline' }, rows),
      el('div', { class: 'screen-foot' }, aloud),
    );
  }

  B.calendar = { render, stop() { reading = false; } };
})();
