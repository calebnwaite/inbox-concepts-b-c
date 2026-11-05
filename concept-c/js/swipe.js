/* Drag-to-swipe on one card, for touch and mouse alike (pointer events). Transform-only animation. */
const Swipe = (() => {
  const COMMIT_DISTANCE = 100;   // px dragged to commit
  const COMMIT_VELOCITY = 0.6;   // px per ms fling to commit
  const ROTATE_DIVISOR = 18;     // dx / this = degrees

  const place = (card, dx, dy) => {
    card.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${dx / ROTATE_DIVISOR}deg)`;
  };

  /* Fly the card off-screen; resolves after the animation (or at once with reduced motion). */
  function flyOff(card, direction) {
    const distance = (card.offsetWidth + window.innerWidth) * direction;
    if (U.reducedMotion() || !card.animate) return Promise.resolve();
    const from = card.style.transform || 'none';
    const animation = card.animate(
      [{ transform: from, opacity: 1 }, { transform: `translate3d(${distance}px, 30px, 0) rotate(${direction * 24}deg)`, opacity: 0.6 }],
      { duration: 260, easing: 'cubic-bezier(.3,.7,.4,1)', fill: 'forwards' });
    return animation.finished.catch((error) => console.warn('Swipe animation was interrupted.', error));
  }

  /* onMove(dx): live progress; onCommit(direction: 1|-1, fromDrag: bool). */
  function attach(card, { onMove, onCommit }) {
    let start = null;

    card.addEventListener('pointerdown', (event) => {
      if (event.button > 0 || start) return;
      start = { id: event.pointerId, x: event.clientX, y: event.clientY, t: performance.now(), dx: 0, lastX: event.clientX, lastT: performance.now(), v: 0 };
      try { card.setPointerCapture(event.pointerId); } catch (error) {
        console.debug('Pointer capture unavailable; dragging continues without it.', error);
      }
      card.classList.add('dragging');
      card.style.transition = 'none';
    });

    card.addEventListener('pointermove', (event) => {
      if (!start || event.pointerId !== start.id) return;
      const now = performance.now();
      start.dx = event.clientX - start.x;
      start.v = (event.clientX - start.lastX) / Math.max(1, now - start.lastT);
      start.lastX = event.clientX; start.lastT = now;
      place(card, start.dx, (event.clientY - start.y) * 0.15);
      onMove(start.dx);
    });

    const finish = (event) => {
      if (!start || event.pointerId !== start.id) return;
      const { dx, v } = start;
      start = null;
      card.classList.remove('dragging');
      const direction = dx > 0 ? 1 : -1;
      if (event.type === 'pointerup' && (Math.abs(dx) > COMMIT_DISTANCE || Math.abs(v) > COMMIT_VELOCITY && Math.abs(dx) > 30)) {
        onCommit(direction, true);
      } else {
        card.style.transition = 'transform .28s cubic-bezier(.2,.9,.3,1.2)';
        card.style.transform = '';
        onMove(0);
      }
    };
    card.addEventListener('pointerup', finish);
    card.addEventListener('pointercancel', finish);
  }

  return { attach, flyOff, place };
})();
