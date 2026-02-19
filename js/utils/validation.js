/* ============================================
   Validation Module
   Real-time form validation with inline errors
   ============================================ */

/**
 * Validation rules
 */
const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]*$/,
    url: /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/,
};

/**
 * Validate a single field
 * @param {HTMLInputElement} input 
 * @returns {boolean}
 */
export function validateField(input) {
    const value = input.value.trim();
    const type = input.dataset.validate;
    const required = input.hasAttribute('required');
    let errorMsg = '';

    // Required check
    if (required && !value) {
        errorMsg = 'This field is required';
    }
    // Type-specific validation
    else if (value && type) {
        switch (type) {
            case 'email':
                if (!patterns.email.test(value)) {
                    errorMsg = 'Please enter a valid email address';
                }
                break;
            case 'phone':
                if (!patterns.phone.test(value)) {
                    errorMsg = 'Please enter a valid phone number';
                }
                break;
            case 'url':
                if (!patterns.url.test(value)) {
                    errorMsg = 'Please enter a valid URL';
                }
                break;
        }
    }

    // Show/hide error
    showFieldError(input, errorMsg);
    return !errorMsg;
}

/**
 * Show inline error for a field
 * @param {HTMLInputElement} input 
 * @param {string} message 
 */
function showFieldError(input, message) {
    let errorEl = input.parentElement.querySelector('.form-error');

    if (message) {
        input.classList.add('error');
        input.classList.remove('success');

        if (!errorEl) {
            errorEl = document.createElement('span');
            errorEl.className = 'form-error';
            input.parentElement.appendChild(errorEl);
        }
        errorEl.textContent = message;
        // Trigger visible class after a tick for animation
        requestAnimationFrame(() => errorEl.classList.add('visible'));
    } else {
        input.classList.remove('error');
        if (input.value.trim()) {
            input.classList.add('success');
        }
        if (errorEl) {
            errorEl.classList.remove('visible');
            setTimeout(() => errorEl.remove(), 150);
        }
    }
}

/**
 * Validate all fields within a container
 * @param {Element} container 
 * @returns {boolean}
 */
export function validateStep(container) {
    const inputs = container.querySelectorAll('input[required], textarea[required]');
    let allValid = true;

    inputs.forEach(input => {
        if (!validateField(input)) {
            allValid = false;
        }
    });

    return allValid;
}

/**
 * Setup real-time validation on inputs
 * @param {Element} container 
 */
export function setupRealtimeValidation(container) {
    const inputs = container.querySelectorAll('input, textarea');

    inputs.forEach(input => {
        // Validate on blur
        input.addEventListener('blur', () => validateField(input));

        // Clear error on input
        input.addEventListener('input', () => {
            if (input.classList.contains('error')) {
                validateField(input);
            }
        });
    });
}
