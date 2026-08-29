// ── Состояние приложения ──────────────────────────────
let state = {
  cart: JSON.parse(localStorage.getItem('nextPizzaCart') || '[]'),
  activeCategory: 'Все',
  activeIngredients: new Set(),
  search: '',
  sort: 'popular',
  priceMin: null,
  priceMax: null,
  filterCustom: false,
  filterNew: false,
  page: 1,
  user: JSON.parse(localStorage.getItem('nextPizzaUser') || 'null'),
};

const PER_PAGE = 8;
const TAX_RATE = 0.05;
const DELIVERY = 120;

// ── Утилиты ──────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const formatPrice = (n) => Math.round(n).toLocaleString('ru-RU') + ' ₽';

function showToast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2200);
}

// ── Инициализация ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  renderIngredientFilters();
  renderAuth();
  renderCart();
  renderCatalog();
});

// ── Категории ────────────────────────────────────────
function renderCategories() {
  const wrap = $('#categories');
  wrap.innerHTML = '';
  CATEGORIES.forEach((cat) => {
    const btn = document.createElement('button');
    btn.className = 'category-tab' + (cat === state.activeCategory ? ' active' : '');
    btn.textContent = cat;
    btn.onclick = () => {
      state.activeCategory = cat;
      state.page = 1;
      renderCategories();
      renderCatalog();
    };
    wrap.appendChild(btn);
  });
}

// ── Фильтры по ингредиентам ──────────────────────────
function renderIngredientFilters() {
  const wrap = $('#ingredientFilters');
  const visible = FILTER_INGREDIENTS.slice(0, 6);
  wrap.innerHTML = '';
  visible.forEach((name) => {
    const label = document.createElement('label');
    label.className = 'checkbox-row';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = state.activeIngredients.has(name);
    cb.onchange = () => {
      if (cb.checked) state.activeIngredients.add(name);
      else state.activeIngredients.delete(name);
      state.page = 1;
      renderCatalog();
    };
    label.appendChild(cb);
    label.appendChild(document.createTextNode(name));
    wrap.appendChild(label);
  });

  if (FILTER_INGREDIENTS.length > 6) {
    const more = FILTER_INGREDIENTS.slice(6);
    more.forEach((name) => {
      const label = document.createElement('label');
      label.className = 'checkbox-row';
      label.style.display = 'none';
      label.id = 'extraIng_' + name;
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = state.activeIngredients.has(name);
      cb.onchange = () => {
        if (cb.checked) state.activeIngredients.add(name);
        else state.activeIngredients.delete(name);
        state.page = 1;
        renderCatalog();
      };
      label.appendChild(cb);
      label.appendChild(document.createTextNode(name));
      wrap.appendChild(label);
    });
  }

  const showAll = $('#showAllIngredients');
  showAll.onclick = () => {
    FILTER_INGREDIENTS.slice(6).forEach((name) => {
      const el = $('#extraIng_' + name);
      if (el) el.style.display = 'flex';
    });
    showAll.style.display = 'none';
  };
}

// ── Фильтрация и сортировка ──────────────────────────
function getFiltered() {
  let list = [...PIZZAS];

  if (state.activeCategory !== 'Все') {
    list = list.filter((p) => p.category === state.activeCategory);
  }
  if (state.search) {
    list = list.filter((p) =>
      p.name.toLowerCase().includes(state.search.toLowerCase())
    );
  }
  if (state.priceMin != null) list = list.filter((p) => p.price >= state.priceMin);
  if (state.priceMax != null) list = list.filter((p) => p.price <= state.priceMax);
  if (state.filterCustom) list = list.filter((p) => p.custom);
  if (state.filterNew) list = list.filter((p) => p.isNew);
  if (state.activeIngredients.size > 0) {
    list = list.filter((p) =>
      [...state.activeIngredients].every((ing) =>
        [...p.ingredients, ...ADDITIONAL_INGREDIENTS.map((a) => a.name)].some((x) =>
          x.toLowerCase().startsWith(ing.toLowerCase().slice(0, 4))
        )
      )
    );
  }

  switch (state.sort) {
    case 'price-asc': list.sort((a, b) => a.price - b.price); break;
    case 'price-desc': list.sort((a, b) => b.price - a.price); break;
    case 'name': list.sort((a, b) => a.name.localeCompare(b.name, 'ru')); break;
    default: list.sort((a, b) => b.rating - a.rating);
  }
  return list;
}

