const { Telegraf, Markup } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);

// --- قاعدة بيانات الافلام (تقدر تعدلها وتضيف عليها) ---
const moviesDB = [
  "Avatar", "Avengers", "Aquaman",
  "Batman", "Black Panther", "Bullet Train",
  "Cars", "Creed", "Captain America",
  "Deadpool", "Dune", "Doctor Strange",
  "Extraction", "Equalizer", "El Camino",
  "Fast & Furious", "Frozen", "Fight Club",
  "Gladiator", "Godzilla", "Guardians",
  "Harry Potter", "Hulk", "Home Alone",
  "Interstellar", "Inception", "Iron Man",
  "John Wick", "Joker", "Jumanji",
  "Kung Fu Panda", "Knives Out",
  "Lion King", "Lucy", "Logan",
  "Matrix", "Moana", "Mission Impossible",
  "Narnia", "No Time To Die",
  "Oppenheimer", "Ocean's 11",
  "Pirates of Caribbean", "Parasite",
  "Quiet Place",
  "Rambo", "Ratatouille", "Red Notice",
  "Spiderman", "Superman", "Shrek",
  "Titanic", "Thor", "Top Gun",
  "Up", "Uncharted",
  "Venom", "Vikings",
  "WALL-E", "Wonder Woman",
  "X-Men",
  "Zootopia"
];

// القائمة الرئيسية
bot.start((ctx) => {
  ctx.reply(`هلا ${ctx.from.first_name} 👋\nوش تبي تشوف؟`,
    Markup.inlineKeyboard([
      [Markup.button.callback('📺 مسلسلات', 'series')],
      [Markup.button.callback('🎌 انمي', 'anime')],
      [Markup.button.callback('🎬 افلام - حسب الحرف', 'movies')]
    ])
  );
});

// لما يضغط افلام -> نطلع له الحروف
bot.action('movies', (ctx) => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const keyboard = [];
  let row = [];

  letters.forEach((letter, i) => {
    row.push(Markup.button.callback(letter, `letter_${letter}`));
    if ((i + 1) % 6 === 0) { // كل 6 احرف في سطر
      keyboard.push(row);
      row = [];
    }
  });
  if (row.length > 0) keyboard.push(row);

  keyboard.push([Markup.button.callback('🔙 رجوع', 'back_main')]);

  ctx.editMessageText('🎬 اختر الحرف:', Markup.inlineKeyboard(keyboard));
});

// لما يضغط على حرف معين
bot.action(/letter_(.+)/, (ctx) => {
  const letter = ctx.match[1];
  const filtered = moviesDB.filter(m => m.toUpperCase().startsWith(letter));

  if (filtered.length === 0) {
    return ctx.reply(`ما فيه افلام بحرف ${letter} 😅`, Markup.inlineKeyboard([
      [Markup.button.callback('🔙 رجوع للحروف', 'movies')]
    ]));
  }

  let text = `🎬 افلام بحرف ${letter}:\n\n`;
  filtered.forEach((movie, i) => {
    text += `${i+1}. ${movie}\n`;
  });

  ctx.reply(text, Markup.inlineKeyboard([
    [Markup.button.callback('🔙 رجوع للحروف', 'movies')],
    [Markup.button.callback('🏠 القائمة الرئيسية', 'back_main')]
  ]));
});

bot.action('back_main', (ctx) => {
  ctx.editMessageText(`وش تبي تشوف؟`,
    Markup.inlineKeyboard([
      [Markup.button.callback('📺 مسلسلات', 'series')],
      [Markup.button.callback('🎌 انمي', 'anime')],
      [Markup.button.callback('🎬 افلام - حسب الحرف', 'movies')]
    ])
  );
});

// Vercel
module.exports = async (req, res) => {
  if (req.method === 'GET') return res.status(200).send('Bot Running ✅');
  await bot.handleUpdate(req.body);
  res.status(200).send('OK');
};
