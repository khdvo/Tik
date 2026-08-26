const { Telegraf } = require('telegraf');
const axios = require('axios');
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply('هلا! 👋\nارسل يوزر تيك توك بدون @'));

bot.on('text', async (ctx) => {
  let username = ctx.message.text.trim().replace('@','').replace('https://','').split('/').pop();
  if(!username || username.startsWith('/')) return;
  
  const wait = await ctx.reply(`جاري سحب معلومات @${username} ...`);
  
  try {
    // نجيب معلومات من API مجاني
    const res = await axios.post('https://www.tikwm.com/api/user/info', 
      `unique_id=${username}`, 
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    
    const data = res.data?.data?.user;
    if(!data) throw new Error('no user');

    const info = `
✅ معلومات @${data.uniqueId}

👤 الاسم: ${data.nickname}
🌍 الدولة: ${data.region || 'غير معروفة'}
❤️ متابعين: ${data.followerCount}
👥 يتابع: ${data.followingCount}
💜 لايكات: ${data.heartCount}
🎬 فيديوهات: ${data.videoCount}
📝 البايو: ${data.signature || 'لا يوجد'}

🔗 https://tiktok.com/@${data.uniqueId}
    `;

    await ctx.telegram.deleteMessage(ctx.chat.id, wait.message_id).catch(()=>{});
    await ctx.replyWithPhoto({ url: data.avatarLarger }, { caption: info });

  } catch (e) {
    await ctx.telegram.deleteMessage(ctx.chat.id, wait.message_id).catch(()=>{});
    await ctx.reply(`❌ ما قدرت اجيب @${username}\nتأكد اليوزر صحيح او جرب يوزر ثاني مشهور مثل khaby.lame`);
  }
});

module.exports = async (req, res) => {
  if (req.method === 'GET') return res.status(200).send('Bot is Live');
  try { await bot.handleUpdate(req.body); res.status(200).send('OK'); }
  catch(e){ res.status(200).send('OK'); }
};
