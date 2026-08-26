const { Telegraf } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply('ارسل يوزر تيك توك بدون @ مثلا: khaby.lame'));

bot.on('text', async (ctx) => {
  const username = ctx.message.text.replace('@','').trim();
  if(!username) return;
  try {
    await ctx.reply(`جاري البحث عن @${username} ...`);
    // هنا تقدر تضيف كود جلب معلومات تيك توك
    await ctx.reply(`تم استلام اليوزر: ${username} ✅\nالبوت شغال!`);
  } catch (e) {
    await ctx.reply('ما لقيت اليوزر، تأكد من الاسم');
  }
});

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    return res.status(200).send('Bot is Live');
  }
  try {
    await bot.handleUpdate(req.body);
    res.status(200).send('OK');
  } catch (e) {
    res.status(200).send('OK');
  }
};
