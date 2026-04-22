exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { email, password, full_name, company_id } = JSON.parse(event.body);

  const SUPABASE_URL = 'https://pzepijkdkiglswderrdv.supabase.co';
  const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6ZXBpamtka2lnbHN3ZGVycmR2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjEwMjA0MywiZXhwIjoyMDkxNjc4MDQzfQ.Garw0_4gYSSlbRBBiMB1i7YW2Lgh-mCId7xJIzjPRZU';

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, role: 'driver' }
      })
    });

    const user = await res.json();

    if (!user.id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: user.message || 'Failed to create user' })
      };
    }

    await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ role: 'driver', company_id, full_name })
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ id: user.id, email: user.email })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};