/* Ask-about-today's-email chat: chips, typing indicator, canned answers. */
const Chat = (() => {
  const TYPING_MS = 750;
  let typing = false;

  function messageHtml(message) {
    return `<div class="msg msg-${message.role}">${U.esc(message.text)}</div>`;
  }

  function render(state) {
    const log = U.$('#chat-log');
    log.innerHTML = state.chat.map(messageHtml).join('') + (typing ? '<div class="msg msg-bot typing" aria-label="Assistant is typing"><i></i><i></i><i></i></div>' : '');
    U.$('#chat-chips').hidden = state.chat.length > 4;
    log.scrollTop = log.scrollHeight;
  }

  function ask(question) {
    const text = question.trim();
    if (!text || typing) return;
    typing = true;
    State.mutate((state) => { state.chat.push({ role: 'user', text }); });
    scrollToEnd();
    setTimeout(() => {
      typing = false;
      State.mutate((state) => { state.chat.push({ role: 'bot', text: Answers.answer(state, text) }); });
      scrollToEnd();
    }, U.reducedMotion() ? 0 : TYPING_MS);
  }

  function scrollToEnd() {
    const scroller = U.$('#summary-scroll');
    scroller.scrollTo({ top: scroller.scrollHeight, behavior: U.reducedMotion() ? 'auto' : 'smooth' });
  }

  function init() {
    U.$('#chat-chips').innerHTML = DATA.suggestedQuestions.map((q) => `<button type="button" class="q-chip">${U.esc(q)}</button>`).join('');
    U.$('#chat-chips').addEventListener('click', (event) => {
      const chip = event.target.closest('.q-chip');
      if (chip) ask(chip.textContent);
    });
    U.$('#chat-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const input = U.$('#chat-input');
      ask(input.value);
      input.value = '';
    });
    State.subscribe(render);
  }

  return { init, render, ask };
})();
