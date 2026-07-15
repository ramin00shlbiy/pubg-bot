import os
import sqlite3
import telebot
from telebot import types
from dotenv import load_dotenv

# بارگذاری گاوصندوق امنیتی رندر (توکن‌ها)
load_dotenv()
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
bot = telebot.TeleBot(BOT_TOKEN)

DB_PATH = "pubg_exchange.db"

# ----------------- لایه اول: مدیریت و ساخت دیتابیس -----------------
def init_db():
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.execute('PRAGMA journal_mode=WAL;') # حالت ضد قفل تراکنش‌ها
    cursor = conn.cursor()
    
    # جدول کاربران
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            telegram_id INTEGER PRIMARY KEY,
            username TEXT,
            language TEXT DEFAULT 'fa',
            balance_uc INTEGER DEFAULT 0,
            character_id TEXT DEFAULT NULL,
            is_banned INTEGER DEFAULT 0
        )
    ''')
    
    # جدول انبار پین‌کدها (سپر ضد هک و کدهای تکراری)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS pin_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pin_text TEXT UNIQUE NOT NULL,
            user_id INTEGER,
            status TEXT DEFAULT 'pending',
            FOREIGN KEY(user_id) REFERENCES users(telegram_id)
        )
    ''')
    conn.commit()
    conn.close()

# اجرای خودکار ساخت دیتابیس به محض روشن شدن سرور
init_db()

# ----------------- لایه دوم: منطق و دکمه‌های ربات -----------------

@bot.message_handler(commands=['start'])
def send_welcome(message):
    user_id = message.chat.id
    username = message.from_user.username or "Unknown"
    
    # ثبت‌نام خودکار کاربر در دیتابیس در صورت جدید بودن
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("INSERT OR IGNORE INTO users (telegram_id, username) VALUES (?, ?)", (user_id, username))
    conn.commit()
    conn.close()

    # منوی شیشه‌ای انتخاب زبان
    markup = types.InlineKeyboardMarkup(row_width=2)
    btn_fa = types.InlineKeyboardButton("دری / فارسی 🇦🇫", callback_data="lang_fa")
    btn_ps = types.InlineKeyboardButton("پښتو 🇦🇫", callback_data="lang_ps")
    markup.add(btn_fa, btn_ps)
    
    bot.send_message(
        user_id, 
        "به ربات مسابقات و صرافی پابجی موبایل خوش آمدید!\nلطفاً زبان خود را انتخاب کنید:\n\nپه خیر راغلاست! هیله ده خپله ژبه غوره کړئ:", 
        reply_markup=markup
    )

@bot.callback_query_handler(func=lambda call: call.data.startswith('lang_'))
def set_language(call):
    user_id = call.message.chat.id
    lang = call.data.split('_')[1]
    
    # به‌روزرسانی زبان کاربر در دیتابیس
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET language = ? WHERE telegram_id = ?", (lang, user_id))
    conn.commit()
    conn.close()
    
    bot.delete_message(user_id, call.message.message_id)
    show_main_menu(user_id, lang)

def show_main_menu(user_id, lang):
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    
    if lang == "fa":
        btn1 = types.KeyboardButton("🏆 مسابقات فعال")
        btn2 = types.KeyboardButton("💰 شارژ حساب / انبار کد")
        btn3 = types.KeyboardButton("👤 پروفایل من")
        btn4 = types.KeyboardButton("🎁 برداشت جوایز")
        markup.add(btn1, btn2, btn3, btn4)
        text = "رفیق، به منوی اصلی صرافی خوش آمدی! یک گزینه را انتخاب کن:"
    else:
        btn1 = types.KeyboardButton("🏆 فعالې سیالۍ")
        btn2 = types.KeyboardButton("💰 د حساب چارج")
        btn3 = types.KeyboardButton("👤 زما پروفایل")
        btn4 = types.KeyboardButton("🎁 د جایزو اخیستل")
        markup.add(btn1, btn2, btn3, btn4)
        text = "اصلي مینو ته ښه راغلاست! یو انتخاب کړه:"
        
    bot.send_message(user_id, text, reply_markup=markup)

# مدیریت دکمه شارژ حساب و دریافت پین‌کد
@bot.message_handler(func=lambda msg: msg.text in ["💰 شارژ حساب / انبار کد", "💰 د حساب چارج"])
def deposit_request(message):
    user_id = message.chat.id
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT language FROM users WHERE telegram_id = ?", (user_id,))
    row = cursor.fetchone()
    lang = row[0] if row else "fa"
    conn.close()
    
    if lang == "fa":
        text = "🎫 لطفاً پین‌کد دیجیتالی (ریزر گلد / مایدس‌بای) خود را ارسال کنید:\n\n*نکته: کد ارسالی شما در صدم‌ثانیه در دیتابیس بررسی و قفل می‌شود.*"
    else:
        text = "🎫 هیله ده خپل ډیجیټل پین‌کوډ (ریزر ګولډ / مایدس‌بای) راولېږئ:\n\n*یادونه: ستاسو کوډ په ثانیه کې په ډیټابیس کې چک او لاک کیږي.*"
        
    msg = bot.send_message(user_id, text, parse_mode="Markdown")
    bot.register_next_step_handler(msg, process_pin_code, lang)

def process_pin_code(message, lang):
    user_id = message.chat.id
    pin_text = message.text.strip()
    
    # لایه امنیتی اول: بررسی ضد تکرار در دیتابیس
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute("INSERT INTO pin_codes (pin_text, user_id) VALUES (?, ?)", (pin_text, user_id))
        conn.commit()
        
        # کد تکراری نبود و در انبار موقت قفل شد
        if lang == "fa":
            bot.send_message(user_id, "🟢 کد شما با موفقیت در انبار پذیرش شد. در حال ارسال به تونل مایدس‌بای جهت تایید شارژ...")
        else:
            bot.send_message(user_id, "🟢 ستاسو کوډ په بریالیتوب سره انبار ته لاړ. د تایید لپاره مایدس‌بای ټانل ته د لیږلو په حال کې دی...")
            
        # اینجا بعداً اسکریپت مایدس‌بای متصل خواهد شد
            
    except sqlite3.IntegrityError:
        # کد قبلاً در دیتابیس وجود داشته است (تلاش برای تقلب)
        if lang == "fa":
            bot.send_message(user_id, "🔴 خطا: این کد قبلاً در صرافی استفاده شده است! دسترسی شما به دلیل ارسال کد سوخته محدود می‌شود.")
        else:
            bot.send_message(user_id, "🔴 تېروتنه: دا کوډ دمخه په صرافی کې کارول شوی! ستاسو لاسرسی به د کارول شوي کوډ له امله محدود شي.")
            
    finally:
        conn.close()

if __name__ == "__main__":
    bot.infinity_polling()
  
