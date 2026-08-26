export default async function handler(req, res) {
  if (req.method === 'POST') {
    const msg = req.body.message;
    const chatId = msg.chat.id;
    let username = msg.text.replace('@','').trim();
    if (username === '/start') {
      await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: '👋 أرسل يوزر تيك توك بدون @' })
      });
      return res.send('OK');
    }
    try {
      const r = await fetch(`https://www.tiktok.com/@${username}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await r.text();
      const region = html.match(/"region":"(.*?)"/)?.[1] || 'مخفي';
      const followers = html.match(/"followerCount":(\d+)/)?.[1] || 'غير معروف';
      const flag = region.length===2? region.toUpperCase().replace(/./g,c=>String.fromCodePoint(127397+c.charCodeAt())) : '';
      await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: `🌍 الدولة: ${region} ${flag}\n👥 متابعين: ${followers}` })
      });
    } catch {}
    return res.send('OK');
  }
  res.send('OK');
}
