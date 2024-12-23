/**
 * @fileoverview Money input mask formatter with European currency support
 * @version 1.0.0
 * @author Bernhard Enders
 * @license MIT
 *
 * Copyright (c) 2024
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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
    constructor(inputElement, options = {}) {
        this.input = inputElement;
        this.options = {
            decimal: ',',
            thousands: '.',
            precision: 2,
            prefix: '€ ',
            allowNegative: true,
            ...options
        };
        this.setupEventListeners();
    }

    setupEventListeners() {
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
        event.target.value = this.formatValue(numericValue);
    }

    /**
     * Keydown handler to allow minus only if negative is allowed and no minus is present yet.
     */
    handleKeyDown(event) {
        const { key, keyCode, ctrlKey, metaKey, shiftKey, target } = event;
        // Allow backspace, delete, tab, escape, enter, arrows, or Ctrl/Cmd+A
        if ([46, 8, 9, 27, 13].includes(keyCode) ||
            (key === 'a' && (ctrlKey || metaKey)) ||
            (keyCode >= 35 && keyCode <= 40)) {
            return;
        }
        // Handle minus sign:
        // - allow if allowNegative: true
        // - disallow if already has minus, or not allowed to be negative
        if ((key === '-' || keyCode === 189)) {
            if (!this.options.allowNegative || target.value.includes('-')) {
                event.preventDefault();
            }
            return;
        }
        // Enforce digits (and numeric keypad digits). Block everything else.
        if ((shiftKey || keyCode < 48 || keyCode > 57) &&
            (keyCode < 96 || keyCode > 105)) {
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
        return `${this.options.prefix}${isNegative ? '-' : ''}${parts.join(this.options.decimal)}`;
    }

    /**
     * Place caret at the end on focus.
     */
    handleFocus(event) {
        const length = event.target.value.length;
        event.target.setSelectionRange(length, length);
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