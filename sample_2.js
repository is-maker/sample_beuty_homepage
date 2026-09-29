// スマホ用メニューの開閉
const menuBtn = document.getElementById('menuBtn');
const gnav = document.getElementById('gnav');

const toggleMenu = (open) => {
  document.body.classList.toggle('is-menu-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
};

menuBtn.addEventListener('click', () => {
  toggleMenu(!document.body.classList.contains('is-menu-open'));
});
gnav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => toggleMenu(false)));

// 予約フォーム（入力チェックはブラウザ標準。サンプルのため実際には送信しない）
const form = document.getElementById('reserveForm');
const formMsg = document.getElementById('formMsg');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  formMsg.textContent = 'ご予約ありがとうございます。（サンプルのため実際には送信されません）';
  form.reset();
});
