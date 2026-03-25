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
        { class: 'fa-user', label: '1 Persona' },
        { class: 'fa-user-friends', label: '2 Personas' },
        { class: 'fa-users', label: 'Grupo' },
        { class: 'fa-user-check', label: 'Validado' },
        { class: 'fa-id-card', label: 'Cliente' },
        { class: 'fa-star', label: 'Premium' },
        { class: 'fa-tag', label: 'Oferta' },
        { class: 'fa-dumbbell', label: 'Entrenamiento' },
        { class: 'fa-heartbeat', label: 'Salud' },
        { class: 'fa-coins', label: 'Descuento' }
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
                $('#pos-tipo-empresa').select2({
                    dropdownParent: $('#pos-modal'),
                    width: '100%'
                }).on('change', () => updateTotal());
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
                    <div id="icon-selector" style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin-bottom:10px;">${iconsHtml}</div>
                    
                    <div style="margin-bottom:20px;">
                        <label style="display:block; margin-bottom:5px; color:#64748b; font-weight:600;">O escribe una clase personalizada (ej: fa-heart):</label>
                        <div style="display:flex; gap:10px; align-items:center;">
                            <input id="swal-custom-icon" class="swal2-input gym-input" placeholder="fa-tag" value="${type.custom_icon || ''}" style="width:100%; margin:0;" onkeyup="document.getElementById('icon-preview').className = 'fas ' + this.value">
                            <div style="width:40px; height:40px; display:flex; align-items:center; justify-content:center; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; font-size:18px; color:#10b981;">
                                <i id="icon-preview" class="fas ${type.custom_icon || 'fa-tag'}"></i>
                            </div>
                        </div>
                    </div>

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
                </div>
            `,
            didOpen: () => {
                const radios = document.querySelectorAll('#icon-selector label');
                const customIconInput = document.getElementById('swal-custom-icon');

                radios.forEach(l => {
                    l.onclick = function() {
                        radios.forEach(r => r.style.borderColor = '#e2e8f0');
                        radios.forEach(r => r.style.backgroundColor = 'transparent');
                        this.style.borderColor = '#10b981';
                        this.style.backgroundColor = '#f0fdf4';
                        this.querySelector('input').checked = true;
                        // Clear custom icon input if a radio is selected
                        if (customIconInput) {
                            customIconInput.value = '';
                            document.getElementById('icon-preview').className = 'fas ' + this.querySelector('input').value;
                        }
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
                const customIcon = document.getElementById('swal-custom-icon').value;
                const selectedIcon = document.querySelector('input[name="swal-icon"]:checked')?.value || 'fa-tag';
                const icon = customIcon || selectedIcon;
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
                    icon: icon,
                    custom_icon: customIcon,
                    is_abono: false
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
            id: Date.now() + '_' + Math.floor(Math.random() * 1000),
            tipo: type.id,
            name: type.name,
            price: type.defaultPrice,
            basePrice: type.defaultPrice,
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
            const newP = parseFloat(newPrice) || 0;
            const itemType = item.tipo;
            
            // Actualizar todos los items del mismo tipo
            cart.forEach(i => {
                if (i.tipo === itemType) {
                    i.price = newP;
                }
            });
            renderCart();
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
                    <input type="number" class="cart-item-price-edit" value="${item.price}" onchange="updateItemPrice('${item.id}', this.value)"> €
                    <i class="fa-solid fa-trash cart-item-remove" onclick="removeFromCart('${item.id}')"></i>
                </div>
            `;
            cartItemsList.appendChild(div);
        });
        updateTotal();
    }

    function updateTotal() {
        if (!cartTotalValue) return;
        
        const rawTotal = cart.reduce((sum, item) => sum + item.price, 0);
        const tipoEmpresa = document.getElementById('pos-tipo-empresa').value;
        
        let subtotal = 0; // Base Imponible
        let iva = 0;
        let total = rawTotal; // Siempre el precio del botón

        if (tipoEmpresa === 'entrenamiento') {
            // El precio del botón ya incluye el 21% de IVA
            subtotal = total / 1.21;
            iva = total - subtotal;
        } else {
            // Salud (0% IVA), el total es el mismo pero todo es base (sin IVA)
            subtotal = total;
            iva = 0;
        }

        // Update UI
        const subtotalEl = document.getElementById('cart-subtotal-value');
        const ivaEl = document.getElementById('cart-iva-value');
        const ivaLabelEl = ivaEl ? ivaEl.parentElement.querySelector('span:first-child') : null;
        
        if (subtotalEl) subtotalEl.innerText = subtotal.toFixed(2) + ' €';
        if (ivaEl) ivaEl.innerText = iva.toFixed(2) + ' €';
        if (cartTotalValue) cartTotalValue.innerText = total.toFixed(2) + ' €';
        
        if (ivaLabelEl) {
            ivaLabelEl.innerText = tipoEmpresa === 'entrenamiento' ? 'IVA (21%):' : 'IVA (0%):';
        }

        // Importe entregado se iguala al total por defecto
        const entregadoInput = document.getElementById('pos-importe-entregado');
        if (entregadoInput) {
            entregadoInput.value = total.toFixed(2);
            const cambioContainer = document.getElementById('pos-cambio-container');
            if (cambioContainer && cambioContainer.style.display !== 'none') {
                updateCambio();
            }
        }
    }

    const entregadoInput = document.getElementById('pos-importe-entregado');
    if (entregadoInput) {
        entregadoInput.addEventListener('input', updateTotal);
    }

    // Quick Money Buttons (Now for Adjustments to all sessions)
    document.querySelectorAll('.quick-money-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const val = parseFloat(this.getAttribute('data-val'));
            
            if (val === 0) {
                // Reset all sessions to their base price and remove manual adjustments
                cart.forEach(item => {
                    if (item.basePrice !== undefined) {
                        item.price = item.basePrice;
                    }
                });
                cart = cart.filter(item => item.tipo !== 'ajuste_manual');
            } else {
                // Apply the value to ALL sessions in the cart
                cart.forEach(item => {
                    if (item.tipo !== 'ajuste_manual') {
                        item.price = parseFloat((Math.max(0, item.price + val)).toFixed(2));
                    }
                });
            }
            renderCart();
        });
    });

    // Global Discount Button
    const btnGlobalDiscount = document.getElementById('btn-global-discount');
    if (btnGlobalDiscount) {
        btnGlobalDiscount.addEventListener('click', () => {
            if (cart.length === 0) return;
            
            // Only apply to sessions (items that are NOT adjustments)
            let affected = 0;
            cart.forEach(item => {
                if (item.tipo !== 'ajuste_manual') {
                    item.price = parseFloat((Math.max(0, item.price - 2)).toFixed(2));
                    affected++;
                }
            });
            
            if (affected > 0) {
                renderCart();
                // Subtle feedback
                btnGlobalDiscount.style.background = '#dcfce7';
                setTimeout(() => btnGlobalDiscount.style.background = '#eff6ff', 500);
            }
        });
    }

    if (btnCheckout) {
        btnCheckout.addEventListener('click', async () => {
            // Usamos jQuery val() para evitar problemas con Select2, con fallback a document...
            const clienteId = typeof jQuery !== 'undefined' ? $('#pos-cliente-id').val() : document.getElementById('pos-cliente-id').value;
            const entrenadorId = typeof jQuery !== 'undefined' ? $('#pos-entrenador-id').val() : document.getElementById('pos-entrenador-id').value;
            const centro = typeof jQuery !== 'undefined' ? $('#pos-centro').val() : document.getElementById('pos-centro').value;
            
            if (!clienteId || !entrenadorId || !centro) { alert('Por favor selecciona cliente, entrenador y centro.'); return; }
            
            const tipoEmpresa = document.getElementById('pos-tipo-empresa').value;
            const totalPagar = cart.reduce((sum, item) => sum + item.price, 0);
            
            let iva = 0;
            if (tipoEmpresa === 'entrenamiento') {
                iva = totalPagar - (totalPagar / 1.21);
            } else {
                iva = 0;
            }
            
            if (cart.length === 0) {
                alert('Añade al menos una clase o ajuste a la cuenta.');
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
                        tipo_empresa: tipoEmpresa,
                        iva_aplicado: iva,
                        importe_entregado: totalPagar,
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
