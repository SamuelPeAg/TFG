import axios from 'axios';
import $ from 'jquery';

// Asignar jQuery a window
window.$ = $;
window.jQuery = $;
window.axios = axios;

// Select2 se carga dinámicamente en select2-init.js después de que jQuery esté disponible

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

let token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
    console.error('CSRF token not found');
}
