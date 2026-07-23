// ============================================
// ربات مسابقات پابجی - Vercel Serverless Function
// ============================================

const { Bot } = require('grammy');

const bot = new Bot(process.env.BOT_TOKEN);

const users = {};

// ===== دستور استارت =====
bot.command('start', async (ctx) => {
    const chatId = ctx.chat.id;
    
    if (!users[chatId]) {
        users[chatId] = { balance: 0, wins: 0, losses: 0 };
    }
    
    const keyboard = {
        keyboard: [
            ["🎮 روم (۱۳۰ UC)", "🥇 سولو (۱۸۰ UC)"],
            ["👥 دوتایی (۲۵۰ UC)"],
            ["💰 شارژ حساب", "🎁 برداشت جایزه"],
            ["👤 پروفایل من"]
        ],
        resize_keyboard: true,
        persistent: true
    };
    
    await ctx.reply(
        "🎮 *به ربات مسابقات پابجی خوش آمدید!*\n\n" +
        "💰 موجودی: " + users[chatId].balance + " UC\n\n" +
        "لطفاً یکی از گزینه‌ها را انتخاب کنید:",
        { parse_mode: "Markdown", reply_markup: keyboard }
    );
});

// ===== مدیریت پیام‌ها =====
bot.on('message', async (ctx) => {
    const chatId = ctx.chat.id;
    const text = ctx.message.text;
    
    if (!users[chatId]) {
        users[chatId] = { balance: 0, wins: 0, losses: 0 };
    }
    
    // ===== بازگشت =====
    if (text === "🔙 بازگشت") {
        await ctx.reply("🏠 *بازگشت به منوی اصلی*", { parse_mode: "Markdown" });
        return;
    }
    
    // ===== پروفایل =====
    if (text === "👤 پروفایل من") {
        await ctx.reply(
            "👤 *پروفایل شما*\n\n" +
            "━━━━━━━━━━━━━━━━\n" +
            "🆔 شناسه: " + chatId + "\n" +
            "💰 موجودی: " + users[chatId].balance + " UC\n" +
            "🏆 برد: " + users[chatId].wins + "\n" +
            "📉 باخت: " + users[chatId].losses + "\n" +
            "━━━━━━━━━━━━━━━━",
            { parse_mode: "Markdown" }
        );
        return;
    }
    
    // ===== شارژ =====
    if (text === "💰 شارژ حساب") {
        await ctx.reply(
            "💰 *شارژ حساب*\n\n" +
            "لطفاً کد ۱۶ رقمی خود را ارسال کنید:",
            { parse_mode: "Markdown" }
        );
        return;
    }
    
    // ===== کد شارژ =====
    if (text.length === 16 && /^[A-Z0-9]{16}$/i.test(text)) {
        const validCodes = {
            "ABCD1234EFGH5678": 100,
            "1234ABCD5678EFGH": 200,
            "PUBG2024CODE001": 60
        };
        
        const code = text.toUpperCase();
        if (validCodes[code]) {
            users[chatId].balance += validCodes[code];
            await ctx.reply(
                "✅ *شارژ موفق!*\n\n" +
                "💰 +" + validCodes[code] + " UC\n" +
                "📊 موجودی جدید: " + users[chatId].balance + " UC",
                { parse_mode: "Markdown" }
            );
        } else {
            await ctx.reply("❌ *کد نامعتبر است!*", { parse_mode: "Markdown" });
        }
        return;
    }
    
    // ===== برداشت =====
    if (text === "🎁 برداشت جایزه") {
        if (users[chatId].balance < 60) {
            await ctx.reply(
                "❌ *موجودی کافی نیست!*\n\n" +
                "موجودی: " + users[chatId].balance + " UC\n" +
                "حداقل برداشت: ۶۰ UC",
                { parse_mode: "Markdown" }
            );
        } else {
            users[chatId].balance -= 60;
            await ctx.reply(
                "✅ *برداشت موفق!*\n\n" +
                "💰 ۶۰ UC برداشت شد.\n" +
                "📊 موجودی جدید: " + users[chatId].balance + " UC",
                { parse_mode: "Markdown" }
            );
        }
        return;
    }
    
    // ===== مسابقات =====
    if (text === "🎮 روم (۱۳۰ UC)") {
        await ctx.reply(
            "🎮 *مسابقه روم*\n\n" +
            "━━━━━━━━━━━━━━━━\n" +
            "💰 قیمت: ۱۳۰ UC\n" +
            "👥 تعداد: ۴ نفر\n" +
            "🎁 جایزه: ۱ رویال پاس یا ۱۰۰ UC\n" +
            "━━━━━━━━━━━━━━━━\n\n" +
            "📊 موجودی شما: " + users[chatId].balance + " UC",
            { parse_mode: "Markdown" }
        );
        return;
    }
    
    if (text === "🥇 سولو (۱۸۰ UC)") {
        await ctx.reply(
            "🥇 *مسابقه سولو*\n\n" +
            "━━━━━━━━━━━━━━━━\n" +
            "💰 قیمت: ۱۸۰ UC\n" +
            "👥 تعداد: ۴ نفر\n" +
            "🎁 جایزه: ۱ رویال پاس + ۲۰۰ UC یا ۳۰۰ UC\n" +
            "━━━━━━━━━━━━━━━━\n\n" +
            "📊 موجودی شما: " + users[chatId].balance + " UC",
            { parse_mode: "Markdown" }
        );
        return;
    }
    
    if (text === "👥 دوتایی (۲۵۰ UC)") {
        await ctx.reply(
            "👥 *مسابقه دوتایی*\n\n" +
            "━━━━━━━━━━━━━━━━\n" +
            "💰 قیمت: ۲۵۰ UC\n" +
            "👥 تعداد: ۸ نفر\n" +
            "🎁 جایزه: ۱ رویال پاس + ۲۰۰ UC یا ۳۰۰ UC (هر نفر)\n" +
            "━━━━━━━━━━━━━━━━\n\n" +
            "📊 موجودی شما: " + users[chatId].balance + " UC",
            { parse_mode: "Markdown" }
        );
        return;
    }
    
    // ===== دستور نامعتبر =====
    await ctx.reply(
        "⚠️ *گزینه نامعتبر!*\n" +
        "لطفاً از دکمه‌ها استفاده کنید.",
        { parse_mode: "Markdown" }
    );
});

// ============================================
// Vercel Serverless Handler
// ============================================

module.exports = async (req, res) => {
    try {
        const body = req.body;
        await bot.handleUpdate(body);
        res.status(200).send('OK');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error: ' + error.message);
    }
};
