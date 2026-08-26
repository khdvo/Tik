const { Telegraf } = require('telegraf');
const axios = require('axios');
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply('هلا! ارسل يوزر تيك توك 👇'));

bot.on('text', async (ctx) => {
  let username = ctx.message.text.trim().replace('@','').split('/').pop();
  if(!username || username.startsWith('/')) return;
  
  const wait = await ctx.reply(`جاري فحص @${username} ...`);
  
  try {
    let user = null;
    
    // المحاولة 1: tikwm GET
    try {
      const r1 = await axios.get(`https://www.tikwm.com/api/user/info?unique_id=${username}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 8000
      });
      if(r1.data?.data?.user) user = r1.data.data.user;
    } catch(e){}

    // المحاولة 2: API ثاني بديل
    if(!user){
      const r2 = await axios.get(`https://countik.com/api/userinfo?username=${username}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 8000
      });
      if(r2.data?.followerCount) {
        user = {
          uniqueId: r2.data.username || username,
          nickname: r2.data.nickname,
          region: r2.data.region || r2.data.country,
          followerCount: r2.data.followerCount,
          followingCount: r2.data.followingCount,
          heartCount: r2.data.heartCount,
          videoCount: r2.data.videoCount,
          signature: r2.data.signature,
          avatarLarger: r2.data.avatar
        };
      }
    }

    if(!user) throw new Error('not found');

    const txt = `✅ @${user.uniqueId}
👤 ${user.nickname}
🌍 الدولة: ${user.region || 'غير معروفة'}
❤️ متابعين: ${Number(user.followerCount).toLocaleString()}
👥 يتابع: ${user.followingCount}
💜 لايكات: ${Number(user.heartCount).toLocaleString()}
🎬 فيديو: ${user.videoCount}
📝 ${user.signature || ''}`;

    await ctx.telegram.deleteMessage(ctx.chat.id, wait.message_id).catch(()=>{});
    
    if(user.avatarLarger){
      await ctx.replyWithPhoto(user.avatarLarger, { caption: txt }).catch(async ()=>{
        await ctx.reply(txt);
      });
    } else {
      await ctx.reply(txt);
    }

  } catch (err) {
    await ctx.telegram.deleteMessage(ctx.chat.id, wait.message_id).catch(()=>{});
    await ctx.reply(`❌ ما قدرت اجيب @${username}\nجرب يوزر مشهور: khaby.lame\nاذا ما اشتغل قلي بجرب لك طريقة ثالثة`);
  }
});

module.exports = async (req, res) => {
  if (req.method === 'GET') return res.status(200).send('Bot is Live');
  try { await bot.handleUpdate(req.body); res.status(200).send('OK'); }
  catch(e){ res.status(200).send('OK'); }
};
