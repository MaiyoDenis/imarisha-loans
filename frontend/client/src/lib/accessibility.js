/**
 * Accessibility utilities for the application
 */
/**
 * Announces a message to screen readers
 * @param message - The message to announce
 * @param priority - 'polite' (default) or 'assertive'
 */
export function announceToScreenReader(message, priority) {
    if (priority === void 0) { priority = 'polite'; }
    var announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    // Remove after announcement
    setTimeout(function () {
        document.body.removeChild(announcement);
    }, 1000);
}
/**
 * Format currency for screen readers
 * @param amount - The amount to format
 * @param currency - The currency code (default: KES)
 */
export function formatCurrencyForScreenReader(amount, currency) {
    if (currency === void 0) { currency = 'KES'; }
    return "".concat(currency, " ").concat(amount.toLocaleString());
}
/**
 * Format percentage for screen readers
 * @param value - The percentage value
 */
export function formatPercentageForScreenReader(value) {
    return "".concat(value, " percent");
}
/**
 * Trap focus within a modal or dialog
 * @param element - The container element
 */
export function trapFocus(element) {
    var focusableElements = element.querySelectorAll('a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');
    var firstElement = focusableElements[0];
    var lastElement = focusableElements[focusableElements.length - 1];
    var handleTabKey = function (e) {
        if (e.key !== 'Tab')
            return;
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        }
        else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    };
    element.addEventListener('keydown', handleTabKey);
    // Focus first element
    firstElement === null || firstElement === void 0 ? void 0 : firstElement.focus();
    return function () {
        element.removeEventListener('keydown', handleTabKey);
    };
}
/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
