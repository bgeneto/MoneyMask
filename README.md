# MoneyMask

A lightweight JavaScript class that formats user input as monetary values, supporting custom precision, decimal separators, prefixes, and optional negative values. Commonly used for currency input fields in forms.

## Table of Contents

1. [Introduction](#introduction)  
2. [Features](#features)  
3. [Installation](#installation)  
4. [Usage](#usage)  
   - [Basic Usage](#basic-usage)  
   - [Passing Custom Options](#passing-custom-options)  
   - [Applying to Multiple Elements](#applying-to-multiple-elements)  
   - [Retrieving and Setting Values](#retrieving-and-setting-values)  
5. [Available Options](#available-options)  
6. [Example Project Structure](#example-project-structure)  
7. [Contributing](#contributing)  
8. [License](#license)  

---

## Introduction

MoneyMask is a simple yet flexible solution for masking user input as formatted currency, allowing for custom:

- Decimal separators (e.g. "," or ".")  
- Thousands separators (e.g. "." or ",")  
- Currency prefixes (e.g. "€", "$", "R$")  
- Optional minus sign for negative amounts  

It helps to ensure consistent and valid monetary inputs across different locales or use cases.

---

## Features

- Automatically formats user input as currency while typing (e.g. "1.234,56" or "1,234.56").  
- Optionally allows negative values and places the minus sign appropriately ("€ -123,45").  
- Configurable decimal and thousands separators.  
- Works seamlessly with multiple inputs in the same page.  
- Simple API for programmatic get/set of numeric values.

---

## Installation

1. **Clone or Download** this repository.  
2. **Include the JavaScript** file in your project, for example:

```html
<!-- Either host locally or via a bundler -->
<script src="MoneyMask.js"></script>
```

3. You can now use the `MoneyMask` class to format your input fields.

---

## Usage

### Basic Usage

1. In your HTML, create one or more `<input>` fields that should be formatted as currency:

```html
<input id="price" type="text" />
```

2. Call the `MoneyMask.apply` method on your desired selector after the DOM is loaded:

```html
<script>
document.addEventListener('DOMContentLoaded', () => {
  MoneyMask.apply('#price');
});
</script>
```

3. Your input will automatically be masked as you type.

### Passing Custom Options

For more fine-grained control, you can pass an options object to override defaults:

```html
<script>
document.addEventListener('DOMContentLoaded', () => {
  MoneyMask.apply('#price', {
    prefix: 'R$ ',
    decimal: ',',
    thousands: '.',
    precision: 2,
    allowNegative: false
  });
});
</script>
```

These options will change the formatting to (for example) “R$ 1.234,56” without permitting negative values.

### Applying to Multiple Elements

You can apply MoneyMask to several fields by using a shared selector (e.g., a [data-mask] attribute) or by selecting multiple IDs/classes. For instance:

```html
<!-- In your HTML -->
<input data-mask="euro" type="text" placeholder="Amount 1" />
<input data-mask="euro" type="text" placeholder="Amount 2" />
<input data-mask="euro" type="text" placeholder="Amount 3" />

<script>
document.addEventListener('DOMContentLoaded', () => {
  MoneyMask.apply('[data-mask="euro"]', {
    prefix: '€ ',
    decimal: ',',
    thousands: '.',
    precision: 2,
    allowNegative: true
  });
});
</script>
```

In this example, all three inputs share the same selector `[data-mask="euro"]` and the same configuration options.
Another example with multiple inputs using data attributes:

```html
<input type="text" data-mask="euro" placeholder="€ 0,00">
<input type="text" data-prefix="£ " data-precision="2" placeholder="£ 0.00">
<input type="text" data-prefix="$ " data-precision="2" placeholder="$ 0.00">
<script>
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-mask="euro"]').forEach(input => {
        MoneyMask.apply(input, {
            prefix: input.dataset.prefix || '€ ',
            precision: parseInt(input.dataset.precision) || 2
        });
    });
});
</script>
```
You can even create a more declarative approach using custom attributes:

```js
// Auto-initialize all monetary inputs
class MonetaryInput extends HTMLInputElement {
    connectedCallback() {
        MoneyMask.apply(this, {
            prefix: this.dataset.prefix || '€ ',
            precision: parseInt(this.dataset.precision) || 2,
            decimal: this.dataset.decimal || ',',
            thousands: this.dataset.thousands || '.'
        });
    }
}

// Register the custom element
customElements.define('monetary-input', MonetaryInput, { extends: 'input' });
```
Then use it in HTML:

```html
<!-- Using custom element -->
<input type="text" is="monetary-input">
<input type="text" is="monetary-input" data-prefix="$ " data-decimal="." data-thousands=",">
```

### Retrieving and Setting Values

You can also manage masked input values programmatically:

• Retrieve the numeric value (as a JS number):  
```js
// Suppose you have the reference to a single MoneyMask instance:
const moneyMaskInstance = new MoneyMask(document.getElementById('price'));

// Or if you used apply():
// moneyMaskInstance = ... is automatically created internally

// Now you can call:
const currentValue = moneyMaskInstance.getValue();
console.log(currentValue); // e.g., 123.45 (if "€ 123,45" is displayed)
```

• Set the numeric value (e.g., loading from an API or database):
```js
moneyMaskInstance.setValue(1999.99);
// Input field becomes "€ 1.999,99" (according to your configuration)
```

If you’re using `MoneyMask.apply`, you can also retrieve all created instances by storing references yourself or by accessing them in your code logic. Each input has its own instance.

---

## Available Options

Here are the defaults with brief explanations:

| Option         | Default | Description                                                                                 |
|----------------|---------|---------------------------------------------------------------------------------------------|
| `decimal`      | `','`   | The character used as the decimal point.                                                   |
| `thousands`    | `'.'`   | The character used as the thousands separator.                                             |
| `precision`    | `2`     | Number of digits after the decimal point.                                                  |
| `prefix`       | `'€ '`  | String added before the numeric value (e.g., `'€ '`, `'$'`, `'R$ '`).                       |
| `allowNegative`| `true`  | Whether negative values are allowed, e.g. "€ -123,45".                                      |

You can override any of the above options by passing an object to the constructor or the `MoneyMask.apply()` call.

---

## Contributing

1. Fork the repository.  
2. Create your feature branch: `git checkout -b my-new-feature`.  
3. Commit your changes: `git commit -am 'Add some feature'`.  
4. Push to the branch: `git push origin my-new-feature`.  
5. Submit a pull request.

We welcome bug reports, feature requests, and pull requests!

---

## License

MoneyMask is open-source software licensed under the MIT license. For more information, please see the [LICENSE](LICENSE) file.