// ── Рендер каталога ──────────────────────────────────
function renderCatalog() {
  const filtered = getFiltered();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  if (state.page > totalPages) state.page = totalPages;

  const start = (state.page - 1) * PER_PAGE;
  const pageItems = filtered.slice(start, start + PER_PAGE);

  const grid = $('#pizzaGrid');
  grid.innerHTML = '';

  if (pageItems.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <img src="images/cart_empty.webp" alt="">
        <h3>Ничего не найдено</h3>
        <p>Попробуйте изменить параметры фильтрации или поиска</p>
        <button class="btn-apply" style="width:auto;padding:12px 30px" onclick="resetFilters()">Сбросить фильтры</button>
      </div>`;
    $('#pagination').innerHTML = '';
    return;
  }

  pageItems.forEach((pizza) => {
    const card = document.createElement('div');
    card.className = 'pizza-card';
    card.innerHTML = `
      <div class="pizza-img-wrap">
        <img class="pizza-img" src="${pizza.image}" alt="${pizza.name}" loading="lazy">
        ${pizza.name.includes('🌱') ? '<div class="pizza-veg">🌱</div>' : ''}
      </div>
      <div class="pizza-info">
        <div class="pizza-name">${pizza.name.replace(' 🌱', '')}</div>
        <div class="pizza-desc">${pizza.description}</div>
        <div class="pizza-bottom">
          <div class="pizza-price">от <b>${formatPrice(pizza.price)}</b></div>
          <button class="btn-add" data-id="${pizza.id}">
            ${pizza.custom ? 'Собрать' : 'Добавить'}
            ${pizza.custom ? '' : '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'}
          </button>
        </div>
      </div>`;
    grid.appendChild(card);
  });

  // Обработчики
  grid.querySelectorAll('.pizza-card').forEach((card, i) => {
    const pizza = pageItems[i];
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-add')) return;
      openPizzaModal(pizza);
    });
  });
  grid.querySelectorAll('.btn-add').forEach((btn, i) => {
    const pizza = pageItems[i];
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (pizza.custom) openPizzaModal(pizza);
      else addToCart(pizza, {
        size: SIZES[1],
        dough: DOUGH[0],
        additions: [],
        qty: 1,
      });
    });
  });

  renderPagination(totalPages, filtered.length);
}

function renderPagination(totalPages, total) {
  const wrap = $('#pagination');
  if (totalPages <= 1) {
    wrap.innerHTML = `<span class="page-info">9 из ${total}</span>`;
    return;
  }
  let html = '';
  html += `<button class="page-btn" ${state.page === 1 ? 'disabled' : ''} onclick="goPage(${state.page - 1})">‹</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === state.page ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
  }
  html += `<button class="page-btn" ${state.page === totalPages ? 'disabled' : ''} onclick="goPage(${state.page + 1})">›</button>`;
  html += `<span class="page-info">${state.page} из ${total}</span>`;
  wrap.innerHTML = html;
}

