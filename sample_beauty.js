// スマホ用メニューの開閉
const menuBtn = document.getElementById('menuBtn');
const gnav = document.getElementById('gnav');

const toggleMenu = (open) => {
  document.body.classList.toggle('is-menu-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
};

menuBtn.addEventListener('click', () => {
  toggleMenu(!document.body.classList.contains('is-menu-open'));
});
gnav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => toggleMenu(false)));

// 検索フォーム（サンプルのため実際には検索せず、注目サロンへ移動する）
const searchForm = document.getElementById('searchForm');
const searchMsg = document.getElementById('searchMsg');

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  searchMsg.textContent = 'サンプルのため、実際の検索は行われません。おすすめのサロンをご覧ください。';
  setTimeout(() => document.getElementById('pickup').scrollIntoView({ behavior: 'smooth' }), 900);
});
