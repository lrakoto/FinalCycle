export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();

    await env.DB.prepare(`
      INSERT INTO submissions
        (submitted_at, annual_revenue, team_members, firm_worth,
         client_count, tax_returns, tax_software, documentation,
         efficiency, bottleneck)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      new Date().toISOString(),
      data['Annual Gross Revenue']           || '',
      data['Team Members']                   || '',
      data['Estimated Firm Worth']           || '',
      data['Number of Clients']              || '',
      data['Annual Tax Returns Prepared']    || '',
      data['Tax Software Used']              || '',
      data['Documentation Storage']          || '',
      data['Operational Efficiency Rating']  || '',
      data['Biggest Operational Bottleneck'] || ''
    ).run();

    // Forward to Web3Forms for email delivery
    const fd = new FormData();
    fd.append('access_key',  'a7a88086-f7df-4478-a0a2-285be6f5cc3f');
    fd.append('subject',     'New Placement Questionnaire Submission – Final Cycle');
    fd.append('from_name',   'Final Cycle Questionnaire');
    fd.append('replyto',     'management@roberthalltaxes.com');
    Object.entries(data).forEach(([k, v]) => fd.append(k, v));
    await fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd });

    return Response.json({ success: true }, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    });

  } catch (err) {
    return Response.json({ success: false, error: err.message }, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
