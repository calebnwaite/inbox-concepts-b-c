/* "Why this order" side panel and the sorting-confidence meter. */
const Why = (() => {
  function senderCard(state, senderKey, emails) {
    const sender = DATA.senders[senderKey];
    const { right, left } = Learning.counts(state, senderKey);
    const score = Math.round(Learning.senderScore(state, senderKey) * 100);
    const reasons = emails.map((email) => `<li>${U.esc(email.subject)}<span>${U.esc(Learning.reasonText(state, email))}</span></li>`).join('');
    return `<section class="why-card" data-sender="${senderKey}">
      <header><strong>${U.esc(sender.short)}</strong><span class="why-score">${score}% sure</span></header>
      <p class="why-counts">${right} marked priority · ${left} later</p>
      <div class="mini-bar"><i style="width:${score}%"></i></div>
      <ul>${reasons}</ul></section>`;
  }

  function render(state, priority) {
    const bySender = new Map();
    priority.forEach((email) => {
      if (!bySender.has(email.sender)) bySender.set(email.sender, []);
      bySender.get(email.sender).push(email);
    });
    U.$('#why-cards').innerHTML = bySender.size
      ? Array.from(bySender, ([key, emails]) => senderCard(state, key, emails)).join('')
      : '<p class="why-empty">No priority emails yet. Swipe right on the phone to start.</p>';
    const confidence = Learning.confidence(state);
    U.$('#confidence-value').textContent = `${confidence}%`;
    U.$('#confidence-fill').style.width = `${confidence}%`;
    U.$('#confidence-bar').setAttribute('aria-valuenow', confidence);
  }

  return { render };
})();
