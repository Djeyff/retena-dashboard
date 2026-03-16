// Personal inbox API — queries Supabase directly for chat_id + from_me
module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://qr-dashboard.retena.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  res.setHeader('Cache-Control', 'no-store');

  const SUPA_URL = process.env.SUPABASE_URL;
  const SUPA_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SUPA_URL || !SUPA_KEY) return res.status(500).json({ error: 'Supabase not configured' });

  try {
    const limit = Math.min(Number(req.query.limit) || 500, 1000);
    const chatFilter = req.query.chat ? `&chat_id=eq.${req.query.chat}` : '';

    const qs = `rewa_messages?select=id,chat_id,chat_name,sender_id,sender_name,from_me,is_group,message_type,body,transcription,media_caption,summary,duration_seconds,language,has_media,timestamp,created_at&is_group=eq.false&chat_id=neq.status@broadcast&order=timestamp.desc&limit=${limit}${chatFilter}`;

    const resp = await fetch(`${SUPA_URL}/rest/v1/${qs}`, {
      headers: {
        'apikey': SUPA_KEY,
        'Authorization': `Bearer ${SUPA_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`Supabase ${resp.status}: ${err}`);
    }

    const rows = await resp.json();

    // Build conversation map
    const convMap = {};
    for (const msg of rows) {
      const cid = msg.chat_id;
      if (!cid) continue;
      if (!convMap[cid]) {
        convMap[cid] = {
          chat_id: cid,
          contact_name: null,
          last_message: msg,
          message_count: 0,
          voice_count: 0,
          text_count: 0,
        };
      }
      if (!msg.from_me && msg.sender_name) {
        convMap[cid].contact_name = msg.sender_name;
      }
      convMap[cid].message_count++;
      if (msg.message_type === 'voice' || msg.message_type === 'audio') convMap[cid].voice_count++;
      else convMap[cid].text_count++;
    }

    // Resolve missing contact names
    for (const conv of Object.values(convMap)) {
      if (!conv.contact_name) {
        const phone = conv.chat_id.replace(/@.*/, '');
        conv.contact_name = phone;
      }
    }

    const conversations = Object.values(convMap).sort(
      (a, b) => new Date(b.last_message.timestamp || b.last_message.created_at) -
                new Date(a.last_message.timestamp || a.last_message.created_at)
    );

    res.json({ items: rows, conversations });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
