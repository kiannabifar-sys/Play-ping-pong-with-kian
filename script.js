// ==================== تنظیمات ====================
const DATA_URL = './data/news.json';

// ==================== ابزارها ====================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// تبدیل تاریخ به فارسی
function toPersianDate(isoString) {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  } catch {
    return isoString;
  }
}

// فرار از HTML برای امنیت
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

// ==================== رندر ====================
function renderLastUpdate(iso) {
  $('#lastUpdate').textContent = toPersianDate(iso);
  $('#year').textContent = new Date().getFullYear();
}

function renderMatches(matches) {
  const container = $('#upcomingMatches');
  if (!matches?.length) {
    container.innerHTML = '<div class="empty">بازی پیش‌رویی ثبت نشده است.</div>';
    return;
  }

  container.innerHTML = matches.map(m => `
    <div class="match-card fade-in">
      <div class="match-time">${escapeHTML(m.time)} — ${escapeHTML(m.date)}</div>
      <div class="match-teams">
        ${escapeHTML(m.team1)}
        <span class="match-vs">VS</span>
        ${escapeHTML(m.team2)}
      </div>
      <div class="match-info">🏆 ${escapeHTML(m.tournament)}</div>
    </div>
  `).join('');
}

function renderNews(news) {
  const container = $('#newsList');
  if (!news?.length) {
    container.innerHTML = '<div class="empty">خبری برای نمایش وجود ندارد.</div>';
    return;
  }

  container.innerHTML = news.map(n => `
    <article class="news-card fade-in" data-category="${escapeHTML(n.category)}">
      <span class="news-category cat-${escapeHTML(n.category)}">${escapeHTML(n.categoryLabel)}</span>
      <h3 class="news-title">${escapeHTML(n.title)}</h3>
      <p class="news-summary">${escapeHTML(n.summary)}</p>
      <div class="news-meta">
        <span class="news-source">${escapeHTML(n.source)}</span>
        <span>${toPersianDate(n.date)}</span>
      </div>
    </article>
  `).join('');
}

function renderRanking(ranking) {
  const container = $('#rankingList');
  if (!ranking?.length) {
    container.innerHTML = '<div class="empty">رنکینگی ثبت نشده.</div>';
    return;
  }

  container.innerHTML = ranking.map((p, i) => {
    const rankClass = i < 3 ? `top-${i + 1}` : '';
    return `
      <div class="rank-item">
        <div class="rank-num ${rankClass}">${i + 1}</div>
        <div class="rank-info">
          <div class="rank-name">${escapeHTML(p.name)}</div>
          <div class="rank-country">${escapeHTML(p.country)}</div>
        </div>
        <div class="rank-points">${escapeHTML(String(p.points))}</div>
      </div>
    `;
  }).join('');
}

// ==================== فیلتر ====================
function setupFilters() {
  $$('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      $$('.news-card').forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.style.display = show ? '' : 'none';
      });
    });
  });
}

// ==================== بارگذاری ====================
async function loadData() {
  try {
    const res = await fetch(`${DATA_URL}?t=${Date.now()}`); // جلوگیری از کش
    if (!res.ok) throw new Error('خطا در دریافت داده');
    const data = await res.json();

    renderLastUpdate(data.updatedAt);
    renderMatches(data.matches);
    renderNews(data.news);
    renderRanking(data.ranking);
    setupFilters();

  } catch (err) {
    console.error(err);
    $('#newsList').innerHTML = '<div class="empty">خطا در بارگذاری اخبار. لطفاً بعداً تلاش کنید.</div>';
    $('#upcomingMatches').innerHTML = '<div class="empty">خطا در بارگذاری بازی‌ها.</div>';
  }
}

// ==================== شروع ====================
document.addEventListener('DOMContentLoaded', loadData);

// هر ۱۰ دقیقه یک بار از سرور چک کن (در صورت تغییر فایل در گیت‌هاب)
setInterval(loadData, 10 * 60 * 1000);
