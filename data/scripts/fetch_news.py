#!/usr/bin/env python3
"""
اسکریپت به‌روزرسانی خودکار اخبار پینگ پونگ
هر ساعت توسط GitHub Actions اجرا می‌شود.
"""

import json
import os
from datetime import datetime, timezone
from pathlib import Path

# مسیرها
ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = ROOT / "data" / "news.json"


def now_iso() -> str:
    """زمان فعلی به فرمت ISO با UTC."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def load_existing() -> dict:
    """خواندن فایل JSON موجود."""
    if DATA_FILE.exists():
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"updatedAt": now_iso(), "matches": [], "news": [], "ranking": []}


def fetch_news_from_source() -> list:
    """
    اینجا منطق دریافت اخبار از منبع را پیاده کن.
    نمونه: با requests و BeautifulSoup از یک سایت خبری.

    مثال:
        import requests
        from bs4 import BeautifulSoup

        r = requests.get("https://example.com/pingpong-news", timeout=10)
        soup = BeautifulSoup(r.text, "html.parser")
        items = []
        for article in soup.select(".news-item"):
            items.append({
                "title": article.select_one(".title").text.strip(),
                "summary": article.select_one(".summary").text.strip(),
                "category": "world",
                "categoryLabel": "جهان",
                "source": "منبع خبری",
                "date": now_iso()
            })
        return items
    """
    # در حال حاضر لیست خالی برمی‌گرداند
    return []


def fetch_matches_from_source() -> list:
    """دریافت برنامه بازی‌ها از منبع (نمونه)."""
    return []


def main():
    data = load_existing()

    # به‌روزرسانی زمان
    data["updatedAt"] = now_iso()

    # دریافت اخبار جدید
    new_news = fetch_news_from_source()
    if new_news:
        # اضافه کردن به ابتدای لیست و حذف تکراری‌ها
        existing_titles = {n["title"] for n in data["news"]}
        fresh = [n for n in new_news if n["title"] not in existing_titles]
        data["news"] = (fresh + data["news"])[:50]  # حداکثر ۵۰ خبر

    # دریافت بازی‌ها
    new_matches = fetch_matches_from_source()
    if new_matches:
        data["matches"] = new_matches[:20]

    # ذخیره
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"✅ فایل به‌روزرسانی شد: {DATA_FILE}")


if __name__ == "__main__":
    main()
