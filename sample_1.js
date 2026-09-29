/* ==========================================================
   サンプルのホームページ インタラクション
   ========================================================== */
(() => {
  'use strict';

  // OS の「視差効果を減らす」設定と、マウス操作できる端末かどうか
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const header = document.querySelector('.header');
  const hero = document.querySelector('.hero');
  const progress = document.querySelector('.progress');
  const toTop = document.querySelector('.to-top');

  /* ---------- 1. メインビジュアルの見出しを1文字ずつ表示 ---------- */
  const title = document.querySelector('.hero__title');
  if (title) {
    // 読み上げソフトには分割前の文章をそのまま伝える
    title.setAttribute('aria-label', title.textContent);
    let i = 0;
    [...title.childNodes].forEach((node) => {
      if (node.nodeType !== Node.TEXT_NODE) return; // <br> はそのまま残す
      const frag = document.createDocumentFragment();
      [...node.textContent].forEach((ch) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = ch;
        span.setAttribute('aria-hidden', 'true');
        span.style.setProperty('--i', i++);
        frag.appendChild(span);
      });
      node.replaceWith(frag);
    });
  }

  /* ---------- 2. スクロール連動（進捗バー・ヘッダー・パララックス） ---------- */
  let lastY = window.scrollY;
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    // 下スクロールでヘッダーを隠し、上スクロールで再表示
    const menuOpen = document.body.classList.contains('is-menu-open');
    header.classList.toggle('is-scrolled', y > 40);
    header.classList.toggle('is-hidden', !menuOpen && y > lastY && y > 300);
    lastY = y;

    toTop.classList.toggle('is-show', y > window.innerHeight * 0.8);

    // 星と文字を異なる速さで動かして奥行きを出す
    if (!reduceMotion && hero && y <= hero.offsetHeight) {
      hero.style.setProperty('--sy', `${y * 0.4}px`);
      hero.style.setProperty('--cy', `${y * 0.25}px`);
      hero.style.setProperty('--co', String(1 - y / hero.offsetHeight));
    }
    ticking = false;
  };

  // requestAnimationFrame で描画1回につき1度だけ処理し、負荷を抑える
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  /* ---------- 3. 画面に入った要素をふわっと表示 ---------- */
  // グループ内の要素には少しずつ遅延をつけて順番に出す
  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    group.querySelectorAll('[data-reveal]').forEach((el, idx) => {
      el.style.setProperty('--delay', `${idx * 0.12}s`);
    });
  });

  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target); // 一度表示したら監視をやめる
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- 4. 数字のカウントアップ ---------- */
  const countUp = (el) => {
    const target = Number(el.dataset.count);
    const duration = 1200;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // 終盤ゆっくりになる easeOutCubic
      el.textContent = Math.round(target * eased);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 1 });
    document.querySelectorAll('[data-count]').forEach((el) => countObserver.observe(el));
  }

  /* ---------- 5. 表示中のセクションをナビでハイライト ---------- */
  const navLinks = [...document.querySelectorAll('.gnav a[href^="#"]')];
  if ('IntersectionObserver' in window) {
    // 画面の縦方向ちょうど真ん中の線にかかったセクションを「表示中」とみなす
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((a) => {
          a.classList.toggle('is-active', id !== '' && a.getAttribute('href') === `#${id}`);
        });
      });
    }, { rootMargin: '-50% 0px -50% 0px' });

    navLinks.forEach((a) => {
      const section = document.querySelector(a.getAttribute('href'));
      if (section) sectionObserver.observe(section);
    });
    if (hero) sectionObserver.observe(hero); // 最上部に戻ったらハイライトを消す
  }

  /* ---------- 6. マウスに反応する演出（PC のみ） ---------- */
  if (canHover && !reduceMotion) {
    // メニューカードをマウスの位置に合わせて立体的に傾ける
    document.querySelectorAll('.menu-card').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;  // 0〜1
        const y = (e.clientY - r.top) / r.height;  // 0〜1
        card.style.setProperty('--ry', `${(x - 0.5) * 10}deg`);
        card.style.setProperty('--rx', `${(0.5 - y) * 10}deg`);
        card.style.setProperty('--gx', `${x * 100}%`);
        card.style.setProperty('--gy', `${y * 100}%`);
      });
      card.addEventListener('pointerleave', () => {
        ['--rx', '--ry', '--gx', '--gy'].forEach((p) => card.style.removeProperty(p));
      });
    });

    // メインビジュアルの星空をマウスと逆方向に少しずらす
    if (hero) {
      hero.addEventListener('pointermove', (e) => {
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        hero.style.setProperty('--px', `${x * -24}px`);
        hero.style.setProperty('--py', `${y * -24}px`);
      });
    }
  }

  /* ---------- 7. スマホ用メニューの開閉 ---------- */
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
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleMenu(false);
  });

  /* ---------- 8. お問い合わせフォーム（サンプルのため実際には送信しない） ---------- */
  const form = document.getElementById('contactForm');
  const formMsg = document.getElementById('formMsg');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      formMsg.textContent = '未入力の項目、またはメールアドレスの形式をご確認ください。';
      formMsg.className = 'form__msg is-error';
      form.classList.remove('is-shake');
      void form.offsetWidth; // アニメーションを再生し直すためにリフローさせる
      form.classList.add('is-shake');
      return;
    }

    // 送信中の見た目を少しだけ見せてから完了メッセージを出す
    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');
    formMsg.textContent = '';
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-loading');
      formMsg.textContent = '送信ありがとうございました。（サンプルのため実際には送信されません）';
      formMsg.className = 'form__msg is-success';
      form.reset();
    }, 900);
  });
})();
