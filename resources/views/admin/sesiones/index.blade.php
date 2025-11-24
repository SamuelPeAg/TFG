@extends('layouts.admin')

@section('title', 'Sesiones')

@section('content')
    
    <div class="header-controls">
        <div class="title-section">
            <h1>Sesiones List</h1>
            <span class="breadcrumb">Dashboard / Sesiones List</span>
        </div>
        
        <div class="controls-bar">
            <div style="display: flex; gap: 10px;">
                <button class="btn-new-customer primary-action" id="open-form-sidebar"> 
                    + NUEVA SESIÓN
                </button>
                <button class="btn-new-customer secondary-action" id="btn-ver-calendario"> 
                    VER CALENDARIO
                </button>
            </div>
            <div class="search-box">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" placeholder="Buscar sesión...">
            </div>
        </div>
    </div>
    
    <div class="session-cards-container">
        <p style="color: #666; margin-top: 20px;">No hay sesiones creadas todavía...</p>
    </div>

    <div class="overlay"></div>

    <div id="right-sidebar-form" class="right-sidebar-form">
        
        <div class="sidebar-header">
            <h2>Nueva Sesión</h2>
            <button id="close-form-sidebar" class="close-sidebar-btn">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <div class="sidebar-content">
            <div class="form-row">
                <div class="form-group">
                    <label for="input-nombre-sesion">Nombre de la Sesión:</label>
                    <input type="text" id="input-nombre-sesion" class="custom-input" placeholder="Ej. Entrenamiento HIIT">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="input-cliente">Cliente:</label>
                    <input type="text" id="input-cliente" class="custom-input" placeholder="Buscar cliente..." list="lista-clientes">
                    <datalist id="lista-clientes">
                        <option value="Ana Pérez">
                        <option value="Javier Soto">
                        <option value="Pedro Vázquez">
                    </datalist>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="input-precio">Precio (€):</label>
                    <input type="number" id="input-precio" class="custom-input" placeholder="0.00" min="0" step="0.01">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group date-picker-container">
                    <label for="input-fecha">Día(s) de la Sesión:</label>
                    <input type="text" id="input-fecha" class="custom-input" placeholder="Selecciona días..." readonly>
                    <i class="fa-solid fa-calendar-alt calendar-icon"></i>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="select-centro">Centro:</label>
                    <select id="select-centro" class="custom-select">
                        <option value="" disabled selected>-- Selecciona el Centro --</option>
                        <option value="centro-1">Centro Principal</option>
                        <option value="centro-2">Centro Wellness</option>
                        <option value="online">Online</option>
                    </select>
                </div>
            </div>

            <div class="form-row action-group">
                <button class="btn-new-customer secondary-action" id="cancel-form-sidebar">CANCELAR</button>
                <button class="btn-new-customer primary-action">GUARDAR SESIÓN</button>
            </div>
        </div>
    </div>

@endsection