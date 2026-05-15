let cart = [];
let activeCategory = 'all';
let activeSort = 'default';
const products = [
  { id: 1,  name: "Sevilla FC", price: 80, category: "liga", img: "img/sevilla.png", featured: true  },
  { id: 2,  name: "FC Barcelona", price: 80, category: "liga", img: "img/barcelona.png", featured: true  },
  { id: 3,  name: "Deportivo de La Coruña", price: 80, category: "liga", img: "img/deportivo.png", featured: false },
  { id: 4,  name: "Atlético de Madrid", price: 80, category: "liga", img: "img/atletico.png", featured: false },
  { id: 5,  name: "Real Madrid", price: 80, category: "liga", img: "img/realmadrid.png", featured: true  },
  { id: 6,  name: "Real Betis", price: 80, category: "liga", img: "img/betis.png", featured: false },
  { id: 7,  name: "Chelsea FC", price: 75, category: "premier", img: "img/chelsea.png", featured: false },
  { id: 8,  name: "Liverpool FC", price: 75, category: "premier", img: "img/liverpool.png", featured: true  },
  { id: 9,  name: "Manchester City", price: 75, category: "premier", img: "img/mancity.png", featured: false },
  { id: 10, name: "Manchester United", price: 75, category: "premier", img: "img/manutd.png", featured: true  },
  { id: 11, name: "Arsenal FC", price: 75, category: "premier", img: "img/arsenal.png", featured: false },
  { id: 12, name: "AC Milan", price: 75, category: "otras", img: "img/milan.png", featured: false },
  { id: 13, name: "Ajax Amsterdam", price: 75, category: "otras", img: "img/ajax.png", featured: true  },
  { id: 14, name: "Boca Juniors", price: 75, category: "otras", img: "img/boca.png", featured: false },
  { id: 15, name: "Paris Saint-Germain", price: 75, category: "otras", img: "img/psg.png",  featured: false },
  { id: 16, name: "Juventus FC", price: 75, category: "otras", img: "img/juventus.png", featured: false },
  { id: 17, name: "Selección España", price: 100, category: "seleccion", img: "img/espana.png", featured: true  },
  { id: 18, name: "Selección Francia", price: 100, category: "seleccion", img: "img/francia.png", featured: false },
  { id: 19, name: "Selección Argentina", price: 100, category: "seleccion", img: "img/argentina.png", featured: true  },
  { id: 20, name: "Selección Brasil", price: 100, category: "seleccion", img: "img/brasil.png", featured: false },
  { id: 21, name: "Selección Holanda", price: 100, category: "seleccion", img: "img/holanda.png", featured: false },
];

/*  CARRITO: PERSISTENCIA  */
function saveCart() {
  localStorage.setItem('classicxi_cart', JSON.stringify(cart));
}

function loadCart() {
  try {
    const saved = localStorage.getItem('classicxi_cart');
    if (!saved) return;
    cart = JSON.parse(saved)
      .map(item => {
        const product = products.find(p => p.id === item.product.id);
        return product ? { product, qty: item.qty } : null;
      })
      .filter(Boolean);
  } catch {
    cart = [];
  }
}

/*  MENÚ MÓVIL  */
function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('mobile-open');
}

/*  CARRITO: ABRIR / CERRAR  */
function toggleCart() {
  document.getElementById('cartSidebar').classList.toggle('open');
  document.getElementById('cartOverlay').classList.toggle('active');
}

/*  CARRITO: AÑADIR  */
function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(item => item.product.id === id);
  existing ? existing.qty++ : cart.push({ product, qty: 1 });
  saveCart();
  updateCart();
  renderProducts(getFilteredSortedProducts());
  showToast(`${product.name} añadido al carrito.`);
}

/*  CARRITO: CAMBIAR CANTIDAD */
function changeQty(id, delta) {
  const idx = cart.findIndex(item => item.product.id === id);
  if (idx === -1) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart();
  updateCart();
  renderProducts(getFilteredSortedProducts());
}

/*  CARRITO: ELIMINAR */
function removeFromCart(id) {
  cart = cart.filter(item => item.product.id !== id);
  saveCart();
  updateCart();
  renderProducts(getFilteredSortedProducts());
}

