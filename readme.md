# Unchained UI

## Input Date Field UI Component

[![NPM Version](https://img.shields.io/npm/v/uc-input-field-date.svg?style=flat-square)](https://www.npmjs.com/package/uc-input-field-date)
[![NPM Downloads](https://img.shields.io/npm/dt/uc-input-field-date.svg?style=flat-square)](https://www.npmjs.com/package/uc-input-field-date)

### Usage

```js
import InputDate from 'uc-input-field-date';

const elDisplay = get('#display');

const input = new InputDate({
  title: 'date field',
  onChange: val => {
    console.log('new date', val);
  }
}).appendTo(elDisplay);

```

This component follows **Unchained** UI guidelines.

Constructor options:

* el – HTLMElement, parse all the information from the DOM element
* **title** — string, title of the input
* value — integer, timestamp in milliseconds or string, representing a date in a format recognized by the `Date.parse()` method
* locale — a locale object. Defined as in [uc-calendar](https://github.com/unchainedui/calendar.git)
* debounce – number, default 500ms. Debounce onChange calls
* onChange — function, callback will be called when value is changed

### Methods

#### value([val])

if `val` is undefined returns current value, otherwise sets the value. The value is an instance of the `Date` class.

#### focus()

Sets the focus.

#### blur()

Removes focus.

#### active(state)

Sets the state.

#### error([msg])

Shows the error with optional `msg`.

#### remove()

Removes the input.

License MIT

© velocityzen

