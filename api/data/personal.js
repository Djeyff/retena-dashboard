// Personal inbox API — queries Supabase directly, returns full conversation list
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

  const headers = {
    'apikey': SUPA_KEY,
    'Authorization': `Bearer ${SUPA_KEY}`,
    'Content-Type': 'application/json',
  };

  try {
    const chatFilter = req.query.chat;

    if (chatFilter) {
      // Single chat mode: load messages for one chat_id
      const limit = Math.min(Number(req.query.limit) || 200, 1000);
      const qs = `retena_messages?select=id,chat_id,chat_name,sender_id,sender_name,from_me,is_group,message_type,body,text_content,transcription,summary,duration_seconds,language,language_flag,has_media,timestamp,created_at&chat_id=eq.${encodeURIComponent(chatFilter)}&order=timestamp.desc&limit=${limit}`;
      const resp = await fetch(`${SUPA_URL}/rest/v1/${qs}`, { headers });
      if (!resp.ok) throw new Error(`Supabase ${resp.status}: ${await resp.text()}`);
      const rows = await resp.json();
      return res.json({ items: rows });
    }

    // Full conversation list: paginate through ALL personal messages
    const allRows = [];
    let offset = 0;
    const pageSize = 1000;
    const maxTotal = 10000;

    while (offset < maxTotal) {
      const qs = `retena_messages?select=id,chat_id,chat_name,sender_id,sender_name,from_me,is_group,message_type,body,text_content,transcription,summary,duration_seconds,language,language_flag,has_media,timestamp,created_at&is_group=eq.false&chat_id=neq.status@broadcast&order=timestamp.desc&limit=${pageSize}&offset=${offset}`;
      const resp = await fetch(`${SUPA_URL}/rest/v1/${qs}`, { headers });
      if (!resp.ok) throw new Error(`Supabase ${resp.status}: ${await resp.text()}`);
      const rows = await resp.json();
      if (!rows.length) break;
      allRows.push(...rows);
      if (rows.length < pageSize) break;
      offset += pageSize;
    }

    // Build conversation map from ALL messages
    const convMap = {};
    for (const msg of allRows) {
      const cid = msg.chat_id;
      if (!cid || cid.includes('broadcast') || cid.includes('status')) continue;
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
      // Resolve contact name from received messages
      if (!msg.from_me && msg.sender_name) {
        convMap[cid].contact_name = msg.sender_name;
      } else if (!msg.from_me && msg.chat_name) {
        convMap[cid].contact_name = msg.chat_name;
      }
      convMap[cid].message_count++;
      if (msg.message_type === 'voice' || msg.message_type === 'audio') convMap[cid].voice_count++;
      else convMap[cid].text_count++;
    }

    // Fill missing contact names from chat_name of any message in the chat
    for (const conv of Object.values(convMap)) {
      if (!conv.contact_name) {
        // Try to find a chat_name from any message in this chat
        const anyMsg = allRows.find(m => m.chat_id === conv.chat_id && m.chat_name);
        if (anyMsg) {
          conv.contact_name = anyMsg.chat_name;
        } else {
          const phone = conv.chat_id.replace(/@.*/, '');
          conv.contact_name = conv.chat_id.endsWith('@lid') ? phone : '+' + phone;
        }
      }
    }

    const conversations = Object.values(convMap).sort(
      (a, b) => new Date(b.last_message.timestamp || b.last_message.created_at) -
                new Date(a.last_message.timestamp || a.last_message.created_at)
    );

    // Return latest 500 items for detail view + full conversations list
    const items = allRows.slice(0, 500);
    res.json({ items, conversations });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
