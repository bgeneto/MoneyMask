const { JSDOM } = require('jsdom');
const MoneyMask = require('../MoneyMask');

describe('MoneyMask', () => {
    let input;

    beforeEach(() => {
        const dom = new JSDOM('<!DOCTYPE html><input type="text" id="money-input">');
        global.document = dom.window.document;
        input = document.getElementById('money-input');
    });

    afterEach(() => {
        delete global.document;
    });

    test('should place caret at the end of the input value on focus', () => {
        const mask = new MoneyMask(input);
        input.value = '€ 1.234,56';
        input.focus();
        expect(input.selectionStart).toBe(input.value.length);
        expect(input.selectionEnd).toBe(input.value.length);
    });

    test('should select the entire text input if selectOnFocus is true', () => {
        const mask = new MoneyMask(input, { selectOnFocus: true });
        input.value = '€ 1.234,56';
        input.focus();
        expect(input.selectionStart).toBe(0);
        expect(input.selectionEnd).toBe(input.value.length);
    });

    test('should handle empty input value on focus', () => {
        const mask = new MoneyMask(input);
        input.value = '';
        input.focus();
        expect(input.selectionStart).toBe(0);
        expect(input.selectionEnd).toBe(0);
    });

    test('should handle input with only the prefix on focus', () => {
        const mask = new MoneyMask(input);
        input.value = '€ ';
        input.focus();
        expect(input.selectionStart).toBe(input.value.length);
        expect(input.selectionEnd).toBe(input.value.length);
    });

    test('should handle input with a full monetary value on focus', () => {
        const mask = new MoneyMask(input);
        input.value = '€ 1.234,56';
        input.focus();
        expect(input.selectionStart).toBe(input.value.length);
        expect(input.selectionEnd).toBe(input.value.length);
    });

    test('should handle multiple focus events in succession', () => {
        const mask = new MoneyMask(input);
        input.value = '€ 1.234,56';
        input.focus();
        expect(input.selectionStart).toBe(input.value.length);
        expect(input.selectionEnd).toBe(input.value.length);
        input.blur();
        input.focus();
        expect(input.selectionStart).toBe(input.value.length);
        expect(input.selectionEnd).toBe(input.value.length);
    });

    test('should work correctly with different configurations of MoneyMask options', () => {
        const mask = new MoneyMask(input, {
            decimal: '.',
            thousands: ',',
            precision: 3,
            prefix: '$ ',
            selectOnFocus: true
        });
        input.value = '$ 1,234.567';
        input.focus();
        expect(input.selectionStart).toBe(0);
        expect(input.selectionEnd).toBe(input.value.length);
    });

    test('should format value with different prefix', () => {
        const mask = new MoneyMask(input, { prefix: '$ ' });
        input.value = '1234.56';
        mask.handleInput({ target: input });
        expect(input.value).toBe('$ 1.234,56');
    });

    test('should format value with different precision', () => {
        const mask = new MoneyMask(input, { precision: 3 });
        input.value = '1234.567';
        mask.handleInput({ target: input });
        expect(input.value).toBe('€ 1.234,567');
    });

    test('should format value with decimal dot', () => {
        const mask = new MoneyMask(input, { decimal: '.' });
        input.value = '1234.56';
        mask.handleInput({ target: input });
        expect(input.value).toBe('€ 1.234.56');
    });

    test('should format value with negative sign', () => {
        const mask = new MoneyMask(input, { allowNegative: true });
        input.value = '-1234.56';
        mask.handleInput({ target: input });
        expect(input.value).toBe('€ -1.234,56');
    });

    test('should not format value with negative sign if not allowed', () => {
        const mask = new MoneyMask(input, { allowNegative: false });
        input.value = '-1234.56';
        mask.handleInput({ target: input });
        expect(input.value).toBe('€ 1.234,56');
    });
});
