// Global Select2 Initialization
import 'select2/dist/css/select2.css';

/**
 * Carga Select2 dinámicamente cuando jQuery está disponible
 */
async function loadSelect2() {
  // Esperar a que jQuery esté disponible
  const maxAttempts = 50;
  let attempts = 0;

  while (!window.$ || !window.jQuery && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }

  if (!window.$) {
    return;
  }

  try {
    // Cargar Select2 a través del módulo npm que se registra en window.jQuery
    const select2 = await import('select2');
    
    // Verificar que Select2 se registró en jQuery
    if (typeof window.$.fn.select2 === 'function') {
      initializeSelect2();
    } else {
      // Intentar llamar Select2 directamente
      if (select2 && select2.default) {
        select2.default(window.$);
      }
      setTimeout(initializeSelect2, 100);
    }
  } catch (error) {
    // Última alternativa: intentar usar la función global
    if (typeof window.Select2 !== 'undefined') {
      initializeSelect2();
    }
  }
}

/**
 * Inicializa Select2 para todos los elementos select
 */
function initializeSelect2() {
  const $ = window.$;
  
  if (!$) return;
  if (typeof $.fn.select2 !== 'function') return;

  // Selecciona todos los select que no hayan sido inicializados
  $('select').each(function() {
    const $select = $(this);

    // Skip if has ignore class
    if ($select.hasClass('select2-ignore')) {
        return;
    }

    // Skip if already initialized
    if ($select.hasClass('select2-hidden-accessible')) {
      return;
    }

    try {
      // Initialize Select2
      $select.select2({
        width: '100%',
        minimumResultsForSearch: 0,
        searchInputPlaceholder: "Buscar...",
        language: {
          noResults: function() {
            return 'No se encontraron resultados';
          }
        }
      });
    } catch (error) {
      // Silent fail
    }
  });
}

// Cargar Select2 cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    loadSelect2();
  });
} else {
  loadSelect2();
}

// Re-initialize when modals are shown (Bootstrap 5)
document.addEventListener('show.bs.modal', function(e) {
  setTimeout(initializeSelect2, 200);
});

// Watch for dynamically added content
const observer = new MutationObserver(function(mutations) {
  let newSelectsFound = false;

  mutations.forEach(function(mutation) {
    if (mutation.addedNodes.length > 0) {
      Array.from(mutation.addedNodes).forEach(node => {
        if (node.tagName === 'SELECT') {
          newSelectsFound = true;
        } else if (node.querySelectorAll) {
          const newSelects = node.querySelectorAll('select:not(.select2-hidden-accessible)');
          if (newSelects.length > 0) {
            newSelectsFound = true;
          }
        }
      });
    }
  });

  if (newSelectsFound) {
    setTimeout(initializeSelect2, 150);
  }
});

// Start observing the document for changes
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Exportar la función para uso manual
window.reinitializeSelect2 = initializeSelect2;
