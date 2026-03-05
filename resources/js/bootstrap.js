import axios from 'axios';
import $ from 'jquery';
import select2 from 'select2';

window.$ = $;
window.jQuery = $;
window.axios = axios;
window.select2 = select2;

// Initialize Select2
$.fn.select2.defaults.set("theme", "bootstrap-5");
$.fn.select2.defaults.set("minimumResultsForSearch", 5);
$.fn.select2.defaults.set("searchInputPlaceholder", "Buscar...");

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