function goPage(p) {
  if (p < 1) return;
  state.page = p;
  renderCatalog();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetFilters() {
  state.activeCategory = 'Все';
  state.activeIngredients = new Set();
  state.search = '';
  state.sort = 'popular';
  state.priceMin = null;
  state.priceMax = null;
  state.filterCustom = false;
  state.filterNew = false;
  state.page = 1;
  $('#searchInput').value = '';
  $('#priceMin').value = '';
  $('#priceMax').value = '';
  $('#filterCustom').checked = false;
  $('#filterNew').checked = false;
  renderCategories();
  renderIngredientFilters();
  renderCatalog();
}

// ── Поиск и события ──────────────────────────────────
$('#searchInput') && ($('#searchInput').addEventListener('input', (e) => {
  state.search = e.target.value;
  state.page = 1;
  renderCatalog();
}));

$('#sortSelect') && ($('#sortSelect').addEventListener('change', (e) => {
  state.sort = e.target.value;
  renderCatalog();
}));

$('#applyFilters') && ($('#applyFilters').addEventListener('click', () => {
  const min = $('#priceMin').value;
  const max = $('#priceMax').value;
  state.priceMin = min !== '' ? parseInt(min) : null;
  state.priceMax = max !== '' ? parseInt(max) : null;
  state.page = 1;
  renderCatalog();
}));

$('#filterCustom') && ($('#filterCustom').addEventListener('change', (e) => {
  state.filterCustom = e.target.checked;
  state.page = 1;
  renderCatalog();
}));

$('#filterNew') && ($('#filterNew').addEventListener('change', (e) => {
  state.filterNew = e.target.checked;
  state.page = 1;
  renderCatalog();
}));

// ── Модалка пиццы ────────────────────────────────────
let modalState = { pizza: null, size: null, dough: null, additions: [] };

function openPizzaModal(pizza) {
  modalState = {
    pizza,
    size: SIZES[1],
    dough: DOUGH[0],
    additions: [],
  };
  $('#modalImg').src = pizza.image;
  $('#modalTitle').textContent = pizza.name.replace(' 🌱', '');
  $('#modalSub').textContent = '30 см, традиционное тесто 30, традиционное';
  $('#modalAddBtn').textContent = `Добавить в корзину за ${formatPrice(pizza.price)}`;
  renderModalOptions();
  $('#pizzaModal').classList.add('open');
}

function renderModalOptions() {
  const { pizza, size, dough, additions } = modalState;

  // Размер / тип теста
  const sizeType = $('#modalSizeType');
  sizeType.innerHTML = '';
  DOUGH.forEach((d) => {
    const seg = document.createElement('div');
    seg.className = 'segment' + (d === dough ? ' active' : '');
    seg.textContent = d;
    seg.onclick = () => {
      modalState.dough = d;
      updateModalPrice();
      renderModalOptions();
    };
    sizeType.appendChild(seg);
  });

  const sizeWrap = $('#modalSize');
  sizeWrap.innerHTML = '';
  SIZES.forEach((s) => {
    const seg = document.createElement('div');
    seg.className = 'segment' + (s.label === size.label ? ' active' : '');
    seg.textContent = s.label + ' ' + s.size;
    seg.onclick = () => {
      modalState.size = s;
      updateModalPrice();
      renderModalOptions();
    };
    sizeWrap.appendChild(seg);
  });

  // Ингредиенты
  const ingWrap = $('#modalIngredients');
  ingWrap.innerHTML = '';
  ADDITIONAL_INGREDIENTS.forEach((ing) => {
    const card = document.createElement('div');
    const isSel = additions.includes(ing.name);
    card.className = 'ingredient' + (isSel ? ' selected' : '');
    card.innerHTML = `
      <div class="check">✓</div>
      <img src="${ing.image}" alt="">
      <span>${ing.name}</span>
      <div class="price">${ing.price} ₽</div>`;
    card.onclick = () => {
      if (isSel) {
        modalState.additions = additions.filter((x) => x !== ing.name);
      } else {
        modalState.additions = [...additions, ing.name];
      }
      updateModalPrice();
      renderModalOptions();
    };
    ingWrap.appendChild(card);
  });
}

function updateModalPrice() {
  const { pizza, size, additions } = modalState;
  const base = pizza.price * size.mult;
  const extra = additions.reduce((sum, name) => {
    const ing = ADDITIONAL_INGREDIENTS.find((i) => i.name === name);
    return sum + (ing ? ing.price : 0);
  }, 0);
  $('#modalAddBtn').textContent = `Добавить в корзину за ${formatPrice(base + extra)}`;
  const sub = `${size.label} ${size.size}, ${modalState.dough} тесто`;
  $('#modalSub').textContent = sub;
}

function closePizzaModal() {
  $('#pizzaModal').classList.remove('open');
}

$('#pizzaModal') && ($('#pizzaModal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closePizzaModal();
}));

