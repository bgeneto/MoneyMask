/**
 * @fileoverview A small JavaScript class that formats user input as monetary values.
 * @version 1.0.1
 * @author Bernhard Enders
 * @license MIT
 * @modified 2024-12-23
 */

/**
 * MoneyMask class provides currency input masking functionality
 * @class
 * @classdesc Handles real-time formatting of input fields for currency values with European formatting
 *
 * @example
 * // Create new instance
 * const input = document.querySelector('#money-input');
 * const mask = new MoneyMask(input, {
 *   decimal: ',',
 *   thousands: '.',
 *   precision: 2,
 *   prefix: '€ '
 * });
 *
 * // Or use static method
 * MoneyMask.apply(input, options);
 */
class MoneyMask {
    /**
     * Apply mask to all inputs matching selector.
     */
    static apply(selector, options = {}) {
        const inputs = document.querySelectorAll(selector);
        inputs.forEach(input => new MoneyMask(input, options));
    }

    /**
     * Constructor with options for mask.
     */
    constructor(inputElementOrSelector, options = {}) {
        if (typeof inputElementOrSelector === 'string') {
            this.input = document.querySelector(inputElementOrSelector);
        } else if (inputElementOrSelector instanceof HTMLElement) {
            // If a DOM element is passed, use it directly
            this.input = inputElementOrSelector;
        } else {
            // If neither a string nor an element, ignore
            return;
        }

        // If no element is found, ignore
        if (!this.input) {
            return;
        }
        this.options = {
            decimal: ',',
            thousands: '.',
            precision: 2,
            prefix: '€ ',
            allowNegative: true,
            selectOnFocus: false,
            ...options
        };
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Use 'input' to reformat whenever the text changes (typing, paste, etc.)
        this.input.addEventListener('input', this.handleInput.bind(this));
        this.input.addEventListener('focus', this.handleFocus.bind(this));
        this.input.addEventListener('blur', this.handleBlur.bind(this));
        this.input.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    /**
     * Handle input, put minus sign (if any) on the numeric part only, then format.
     */
    handleInput(event) {
        let value = event.target.value;
        // Check if user wants negative and typed at least one '-'
        const wantsNegative = this.options.allowNegative && value.includes('-');

        // Remove all minus signs
        value = value.replace(/-/g, '');

        // Extract only the digits and optional decimal
        let numericValue = this.extractNumericValue(value);

        // Re-add a single minus sign if user wants negative
        if (wantsNegative) {
            numericValue = '-' + numericValue;
        }

        // Format and replace input value
        const fmtVal = this.formatValue(numericValue);
        event.target.value = fmtVal;
    }

    /**
     * Keydown handler to (1) allow cut/copy/paste, minus sign, arrows, etc.
     * and (2) properly allow digits and decimal.
     */
    handleKeyDown(event) {
        const { key, keyCode, ctrlKey, metaKey, shiftKey, target } = event;

        // Allow backspace, delete, tab, escape, enter, arrows, or Ctrl/Cmd+A
        if (
            [46, 8, 9, 27, 13].includes(keyCode) || // Del, Bksp, Tab, Esc, Enter
            (key.toLowerCase() === 'a' && (ctrlKey || metaKey)) || // Ctrl/Cmd + A
            (keyCode >= 35 && keyCode <= 40) // Home, End, Arrow keys
        ) {
            return;
        }

        // Allow cut/copy/paste if Ctrl/Cmd is pressed
        if (
            (key.toLowerCase() === 'c' || key.toLowerCase() === 'v' || key.toLowerCase() === 'x') &&
            (ctrlKey || metaKey)
        ) {
            return;
        }

        // Handle minus sign if negatives are allowed.
        if ((key === '-' || keyCode === 189)) {
            if (!this.options.allowNegative || target.value.includes('-')) {
                event.preventDefault();
            }
            return;
        }

        // Allow the decimal character if user hasn’t typed it yet.
        if (key === this.options.decimal) {
            // block a second decimal
            if (target.value.includes(this.options.decimal)) {
                event.preventDefault();
            }
            return;
        }

        // Enforce digits (and numeric keypad digits). Block everything else.
        // The shift check will block !@#$... above the top number row.
        if ((shiftKey || keyCode < 48 || keyCode > 57) && (keyCode < 96 || keyCode > 105)) {
            event.preventDefault();
        }
    }

    /**
     * Extract only digits and a single decimal character.
     */
    extractNumericValue(value) {
        const escapedDecimal = this.escapeRegex(this.options.decimal);
        const regex = new RegExp(`[^0-9${escapedDecimal}]`, 'g');
        let numeric = value.replace(regex, '');
        const parts = numeric.split(this.options.decimal);
        // If more than one decimal, merge them into a single decimal point
        if (parts.length > 2) {
            numeric = parts[0] + this.options.decimal + parts.slice(1).join('');
        }
        return numeric;
    }

    /**
     * Format numeric string with decimal, thousands separator, prefix, and optional minus.
     * Ensures minus sign is after the prefix (e.g., "€ -123.45").
     */
    formatValue(value, isBlur = false) {
        if (!value) return '';
        const isNegative = this.options.allowNegative && value.startsWith('-');
        let numeric = value.replace(/[^\d]/g, ''); // keep only digits

        // If there's nothing but a minus, just return the minus or empty
        if (!numeric) {
            return isNegative ? `${this.options.prefix}-` : '';
        }

        let number = parseFloat(numeric) / Math.pow(10, this.options.precision);
        if (isNegative) number = -number;

        const parts = Math.abs(number).toFixed(this.options.precision).split('.');
        // Apply thousands separator
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.options.thousands);

        // Ensure minus is placed after prefix
        const ret = `${this.options.prefix}${isNegative ? '-' : ''}${parts.join(this.options.decimal)}`
        return ret;
    }

    /**
     * Place caret at the end on focus.
     */
    handleFocus(event) {
        if (this.options.selectOnFocus) {
            event.target.select();
        } else {
            const length = event.target.value.length;
            event.target.setSelectionRange(length, length);
        }
    }

    /**
     * Re-format on blur.
     */
    handleBlur(event) {
        const value = event.target.value;
        const isNegative = this.options.allowNegative && value.includes('-');
        const rawValue = value.replace(/-/g, '');
        const numericValue = this.extractNumericValue(rawValue);

        event.target.value = this.formatValue(
            isNegative ? '-' + numericValue : numericValue,
            true
        );
    }

    /**
     * Return the numeric value (Number) from masked input.
     */
    getValue() {
        const value = this.input.value;
        const isNegative = this.options.allowNegative && value.includes('-');
        const rawValue = value.replace(/-/g, '');
        const numericValue = this.extractNumericValue(rawValue);
        return isNegative
            ? -parseFloat(numericValue.replace(this.options.decimal, '.'))
            : parseFloat(numericValue.replace(this.options.decimal, '.'));
    }

    /**
     * Set the mask from a numeric value.
     */
    setValue(value) {
        const strValue = String(value);
        const isNegative = this.options.allowNegative && strValue.startsWith('-');
        const numeric = strValue.replace(/-/g, '');
        this.input.value = this.formatValue(isNegative ? '-' + numeric : numeric);
    }

    /**
     * Escape special characters for regex usage.
     */
    escapeRegex(char) {
        return char.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
}
