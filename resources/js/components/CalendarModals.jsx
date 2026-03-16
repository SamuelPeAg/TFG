import React from 'react';

export default function CalendarModals({ centros = [], entrenadores = [], users = [] }) {
  return (
    <>
      {/* 1. Modal Salir */}
      <div id="modalSalir" className="modal-overlay">
        <div className="modal-box">
          <div className="modal-title">Cerrar Sesión</div>
          <div className="modal-text">¿Estás seguro de que quieres salir de Factomove?</div>
          
          <div className="modal-actions">
            <button className="btn-modal btn-cancel" id="btnCancelarSalir">Cancelar</button>
            <button className="btn-modal btn-confirm" id="btnConfirmarSalir">Sí, salir</button>
          </div>
        </div>
      </div>

      {/* 2. Modal Info */}
      <div id="infoPopup" className="modal-overlay" aria-hidden="true">
        <div className="modal-box modal-expanded">
          <button type="button" className="close-icon" id="btnCerrarPopup" style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '24px', color: '#9ca3af', cursor: 'pointer' }}>&times;</button>
          <h2 id="modal-fecha-titulo">Detalles</h2>
          <div id="lista-Pagos" className="modal-details"></div>
          <br />
          <button type="button" className="btn-modal btn-cancel" id="btnCerrarPopup2">Cerrar</button>
        </div>
      </div>

      {/* 3. Modal Selección Clientes */}
      <div id="modalSeleccionClientes" className="modal-overlay" aria-hidden="true" style={{ zIndex: 10000 }}>
        <div className="modal-box" style={{ maxWidth: '500px', padding: '30px', height: '80vh', display: 'flex', flexDirection: 'column' }}>
          <button type="button" className="close-icon btn-close-clients" style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '24px', color: '#9ca3af', cursor: 'pointer' }}>&times;</button>
          
          <h3 className="modern-title" style={{ fontSize: '1.4rem', marginBottom: '5px' }}>Seleccionar Clientes</h3>
          <p className="modern-subtitle" style={{ marginBottom: '20px' }}>Busca y marca los participantes</p>

          <div className="search-box" style={{ width: '100%', marginBottom: '15px', borderRadius: '10px', background: '#f9fafb' }}>
            <i className="fa-solid fa-search" style={{ color: '#9ca3af' }}></i>
            <div className="search-anchor">
              <input type="text" id="inputBuscarClientesModal" placeholder="Buscar por nombre..." style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '14px' }} />
            </div>
          </div>

          <div id="listaClientesModal" style={{ flex: 1, overflowY: 'auto', paddingRight: '5px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* JS Rendered */}
          </div>

          <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <button type="button" id="btnConfirmarClientes" className="btn-gradient">AÑADIR SELECCIONADOS</button>
          </div>
        </div>
      </div>

      {/* 4. Modal Nueva Clase */}
      <div id="modalNuevaClase" className="modal-overlay" role="dialog" aria-hidden="true">
        <div className="modal-box modal-expanded" style={{ maxWidth: '950px', height: '85vh', padding: 0, display: 'flex', borderRadiu: '16px', overflow: 'hidden' }}>
          
          {/* LEFT SIDEBAR */}
          <div className="wizard-sidebar" style={{ width: '260px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '24px' }}>
            <div className="sidebar-header" style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src="/img/logopng.png" alt="Logo" style={{ width: '32px', height: '32px' }} />
              <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '16px', letterSpacing: '-0.5px' }}>FACTOMOVE</span>
            </div>

            <div className="wizard-nav" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="nav-step active" data-step="1">
                <div className="nav-step-icon">1</div>
                <div className="nav-step-info">
                  <span className="step-label">Configuración</span>
                  <span className="step-desc">Centro y Entrenadores</span>
                </div>
              </div>
              <div className="nav-step" data-step="2">
                <div className="nav-step-icon">2</div>
                <div className="nav-step-info">
                  <span className="step-label">Planificación</span>
                  <span className="step-desc">Horario y Alumnos</span>
                </div>
              </div>
              <div className="nav-step" data-step="3">
                <div className="nav-step-icon">3</div>
                <div className="nav-step-info">
                  <span className="step-label">Facturación</span>
                  <span className="step-desc">Detalles de pagos</span>
                </div>
              </div>
            </div>

            <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '12px' }}>
              <p>&copy; {new Date().getFullYear()} Factomove</p>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="wizard-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ffffff', position: 'relative' }}>
            <button type="button" className="close-icon" id="btnCerrarNuevaClase" style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10, color: '#64748b', background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>

            <div className="wizard-header" style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9' }}>
              <h2 id="wizard-title" style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>Agendar Nueva Clase</h2>
              <p id="wizard-subtitle" style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>Completa los detalles para crear una sesión.</p>
            </div>

            <form id="formNuevaClaseWizard" action="/Pagos" onSubmit={(e) => e.preventDefault()} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.content || ''} />
              
              <div className="wizard-body" style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                
                {/* STEP 1 */}
                <div id="step-1" className="wizard-step">
                  <div className="form-section-title">DETALLES GENERALES</div>
                  
                  <div className="form-grid-2">
                    <div className="input-group-clean">
                      <label>Centro Deportivo</label>
                      <select id="centro" name="centro" className="input-clean" required defaultValue="">
                        <option value="" disabled>Selecciona centro...</option>
                        {centros.map(centro => (
                          <option key={centro.id} value={centro.nombre}>{centro.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="input-group-clean">
                      <label>Nombre de la Clase</label>
                      <input id="nombre_clase" type="text" name="nombre_clase" className="input-clean" placeholder="Ej. Pilates Reformer" required />
                    </div>
                  </div>

                  <div style={{ marginTop: '24px' }}>
                    <div className="input-group-clean">
                      <label>Tipo de Sesión</label>
                      <div className="select-cards-container">
                        <div className="custom-select-wrapper">
                          <select id="tipo_clase" name="tipo_clase" className="input-clean" required onChange={() => window.handleTipoChange?.()} defaultValue="EP">
                            <option value="EP">EP (Individual)</option>
                            <option value="DUO">DUO</option>
                            <option value="TRIO">TRIO</option>
                            <option value="GRUPO_PRIVADO">GRUPO PRIVADO</option>
                            <option value="GRUPO">GRUPO</option>
                          </select>
                          <div className="select-icon"><i className="fa-solid fa-chevron-down"></i></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '32px' }}>
                    <div className="form-section-title">EQUIPO TÉCNICO</div>
                    <div className="trainers-grid-clean">
                      {entrenadores.length > 0 ? entrenadores.map(coach => (
                        <label className="trainer-card-clean" key={coach.id}>
                          <input type="checkbox" name="trainers[]" value={coach.id} />
                          <div className="t-card-content">
                            <div className="t-avatar">
                              {coach.foto_de_perfil ? (
                                <img src={`/storage/${coach.foto_de_perfil}`} alt={coach.name} />
                              ) : (
                                coach.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="t-info">
                              <span className="t-name">{coach.name}</span>
                              <span className="t-role">Entrenador</span>
                            </div>
                            <div className="t-check"><i className="fa-solid fa-circle-check"></i></div>
                          </div>
                        </label>
                      )) : (
                        <div className="empty-msg">No hay entrenadores disponibles</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* STEP 2 */}
                <div id="step-2" className="wizard-step" style={{ display: 'none' }}>
                  <div className="form-section-title">AGENDA Y PRECIOS</div>
                  
                  <div className="form-grid-2">
                    <div className="input-group-clean">
                      <label>Fecha y Hora</label>
                      <input id="fecha_hora" type="datetime-local" name="fecha_hora" className="input-clean" required />
                    </div>
                    <div className="input-group-clean">
                      <label>Precio Base por Persona (€)</label>
                      <input id="precio_base" type="number" step="0.01" className="input-clean" placeholder="0.00" required />
                    </div>
                  </div>

                  <div style={{ marginTop: '40px' }}>
                    <div className="form-section-title">PARTICIPANTES <span id="clients-count" style={{ fontWeight: 400, fontSize: '11px', color: '#94a3b8', marginLeft: '5px' }}></span></div>
                    
                    <div className="client-search-wrapper" style={{ position: 'relative', marginBottom: '15px' }}>
                      <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }}></i>
                      <input type="text" id="client-search-input" className="input-clean" style={{ paddingLeft: '36px' }} placeholder="Buscar alumno por nombre..." autoComplete="off" />
                      <div id="client-suggestions" style={{ display: 'none', position: 'absolute', top: '100%', left: 0, width: '100%', maxHeight: '200px', overflowY: 'auto', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 50, marginTop: '4px' }}></div>
                    </div>

                    <div id="selected-clients-list" className="participants-grid-clean">
                      <div className="empty-state-clean">
                        <i className="fa-solid fa-users-slash"></i>
                        <p>Busca y selecciona alumnos</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* STEP 3 */}
                <div id="step-3" className="wizard-step" style={{ display: 'none' }}>
                  <div className="form-section-title">DETALLES DE PAGO INDIVIDUAL</div>
                  <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Revisa los importes y métodos de pago para cada asistente.</p>
                  
                  <div className="payments-table-container">
                    <div className="table-header">
                      <span>Alumno</span>
                      <span>Precio (€)</span>
                      <span>Método</span>
                    </div>
                    <div id="payment-rows-container" className="table-body">
                      {/* JS Fills */}
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer Actions */}
              <div className="wizard-footer" style={{ flexShrink: 0, padding: '20px 32px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff' }}>
                <button type="button" id="btn-prev-step" className="btn-clean-text" style={{ display: 'none' }}>
                  <i className="fa-solid fa-arrow-left"></i> Anterior
                </button>
                
                <div style={{ marginLeft: 'auto' }}>
                  <button type="button" id="btn-next-step" className="btn-clean-primary">
                    Siguiente <i className="fa-solid fa-arrow-right"></i>
                  </button>
                  <button type="submit" id="btn-submit-wizard" className="btn-clean-success" style={{ display: 'none' }}>
                    <i className="fa-solid fa-check"></i> CONFIRMAR Y GUARDAR
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* JSON data for JS compatibility */}
      <script type="application/json" id="users_json" dangerouslySetInnerHTML={{ __html: JSON.stringify(users.map(u => ({ id: u.id, name: u.name }))) }} />
      
      <style dangerouslySetInnerHTML={{ __html: `
        /* Reset & Fonts */
        .wizard-box { font-family: 'Inter', sans-serif; }
        
        /* Nav Items */
        .nav-step {
            display: flex; align-items: center; gap: 12px; padding: 12px 16px;
            border-radius: 10px; cursor: default; transition: all 0.2s;
            margin-bottom: 4px;
        }
        .nav-step.active { background: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        
        /* Active Step Icon: Teal-Pink Gradient */
        .nav-step.active .nav-step-icon { 
            background: linear-gradient(135deg, #39c5a7, #eb567a); 
            color: white; 
            border: none;
        }
        .nav-step.active .step-label { color: #0f172a; font-weight: 700; }
        
        .nav-step:not(.active) { opacity: 0.6; }
        .nav-step.completed .nav-step-icon { background: #39c5a7; border-color: #39c5a7; color: white; }

        .nav-step-icon {
            width: 32px; height: 32px; border-radius: 50%; border: 2px solid #cbd5e1;
            color: #64748b; font-weight: 700; display: flex; align-items: center; justify-content: center;
            background: white; flex-shrink: 0; font-size: 14px;
        }
        .step-label { display: block; font-size: 14px; color: #475569; font-weight: 600; }
        .step-desc { display: block; font-size: 11px; color: #94a3b8; }

        /* Forms */
        .form-section-title { font-size: 12px; font-weight: 800; color: #94a3b8; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 16px; }
        .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        
        .input-group-clean label { display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px; }
        .input-clean {
            width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #e2e8f0;
            font-size: 14px; color: #1e293b; background: #f8fafc; transition: all 0.2s;
        }
        .input-clean:focus { background: white; border-color: #39c5a7; outline: none; box-shadow: 0 0 0 3px rgba(57, 197, 167, 0.1); }

        /* Trainers Grid */
        .trainers-grid-clean { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
        .trainer-card-clean { cursor: pointer; position: relative; }
        .trainer-card-clean input { position: absolute; opacity: 0; }
        .t-card-content {
            border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; display: flex; align-items: center; gap: 12px;
            background: white; transition: all 0.2s;
        }
        /* Trainer Checked State */
        .trainer-card-clean input:checked + .t-card-content { border-color: #39c5a7; background: #f0fdfa; box-shadow: 0 4px 6px -1px rgba(57, 197, 167, 0.1); }
        
        /* Trainer Avatar with Gradient */
        .t-avatar { 
            width: 36px; height: 36px; 
            background: linear-gradient(135deg, #39c5a7, #eb567a); 
            border-radius: 50%; display: flex; align-items: center; justify-content: center; 
            font-weight: 700; color: white; font-size: 13px; text-shadow: 0 1px 2px rgba(0,0,0,0.2);
            overflow: hidden;
        }

        .t-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .t-info { flex: 1; display: flex; flex-direction: column; }
        .t-name { font-size: 13px; font-weight: 600; color: #334155; }
        .t-role { font-size: 11px; color: #94a3b8; }
        .t-check { display: none; color: #39c5a7; }
        .trainer-card-clean input:checked + .t-card-content .t-check { display: block; }

        /* Participants */
        .participants-grid-clean { margin-top: 15px; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
        .empty-state-clean { grid-column: 1/-1; text-align: center; color: #cbd5e1; padding: 40px; border: 2px dashed #f1f5f9; border-radius: 12px; }
        .empty-state-clean i { font-size: 24px; margin-bottom: 8px; }

        /* Payments Table */
        .payments-table-container { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
        .table-header { display: grid; grid-template-columns: 2fr 1fr 1fr; background: #f8fafc; padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; }
        .payment-row { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 15px; padding: 12px 16px; border-bottom: 1px solid #f1f5f9; align-items: center; background: white; }
        .payment-row:last-child { border-bottom: none; }

        /* Buttons */
        .btn-clean-primary { background: #0f172a; color: white; padding: 10px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: 0.2s; }
        .btn-clean-primary:hover { background: #1e293b; transform: translateY(-1px); }
        
        .btn-clean-secondary { background: white; color: #334155; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; transition: 0.2s; }
        .btn-clean-secondary:hover { background: #f8fafc; border-color: #cbd5e1; }

        .btn-clean-text { background: transparent; color: #64748b; border: none; font-weight: 600; font-size: 14px; cursor: pointer; padding: 10px 16px; }
        .btn-clean-text:hover { color: #334155; }

        /* Success Button Gradient Update */
        .btn-clean-success { 
            background: linear-gradient(90deg, #39c5a7 0%, #eb567a 100%); 
            color: white; padding: 10px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; border: none; 
            cursor: pointer; box-shadow: 0 4px 6px -1px rgba(235, 86, 122, 0.2); 
        }
        .btn-clean-success:hover { box-shadow: 0 6px 8px -2px rgba(235, 86, 122, 0.4); transform: translateY(-1px); }

        /* Animation */
        .wizard-step { animation: fadeIn 0.4s ease; }

        /* RESPONSIVE MOBILE */
        @media (max-width: 768px) {
            .modal-box {
                flex-direction: column !important;
                width: 100% !important;
                height: 100% !important;
                border-radius: 0 !important;
                max-width: 100% !important;
                max-height: 100% !important;
            }

            .wizard-sidebar {
                width: 100% !important;
                height: auto !important;
                flex-direction: row !important;
                align-items: center;
                padding: 10px 15px !important;
                border-right: none !important;
                border-bottom: 1px solid #e2e8f0;
                gap: 10px;
            }

            .sidebar-header, .sidebar-footer { display: none !important; }

            .wizard-nav {
                flex-direction: row !important;
                gap: 10px !important;
                justify-content: center;
                width: 100%;
            }

            .nav-step {
                padding: 5px !important;
                background: transparent !important;
                box-shadow: none !important;
                margin-bottom: 0 !important;
            }

            .nav-step-info { display: none; }
            .nav-step-icon { width: 36px; height: 36px; font-size: 14px; }

            .wizard-main { width: 100% !important; }
            .wizard-header { padding: 15px 20px !important; }
            .wizard-body { padding: 20px !important; }
            .wizard-footer { padding: 15px 20px !important; }

            .form-grid-2 { grid-template-columns: 1fr !important; gap: 15px !important; }

            /* Payment Table Mobile */
            .table-header { display: none !important; }
            .payment-row {
                grid-template-columns: 1fr !important;
                gap: 10px !important;
                padding: 15px !important;
                border: 1px solid #f1f5f9;
                margin-bottom: 10px;
                border-radius: 8px;
            }
        }
      `}} />
    </>
  );
}
