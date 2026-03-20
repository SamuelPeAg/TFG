document.addEventListener('DOMContentLoaded', function() {
    const posModal = document.getElementById('pos-modal');
    const openPosBtn = document.getElementById('open-pos-btn');
    const closePosBtn = document.getElementById('pos-close-btn');
    const posItemsGrid = document.getElementById('pos-items-grid');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartTotalValue = document.getElementById('cart-total-value');
    const btnCheckout = document.getElementById('btn-checkout');

    let cart = [];
    let isEditMode = false;

    const defaultSessionTypes = [
        { id: 'ep', name: 'EP', icon: 'fa-user', defaultPrice: 35, description: 'Individual' },
        { id: 'duo', name: 'Duo', icon: 'fa-users', defaultPrice: 20, description: '2 Personas' },
        { id: 'trio', name: 'Trio', icon: 'fa-people-group', defaultPrice: 15, description: '3 Personas' },
        { id: 'grupos', name: 'Grupos', icon: 'fa-layer-group', defaultPrice: 10, description: 'Clase Grupal' }
    ];

    const iconOptions = [
        { class: 'fa-user', label: 'Individual' },
        { class: 'fa-users', label: 'Duo' },
        { class: 'fa-people-group', label: 'Trio' },
        { class: 'fa-layer-group', label: 'Grupo' },
        { class: 'fa-star', label: 'Especial' },
        { class: 'fa-tag', label: 'Oferta' },
        { class: 'fa-bolt', label: 'Express' },
        { class: 'fa-fire', label: 'Hot' }
    ];

    // Open Modal
    if (openPosBtn) {
        openPosBtn.addEventListener('click', () => {
            posModal.style.display = 'flex';
            renderMenuItems();
        });
    }

    // Close Modal
    if (closePosBtn) {
        closePosBtn.addEventListener('click', () => {
            posModal.style.display = 'none';
        });
    }

    // Render Menu Items
    function renderMenuItems() {
        if (!posItemsGrid) return;
        posItemsGrid.innerHTML = '';
        
        const menuHeader = document.querySelector('.pos-category-title');
        if (menuHeader && !document.getElementById('toggle-edit-mode')) {
            menuHeader.style.display = 'flex';
            menuHeader.style.justifyContent = 'space-between';
            menuHeader.style.alignItems = 'center';
            menuHeader.innerHTML = `
                <span>Seleccionar Sesión</span>
                <button id="toggle-edit-mode" class="pos-btn-icon ${isEditMode ? 'active' : ''}" title="Modo Edición">
                    <i class="fa-solid ${isEditMode ? 'fa-check' : 'fa-pencil'}"></i>
                </button>
            `;
            document.getElementById('toggle-edit-mode').onclick = () => {
                isEditMode = !isEditMode;
                renderMenuItems();
            };
        }

        const items = getMergedSessionTypes();

        items.forEach(type => {
            const btn = createItemBtn(type);
            posItemsGrid.appendChild(btn);
        });

        if (isEditMode) {
            const addBtn = document.createElement('div');
            addBtn.className = 'pos-item-btn add-custom-btn wiggling';
            addBtn.style.border = '2px dashed #cbd5e1';
            addBtn.style.background = '#f8fafc';
            addBtn.style.color = '#94a3b8';
            addBtn.innerHTML = `
                <i class="fa-solid fa-plus-circle"></i>
                <span class="pos-item-name" style="font-size:10px;">Añadir Botón</span>
            `;
            addBtn.onclick = showAddCustomDialog;
            posItemsGrid.appendChild(addBtn);
        }
    }

    function getMergedSessionTypes() {
        let base = JSON.parse(JSON.stringify(defaultSessionTypes));
        
        const hidden = JSON.parse(localStorage.getItem('factomove_pos_hidden_defaults') || '[]');
        base = base.filter(b => !hidden.includes(b.id));

        const overrides = JSON.parse(localStorage.getItem('factomove_pos_overrides') || '{}');
        base = base.map(b => {
            if (overrides[b.id]) {
                return { ...b, ...overrides[b.id] };
            }
            return b;
        });

        const customs = JSON.parse(localStorage.getItem('factomove_pos_custom_items') || '[]');
        return [...base, ...customs];
    }

    function createItemBtn(type) {
        const btn = document.createElement('div');
        btn.className = 'pos-item-btn';
        if (isEditMode) btn.classList.add('wiggling');
        
        btn.innerHTML = `
            <i class="fa-solid ${type.icon || 'fa-tag'}"></i>
            <span class="pos-item-name">${type.name}</span>
            ${type.description ? `<span style="font-size:10px; color:#64748b; margin-top:-4px;">${type.description}</span>` : ''}
            <span class="pos-item-price">${type.defaultPrice}€</span>
            ${isEditMode ? `
                <div class="pos-item-edit-overlay">
                    <i class="fa-solid fa-gear"></i>
                </div>
                <i class="fa-solid fa-circle-xmark remove-custom" onclick="event.stopPropagation(); removeItem('${type.id}')"></i>
            ` : ''}
        `;
        
        btn.onclick = () => {
            if (isEditMode) {
                showEditDialog(type);
            } else {
                addToCart(type);
            }
        };
        return btn;
    }

    async function showEditDialog(type, isNew = false) {
        const iconsHtml = iconOptions.map(icon => `
            <label style="cursor:pointer; padding:5px; border-radius:5px; border:1px solid #e2e8f0; display:flex; flex-direction:column; align-items:center; gap:5px; width:60px; ${type.icon === icon.class ? 'border-color:#10b981;' : ''}">
                <input type="radio" name="swal-icon" value="${icon.class}" ${type.icon === icon.class ? 'checked' : ''} style="display:none;">
                <i class="fa-solid ${icon.class}" style="font-size:18px;"></i>
                <span style="font-size:9px;">${icon.label}</span>
            </label>
        `).join('');

        const { value: formValues } = await Swal.fire({
            title: isNew ? 'Nuevo Botón' : 'Configurar Botón',
            html: `
                <div style="text-align:left; font-size:13px; margin-bottom:15px;">
                    <label style="display:block; margin-bottom:5px; color:#64748b;">Icono:</label>
                    <div id="icon-selector" style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center;">${iconsHtml}</div>
                    
                    <label style="display:block; margin:15px 0 5px; color:#64748b;">Nombre:</label>
                    <input id="swal-name" class="swal2-input" value="${type.name || ''}" style="margin-top:0;">
                    
                    <label style="display:block; margin:15px 0 5px; color:#64748b;">Descripción breve:</label>
                    <input id="swal-desc" class="swal2-input" value="${type.description || ''}" style="margin-top:0;">

                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-top:15px;">
                        <div>
                            <label style="display:block; margin-bottom:5px; color:#64748b;">Precio Base (€):</label>
                            <input id="swal-price" type="number" step="0.01" class="swal2-input" value="${type.defaultPrice || ''}" style="margin-top:0; width:100%;">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:5px; color:#64748b;">Descuento %:</label>
                            <input id="swal-discount" type="number" class="swal2-input" placeholder="0" style="margin-top:0; width:100%;">
                        </div>
                    </div>
                </div>
            `,
            didOpen: () => {
                const radios = document.querySelectorAll('#icon-selector label');
                radios.forEach(l => {
                    l.onclick = function() {
                        radios.forEach(r => r.style.borderColor = '#e2e8f0');
                        this.style.borderColor = '#10b981';
                        this.querySelector('input').checked = true;
                    }
                });
            },
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            confirmButtonColor: '#10b981',
            preConfirm: () => {
                const name = document.getElementById('swal-name').value;
                const priceValue = document.getElementById('swal-price').value;
                const discountValue = document.getElementById('swal-discount').value || 0;
                const price = parseFloat(priceValue);
                const discount = parseFloat(discountValue);
                const icon = document.querySelector('input[name="swal-icon"]:checked')?.value || 'fa-tag';
                const desc = document.getElementById('swal-desc').value;

                if (!name || isNaN(price)) {
                    Swal.showValidationMessage('Nombre y precio base son obligatorios');
                    return false;
                }

                let finalPrice = price;
                if (discount > 0) finalPrice = price * (1 - (discount / 100));

                return {
                    id: type.id || ('custom_' + Date.now()),
                    name: name,
                    description: desc,
                    defaultPrice: parseFloat(finalPrice.toFixed(2)),
                    icon: icon
                }
            }
        });

        if (formValues) {
            if (formValues.id.startsWith('custom_')) {
                const customs = JSON.parse(localStorage.getItem('factomove_pos_custom_items') || '[]');
                if (isNew) {
                    customs.push(formValues);
                } else {
                    const idx = customs.findIndex(c => c.id === type.id);
                    if (idx > -1) customs[idx] = formValues;
                }
                localStorage.setItem('factomove_pos_custom_items', JSON.stringify(customs));
            } else {
                const overrides = JSON.parse(localStorage.getItem('factomove_pos_overrides') || '{}');
                overrides[type.id] = formValues;
                localStorage.setItem('factomove_pos_overrides', JSON.stringify(overrides));
            }
            renderMenuItems();
        }
    }

    async function showAddCustomDialog() {
        showEditDialog({ id: 'custom_' + Date.now(), icon: 'fa-star' }, true);
    }

    window.removeItem = function(id) {
        if (!id.startsWith('custom_')) {
            const hidden = JSON.parse(localStorage.getItem('factomove_pos_hidden_defaults') || '[]');
            if (!hidden.includes(id)) hidden.push(id);
            localStorage.setItem('factomove_pos_hidden_defaults', JSON.stringify(hidden));
        } else {
            let customs = JSON.parse(localStorage.getItem('factomove_pos_custom_items') || '[]');
            customs = customs.filter(item => item.id !== id);
            localStorage.setItem('factomove_pos_custom_items', JSON.stringify(customs));
        }
        renderMenuItems();
    };

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
        if (!cartItemsList) return;
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
        if (!cartTotalValue) return;
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        cartTotalValue.innerText = total.toFixed(2) + ' €';
    }

    if (btnCheckout) {
        btnCheckout.addEventListener('click', async () => {
            if (cart.length === 0) { alert('Añade al menos una clase.'); return; }
            const clienteId = document.getElementById('pos-cliente-id').value;
            const entrenadorId = document.getElementById('pos-entrenador-id').value;
            const centro = document.getElementById('pos-centro').value;
            if (!clienteId || !entrenadorId || !centro) { alert('Por favor selecciona cliente, entrenador y centro.'); return; }
            btnCheckout.disabled = true;
            btnCheckout.innerText = 'Procesando...';
            try {
                const response = await fetch('/facturas/tickar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content') },
                    body: JSON.stringify({ cliente_id: clienteId, entrenador_id: entrenadorId, centro: centro, items: cart.map(i => ({ tipo: i.name, precio: i.price })) })
                });
                const data = await response.json();
                if (data.success) {
                    posModal.style.display = 'none';
                    const successModal = document.getElementById('success-modal');
                    if (successModal) successModal.style.display = 'flex';
                    const successClose = document.getElementById('success-close-btn');
                    if (successClose) { successClose.onclick = () => { location.reload(); }; }
                } else { alert('Error: ' + data.message); }
            } catch (error) { console.error('Error:', error); alert('Hubo un error al procesar la cuenta.'); } finally { btnCheckout.disabled = false; btnCheckout.innerText = 'Cobrar Cuenta'; }
        });
    }
});
