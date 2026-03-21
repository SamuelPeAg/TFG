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
        { class: 'fa-fire', label: 'Hot' },
        { class: 'fa-coins', label: 'Céntimos' }
    ];

    // Open Modal
    if (openPosBtn) {
        openPosBtn.addEventListener('click', () => {
            posModal.style.display = 'flex';
            renderMenuItems();
            
            if (typeof jQuery !== 'undefined' && $.fn.select2) {
                $('#pos-cliente-id').select2({
                    dropdownParent: $('#pos-modal'),
                    width: '100%',
                    placeholder: 'Seleccionar cliente...'
                });
                $('#pos-entrenador-id').select2({
                    dropdownParent: $('#pos-modal'),
                    width: '100%',
                    placeholder: 'Seleccionar entrenador...'
                });
                $('#pos-centro').select2({
                    dropdownParent: $('#pos-modal'),
                    width: '100%'
                });
            }
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
            ${type.is_abono ? `<span style="position:absolute; top:4px; left:4px; font-size:10px; background:#10b981; color:white; padding:2px 6px; border-radius:10px;">Saldo</span>` : ''}
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
                <div class="swal-gym-container" style="text-align:left; font-size:13px; padding: 0 5px;">
                    <label style="display:block; margin-bottom:8px; color:#64748b; font-weight:600;">Icono:</label>
                    <div id="icon-selector" style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin-bottom:20px;">${iconsHtml}</div>
                    
                    <label style="display:block; margin-bottom:5px; color:#64748b; font-weight:600;">Nombre:</label>
                    <input id="swal-name" class="swal2-input gym-input" value="${type.name || ''}" style="width:100%; margin: 0 0 15px 0;">
                    
                    <label style="display:block; margin-bottom:5px; color:#64748b; font-weight:600;">Descripción breve:</label>
                    <input id="swal-desc" class="swal2-input gym-input" value="${type.description || ''}" placeholder="Ej: Pago Individual" style="width:100%; margin: 0 0 15px 0;">

                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-top:5px;">
                        <div>
                            <label style="display:block; margin-bottom:5px; color:#64748b; font-weight:600;">Precio Base (€):</label>
                            <input id="swal-price" type="number" step="0.01" class="swal2-input gym-input" value="${type.defaultPrice || ''}" style="width:100%; margin:0;">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:5px; color:#64748b; font-weight:600;">Descuento %:</label>
                            <input id="swal-discount" type="number" class="swal2-input gym-input" placeholder="0" style="width:100%; margin:0;">
                        </div>
                    </div>

                    <div style="margin-top:15px; padding:10px; border-radius:8px; background:#f0fdf4; border:1px solid #10b981; display:flex; align-items:center; gap:10px;">
                        <input type="checkbox" id="swal-is-abono" ${type.is_abono ? 'checked' : ''} style="width:18px; height:18px; accent-color:#10b981;">
                        <div>
                            <span style="font-weight:bold; color:#065f46;">Es una Recarga de Saldo</span><br>
                            <span style="font-size:10px; color:#047857;">En lugar de cobrar, añade este dinero al saldo a favor del cliente.</span>
                        </div>
                    </div>
                </div>
            `,
            didOpen: () => {
                const radios = document.querySelectorAll('#icon-selector label');
                radios.forEach(l => {
                    l.onclick = function() {
                        radios.forEach(r => r.style.borderColor = '#e2e8f0');
                        radios.forEach(r => r.style.backgroundColor = 'transparent');
                        this.style.borderColor = '#10b981';
                        this.style.backgroundColor = '#f0fdf4';
                        this.querySelector('input').checked = true;
                    }
                });
            },
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            confirmButtonColor: '#10b981',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const name = document.getElementById('swal-name').value;
                const priceValue = document.getElementById('swal-price').value;
                const discountValue = document.getElementById('swal-discount').value || 0;
                const price = parseFloat(priceValue);
                const discount = parseFloat(discountValue);
                const icon = document.querySelector('input[name="swal-icon"]:checked')?.value || 'fa-tag';
                const desc = document.getElementById('swal-desc').value;
                const isAbono = document.getElementById('swal-is-abono').checked;

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
                    icon: icon,
                    is_abono: isAbono
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
        if (type.is_abono) {
            const entregadoInput = document.getElementById('pos-importe-entregado');
            if (entregadoInput) {
                const totalPagar = cart.reduce((sum, item) => sum + item.price, 0);
                let current = parseFloat(entregadoInput.value);
                if (isNaN(current)) {
                    current = 0;
                }
                entregadoInput.value = (current + type.defaultPrice).toFixed(2);
                updateTotal();
            }
            return; // No lo añadimos al carrito como clase
        }

        const item = {
            id: Date.now(),
            tipo: type.id,
            name: type.name,
            price: type.defaultPrice,
            is_abono: type.is_abono || false
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
        const totalPagar = cart.reduce((sum, item) => sum + item.price, 0); // Coste de clases en carrito
        const totalClasesCost = totalPagar; // Ya no hay abonos en el carrito, todo es clase.

        cartTotalValue.innerText = totalPagar.toFixed(2) + ' €';
        
        const entregadoInput = document.getElementById('pos-importe-entregado');
        const cambioContainer = document.getElementById('pos-cambio-container');
        const cambioValue = document.getElementById('pos-cambio-value');
        
        if (entregadoInput && cambioContainer && cambioValue) {
            let entregado = totalPagar; // Por defecto entrega el total a pagar
            if (entregadoInput.value !== '') {
                entregado = parseFloat(entregadoInput.value);
            }
            
            if (!isNaN(entregado)) {
                // El saldo que gana/pierde el cliente es lo que entrega MENOS lo que cuestan las clases
                const diferencia = entregado - totalClasesCost;
                cambioValue.innerText = diferencia > 0 ? '+' + diferencia.toFixed(2) + ' €' : diferencia.toFixed(2) + ' €';
                if (diferencia < 0) {
                    cambioValue.style.color = '#ef4444'; // red (debe dinero)
                } else if (diferencia > 0) {
                    cambioValue.style.color = '#10b981'; // green (a favor)
                } else {
                    cambioValue.style.color = '#64748b'; // neutral
                }
                cambioContainer.style.display = 'block';
            } else {
                cambioContainer.style.display = 'none';
            }
        }
    }

    const entregadoInput = document.getElementById('pos-importe-entregado');
    if (entregadoInput) {
        entregadoInput.addEventListener('input', updateTotal);
    }

    // Quick Money Buttons
    document.querySelectorAll('.quick-money-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const val = parseFloat(this.getAttribute('data-val'));
            if (!entregadoInput) return;
            
            if (val === 0) {
                entregadoInput.value = '0.00';
            } else {
                let current = parseFloat(entregadoInput.value) || 0;
                let newVal = current + val;
                if (newVal < 0) newVal = 0;
                entregadoInput.value = newVal.toFixed(2);
            }
            updateTotal();
        });
    });

    if (btnCheckout) {
        btnCheckout.addEventListener('click', async () => {
            // Usamos jQuery val() para evitar problemas con Select2, con fallback a document...
            const clienteId = typeof jQuery !== 'undefined' ? $('#pos-cliente-id').val() : document.getElementById('pos-cliente-id').value;
            const entrenadorId = typeof jQuery !== 'undefined' ? $('#pos-entrenador-id').val() : document.getElementById('pos-entrenador-id').value;
            const centro = typeof jQuery !== 'undefined' ? $('#pos-centro').val() : document.getElementById('pos-centro').value;
            
            if (!clienteId || !entrenadorId || !centro) { alert('Por favor selecciona cliente, entrenador y centro.'); return; }
            const totalPagar = cart.reduce((sum, item) => sum + item.price, 0);
            const entregadoInput = document.getElementById('pos-importe-entregado');
            let importeEntregado = totalPagar; // Si no pone nada, asume que paga lo que dice la cuenta
            if (entregadoInput && entregadoInput.value !== '') {
                importeEntregado = parseFloat(entregadoInput.value);
            }

            if (cart.length === 0 && (isNaN(importeEntregado) || importeEntregado <= 0)) {
                alert('Añade al menos una clase o indica un importe entregado válido.');
                return;
            }

            btnCheckout.disabled = true;
            btnCheckout.innerText = 'Procesando...';
            try {
                // Usamos una ruta relativa al origen para evitar problemas con subcarpetas en XAMPP
                const currentPath = window.location.pathname.replace(/\/$/, '');
                const targetUrl = currentPath.includes('facturas') ? currentPath + '/tickar' : '/facturas/tickar';

                const response = await fetch(targetUrl, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Accept': 'application/json', 
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content') 
                    },
                    body: JSON.stringify({ 
                        cliente_id: clienteId, 
                        entrenador_id: entrenadorId, 
                        centro: centro, 
                        importe_entregado: importeEntregado,
                        items: cart.map(i => ({ tipo: i.name, precio: i.price, is_abono: i.is_abono })) 
                    })
                });
                
                let data;
                const responseClone1 = response.clone();
                const responseClone2 = response.clone();
                try {
                    data = await responseClone1.json();
                } catch (e) {
                    const text = await responseClone2.text();
                    data = { message: 'El servidor no devolvió JSON válido', error_tecnico: text };
                }
                
                if (response.ok && data.success) {
                    posModal.style.display = 'none';
                    const successModal = document.getElementById('success-modal');
                    if (successModal) successModal.style.display = 'flex';
                    const successClose = document.getElementById('success-close-btn');
                    if (successClose) { successClose.onclick = () => { location.reload(); }; }
                } else {
                    let errStr = data.message || 'Error Desconocido';
                    
                    if (data.errors) {
                        errStr += '\n\nDetalles:\n' + Object.values(data.errors).map(e => (Array.isArray(e) ? e.join(', ') : e)).join('\n');
                    }
                    
                    if (response.status === 419) {
                        errStr = 'Error 419: La sesión ha expirado por inactividad. Refresca la página (F5).';
                    }

                    if (data.error_tecnico) {
                        // Limpiar tags HTML para que sea legible en el alert
                        const cleanTech = data.error_tecnico.replace(/<[^>]*>?/gm, ' ').substring(0, 300);
                        errStr += '\n\nError Técnico (Breve):\n' + cleanTech + '...';
                    }

                    alert('Error del Servidor (' + response.status + '):\n\n' + errStr);
                }
            } catch (error) { 
                console.error('Error Crítico:', error); 
                alert('Fallo Crítico:\n' + error.message); 
            } finally { 
                btnCheckout.disabled = false; 
                btnCheckout.innerText = 'Cobrar Cuenta'; 
            }
        });
    }
});