$('#modalAddBtn') && ($('#modalAddBtn').addEventListener('click', () => {
  const { pizza, size, dough, additions } = modalState;
  addToCart(pizza, { size, dough, additions, qty: 1 });
  closePizzaModal();
}));

// ── Корзина ──────────────────────────────────────────
function addToCart(pizza, opts) {
  const base = pizza.price * opts.size.mult;
  const extra = opts.additions.reduce((sum, name) => {
    const ing = ADDITIONAL_INGREDIENTS.find((i) => i.name === name);
    return sum + (ing ? ing.price : 0);
  }, 0);
  const unitPrice = base + extra;

  const sizeLabel = opts.size ? opts.size.label : 'Средняя';
  const doughLabel = opts.dough || 'Традиционное';

  // Ищем существующий одинаковый товар
  const existing = state.cart.find(
    (i) =>
      i.id === pizza.id &&
      i.sizeLabel === sizeLabel &&
      i.dough === doughLabel &&
      JSON.stringify(i.additions || []) === JSON.stringify(opts.additions || [])
  );

  if (existing) {
    existing.qty++;
  } else {
    state.cart.push({
      id: pizza.id,
      name: pizza.name.replace(' 🌱', ''),
      image: pizza.image,
      unitPrice,
      qty: 1,
      sizeLabel,
      size: opts.size ? opts.size.size : '30 см',
      dough: doughLabel,
      additions: opts.additions || [],
    });
  }

  saveCart();
  renderCart();
  showToast(`"${pizza.name.replace(' 🌱', '')}" добавлена в корзину`);
  renderCatalog();
}

function saveCart() {
  localStorage.setItem('nextPizzaCart', JSON.stringify(state.cart));
}

function cartTotals() {
  const items = state.cart.map((i) => ({
    ...i,
    lineTotal: i.unitPrice * i.qty,
  }));
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax + DELIVERY;
  return { items, subtotal, tax, total };
}

