function unauthorized() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}

function checkAuth(request, env) {
  return request.headers.get('X-Admin-Key') === env.ADMIN_PASSWORD;
}

export async function onRequestGet({ request, env }) {
  if (!checkAuth(request, env)) return unauthorized();

  const url    = new URL(request.url);
  const limit  = parseInt(url.searchParams.get('limit')  || '500');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  const { results } = await env.DB.prepare(
    'SELECT * FROM submissions ORDER BY id DESC LIMIT ? OFFSET ?'
  ).bind(limit, offset).all();

  const { results: [{ total }] } = await env.DB.prepare(
    'SELECT COUNT(*) as total FROM submissions'
  ).all();

  return Response.json({ success: true, submissions: results, total });
}

export async function onRequestPatch({ request, env }) {
  if (!checkAuth(request, env)) return unauthorized();

  const { id, status } = await request.json();
  const allowed = ['New', 'Contacted', 'In Progress', 'Closed'];
  if (!allowed.includes(status)) {
    return Response.json({ error: 'Invalid status' }, { status: 400 });
  }

  await env.DB.prepare('UPDATE submissions SET status = ? WHERE id = ?')
    .bind(status, id).run();

  return Response.json({ success: true });
}

export async function onRequestDelete({ request, env }) {
  if (!checkAuth(request, env)) return unauthorized();

  const { id } = await request.json();
  await env.DB.prepare('DELETE FROM submissions WHERE id = ?').bind(id).run();
  return Response.json({ success: true });
}
