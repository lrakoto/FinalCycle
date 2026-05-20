export async function onRequestPost({ request, env }) {
  try {
    const { password } = await request.json();
    if (password === env.ADMIN_PASSWORD) {
      return Response.json({ ok: true });
    }
    return Response.json({ ok: false }, { status: 401 });
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}
