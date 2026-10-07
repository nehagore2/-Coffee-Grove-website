
const cartKey = "coffeeGroveFinalCart";
let cart = JSON.parse(localStorage.getItem(cartKey) || "[]");

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

function saveCart() {
    localStorage.setItem(cartKey, JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.qty, 0);
    $$('[data-cart-count]').forEach((element) => {
        element.textContent = count;
    });
}

function showToast(message) {
    const toast = $('[data-toast]');

    if (!toast) {
        return;
    }

    toast.textContent = message;
    toast.classList.add('show');

    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
        toast.classList.remove('show');
    }, 2200);
}

function openCart() {
    $('[data-cart-drawer]')?.classList.add('open');
    $('.cart-overlay')?.classList.add('open');
    document.body.classList.add('cart-open');
}

function closeCart() {
    $('[data-cart-drawer]')?.classList.remove('open');
    $('.cart-overlay')?.classList.remove('open');
    document.body.classList.remove('cart-open');
}

function openMenu() {
    $('[data-mobile-menu]')?.classList.add('open');
    document.body.classList.add('menu-open');
}

function closeMenu() {
    $('[data-mobile-menu]')?.classList.remove('open');
    document.body.classList.remove('menu-open');
}

function addToCart(button) {
    const product = {
        id: button.dataset.id,
        name: button.dataset.name,
        price: Number(button.dataset.price),
        image: button.dataset.image,
        qty: 1
    };

    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push(product);
    }

    saveCart();
    openCart();
    showToast(`${product.name} added to your basket.`);
}

function changeQuantity(id, change) {
    const item = cart.find((product) => product.id === id);

    if (!item) {
        return;
    }

    item.qty += change;

    if (item.qty <= 0) {
        cart = cart.filter((product) => product.id !== id);
    }

    saveCart();
}

function removeFromCart(id) {
    cart = cart.filter((item) => item.id !== id);
    saveCart();
}

function renderCart() {
    const container = $('[data-cart-items]');
    const totalElement = $('[data-cart-total]');

    if (!container || !totalElement) {
        return;
    }

    if (!cart.length) {
        container.innerHTML = '<p class="empty-cart">Your basket is waiting for something freshly roasted.</p>';
        totalElement.textContent = '₹0';
        return;
    }

    container.innerHTML = cart.map((item) => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div>
                <h4>${item.name}</h4>
                <p>₹${item.price.toLocaleString('en-IN')}</p>
                <div class="qty-controls">
                    <button type="button" data-minus="${item.id}">−</button>
                    <span>${item.qty}</span>
                    <button type="button" data-plus="${item.id}">+</button>
                </div>
            </div>
            <button type="button" data-remove="${item.id}">Remove</button>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    totalElement.textContent = `₹${total.toLocaleString('en-IN')}`;
}

function initReveal() {
    const elements = $$('.reveal');

    if (!('IntersectionObserver' in window)) {
        elements.forEach((element) => element.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add('visible');
            currentObserver.unobserve(entry.target);
        });
    }, { threshold: 0.12 });

    elements.forEach((element) => observer.observe(element));
}

function initFilters() {
    const filters = $$('.filter');
    const cards = $$('.shop-grid .product-card');

    filters.forEach((filter) => {
        filter.addEventListener('click', () => {
            filters.forEach((button) => button.classList.remove('active'));
            filter.classList.add('active');

            const value = filter.dataset.filter;

            cards.forEach((card) => {
                const show = value === 'all' || card.dataset.category === value;
                card.classList.toggle('is-hidden', !show);
            });
        });
    });
}

function initGallery() {
    const lightbox = $('[data-lightbox]');
    const lightboxImage = $('[data-lightbox-image]');

    if (!lightbox || !lightboxImage) {
        return;
    }

    $$('.gallery-item img').forEach((image) => {
        image.addEventListener('click', () => {
            lightboxImage.src = image.src;
            lightboxImage.alt = image.alt;
            lightbox.classList.add('open');
        });
    });

    const close = () => lightbox.classList.remove('open');

    $('[data-lightbox-close]')?.addEventListener('click', close);
    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) {
            close();
        }
    });
}

function initContactForm() {
    const form = $('#contactForm');
    const message = $('#formMessage');

    if (!form || !message) {
        return;
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = $('#name')?.value.trim();

        if (!name) {
            message.textContent = 'Please enter your name.';
            return;
        }

        message.textContent = `Thank you, ${name}. Your enquiry is ready to send.`;
        form.reset();
        showToast('Enquiry form submitted successfully.');
    });
}

function initSpecialities() {
    $$('[data-speciality]').forEach((button) => {
        button.addEventListener('click', () => {
            showToast(`${button.dataset.speciality} selected.`);
        });
    });
}

function initHeader() {
    const header = $('#siteHeader');

    if (!header) {
        return;
    }

    const update = () => {
        header.classList.toggle('scrolled', window.scrollY > 60);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderCart();
    initReveal();
    initFilters();
    initGallery();
    initContactForm();
    initSpecialities();
    initHeader();

    $$('[data-cart-open]').forEach((button) => {
        button.addEventListener('click', openCart);
    });

    $$('[data-cart-close]').forEach((button) => {
        button.addEventListener('click', closeCart);
    });

    $$('[data-menu-open]').forEach((button) => {
        button.addEventListener('click', openMenu);
    });

    $$('[data-menu-close]').forEach((button) => {
        button.addEventListener('click', closeMenu);
    });

    $$('[data-mobile-menu] a').forEach((link) => {
        link.addEventListener('click', closeMenu);
    });

    $$('.add-cart').forEach((button) => {
        button.addEventListener('click', () => addToCart(button));
    });

    document.addEventListener('click', (event) => {
        const plus = event.target.closest('[data-plus]');
        const minus = event.target.closest('[data-minus]');
        const remove = event.target.closest('[data-remove]');

        if (plus) {
            changeQuantity(plus.dataset.plus, 1);
        }

        if (minus) {
            changeQuantity(minus.dataset.minus, -1);
        }

        if (remove) {
            removeFromCart(remove.dataset.remove);
        }
    });

    $$('.year').forEach((element) => {
        element.textContent = new Date().getFullYear();
    });
});
