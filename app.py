from flask import Flask, request, jsonify
import requests
import os

app = Flask(__name__)

BOT_TOKEN = os.environ.get("BOT_TOKEN", "8823099835:AAGqYW6N3bELh0sIxvf8tRX8TOd1YvKPCr0")
API_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"

@app.route("/", methods=["POST"])
def webhook():
    try:
        data = request.get_json()
        if "message" in data:
            chat_id = data["message"]["chat"]["id"]
            text = data["message"].get("text", "")
            
            if text == "/start":
                requests.post(f"{API_URL}/sendMessage", json={
                    "chat_id": chat_id,
                    "text": "✅ ربات با موفقیت روشن شد!"
                })
        return jsonify({"status": "ok"}), 200
    except Exception as e:
        return jsonify({"status": "error"}), 500

@app.route("/", methods=["GET"])
def index():
    return "✅ ربات فعال است!"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
        
