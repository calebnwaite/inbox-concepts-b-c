/* Drag gesture with pointer events (one code path for touch, pen and mouse).
   B.attachSwipe(card, { threshold, onMove(dx, dy, direction, pull), onRelease(direction | null), onFling(direction) }) */
(function () {
  const B = (window.B = window.B || {});

  /** Dominant direction of a drag: up | down | left | right. */
  B.directionOf = (dx, dy) => (Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));

  B.attachSwipe = function (card, options) {
    const threshold = options.threshold || 90;
    let start = null;

    card.style.touchAction = 'none';
    card.addEventListener('pointerdown', (event) => {
      if (event.button > 0 || card.classList.contains('flung')) return;
      start = { x: event.clientX, y: event.clientY, t: performance.now(), id: event.pointerId };
      try { card.setPointerCapture(event.pointerId); } catch (error) { console.debug('concept-b: pointer capture unavailable, drag still tracked on the card', error); }
      card.classList.add('dragging');
    });
    card.addEventListener('pointermove', (event) => {
      if (!start || event.pointerId !== start.id) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      const direction = B.directionOf(dx, dy);
      const distance = Math.max(Math.abs(dx), Math.abs(dy));
      card.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${dx / 22}deg)`;
      options.onMove(dx, dy, direction, Math.min(1, distance / threshold));
    });
    const finish = (event, cancelled) => {
      if (!start || event.pointerId !== start.id) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      const elapsed = Math.max(1, performance.now() - start.t);
      const direction = B.directionOf(dx, dy);
      const distance = Math.max(Math.abs(dx), Math.abs(dy));
      const fast = distance > 40 && distance / elapsed > 0.6;
      start = null;
      card.classList.remove('dragging');
      if (!cancelled && (distance >= threshold || fast)) {
        card.classList.add('flung');
        const far = Math.max(window.innerWidth, window.innerHeight) * 1.1;
        const x = direction === 'right' ? far : direction === 'left' ? -far : dx;
        const y = direction === 'down' ? far : direction === 'up' ? -far : dy;
        card.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${x / 18}deg)`;
        card.style.opacity = '0';
        options.onRelease(direction);
        setTimeout(() => options.onFling(direction), 260);
      } else {
        card.style.transform = '';
        options.onRelease(null);
      }
    };
    card.addEventListener('pointerup', (event) => finish(event, false));
    card.addEventListener('pointercancel', (event) => finish(event, true));
  };

  /** Plays the same fling for button taps, then commits. */
  B.flingCard = function (card, direction, onFling) {
    card.classList.add('flung');
    const far = Math.max(window.innerWidth, window.innerHeight) * 1.1;
    const x = direction === 'right' ? far : direction === 'left' ? -far : 0;
    const y = direction === 'down' ? far : direction === 'up' ? -far : 0;
    card.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${x / 18}deg)`;
    card.style.opacity = '0';
    setTimeout(onFling, 260);
  };
})();
