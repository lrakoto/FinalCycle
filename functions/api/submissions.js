const VIEWS = {
  active: { where: 'archived_at IS NULL AND deleted_at IS NULL', order: 'id DESC' },
  archive: { where: 'archived_at IS NOT NULL AND deleted_at IS NULL', order: 'archived_at DESC, id DESC' },
  deleted: { where: 'deleted_at IS NOT NULL', order: 'deleted_at DESC, id DESC' }
};

function unauthorized() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}

function checkAuth(request, env) {
  return request.headers.get('X-Admin-Key') === env.ADMIN_PASSWORD;
}

export async function onRequestGet({ request, env }) {
  if (!checkAuth(request, env)) return unauthorized();

  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view') || 'active';
  const limit = Number(searchParams.get('limit') || '500');
  const offset = Number(searchParams.get('offset') || '0');
  if (!Object.hasOwn(VIEWS, view) || !Number.isSafeInteger(limit) || limit < 0 ||
      !Number.isSafeInteger(offset) || offset < 0) {
    return Response.json({ error: 'Invalid view or pagination' }, { status: 400 });
  }

  const { where, order } = VIEWS[view];
  const [{ results }, { results: [{ total }] }] = await env.DB.batch([
    env.DB.prepare(`SELECT * FROM submissions WHERE ${where} ORDER BY ${order} LIMIT ? OFFSET ?`)
      .bind(limit, offset),
    env.DB.prepare(`SELECT COUNT(*) AS total FROM submissions WHERE ${where}`)
  ]);

  return Response.json({ success: true, submissions: results, total }, {
    headers: { 'Cache-Control': 'no-store' }
  });
}

export async function onRequestPatch({ request, env }) {
  if (!checkAuth(request, env)) return unauthorized();

  const { id, status, action } = await request.json().catch(() => null) || {};
  if (!Number.isSafeInteger(id) || id < 1) {
    return Response.json({ error: 'Invalid submission ID' }, { status: 400 });
  }

  const allowed = ['New', 'Contacted', 'In Progress', 'Closed'];
  let update;
  switch (action) {
    case 'archive':
      update = env.DB.prepare(`UPDATE submissions SET archived_at = ? WHERE id = ? AND ${VIEWS.active.where}`)
        .bind(new Date().toISOString(), id);
      break;
    case 'unarchive':
      update = env.DB.prepare(`UPDATE submissions SET archived_at = NULL WHERE id = ? AND ${VIEWS.archive.where}`)
        .bind(id);
      break;
    case 'restore':
      update = env.DB.prepare(`UPDATE submissions SET deleted_at = NULL WHERE id = ? AND ${VIEWS.deleted.where}`)
        .bind(id);
      break;
    case undefined:
      if (!allowed.includes(status)) {
        return Response.json({ error: 'Invalid status' }, { status: 400 });
      }
      update = env.DB.prepare(`UPDATE submissions SET status = ? WHERE id = ? AND ${VIEWS.active.where}`)
        .bind(status, id);
      break;
    default:
      return Response.json({ error: 'Invalid action' }, { status: 400 });
  }

  return updateSubmission(update);
}

export async function onRequestDelete({ request, env }) {
  if (!checkAuth(request, env)) return unauthorized();

  const { id } = await request.json().catch(() => null) || {};
  if (!Number.isSafeInteger(id) || id < 1) {
    return Response.json({ error: 'Invalid submission ID' }, { status: 400 });
  }

  return updateSubmission(env.DB.prepare(
    'UPDATE submissions SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL'
  ).bind(new Date().toISOString(), id));
}

async function updateSubmission(update) {
  const { meta } = await update.run();
  if (!meta.changes) {
    return Response.json({ error: 'This submission has already changed or is unavailable.' }, { status: 409 });
  }
  return Response.json({ success: true });
}
