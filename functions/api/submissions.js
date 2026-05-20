const ADMIN_PASSWORD = 'RHAMGMT1!';

export async function onRequestGet({ request, env }) {
  if (request.headers.get('X-Admin-Key') !== ADMIN_PASSWORD) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

export async function onRequestDelete({ request, env }) {
  if (request.headers.get('X-Admin-Key') !== ADMIN_PASSWORD) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await request.json();
  await env.DB.prepare('DELETE FROM submissions WHERE id = ?').bind(id).run();
  return Response.json({ success: true });
}