function renderCart() {
  const { items, subtotal, tax, total } = cartTotals();

  // Кнопка в шапке
  const count = items.reduce((s, i) => s + i.qty, 0);
  $('#cartCount').textContent = count;
  $('#cartTotal').textContent = formatPrice(subtotal);

  // Корзина (drawer)
  const wrap = $('#drawerItems');
  if (items.length === 0) {
    wrap.innerHTML = `
      <div class="empty-state">
        <img src="images/cart_empty.webp" alt="">
        <h3>Корзина пустая</h3>
        <p>Добавьте хотя бы одну пиццу, чтобы совершить заказ</p>
      </div>`;
  } else {
    wrap.innerHTML = '';
    items.forEach((item, idx) => {
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-desc">${item.sizeLabel} ${item.size}, ${item.dough} тесто${item.additions && item.additions.length ? ', +' + item.additions.join(', ') : ''}</div>
          <div class="qty-controls">
            <button class="qty-btn" onclick="changeQty(${idx}, -1)">−</button>
            <span>${item.qty}</span>
            <button class="qty-btn" onclick="changeQty(${idx}, 1)">+</button>
          </div>
        </div>
        <div class="cart-item-price">${formatPrice(item.lineTotal)}</div>`;
      wrap.appendChild(el);
    });
  }

  $('#drawerTotal').textContent = formatPrice(total);
  $('#drawerSubtotal').textContent =
    `Товары: ${formatPrice(subtotal)} • Налог: ${formatPrice(tax)} • Доставка: ${formatPrice(DELIVERY)}`;
}

function changeQty(idx, delta) {
  const item = state.cart[idx];
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    state.cart.splice(idx, 1);
  }
  saveCart();
  renderCart();
  renderCatalog();
}

// ── Drawer ───────────────────────────────────────────
function openDrawer() {
  $('#drawer').classList.add('open');
  $('#drawerOverlay').classList.add('open');
}

function closeDrawer() {
  $('#drawer').classList.remove('open');
  $('#drawerOverlay').classList.remove('open');
}

$('#cartBtn') && ($('#cartBtn').addEventListener('click', openDrawer));

function goCheckout() {
  if (state.cart.length === 0) {
    showToast('Корзина пустая');
    return;
  }
  closeDrawer();
  buildCheckoutPage();
}

// ── Авторизация ─────────────────────────────────────
function renderAuth() {
  const label = $('#loginLabel');
  if (state.user) {
    label.textContent = state.user.name || 'Профиль';
    $('#loginBtn').innerHTML =
      `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 8a3 3 0 100-6 3 3 0 000 6zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg><span>${state.user.name || 'Профиль'}</span>`;
  } else {
    label.textContent = 'Войти';
    $('#loginBtn').innerHTML =
      `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 8a3 3 0 100-6 3 3 0 000 6zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg><span>Войти</span>`;
  }
}

$('#loginBtn') && ($('#loginBtn').addEventListener('click', () => {
  if (state.user) {
    state.user = null;
    localStorage.removeItem('nextPizzaUser');
    renderAuth();
    showToast('Вы вышли из аккаунта');
  } else {
    openAuth();
  }
}));

function openAuth() {
  $('#authContent').innerHTML = `
    <h2>Вход в аккаунт</h2>
    <p>Введите номер телефона, чтобы войти или зарегистрироваться</p>
    <input type="tel" id="authPhone" placeholder="+7 (921) XXX-XX-XX" value="+7 (921) 450-20-25">
    <button class="btn-auth" id="authNext">Получить код в SMS</button>`;
  $('#authModal').classList.add('open');
  $('#authNext').addEventListener('click', () => {
    renderPin();
  });
}

function renderPin() {
  $('#authContent').innerHTML = `
    <h2>Введите код</h2>
    <p>SMS-код был отправлен на номер телефона +7 (921) 450-20-25</p>
    <div class="pin-row">
      <input maxlength="1" data-pin><input maxlength="1" data-pin><input maxlength="1" data-pin><input maxlength="1" data-pin>
    </div>
    <button class="btn-auth" disabled id="authConfirm">Подтвердить</button>
    <p style="margin-top:12px;font-size:13px;color:#cecece">Запросить код — через 28 сек.</p>`;

  const inputs = document.querySelectorAll('[data-pin]');
  inputs.forEach((inp, i) => {
    inp.addEventListener('input', () => {
      if (inp.value && i < 3) inputs[i + 1].focus();
      const filled = [...inputs].every((x) => x.value);
      $('#authConfirm').disabled = !filled;
    });
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !inp.value && i > 0) inputs[i - 1].focus();
    });
  });
  inputs[0].focus();

  $('#authConfirm').addEventListener('click', () => {
    state.user = { name: 'Пользователь', phone: '+7 (921) 450-20-25' };
    localStorage.setItem('nextPizzaUser', JSON.stringify(state.user));
    $('#authModal').classList.remove('open');
    renderAuth();
    showToast('Вы вошли в аккаунт');
  });
}

function closeAuth() {
  $('#authModal').classList.remove('open');
}

$('#authModal') && ($('#authModal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeAuth();
}));

// ── Страница оформления заказа ──────────────────────
function buildCheckoutPage() {
  const { items, subtotal, tax, total } = cartTotals();
  const app = document.querySelector('.app');

  let itemsHtml = items
    .map(
      (i) => `
      <div class="cart-item" style="border-bottom:1px solid #f5f5f5;border-radius:0">
        <img src="${i.image}" alt="">
        <div class="cart-item-info">
          <div class="cart-item-name">${i.name}</div>
          <div class="cart-item-desc">${i.sizeLabel} ${i.size}, ${i.dough} тесто — ${i.qty} шт.</div>
        </div>
        <div class="cart-item-price">${formatPrice(i.lineTotal)}</div>
      </div>`
    )
    .join('');

  app.innerHTML = `
    <div class="white-card">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:26px 0;border-bottom:1px solid #ededed">
        <div class="logo" onclick="location.reload()">
          <img src="images/logo.webp" alt="Next Pizza">
          <div>
            <div class="logo-title">Next Pizza</div>
            <div class="logo-sub">вкусней уже не будет</div>
          </div>
        </div>
        <button class="btn-outline" id="checkoutBack">← На главную</button>
      </div>

      <div class="checkout-grid">
        <div>
          <h1 style="font-size:36px;font-weight:800;color:var(--dark);margin:26px 0 20px">Оформление заказа</h1>

          <div class="checkout-section">
            <h2><span class="step-num">1</span> Корзина</h2>
            ${itemsHtml}
          </div>

          <div class="checkout-section">
            <h2><span class="step-num">2</span> Персональная информация</h2>
            <div class="form-grid">
              <div class="form-group">
                <label>Имя</label>
                <input value="${state.user ? 'Вася' : ''}" placeholder="Ваше имя">
              </div>
              <div class="form-group">
                <label>Фамилия</label>
                <input placeholder="Ваша фамилия">
              </div>
              <div class="form-group">
                <label>E-Mail</label>
                <input type="email" placeholder="you@mail.ru">
              </div>
              <div class="form-group">
                <label>Телефон</label>
                <input type="tel" value="${state.user ? '+7 (999) 100-20-20' : ''}" placeholder="+7 (999) 100-20-20">
              </div>
            </div>
          </div>

          <div class="checkout-section">
            <h2><span class="step-num">3</span> Адрес доставки</h2>
            <div class="form-grid">
              <div class="form-group full">
                <label>Адрес</label>
                <input value="Москва, ул. Мира 12" placeholder="Введите адрес">
              </div>
              <div class="form-group full">
                <label>Комментарий к заказу</label>
                <textarea rows="3" placeholder="Укажите тут дополнительную информацию для курьера"></textarea>
              </div>
            </div>
          </div>
        </div>

        <div class="order-summary">
          <h2>Ваш заказ</h2>
          <div class="summary-row"><span>Стоимость товаров:</span><span class="val">${formatPrice(subtotal)}</span></div>
          <div class="summary-row"><span>Налог 5%:</span><span class="val">${formatPrice(tax)}</span></div>
          <div class="summary-row"><span>Доставка:</span><span class="val">${formatPrice(DELIVERY)}</span></div>
          <div class="summary-total"><span class="label">Итого:</span><span class="val">${formatPrice(total)}</span></div>
          <button class="btn-pay" onclick="placeOrder()">Перейти к оплате</button>
        </div>
      </div>
    </div>`;

  $('#checkoutBack').addEventListener('click', () => location.reload());
}

function placeOrder() {
  state.cart = [];
  localStorage.removeItem('nextPizzaCart');
  const app = document.querySelector('.app');
  app.innerHTML = `
    <div class="white-card" style="display:flex;align-items:center;justify-content:center;min-height:80vh">
      <div style="text-align:center;max-width:420px">
        <div style="font-size:60px;margin-bottom:16px">🎉</div>
        <h1 style="font-size:32px;font-weight:800;color:var(--dark);margin-bottom:10px">Заказ оформлен!</h1>
        <p style="color:#777;margin-bottom:24px">Спасибо за ваш заказ. Курьер уже собирается в путь — пицца будет у вас через 30-40 минут.</p>
        <button class="btn-apply" style="width:auto;padding:14px 40px" onclick="location.reload()">На главную</button>
      </div>
    </div>`;
  renderCart();
}
