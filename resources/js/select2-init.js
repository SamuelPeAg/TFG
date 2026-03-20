// Global Select2 Initialization
import 'select2/dist/css/select2.css';

console.log('Select2 initialization script loaded');

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
    console.error('jQuery not available after waiting');
    return;
  }

  console.log('jQuery available, loading Select2...');

  try {
    // Cargar Select2 a través del módulo npm que se registra en window.jQuery
    const select2 = await import('select2');
    
    console.log('✓ Select2 module loaded');

    // Verificar que Select2 se registró en jQuery
    if (typeof window.$.fn.select2 === 'function') {
      console.log('✓ Select2 successfully registered on jQuery.fn');
      initializeSelect2();
    } else {
      console.warn('Select2 module loaded but not on jQuery.fn, trying alternative');
      // Intentar llamar Select2 directamente
      if (select2 && select2.default) {
        select2.default(window.$);
      }
      setTimeout(initializeSelect2, 100);
    }
  } catch (error) {
    console.error('Error loading Select2 module:', error);
    // Última alternativa: intentar usar la función global
    if (typeof window.Select2 !== 'undefined') {
      console.log('Using global Select2');
      initializeSelect2();
    }
  }
}

/**
 * Inicializa Select2 para todos los elementos select
 */
function initializeSelect2() {
  console.log('Attempting to initialize Select2...');

  const $ = window.$;
  
  if (!$) {
    console.error('jQuery not available');
    return;
  }

  if (typeof $.fn.select2 !== 'function') {
    console.error('Select2 plugin not loaded on jQuery.fn');
    return;
  }

  console.log('✓ Select2 is available');

  // Selecciona todos los select que no hayan sido inicializados
  $('select').each(function() {
    const $select = $(this);
    const selectId = $select.attr('id') || $select.attr('name') || 'unnamed';

    // Skip if it is an internal SweetAlert2 element
    if ($select.closest('.swal2-container').length > 0) {
      console.log(`Skipping internal SweetAlert select: ${selectId}`);
      return;
    }

    // Skip if has explicit opt-out or manual init class
    if ($select.hasClass('select2-basic') || $select.hasClass('no-select2')) {
      return;
    }

    // Skip if already initialized
    if ($select.hasClass('select2-hidden-accessible')) {
      return;
    }

    console.log(`Initializing Select2 on: ${selectId}`);

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

      console.log(`✓ Select2 initialized on: ${selectId}`);
    } catch (error) {
      console.error(`Error initializing Select2 on ${selectId}:`, error);
    }
  });
}

// Cargar Select2 cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - loading Select2');
    loadSelect2();
  });
} else {
  console.log('DOM already loaded - loading Select2 immediately');
  loadSelect2();
}

// Re-initialize when modals are shown (Bootstrap 5)
document.addEventListener('show.bs.modal', function(e) {
  console.log('Modal shown - re-initializing Select2');
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
          console.log('New select element detected');
        } else if (node.querySelectorAll) {
          const newSelects = node.querySelectorAll('select:not(.select2-hidden-accessible)');
          if (newSelects.length > 0) {
            newSelectsFound = true;
            console.log(`Detected ${newSelects.length} new select elements`);
          }
        }
      });
    }
  });

  if (newSelectsFound) {
    console.log('Re-initializing Select2 due to new content');
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



