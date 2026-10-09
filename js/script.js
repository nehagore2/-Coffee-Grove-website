/* =========================================================
   THE COFFEE GROVE
   Navigation, scroll reveal and shopping bag interactions
   ========================================================= */

const menuToggle = document.querySelector(".menu-toggle");
const mainNavigation = document.querySelector(".main-nav");

if (menuToggle && mainNavigation) {
    menuToggle.addEventListener("click", function () {
        const isOpen = mainNavigation.classList.toggle("open");

        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation" : "Open navigation"
        );
    });

    mainNavigation.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            mainNavigation.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
        });
    });

    document.addEventListener("click", function (event) {
        const clickedInsideHeader = event.target.closest(".site-header");

        if (!clickedInsideHeader) {
            mainNavigation.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
        }
    });
}

/* Reveal page content as it enters the viewport. */

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
        function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.12
        }
    );

    revealElements.forEach(function (element) {
        revealObserver.observe(element);
    });
} else {
    revealElements.forEach(function (element) {
        element.classList.add("visible");
    });
}

/* Shopping bag state is stored in the browser. */

const CART_STORAGE_KEY = "coffeeGroveProfessionalCart";

const bagButton = document.querySelector(".bag-button");
const shoppingDrawer = document.querySelector(".shopping-drawer");
const bagOverlay = document.querySelector(".bag-overlay");
const drawerClose = document.querySelector(".drawer-close");
const drawerItems = document.querySelector(".drawer-items");
const toastMessage = document.querySelector(".toast-message");

let shoppingBag = [];

try {
    shoppingBag = JSON.parse(
        localStorage.getItem(CART_STORAGE_KEY) || "[]"
    );
} catch (error) {
    shoppingBag = [];
}

function saveShoppingBag() {
    try {
        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(shoppingBag)
        );
    } catch (error) {
        /* The bag still works for the current page if storage is blocked. */
    }

    renderShoppingBag();
}

function showToast(message) {
    if (!toastMessage) {
        return;
    }

    toastMessage.textContent = message;
    toastMessage.classList.add("show");

    window.clearTimeout(showToast.timeoutId);

    showToast.timeoutId = window.setTimeout(function () {
        toastMessage.classList.remove("show");
    }, 2400);
}

function openShoppingBag() {
    if (!shoppingDrawer || !bagOverlay) {
        return;
    }

    shoppingDrawer.classList.add("open");
    bagOverlay.classList.add("open");
    shoppingDrawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("drawer-open");

    if (drawerClose) {
        drawerClose.focus();
    }
}

function closeShoppingBag() {
    if (!shoppingDrawer || !bagOverlay) {
        return;
    }

    shoppingDrawer.classList.remove("open");
    bagOverlay.classList.remove("open");
    shoppingDrawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("drawer-open");
}

function renderShoppingBag() {
    if (!drawerItems) {
        return;
    }

    const itemCount = shoppingBag.reduce(function (total, item) {
        return total + item.quantity;
    }, 0);

    const subtotal = shoppingBag.reduce(function (total, item) {
        return total + item.price * item.quantity;
    }, 0);

    const bagCount = document.querySelector(".bag-count");
    const drawerCount = document.querySelector(".drawer-count");
    const subtotalValue = document.querySelector(".subtotal-value");

    if (bagCount) {
        bagCount.textContent = itemCount;
    }

    if (drawerCount) {
        drawerCount.textContent = itemCount;
    }

    if (subtotalValue) {
        subtotalValue.textContent = subtotal.toLocaleString("en-IN");
    }

    if (shoppingBag.length === 0) {
        drawerItems.innerHTML = `
            <p class="empty-bag">
                Your bag is waiting for something good.
            </p>
        `;

        return;
    }

    drawerItems.innerHTML = shoppingBag.map(function (item) {
        return `
            <article class="drawer-item">
                <img src="${item.image}" alt="${item.name}">
                <div>
                    <h3>${item.name}</h3>
                    <p>₹${item.price.toLocaleString("en-IN")}</p>
                    <div class="quantity-controls">
                        <button
                            type="button"
                            data-quantity-id="${item.id}"
                            data-quantity-change="-1"
                            aria-label="Decrease ${item.name} quantity"
                        >−</button>
                        <span>${item.quantity}</span>
                        <button
                            type="button"
                            data-quantity-id="${item.id}"
                            data-quantity-change="1"
                            aria-label="Increase ${item.name} quantity"
                        >+</button>
                    </div>
                </div>
                <button
                    class="remove-item"
                    type="button"
                    data-remove-id="${item.id}"
                >Remove</button>
            </article>
        `;
    }).join("");
}

function addToBag(button) {
    const productName = button.dataset.name;
    const productPrice = Number(button.dataset.price);
    const productImage = button.dataset.image;

    const productId = productName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");

    const existingProduct = shoppingBag.find(function (item) {
        return item.id === productId;
    });

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        shoppingBag.push({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1
        });
    }

    saveShoppingBag();
    openShoppingBag();
    showToast(productName + " added to your bag.");
}

document.querySelectorAll("[data-add-to-bag]").forEach(function (button) {
    button.addEventListener("click", function () {
        addToBag(button);
    });
});

if (bagButton) {
    bagButton.addEventListener("click", openShoppingBag);
}

if (drawerClose) {
    drawerClose.addEventListener("click", closeShoppingBag);
}

if (bagOverlay) {
    bagOverlay.addEventListener("click", closeShoppingBag);
}

if (drawerItems) {
    drawerItems.addEventListener("click", function (event) {
        const quantityButton = event.target.closest("[data-quantity-id]");
        const removeButton = event.target.closest("[data-remove-id]");

        if (quantityButton) {
            const productId = quantityButton.dataset.quantityId;
            const quantityChange = Number(
                quantityButton.dataset.quantityChange
            );

            const product = shoppingBag.find(function (item) {
                return item.id === productId;
            });

            if (product) {
                product.quantity += quantityChange;

                if (product.quantity <= 0) {
                    shoppingBag = shoppingBag.filter(function (item) {
                        return item.id !== productId;
                    });
                }

                saveShoppingBag();
            }
        }

        if (removeButton) {
            const productId = removeButton.dataset.removeId;

            shoppingBag = shoppingBag.filter(function (item) {
                return item.id !== productId;
            });

            saveShoppingBag();
        }
    });
}

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeShoppingBag();
    }
});

const checkoutButton = document.querySelector(".checkout-button");

if (checkoutButton) {
    checkoutButton.addEventListener("click", function () {
        if (shoppingBag.length === 0) {
            showToast("Your shopping bag is empty.");
            return;
        }

        showToast(
            "Demo checkout only. Connect a payment service to accept orders."
        );
    });
}

/* Smoothly return to the top of the current page. */

const backToTop = document.querySelector("[data-back-to-top]");

if (backToTop) {
    backToTop.addEventListener("click", function (event) {
        event.preventDefault();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

/* Initial render restores any bag items saved in localStorage. */

renderShoppingBag();
