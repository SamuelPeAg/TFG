@extends('layouts.app')

@section('title', 'Sesiones List')
@section('active-sesiones', 'active') 

{{-- Seccion para incluir CSS y JS de Flatpickr --}}
@section('flatpickr_css')
@endsection
@section('flatpickr_js')
@endsection

@section('main-content')
    <main class="main-content">
        
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
                    <button class="btn-new-customer secondary-action"> 
                        VER CALENDARIO
                    </button>
                </div>
                <div class="search-box">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="text" placeholder="Buscar sesión...">
                </div>
            </div>
        </div>
        
        <div class="session-view-container">
            
            {{-- Formulario de creación de Sesión (Puedes moverlo a un @include si es muy largo) --}}
            @include('partials.create_session_form')
            
            <div class="sessions-list-scrollable">
                <div class="session-cards-container">
                    
                    {{-- Ejemplo de bucle Blade para mostrar sesiones --}}
                    @foreach($sesiones as $sesion)
                    <div class="session-card {{ strtolower($sesion->estado) }}">
                        <div class="card-header">
                            <span class="type-badge badge-{{ strtolower($sesion->tipo) }}">{{ $sesion->tipo_nombre }}</span>
                            <span class="status-badge status-{{ strtolower($sesion->estado) }}">{{ $sesion->estado }}</span>
                        </div>
                        <div class="card-body">
                            <h3>Sesión #{{ $loop->iteration }}</h3>
                            <p class="trainer-info"><i class="fa-solid fa-dumbbell"></i> Entrenador: **{{ $sesion->entrenador }}**</p>
                            <p class="client-info"><i class="fa-solid fa-user"></i> Cliente: {{ $sesion->cliente }}</p>
                            <div class="time-details">
                                <p><i class="fa-solid fa-calendar-alt"></i> **Fecha:** {{ $sesion->fecha }}</p>
                                <p><i class="fa-solid fa-clock"></i> **Hora:** {{ $sesion->hora }} ({{ $sesion->duracion }} min)</p>
                            </div>
                        </div>
                        <div class="card-actions">
                            <button class="btn-action view"><i class="fa-solid fa-eye"></i> Ver</button>
                            <button class="btn-action bill" @if($sesion->estado == 'Cancelada') disabled @endif><i class="fa-solid fa-file-invoice"></i> Facturar</button>
                            <button class="btn-action delete"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </div>
                    @endforeach
                    
                </div>
            </div>
            
        </div>
    </main>
@endsection

@section('scripts')
    {{-- Aquí va el contenido del archivo sesiones.js --}}
    <script src="{{ asset('js/sesiones.js') }}"></script> 
@endsection