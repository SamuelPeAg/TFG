// Script para mejorar la navegación con Tab en el formulario de login
document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitButton = document.querySelector('button[type="submit"]');

    if (emailInput && passwordInput && submitButton) {
        emailInput.addEventListener('keydown', function(e) {
            if (e.key === 'Tab' && !e.shiftKey) {
                e.preventDefault();
                passwordInput.focus();
            }
            if (e.key === 'Tab' && e.shiftKey) {
                e.preventDefault();
                submitButton.focus();
            }
        });

        passwordInput.addEventListener('keydown', function(e) {
            if (e.key === 'Tab' && !e.shiftKey) {
                e.preventDefault();
                submitButton.focus();
            }
            if (e.key === 'Tab' && e.shiftKey) {
                e.preventDefault();
                emailInput.focus();
            }
        });

        submitButton.addEventListener('keydown', function(e) {
            if (e.key === 'Tab' && !e.shiftKey) {
                e.preventDefault();
                emailInput.focus();
            }
            if (e.key === 'Tab' && e.shiftKey) {
                e.preventDefault();
                passwordInput.focus();
            }
        });
    }
});
