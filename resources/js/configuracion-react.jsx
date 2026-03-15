import React from 'react';
import { createRoot } from 'react-dom/client';
import ConfiguracionApp from './Components/Configuracion/ConfiguracionApp';

const rootElement = document.getElementById('react-configuracion-root');
if (rootElement) {
    const user = JSON.parse(rootElement.dataset.user || '{}');
    const updateRoute = rootElement.dataset.updateRoute || '';
    const csrfToken = rootElement.dataset.csrf || '';
    const successMsg = rootElement.dataset.success || '';
    const errorsMsg = JSON.parse(rootElement.dataset.errors || '[]');
    
    const root = createRoot(rootElement);
    root.render(
        <ConfiguracionApp 
            user={user} 
            updateRoute={updateRoute} 
            csrfToken={csrfToken}
            successMsg={successMsg}
            errorsMsg={errorsMsg}
        />
    );
}
