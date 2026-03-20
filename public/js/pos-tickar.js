document.addEventListener('DOMContentLoaded', function() {
    const posModal = document.getElementById('pos-modal');
    const openPosBtn = document.getElementById('open-pos-btn');
    const closePosBtn = document.getElementById('pos-close-btn');
    const posItemsGrid = document.getElementById('pos-items-grid');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartTotalValue = document.getElementById('cart-total-value');
    const btnCheckout = document.getElementById('btn-checkout');

    let cart = [];

    const sessionTypes = [
        { id: 'ep', name: 'EP', icon: 'fa-user', defaultPrice: 35 },
        { id: 'duo', name: 'Duo', icon: 'fa-users', defaultPrice: 20 },
        { id: 'trio', name: 'Trio', icon: 'fa-people-group', defaultPrice: 15 },
        { id: 'grupos', name: 'Grupos', icon: 'fa-layer-group', defaultPrice: 10 }
    ];

    // Open Modal
    if (openPosBtn) {
        openPosBtn.addEventListener('click', () => {
            posModal.style.display = 'flex';
        });
    }

    // Close Modal
    if (closePosBtn) {
        closePosBtn.addEventListener('click', () => {
            posModal.style.display = 'none';
        });
    }

    // Render Menu Items
    if (posItemsGrid) {
        sessionTypes.forEach(type => {
            const btn = document.createElement('div');
            btn.className = 'pos-item-btn';
            btn.innerHTML = `
                <i class="fa-solid ${type.icon}"></i>
                <span class="pos-item-name">${type.name}</span>
                <span class="pos-item-price">${type.defaultPrice}€</span>
            `;
            btn.onclick = () => addToCart(type);
            posItemsGrid.appendChild(btn);
        });
    }

    function addToCart(type) {
        const item = {
            id: Date.now(),
            tipo: type.id,
            name: type.name,
            price: type.defaultPrice
        };
        cart.push(item);
        renderCart();
    }

    window.removeFromCart = function(id) {
        cart = cart.filter(item => item.id !== id);
        renderCart();
    };

    window.updateItemPrice = function(id, newPrice) {
        const item = cart.find(i => i.id === id);
        if (item) {
            item.price = parseFloat(newPrice) || 0;
            updateTotal();
        }
    };

    function renderCart() {
        cartItemsList.innerHTML = '';
        cart.forEach(item => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                </div>
                <div>
                    <input type="number" class="cart-item-price-edit" value="${item.price}" onchange="updateItemPrice(${item.id}, this.value)"> €
                    <i class="fa-solid fa-trash cart-item-remove" onclick="removeFromCart(${item.id})"></i>
                </div>
            `;
            cartItemsList.appendChild(div);
        });
        updateTotal();
    }

    function updateTotal() {
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        cartTotalValue.innerText = total.toFixed(2) + ' €';
    }

    // Submit
    if (btnCheckout) {
        btnCheckout.addEventListener('click', async () => {
            if (cart.length === 0) {
                alert('Añade al menos una clase.');
                return;
            }

            const clienteId = document.getElementById('pos-cliente-id').value;
            const entrenadorId = document.getElementById('pos-entrenador-id').value;
            const centro = document.getElementById('pos-centro').value;

            if (!clienteId || !entrenadorId || !centro) {
                alert('Por favor selecciona cliente, entrenador y centro.');
                return;
            }

            btnCheckout.disabled = true;
            btnCheckout.innerText = 'Procesando...';

            try {
                const response = await fetch('/facturas/tickar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    },
                    body: JSON.stringify({
                        cliente_id: clienteId,
                        entrenador_id: entrenadorId,
                        centro: centro,
                        items: cart.map(i => ({ tipo: i.name, precio: i.price }))
                    })
                });

                const data = await response.json();

                if (data.success) {
                    posModal.style.display = 'none';
                    const successModal = document.getElementById('success-modal');
                    successModal.style.display = 'flex';
                    
                    document.getElementById('success-close-btn').onclick = () => {
                        location.reload();
                    };
                } else {
                    alert('Error: ' + data.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Hubo un error al procesar la cuenta.');
            } finally {
                btnCheckout.disabled = false;
                btnCheckout.innerText = 'Cobrar Cuenta';
            }
        });
    }
});
