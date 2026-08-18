// Cloudflare Pages Function — /api/comments/:slug
// GET  -> list new (non-hidden) comments for a post, oldest first
// POST -> submit a new comment (honeypot + Turnstile checked server-side)
//
// Requires, set in the Pages project's Settings -> Functions:
//   D1 binding:      DB                 -> the takuin-comments database
//   Environment var:  TURNSTILE_SECRET  -> secret key from the Turnstile widget
//   Environment var:  IP_HASH_SALT      -> any random string, used to salt IP hashes

const MONTHS = ["", "January","February","March","April","May","June","July","August",
                "September","October","November","December"];

function humanDate(iso) {
  const d = new Date(iso.replace(' ', 'T') + 'Z');
  return `${MONTHS[d.getUTCMonth() + 1]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

async function hashIp(ip, salt) {
  const enc = new TextEncoder().encode(ip + salt);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestGet({ params, env }) {
  const { slug } = params;
  const { results } = await env.DB.prepare(
    `SELECT author, content, created_at, email
     FROM comments WHERE slug = ? AND hidden = 0 ORDER BY created_at ASC`
  ).bind(slug).all();

  const comments = results.map(r => ({
    author: r.author,
    content: r.content,
    date_human: humanDate(r.created_at),
    is_author: r.author.trim().toLowerCase() === 'takuin',
  }));

  return Response.json({ comments });
}

export async function onRequestPost({ request, params, env }) {
  const { slug } = params;
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: 'Malformed request.' }, { status: 400 });
  }

  const { author, email, content, website, turnstileToken } = body || {};

  // Honeypot — a real visitor never fills this in.
  if (website) {
    return Response.json({ message: 'Thanks.' }, { status: 200 }); // fake success for bots
  }

  if (!author || !content || author.length > 100 || content.length > 5000) {
    return Response.json({ message: 'A name and a comment are required.' }, { status: 400 });
  }

  // Verify Turnstile
  if (env.TURNSTILE_SECRET) {
    const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET,
        response: turnstileToken || '',
        remoteip: request.headers.get('CF-Connecting-IP') || '',
      }),
    }).then(r => r.json()).catch(() => ({ success: false }));

    if (!verify.success) {
      return Response.json({ message: 'Could not verify you’re not a bot — try again.' }, { status: 400 });
    }
  }

  const ip = request.headers.get('CF-Connecting-IP') || '';
  const ipHash = env.IP_HASH_SALT ? await hashIp(ip, env.IP_HASH_SALT) : null;

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  await env.DB.prepare(
    `INSERT INTO comments (slug, author, email, content, created_at, ip_hash) VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(slug, author.slice(0, 100), (email || '').slice(0, 200), content.slice(0, 5000), now, ipHash).run();

  return Response.json({
    author: author.slice(0, 100),
    content: content.slice(0, 5000),
    date_human: humanDate(now),
    is_author: author.trim().toLowerCase() === 'takuin',
  });
}
