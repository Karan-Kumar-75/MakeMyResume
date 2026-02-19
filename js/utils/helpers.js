/* ============================================
   Utility Helpers
   DOM helpers, debounce, throttle, ID generation
   ============================================ */

/**
 * Short querySelector
 * @param {string} selector 
 * @param {Element} parent 
 * @returns {Element}
 */
export const $ = (selector, parent = document) => parent.querySelector(selector);

/**
 * Short querySelectorAll
 * @param {string} selector 
 * @param {Element} parent 
 * @returns {NodeList}
 */
export const $$ = (selector, parent = document) => parent.querySelectorAll(selector);

/**
 * Create element with attributes and children
 * @param {string} tag 
 * @param {Object} attrs 
 * @param  {...(string|Element)} children 
 * @returns {Element}
 */
export function createElement(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') {
      el.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([k, v]) => el.dataset[k] = v);
    } else if (key.startsWith('on')) {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      el.setAttribute(key, value);
    }
  });

  children.forEach(child => {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Element) {
      el.appendChild(child);
    }
  });

  return el;
}

/**
 * Debounce function
 * @param {Function} fn 
 * @param {number} delay 
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Generate unique ID
 * @returns {string}
 */
export function generateId() {
  return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
}

/**
 * Show toast notification
 * @param {string} message 
 * @param {string} type - 'success', 'error', 'warning', 'info'
 * @param {number} duration - ms
 */
export function showToast(message, type = 'info', duration = 3000) {
  let container = $('.toast-container');
  if (!container) {
    container = createElement('div', { className: 'toast-container' });
    document.body.appendChild(container);
  }

  const toast = createElement('div', { className: `toast ${type}` },
    createElement('span', {}, message)
  );
  
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Save data to localStorage
 * @param {string} key 
 * @param {*} data 
 */
export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('localStorage save failed:', e);
  }
}

/**
 * Load data from localStorage
 * @param {string} key 
 * @returns {*}
 */
export function loadFromStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.warn('localStorage load failed:', e);
    return null;
  }
}

/**
 * SVG icon helper — returns use element for SVG sprite
 * @param {string} name 
 * @param {number} size 
 * @returns {string}
 */
export function icon(name, size = 20) {
  return `<svg width="${size}" height="${size}" class="icon"><use href="assets/icons/svg-icons.svg#icon-${name}"></use></svg>`;
}
