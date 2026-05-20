const CONFIRMATION_HTML = (name) => `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#eaecf5;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(26,37,80,.1)">
        <tr><td style="background:#1a2550;padding:0"><div style="height:5px;background:linear-gradient(90deg,#111c3d,#2d3e7a,#3b7cc4)"></div></td></tr>
        <tr><td style="padding:40px 40px 0;text-align:center">
          <img src="https://finalcyclequestionnaire.com/FinalCycle-Logo.webp" alt="Final Cycle" height="48" style="display:block;margin:0 auto 24px">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a2550">We've received your questionnaire</h1>
          <p style="margin:0;font-size:15px;color:#4e5470">Thank you for taking the time, ${name}.</p>
        </td></tr>
        <tr><td style="padding:32px 40px">
          <p style="margin:0 0 16px;font-size:15px;color:#4e5470;line-height:1.7">
            Our team will review your responses and reach out within <strong style="color:#1a2550">1–2 business days</strong> to discuss next steps.
          </p>
          <p style="margin:0;font-size:15px;color:#4e5470;line-height:1.7">
            In the meantime, if you have any questions feel free to reply directly to this email.
          </p>
        </td></tr>
        <tr><td style="padding:0 40px 40px;text-align:center">
          <div style="border-top:1px solid #e1e4f0;padding-top:24px">
            <p style="margin:0;font-size:12px;color:#8890ab">
              Final Cycle &nbsp;·&nbsp; Placement Services<br>
              <a href="https://finalcyclequestionnaire.com" style="color:#1a2550">finalcyclequestionnaire.com</a>
            </p>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();

    // Store in D1
    await env.DB.prepare(`
      INSERT INTO submissions
        (submitted_at, name, email, phone,
         annual_revenue, team_members, firm_worth,
         client_count, tax_returns, tax_software, documentation,
         efficiency, bottleneck)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      new Date().toISOString(),
      data['Name']                           || '',
      data['Email']                          || '',
      data['Phone']                          || '',
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

    // Management notification via Web3Forms
    const fd = new FormData();
    fd.append('access_key',  'a7a88086-f7df-4478-a0a2-285be6f5cc3f');
    fd.append('subject',     `New Questionnaire: ${data['Name'] || 'Unknown'} – Final Cycle`);
    fd.append('from_name',   'Final Cycle Questionnaire');
    fd.append('replyto',     data['Email'] || 'management@roberthalltaxes.com');
    Object.entries(data).forEach(([k, v]) => fd.append(k, v));
    await fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd });

    // Confirmation email to submitter via Resend
    if (data['Email'] && env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from:    'Final Cycle <noreply@finalcyclequestionnaire.com>',
          to:      data['Email'],
          subject: 'We received your questionnaire – Final Cycle',
          html:    CONFIRMATION_HTML(data['Name'] || 'there')
        })
      });
    }

    return Response.json({ success: true });

  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
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
