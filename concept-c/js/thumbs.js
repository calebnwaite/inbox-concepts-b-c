/* Attachment previews drawn in inline SVG (no image files). */
const Thumbs = (() => {
  const art = {
    pdf: '<rect width="64" height="48" fill="#fff"/><rect x="8" y="7" width="24" height="4" fill="#c4572a"/><rect x="8" y="16" width="46" height="3" fill="#d9d5cc"/><rect x="8" y="22" width="40" height="3" fill="#d9d5cc"/><rect x="8" y="28" width="44" height="3" fill="#d9d5cc"/><rect x="8" y="36" width="20" height="3" fill="#d9d5cc"/>',
    drawing: '<rect width="64" height="48" fill="#eef3f8"/><path d="M0 12H64M0 24H64M0 36H64M16 0V48M32 0V48M48 0V48" stroke="#d3deea" stroke-width="1"/><path d="M10 38V14h26v8h18v16z" fill="none" stroke="#2f5d8a" stroke-width="2"/><path d="M36 22v16M22 14v24" stroke="#2f5d8a" stroke-width="1"/>',
    photo: '<rect width="64" height="48" fill="#cfe3f1"/><circle cx="48" cy="12" r="5" fill="#f4c95d"/><path d="M0 48V32l16-12 14 10 12-8 22 14v12z" fill="#7d9a6a"/><path d="M0 48V38l20-8 18 8 26-6v16z" fill="#5f7d4f"/>',
    sheet: '<rect width="64" height="48" fill="#fff"/><path d="M0 12H64M0 24H64M0 36H64M20 0V48M42 0V48" stroke="#cfe1d3" stroke-width="1"/><rect x="0" y="0" width="64" height="12" fill="#dff0e3"/><rect x="24" y="14" width="14" height="8" fill="#b9dcc2"/>',
  };

  function html(attachment) {
    return `<span class="thumb" title="${U.esc(attachment.label)}"><svg viewBox="0 0 64 48" role="img" aria-label="${U.esc(attachment.kind)} preview">${art[attachment.kind] || art.pdf}</svg><span class="thumb-label">${U.esc(attachment.label)}</span></span>`;
  }

  const listHtml = (attachments) => (attachments && attachments.length ? `<div class="thumbs">${attachments.map(html).join('')}</div>` : '');

  return { html, listHtml };
})();
