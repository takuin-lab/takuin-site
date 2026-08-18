// takuin.com — comment system client
// Loads new (post-relaunch) comments from D1 via a Pages Function, and
// submits new ones. Historical comments are already baked into the page
// as static HTML and never touch this script.

(function () {
  const liveBox = document.getElementById('live-comments');
  const form = document.getElementById('comment-form');
  if (!liveBox || !form) return;

  const slug = liveBox.dataset.slug;

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function renderComment(c) {
    const div = document.createElement('div');
    div.className = 'comment';
    div.innerHTML = `
      <div class="who">${escapeHtml(c.author)}${c.is_author ? '<span class="badge">Author</span>' : ''}</div>
      <div class="when">${escapeHtml(c.date_human)}</div>
      <div class="body">${escapeHtml(c.content).replace(/\n/g, '<br>')}</div>
    `;
    return div;
  }

  async function loadComments() {
    try {
      const res = await fetch(`/api/comments/${slug}`);
      if (!res.ok) return;
      const data = await res.json();
      (data.comments || []).forEach(c => liveBox.appendChild(renderComment(c)));
    } catch (e) {
      // fail quietly — historical comments still render fine without this
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);

    // Honeypot: bots fill every field, including this hidden one.
    if (fd.get('website')) {
      form.reset();
      return; // silently "succeed" for the bot, do nothing real
    }

    const payload = {
      slug,
      author: (fd.get('author') || '').toString().trim(),
      email: (fd.get('email') || '').toString().trim(),
      content: (fd.get('content') || '').toString().trim(),
      website: (fd.get('website') || '').toString(), // honeypot, re-checked server-side
      turnstileToken: (form.querySelector('[name="cf-turnstile-response"]') || {}).value || '',
    };
    if (!payload.author || !payload.content) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Posting…';

    try {
      const res = await fetch(`/api/comments/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const saved = await res.json();
        liveBox.appendChild(renderComment(saved));
        form.reset();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Could not post that comment — try again in a moment.');
      }
    } catch (e) {
      alert('Could not reach the server — check your connection and try again.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Post comment';
    }
  });

  loadComments();
})();
