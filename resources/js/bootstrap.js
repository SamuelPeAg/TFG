import axios from 'axios';
import $ from 'jquery';

// Asignar jQuery a window
window.$ = $;
window.jQuery = $;
window.axios = axios;

// Select2 se carga dinámicamente en select2-init.js después de que jQuery esté disponible

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
