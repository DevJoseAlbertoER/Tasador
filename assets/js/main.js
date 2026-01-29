/**
* Template Name: Tasador Custom
* Author: Biteo
*/

(function () {
    "use strict";

    /**
     * Helper functions
     */
    const select = (el, all = false) => {
        el = el.trim()
        if (all) {
            return [...document.querySelectorAll(el)]
        } else {
            return document.querySelector(el)
        }
    }

    const on = (type, el, listener, all = false) => {
        let selectEl = select(el, all)
        if (selectEl) {
            if (all) {
                selectEl.forEach(e => e.addEventListener(type, listener))
            } else {
                selectEl.addEventListener(type, listener)
            }
        }
    }

    /**
     * Mobile nav toggle
     */
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navbar = document.querySelector('#navbar');

    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', function (e) {
            navbar.classList.toggle('navbar-mobile');
            this.classList.toggle('bi-list');
            this.classList.toggle('bi-x');
        });
    }

    /**
     * Mobile nav link click logic
     */
    document.querySelectorAll('.navbar .nav-link').forEach(link => {
        link.addEventListener('click', function () {
            if (navbar.classList.contains('navbar-mobile')) {
                navbar.classList.remove('navbar-mobile');
                mobileNavToggle.classList.toggle('bi-list');
                mobileNavToggle.classList.toggle('bi-x');
            }
            document.querySelectorAll('.navbar .nav-link').forEach(el => el.classList.remove('active'));
            this.classList.add('active');
        });
    });

    /**
     * Menu isotope and filter
     */
    document.querySelectorAll('#menu-flters li').forEach(filterBtn => {
        filterBtn.addEventListener('click', function () {
            let filter = this.getAttribute('data-filter');
            document.querySelectorAll('#menu-flters li').forEach(el => el.classList.remove('filter-active'));
            this.classList.add('filter-active');

            document.querySelectorAll('.menu-item').forEach(item => {
                if (filter === '*' || item.classList.contains(filter.replace('.', ''))) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    /**
     * WhatsApp Shopping Cart Logic
     */
    let cart = JSON.parse(localStorage.getItem('tasador_cart')) || [];
    let currentProduct = null;

    const saveCart = () => {
        localStorage.setItem('tasador_cart', JSON.stringify(cart));
        updateCartUI();
    };

    const updateCartUI = () => {
        const cartCount = document.getElementById('cart-count');
        const cartItemsList = document.getElementById('cart-items-list');
        const cartTotalPrice = document.getElementById('cart-total-price');

        if (!cartCount || !cartItemsList || !cartTotalPrice) return;

        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p style="text-align: center; color: #888; padding: 20px;">Tu carrito está vacío</p>';
            cartTotalPrice.textContent = '$0.00';
            return;
        }

        let total = 0;
        cartItemsList.innerHTML = '';
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity * item.weight;
            total += itemTotal;

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item-row';
            itemEl.innerHTML = `
                <div class="cart-item-details">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-meta">${item.weight === 1 ? '1' : '1/2'} Kg · $${item.price}/kg</span>
                    ${item.isVariable ? '<small style="color: #ec4109; display: block; font-size: 10px;">*PESO VARIABLE</small>' : ''}
                </div>
                <div class="cart-item-actions" style="display: flex; align-items: center; gap: 15px;">
                    <div class="qty-control">
                        <button onclick="updateQty(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQty(${index}, 1)">+</button>
                    </div>
                </div>
            `;
            cartItemsList.appendChild(itemEl);
        });

        cartTotalPrice.textContent = `$${total.toFixed(2)}`;
    };

    window.updateQty = (index, change) => {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        saveCart();
    };

    /**
     * Selection Modal Logic
     */
    const selectionModal = document.getElementById('selection-modal');
    const optionsGrid = document.getElementById('modal-options-grid');
    const modalProdName = document.getElementById('modal-product-name');
    const modalProdPrice = document.getElementById('modal-product-price');

    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.select-product-btn');
        if (btn) {
            const card = btn.closest('.card-item');
            const name = card.getAttribute('data-name');
            const price = parseInt(card.getAttribute('data-price'));
            const optionsString = card.getAttribute('data-options');
            const options = optionsString ? optionsString.split(',') : [];

            currentProduct = { name, price };
            modalProdName.textContent = name;
            modalProdPrice.textContent = `$${price} / kg`;

            optionsGrid.innerHTML = '';
            options.forEach(opt => {
                const optEl = document.createElement('div');
                optEl.className = 'selection-option-card';

                let weight = 1;
                let title = "1 Kg";
                let finalPrice = price;
                let isVariable = false;

                if (opt === '0.5') {
                    weight = 0.5;
                    title = "1/2 Kg";
                    finalPrice = price / 2;
                } else if (opt === 'var') {
                    title = "Pieza Completa";
                    finalPrice = price;
                    isVariable = true;
                }

                optEl.innerHTML = `
                    <div class="option-icon"><i class="bi bi-box-seam"></i></div>
                    <div class="option-info">
                        <h4>${title}</h4>
                        <p>${isVariable ? 'Aprox. 1 Kg' : 'Peso exacto'}</p>
                    </div>
                    <div class="option-price">$${isVariable ? price + '/kg' : finalPrice.toFixed(0)}</div>
                `;

                optEl.onclick = () => addToCart(weight, isVariable);
                optionsGrid.appendChild(optEl);
            });

            selectionModal.classList.add('active');
        }
    });

    const addToCart = (weight, isVariable) => {
        const existingItem = cart.find(item => item.name === currentProduct.name && item.weight === weight);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name: currentProduct.name, price: currentProduct.price, quantity: 1, weight, isVariable });
        }
        saveCart();
        selectionModal.classList.remove('active');
        document.getElementById('cart-modal').classList.add('active');
    };

    document.getElementById('close-selection')?.addEventListener('click', () => {
        selectionModal.classList.remove('active');
    });

    /**
     * Cart Modal Control
     */
    const cartModal = document.getElementById('cart-modal');
    document.getElementById('open-cart')?.addEventListener('click', () => {
        cartModal.classList.add('active');
    });

    document.getElementById('close-cart')?.addEventListener('click', () => {
        cartModal.classList.remove('active');
    });

    window.addEventListener('click', (e) => {
        if (e.target === selectionModal) selectionModal.classList.remove('active');
        if (e.target === cartModal) cartModal.classList.remove('active');
    });

    document.getElementById('send-whatsapp')?.addEventListener('click', () => {
        if (cart.length === 0) return alert('Tu carrito está vacío');

        let message = "🥩 *Nuevo Pedido de Market - T'AS-ADOR*\n\n";
        let total = 0;
        cart.forEach(item => {
            const subtotal = item.price * item.quantity * item.weight;
            total += subtotal;
            const weightText = item.weight === 1 ? "1 Kg" : "1/2 Kg";
            message += `• *${item.name}* (${weightText})\n  ${item.quantity} pza(s) ${item.isVariable ? '_(Peso Variable)_' : ''}\n  Subtotal: $${subtotal.toFixed(2)}\n\n`;
        });
        message += `*TOTAL ESTIMADO: $${total.toFixed(2)}*\n\n_Confirmar disponibilidad._`;
        window.open(`https://wa.me/527712064345?text=${encodeURIComponent(message)}`, '_blank');
    });

    updateCartUI();

    /**
     * Safari Detection & Fallback for GloriaFood
     * Detects Safari browser and replaces widget buttons with direct links
     * to avoid 3rd party cookie blocking issues.
     */
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari) {
        console.log("Safari detected - Switching to direct links for menu/reservations");

        // Wait a bit to ensure DOM is ready and before GloriaFood script takes over fully
        setTimeout(() => {
            const glfButtons = document.querySelectorAll('[data-glf-cuid]');
            const restaurantUid = "14ac628c-91fe-410d-8c72-286183b0006c"; // Your RUID
            const menuUrl = `https://www.foodbooking.com/ordering/restaurant/menu?restaurant_uid=${restaurantUid}`;
            const reservationUrl = `https://www.foodbooking.com/ordering/restaurant/menu?restaurant_uid=${restaurantUid}&glf_reservation=true`;

            glfButtons.forEach(btn => {
                // Determine if it's a reservation button or menu button
                const isReservation = btn.getAttribute('data-glf-reservation') === 'true' || btn.classList.contains('reservation');
                const targetUrl = isReservation ? reservationUrl : menuUrl;

                // Create a replacement <a> tag
                const link = document.createElement('a');
                link.className = btn.className; // Keep all styling classes
                link.href = targetUrl;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                link.innerHTML = btn.innerHTML; // Keep the icon and text

                // Remove data attributes to stop GloriaFood script from attaching (if it hasn't already)
                // Replacing the element completely is safer
                btn.parentNode.replaceChild(link, btn);
            });
        }, 100);
    }

})();