/*  CARRITO: RENDERIZAR Y TOTALES */
function updateCart() {
  const container = document.getElementById('cartItems');
  const countEl   = document.getElementById('cartCount');
  const total     = cart.reduce((acc, { qty }) => acc + qty, 0);

  countEl.textContent = total;
  countEl.classList.toggle('visible', total > 0);

  if (cart.length === 0) {
    container.innerHTML = '<p class="cart-empty">Tu carrito está vacío.</p>';
  } else {
    container.innerHTML = cart.map(({ product, qty }) => `
      <div class="cart-item">
        <div class="cart-item__img">
          <img src="${product.img}" alt="${product.name}" onerror="this.style.display='none'">
        </div>
        <div class="cart-item__info">
          <div class="cart-item__name">${product.name}</div>
          <div class="cart-item__price">€${(product.price * qty).toFixed(2)}</div>
          <div class="cart-item__qty">
            <button class="qty-btn" onclick="changeQty(${product.id}, -1)">−</button>
            <span class="qty-val">${qty}</span>
            <button class="qty-btn" onclick="changeQty(${product.id}, 1)">+</button>
            <button class="qty-btn" onclick="removeFromCart(${product.id})" style="margin-left:6px;font-size:0.65rem;color:var(--gold-dark)" aria-label="Eliminar">✕</button>
          </div>
        </div>
      </div>`).join('');
  }

  const subtotal = cart.reduce((acc, { product, qty }) => acc + product.price * qty, 0);
  const envio    = subtotal === 0 ? 0 : subtotal >= 150 ? 0 : subtotal >= 100 ? 4.95 : 7.95;
  document.getElementById('cartSubtotal').textContent = `€${subtotal.toFixed(2)}`;
  document.getElementById('cartShipping').textContent = envio === 0 && subtotal > 0 ? 'Gratis' : `€${envio.toFixed(2)}`;
  document.getElementById('cartTotal').textContent    = `€${(subtotal + envio).toFixed(2)}`;
}

/*  CHECKOUT */
function checkout() {
  if (cart.length === 0) { showToast('Tu carrito está vacío.'); return; }
  showToast('¡Pedido procesado! Gracias por tu compra.');
  cart = [];
  saveCart();
  updateCart();
  renderProducts(getFilteredSortedProducts());
  toggleCart();
}

/*  FILTRAR POR CATEGORÍA  */
function filterCategory(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeCategory = cat;
  renderProducts(getFilteredSortedProducts());
}

/* ORDENAR  */
function sortProducts(type) {
  activeSort = type;
  renderProducts(getFilteredSortedProducts());
}

/*  FILTRAR + ORDENAR  */
function getFilteredSortedProducts() {
  let lista = activeCategory === 'all'
    ? [...products]
    : products.filter(p => p.category === activeCategory);
  const sorters = {
    asc:  (a, b) => a.price - b.price,
    desc: (a, b) => b.price - a.price,
    name: (a, b) => a.name.localeCompare(b.name),
  };
  if (sorters[activeSort]) lista.sort(sorters[activeSort]);
  return lista;
}

/* ETIQUETA CATEGORÍA  */
function categoryLabel(cat) {
  return { liga: 'Liga Española', premier: 'Premier League', otras: 'Otras Ligas', seleccion: 'Selección Nacional' }[cat] || cat;
}

/* RENDERIZAR PRODUCTOS */
function renderProducts(lista) {
  const grid  = document.getElementById('productsGrid');
  const empty = document.getElementById('productsEmpty');
  if (lista.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  grid.innerHTML = lista.map((p, i) => {
    const enCarrito = cart.some(item => item.product.id === p.id);
    return `
      <div class="product-card${enCarrito ? ' in-cart' : ''}" style="animation-delay:${i * 0.06}s">
        <div class="product-card__img">
          <img class="product-card__img-photo" src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'">
        </div>
        <div class="product-card__info">
          <div class="product-card__league">${categoryLabel(p.category)}</div>
          <div class="product-card__name">${p.name}</div>
          <div class="product-card__footer">
            <div class="product-card__price">€${p.price}</div>
            <button class="add-to-cart${enCarrito ? ' added' : ''}" onclick="addToCart(${p.id})" aria-label="Añadir al carrito">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${enCarrito
                  ? '<polyline points="20 6 9 17 4 12"/>'
                  : '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'}
              </svg>
            </button>
          </div>
        </div>
      </div>`;
  }).join('');
}

/* RENDERIZAR MÁS VENDIDAS  */
function renderMasVendidas() {
  document.getElementById('masVendidasGrid').innerHTML = products
    .filter(p => p.featured)
    .slice(0, 4)
    .map(p => `
      <div class="mv-card" onclick="addToCart(${p.id})" role="button" tabindex="0" title="Añadir al carrito">
        <div class="mv-card__img">
          <img class="mv-card__photo" src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'">
        </div>
        <div class="mv-card__info">
          <div class="mv-card__name">${p.name}</div>
        </div>
      </div>`)
    .join('');
}
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
}

/*  INICIALIZACIÓN  */
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  renderProducts(getFilteredSortedProducts());
  renderMasVendidas();
  updateCart();
});