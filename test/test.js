(function () {
  'use strict';

  const rxQuery = /^\s*([>+~])?\s*([*\w-]+)?(?:#([\w-]+))?(?:\.([\w.-]+))?\s*/;
  const rxClassOnly = /^\.([-\w]+)$/;
  const rxIdOnly = /^#([-\w]+)$/;

  function get(selector, root = document) {
    const id = selector.match(rxIdOnly);
    if (id) {
      return document.getElementById(id[1]);
    }

    const className = selector.match(rxClassOnly);
    if (className) {
      return root.getElementsByClassName(className[1]);
    }

    return root.querySelectorAll(selector);
  }

  function query(selector) {
    let f;
    const out = [];
    if (typeof selector === 'string') {
      while (selector) {
        f = selector.match(rxQuery);
        if (f[0] === '') {
          break;
        }

        out.push({
          rel: f[1],
          tag: (f[2] || '').toUpperCase(),
          id: f[3],
          classes: (f[4]) ? f[4].split('.') : undefined
        });
        selector = selector.substring(f[0].length);
      }
    }
    return out;
  }

  function createNs(namespaceURI, selector) {
    const s = query(selector)[0];
    const tag = s.tag;
    if (!tag) {
      return null;
    }

    const el = document.createElementNs(namespaceURI, tag);
    const id = s.id;
    if (id) {
      el.id = id;
    }

    const classes = s.classes;
    if (classes) {
      el.className = classes.join(' ');
    }

    return el;
  }

  function create(selector, content) {
    const s = query(selector)[0];
    const tag = s.tag;
    if (!tag) {
      return null;
    }

    const el = document.createElement(tag);
    const id = s.id;
    if (id) {
      el.id = id;
    }

    const classes = s.classes;
    if (classes) {
      el.className = classes.join(' ');
    }

    if (content) {
      el.innerHTML = content;
    }

    return el;
  }

  function closest(el, selector) {
    while (!el.matches(selector) && (el = el.parentElement));
    return el;
  }

  function attr(el, name, value) {
    if (value === undefined) {
      return el.getAttribute(name);
    }

    el.setAttribute(name, value);
  }

  function append(parent, el) {
    parent.appendChild(el);
    return parent;
  }

  function prepend(parent, el) {
    parent.insertBefore(el, parent.firstChild);
    return parent;
  }

  function appendTo(el, parent) {
    parent.appendChild(el);
    return el;
  }

  function prependTo(el, parent) {
    parent.insertBefore(el, parent.firstChild);
    return el;
  }

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function on(el, event, selector, handler, options) {
    if (typeof selector !== 'string') {
      handler = selector;
      selector = undefined;
    }

    if (!selector) {
      el.addEventListener(event, handler, options);
      return handler;
    }

    return on(el, event, e => {
      const target = closest(e.target, selector);
      if (target) {
        handler.call(target, e);
      }
    }, options);
  }

  function off(el, event, handler, options) {
    el.removeEventListener(event, handler, options);
    return handler;
  }

  function once(el, event, handler, options) {
    const _handler = (...args) => {
      handler(...args);
      off(el, event, handler);
    };

    el.addEventListener(event, handler, options);
    return _handler;
  }

  const ALL_EVENTS = '__events';
  function onEvents(ctx, events) {
    if (!ctx[ALL_EVENTS]) {
      ctx[ALL_EVENTS] = {};
    }

    for (const event in events) {
      ctx[ALL_EVENTS][event] = on(ctx.el, event, events[event]);
    }
  }

  function offEvents(ctx) {
    const events = ctx[ALL_EVENTS];
    for (const event in events) {
      off(ctx.el, event, events[event]);
    }
    delete ctx[ALL_EVENTS];
  }

  function addClass(el, ...cls) {
    return el.classList.add(...cls);
  }

  function removeClass(el, ...cls) {
    return el.classList.remove(...cls);
  }

  function toggleClass(el, cls, force) {
    return el.classList.toggle(cls, force);
  }

  function addDelayRemoveClass(el, cls, delay, cb) {
    addClass(el, cls);
    return setTimeout(() => {
      removeClass(el, cls);
      cb && cb();
    }, delay);
  }

  function replaceClass(el, rx, newClass) {
    const newClasses = [];
    attr(el, 'class').split(' ').forEach(function(cls) {
      const c = rx.test(cls) ? newClass : cls;

      if (newClasses.indexOf(c) === -1) {
        newClasses.push(c);
      }
    });

    attr(el, 'class', newClasses.join(' '));
    return newClasses.length;
  }

  function insertBefore(el, node) {
    return node.parentNode.insertBefore(el, node);
  }

  function insertAfter(el, node) {
    return node.parentNode.insertBefore(el, node.nextSibling);
  }

  function remove(el) {
    return el.parentNode.removeChild(el);
  }

  var dom = /*#__PURE__*/Object.freeze({
    get: get,
    query: query,
    createNs: createNs,
    create: create,
    closest: closest,
    attr: attr,
    append: append,
    prepend: prepend,
    appendTo: appendTo,
    prependTo: prependTo,
    ready: ready,
    on: on,
    off: off,
    once: once,
    ALL_EVENTS: ALL_EVENTS,
    onEvents: onEvents,
    offEvents: offEvents,
    addClass: addClass,
    removeClass: removeClass,
    toggleClass: toggleClass,
    addDelayRemoveClass: addDelayRemoveClass,
    replaceClass: replaceClass,
    insertBefore: insertBefore,
    insertAfter: insertAfter,
    remove: remove
  });

  function compose(...args) {
    let newObject = true;

    if (args[args.length - 1] === true) {
      args.pop();
      newObject = false;
    }

    newObject && args.unshift({});
    return Object.assign.apply(Object, args);
  }

  /*eslint-disable strict */

  const html = [
    'addClass',
    'removeClass',
    'toggleClass',
    'replaceClass',
    'appendTo',
    'prependTo',
    'insertBefore',
    'insertAfter'
  ].reduce((obj, method) => {
    obj[method] = function(...args) {
      dom[method].apply(null, [ this.el ].concat(args));
      return this;
    };
    return obj;
  }, {});

  html.attr = function(name, value) {
    if (value === undefined) {
      return this.el.getAttribute(name);
    }

    this.el.setAttribute(name, value);
    return this
  };

  html.find = function(selector) {
    return get(selector, this.el);
  };

  function closest$1(el, selector) {
    while (!el.matches(selector) && (el = el.parentElement));
    return el;
  }

  function on$1(el, event, selector, handler, options) {
    if (typeof selector !== 'string') {
      handler = selector;
      selector = undefined;
    }

    if (!selector) {
      el.addEventListener(event, handler, options);
      return handler;
    }

    return on$1(el, event, e => {
      const target = closest$1(e.target, selector);
      if (target) {
        handler.call(target, e);
      }
    }, options);
  }

  function off$1(el, event, handler, options) {
    el.removeEventListener(event, handler, options);
    return handler;
  }

  function debounce(func, wait, immediate) {
    let timeout;
    const fn = function(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) {
          func.apply(this, args);
        }
      };

      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);

      if (callNow) {
        func.apply(this, args);
      }
    };

    fn.cancel = function() {
      clearTimeout(timeout);
    };

    return fn;
  }

  var charMap = {
    // latin
    'À': 'A',
    'Á': 'A',
    'Â': 'A',
    'Ã': 'A',
    'Ä': 'Ae',
    'Å': 'A',
    'Æ': 'AE',
    'Ç': 'C',
    'È': 'E',
    'É': 'E',
    'Ê': 'E',
    'Ë': 'E',
    'Ì': 'I',
    'Í': 'I',
    'Î': 'I',
    'Ï': 'I',
    'Ð': 'D',
    'Ñ': 'N',
    'Ò': 'O',
    'Ó': 'O',
    'Ô': 'O',
    'Õ': 'O',
    'Ö': 'Oe',
    'Ő': 'O',
    'Ø': 'O',
    'Ù': 'U',
    'Ú': 'U',
    'Û': 'U',
    'Ü': 'Ue',
    'Ű': 'U',
    'Ý': 'Y',
    'Þ': 'TH',
    'ß': 'ss',
    'à': 'a',
    'á': 'a',
    'â': 'a',
    'ã': 'a',
    'ä': 'ae',
    'å': 'a',
    'æ': 'ae',
    'ç': 'c',
    'è': 'e',
    'é': 'e',
    'ê': 'e',
    'ë': 'e',
    'ì': 'i',
    'í': 'i',
    'î': 'i',
    'ï': 'i',
    'ð': 'd',
    'ñ': 'n',
    'ò': 'o',
    'ó': 'o',
    'ô': 'o',
    'õ': 'o',
    'ö': 'oe',
    'ő': 'o',
    'ø': 'o',
    'ù': 'u',
    'ú': 'u',
    'û': 'u',
    'ü': 'ue',
    'ű': 'u',
    'ý': 'y',
    'þ': 'th',
    'ÿ': 'y',
    'ẞ': 'SS',
    // greek
    'α': 'a',
    'β': 'b',
    'γ': 'g',
    'δ': 'd',
    'ε': 'e',
    'ζ': 'z',
    'η': 'h',
    'θ': '8',
    'ι': 'i',
    'κ': 'k',
    'λ': 'l',
    'μ': 'm',
    'ν': 'n',
    'ξ': '3',
    'ο': 'o',
    'π': 'p',
    'ρ': 'r',
    'σ': 's',
    'τ': 't',
    'υ': 'y',
    'φ': 'f',
    'χ': 'x',
    'ψ': 'ps',
    'ω': 'w',
    'ά': 'a',
    'έ': 'e',
    'ί': 'i',
    'ό': 'o',
    'ύ': 'y',
    'ή': 'h',
    'ώ': 'w',
    'ς': 's',
    'ϊ': 'i',
    'ΰ': 'y',
    'ϋ': 'y',
    'ΐ': 'i',
    'Α': 'A',
    'Β': 'B',
    'Γ': 'G',
    'Δ': 'D',
    'Ε': 'E',
    'Ζ': 'Z',
    'Η': 'H',
    'Θ': '8',
    'Ι': 'I',
    'Κ': 'K',
    'Λ': 'L',
    'Μ': 'M',
    'Ν': 'N',
    'Ξ': '3',
    'Ο': 'O',
    'Π': 'P',
    'Ρ': 'R',
    'Σ': 'S',
    'Τ': 'T',
    'Υ': 'Y',
    'Φ': 'F',
    'Χ': 'X',
    'Ψ': 'PS',
    'Ω': 'W',
    'Ά': 'A',
    'Έ': 'E',
    'Ί': 'I',
    'Ό': 'O',
    'Ύ': 'Y',
    'Ή': 'H',
    'Ώ': 'W',
    'Ϊ': 'I',
    'Ϋ': 'Y',
    // turkish
    'ş': 's',
    'Ş': 'S',
    'ı': 'i',
    'İ': 'I',
    // 'ç': 'c', // duplicate
    // 'Ç': 'C', // duplicate
    // 'ü': 'ue', // duplicate
    // 'Ü': 'Ue', // duplicate
    // 'ö': 'oe', // duplicate
    // 'Ö': 'Oe', // duplicate
    'ğ': 'g',
    'Ğ': 'G',
    // macedonian
    'Ќ': 'Kj',
    'ќ': 'kj',
    'Љ': 'Lj',
    'љ': 'lj',
    'Њ': 'Nj',
    'њ': 'nj',
    'Тс': 'Ts',
    'тс': 'ts',
    // russian */
    'а': 'a',
    'б': 'b',
    'в': 'v',
    'г': 'g',
    'д': 'd',
    'е': 'e',
    'ё': 'yo',
    'ж': 'zh',
    'з': 'z',
    'и': 'i',
    'й': 'y',
    'к': 'k',
    'л': 'l',
    'м': 'm',
    'н': 'n',
    'о': 'o',
    'п': 'p',
    'р': 'r',
    'с': 's',
    'т': 't',
    'у': 'u',
    'ф': 'f',
    'х': 'h',
    'ц': 'c',
    'ч': 'ch',
    'ш': 'sh',
    'щ': 'sch',
    'ъ': '',
    'ы': 'y',
    'ь': '',
    'э': 'e',
    'ю': 'yu',
    'я': 'ya',
    'А': 'A',
    'Б': 'B',
    'В': 'V',
    'Г': 'G',
    'Д': 'D',
    'Е': 'E',
    'Ё': 'Yo',
    'Ж': 'Zh',
    'З': 'Z',
    'И': 'I',
    'Й': 'J',
    'К': 'K',
    'Л': 'L',
    'М': 'M',
    'Н': 'N',
    'О': 'O',
    'П': 'P',
    'Р': 'R',
    'С': 'S',
    'Т': 'T',
    'У': 'U',
    'Ф': 'F',
    'Х': 'H',
    'Ц': 'C',
    'Ч': 'Ch',
    'Ш': 'Sh',
    'Щ': 'Sh',
    'Ъ': '',
    'Ы': 'Y',
    'Ь': '',
    'Э': 'E',
    'Ю': 'Yu',
    'Я': 'Ya',
    // ukranian
    'Є': 'Ye',
    'І': 'I',
    'Ї': 'Yi',
    'Ґ': 'G',
    'є': 'ye',
    'і': 'i',
    'ї': 'yi',
    'ґ': 'g',
    // czech
    'č': 'c',
    'ď': 'd',
    'ě': 'e',
    'ň': 'n',
    'ř': 'r',
    'š': 's',
    'ť': 't',
    'ů': 'u',
    'ž': 'z',
    'Č': 'C',
    'Ď': 'D',
    'Ě': 'E',
    'Ň': 'N',
    'Ř': 'R',
    'Š': 'S',
    'Ť': 'T',
    'Ů': 'U',
    'Ž': 'Z',
    // polish
    'ą': 'a',
    'ć': 'c',
    'ę': 'e',
    'ł': 'l',
    'ń': 'n',
    // 'ó': 'o', // duplicate
    'ś': 's',
    'ź': 'z',
    'ż': 'z',
    'Ą': 'A',
    'Ć': 'C',
    'Ę': 'E',
    'Ł': 'L',
    'Ń': 'N',
    'Ś': 'S',
    'Ź': 'Z',
    'Ż': 'Z',
    // latvian
    'ā': 'a',
    // 'č': 'c', // duplicate
    'ē': 'e',
    'ģ': 'g',
    'ī': 'i',
    'ķ': 'k',
    'ļ': 'l',
    'ņ': 'n',
    // 'š': 's', // duplicate
    'ū': 'u',
    // 'ž': 'z', // duplicate
    'Ā': 'A',
    // 'Č': 'C', // duplicate
    'Ē': 'E',
    'Ģ': 'G',
    'Ī': 'I',
    'Ķ': 'k',
    'Ļ': 'L',
    'Ņ': 'N',
    // 'Š': 'S', // duplicate
    'Ū': 'U',
    // 'Ž': 'Z', // duplicate
    // Arabic
    'ا': 'a',
    'أ': 'a',
    'إ': 'i',
    'آ': 'aa',
    'ؤ': 'u',
    'ئ': 'e',
    'ء': 'a',
    'ب': 'b',
    'ت': 't',
    'ث': 'th',
    'ج': 'j',
    'ح': 'h',
    'خ': 'kh',
    'د': 'd',
    'ذ': 'th',
    'ر': 'r',
    'ز': 'z',
    'س': 's',
    'ش': 'sh',
    'ص': 's',
    'ض': 'dh',
    'ط': 't',
    'ظ': 'z',
    'ع': 'a',
    'غ': 'gh',
    'ف': 'f',
    'ق': 'q',
    'ك': 'k',
    'ل': 'l',
    'م': 'm',
    'ن': 'n',
    'ه': 'h',
    'و': 'w',
    'ي': 'y',
    'ى': 'a',
    'ة': 'h',
    'ﻻ': 'la',
    'ﻷ': 'laa',
    'ﻹ': 'lai',
    'ﻵ': 'laa',
    // Arabic diactrics
    'َ': 'a',
    'ً': 'an',
    'ِ': 'e',
    'ٍ': 'en',
    'ُ': 'u',
    'ٌ': 'on',
    'ْ': '',

    // Arabic numbers
    '٠': '0',
    '١': '1',
    '٢': '2',
    '٣': '3',
    '٤': '4',
    '٥': '5',
    '٦': '6',
    '٧': '7',
    '٨': '8',
    '٩': '9',
    // symbols
    '“': '"',
    '”': '"',
    '‘': '\'',
    '’': '\'',
    '∂': 'd',
    'ƒ': 'f',
    '™': '(TM)',
    '©': '(C)',
    'œ': 'oe',
    'Œ': 'OE',
    '®': '(R)',
    '†': '+',
    '℠': '(SM)',
    '…': '...',
    '˚': 'o',
    'º': 'o',
    'ª': 'a',
    '•': '*',
    // currency
    '$': 'USD',
    '€': 'EUR',
    '₢': 'BRN',
    '₣': 'FRF',
    '£': 'GBP',
    '₤': 'ITL',
    '₦': 'NGN',
    '₧': 'ESP',
    '₩': 'KRW',
    '₪': 'ILS',
    '₫': 'VND',
    '₭': 'LAK',
    '₮': 'MNT',
    '₯': 'GRD',
    '₱': 'ARS',
    '₲': 'PYG',
    '₳': 'ARA',
    '₴': 'UAH',
    '₵': 'GHS',
    '¢': 'cent',
    '¥': 'CNY',
    '元': 'CNY',
    '円': 'YEN',
    '﷼': 'IRR',
    '₠': 'EWE',
    '฿': 'THB',
    '₨': 'INR',
    '₹': 'INR',
    '₰': 'PF'
  };

  const rxAstralRange = /&nbsp;|\ud83c[\udffb-\udfff](?=\ud83c[\udffb-\udfff])|(?:[^\ud800-\udfff][\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]?|[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?(?:\u200d(?:[^\ud800-\udfff]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?)*/g;

  function length(str) {
    const match = str.match(rxAstralRange);
    return (match === null) ? 0 : match.length;
  }

  function substring(str, begin, end) {
    return str.match(rxAstralRange).slice(begin, end).join('')
  }

  function slugify(str) {
    return str
      .toLowerCase()
      .split('')
      .map(char => charMap[char] || char)
      .join('')
      .replace(' ', '-')
      .replace(/[^-a-z0-9]{1,60}/, '');
  }

  var input = {
    setValue: function() {
      // interface, implement this in your class
    },

    getValue: function() {
      // interface, implement this in your class
    },

    setPlaceholder: function() {
      // interface, implement this in your class
    },

    removePlaceholder: function() {
      // interface, implement this in your class
    },

    setCarret: function() {
      // interface, implement this in your class
    },

    getCarret: function() {
      // interface, implement this in your class
    },

    resetCarret: function() {
      // interface, implement this in your class
    },

    addInput: function(opts) {
      this.debouncedUpdate = debounce(this.update, opts.debounce || 500);

      let isMeta = false;
      this._value = this.getValue();
      this.limit = opts.limit;
      this.events.click = on$1(this.el, 'click', e => e.stopPropagation());
      this.events.focus = on$1(this.input, 'focus', () => this.removeClass('input-message'));
      this.events.blur = on$1(this.input, 'blur', () => {
        isMeta = false;
        this.toggleClass('input-value', this.getValue() !== '');
        this.onKeyUp();
      });
      this.events.paste = on$1(this.input, 'paste', e => this.onPaste(e));
      this.events.keydown = on$1(this.input, 'keydown', e => {
        isMeta = e.altKey || e.ctrlKey || e.metaKey;
      });
      this.events.keyup = on$1(this.input, 'keyup', e => {
        if (isMeta || !e.keyCode) {
          return;
        }
        this.onKeyUp();
      });

      opts.placeholder && this.setPlaceholder(opts.placeholder);
      this.toggleClass('input-value', this._value !== '');
    },

    onKeyUp: function() {
      const pos = this.getCarret();
      const limit = this.limit;
      let val = this.transform(this.getValue(), true);
      let needUpdate = false;

      if (limit && length(val) > limit) {
        val = substring(val, 0, limit);
        needUpdate = true;
      }

      if (val !== this._value || needUpdate) {
        this._value = val;
        this.setValue(val);
        this.setCarret(pos);
        this.debouncedUpdate(val);
      }
    },

    onPaste: function(e) {
      const str = e.clipboardData.getData('text/plain');
      const pos = this.getCarret();
      document.execCommand('insertText', false, str);
      e.preventDefault();
      e.stopPropagation();

      setTimeout(() => {
        const val = this.transform(this.getValue());
        this.setValue(val);
        this.setCarret(pos + str.length);
        this.update(val);
      }, 100);
    },

    update: function(val, silent) {
      this.removeClass('error');
      !silent && this.onChange && this.onChange(val);
    },

    focus: function() {
      this.input.focus();
      this.resetCarret();
      return this;
    },

    blur: function() {
      this.input.blur();
      return this;
    },

    value: function(val, silent) {
      if (val === undefined) {
        return this.getValue();
      }

      const value = this.getValue();
      val = this.transform(val);

      if (val !== value) {
        this.setValue(val);
        if (silent) {
          this.toggleClass('input-value', val !== '');
        } else {
          this.update(val);
        }
      }
      return this;
    },

    on: function(...args) {
      return on$1.apply(null, [ this.input ].concat(args));
    },

    off: function(...args) {
      return off$1.apply(null, [ this.input ].concat(args));
    },

    removeInput: function() {
      this.removePlaceholder && this.removePlaceholder();
      this.removeClass('input-msg', 'input-value');

      const events = this.events;
      off$1(this.el, 'click', events.click);
      off$1(this.input, 'focus', events.focus);
      off$1(this.input, 'blur', events.blur);
      off$1(this.input, 'paste', events.paste);
      off$1(this.input, 'keydown', events.keydown);
      off$1(this.input, 'keyup', events.keyup);

      delete this.input;
      delete this.events;
    }
  };

  const rxGt = /&gt;/g;
  const rxNoTags = /<[^>]*>/ig;
  const rxMultipleSpaces = /\s{2,}/g;

  const transforms = {
    slugify,

    noHtml: str => str.replace(rxNoTags, ''),

    fix: str => str
      .replace(rxGt, '>')
      .replace(rxMultipleSpaces, ' '),

    trim: (str, stopper) => {
      if (stopper) {
        return str;
      }

      return str.trim();
    }
  };

  function apply(arr, fn, push) {
    const order = push ? 'push' : 'unshift';

    switch (typeof fn) {
      case 'string':
        arr[order](transforms[fn]);
        break;

      case 'function':
        arr[order](fn);
        break;

      case 'object':
        for (const prop in transforms) {
          if (fn[prop]) {
            arr[order](transforms[prop]);
          }
        }
        break;
    }
  }

  var transform = {
    unshiftTransform: function(fn) {
      apply(this.transforms, fn, false);
    },

    pushTransform: function(fn) {
      apply(this.transforms, fn, true);
    },

    transform: function(val, stopper) {
      if (!this.transforms.length) {
        return val;
      }

      const transforms = this.transforms;
      for (const i in transforms) {
        if (!val) {
          break;
        }

        val = transforms[i](val, stopper);
      }

      return val;
    }
  };

  const rxQuery$2 = /^\s*([>+~])?\s*([*\w-]+)?(?:#([\w-]+))?(?:\.([\w.-]+))?\s*/;

  function query$2(selector) {
    let f;
    const out = [];
    if (typeof selector === 'string') {
      while (selector) {
        f = selector.match(rxQuery$2);
        if (f[0] === '') {
          break;
        }

        out.push({
          rel: f[1],
          tag: (f[2] || '').toUpperCase(),
          id: f[3],
          classes: (f[4]) ? f[4].split('.') : undefined
        });
        selector = selector.substring(f[0].length);
      }
    }
    return out;
  }

  function create$2(selector, content) {
    const s = query$2(selector)[0];
    const tag = s.tag;
    if (!tag) {
      return null;
    }

    const el = document.createElement(tag);
    const id = s.id;
    if (id) {
      el.id = id;
    }

    const classes = s.classes;
    if (classes) {
      el.className = classes.join(' ');
    }

    if (content) {
      el.innerHTML = content;
    }

    return el;
  }

  function closest$2(el, selector) {
    while (!el.matches(selector) && (el = el.parentElement));
    return el;
  }

  function on$2(el, event, selector, handler, options) {
    if (typeof selector !== 'string') {
      handler = selector;
      selector = undefined;
    }

    if (!selector) {
      el.addEventListener(event, handler, options);
      return handler;
    }

    return on$2(el, event, e => {
      const target = closest$2(e.target, selector);
      if (target) {
        handler.call(target, e);
      }
    }, options);
  }

  function off$2(el, event, handler, options) {
    el.removeEventListener(event, handler, options);
    return handler;
  }

  function addClass$2(el, ...cls) {
    return el.classList.add(...cls);
  }

  function removeClass$2(el, ...cls) {
    return el.classList.remove(...cls);
  }

  function addDelayRemoveClass$2(el, cls, delay) {
    addClass$2(el, cls);
    return setTimeout(() => removeClass$2(el, cls), delay);
  }

  function remove$2(el) {
    return el.parentNode.removeChild(el);
  }

  var field = {
    setValue: function(val) {
      this.input.value = val;
    },

    getValue: function() {
      return this.input.value;
    },

    render: function(opts) {
      return create$2('label.input', `
      <input
        type="${opts.type || 'text'}"
        ${(opts.name ? `name="${opts.name}" ` : '')}
        ${(opts.value ? `value="${opts.value}" ` : '')}
      >
      <span>${opts.title}</span>
      <em></em>`
      );
    },

    addField: function(opts) {
      this.el = opts.el || this.render(opts);
      this.input = this.find('input').item(0);
      this.elMessage = this.find('em').item(0);
    },

    removeField: function() {
      clearTimeout(this.errorTimeout);
      remove$2(this.el);
      delete this.el;
      delete this.elMessage;
    },

    getCarret: function() {
      return this.input.selectionEnd;
    },

    setCarret: function(pos) {
      this.input.setSelectionRange(pos, pos);
    },

    resetCarret: function(toBegin) {
      this.input.focus();
      const pos = toBegin ? 0 : this.input.value.length;
      this.input.setSelectionRange(pos, pos);
    },

    error: function(msg) {
      if (msg) {
        this.addClass('input-message');
        this.elMessage.textContent = msg;
      }

      this.errorTimeout = addDelayRemoveClass$2(this.el, 'error', 600);
    },

    active: function(state) {
      this.input.disabled = !state;
    }
  };

  let activePop;

  var pop = {
    addPop: function(opts) {
      this.pop = opts.pop;
      this.pop.onChange = value => this.onPopChange(value);

      this.elPop = create$2(`div.input-pop.input-pop-${opts.popDirection || 'down'}`);
      this.elPop.appendChild(opts.pop.el);
      this.el.appendChild(this.elPop);
      this.events.popFocus = on$2(this.input, 'focus', () => this.show());
      this.events.popDocumentClick = on$2(document, 'click', () => this.hide());
    },

    removePop: function() {
      off$2(this.input, 'focus', this.events.popFocus);
      off$2(document, 'click', this.events.popDocumentClick);
      this.pop.remove();
      delete this.pop;
      delete this.elPop;
    },

    show: function() {
      if (this.popActive) {
        return;
      }

      activePop && activePop.hide();
      activePop = this.addClass('input-pop-active');
      this.popActive = true;
      return this;
    },

    hide: function() {
      if (!this.popActive) {
        return;
      }

      this.popActive = false;
      this.removeClass('input-pop-active');
      activePop = undefined;
    },

    toggle: function() {
      this[this.popActive ? 'hide' : 'show']();
    },

    onChange: function(str) {
      const currentValue = this.pop.toString();

      if (str === currentValue) {
        return;
      }

      try {
        this.pop.value(str);
      } catch (e) {
        this.error(e);
      }
    },

    onPopChange: function() {
      this.setValue(this.pop.toString());
      this.toggleClass('input-value', !!this.getValue());
      this.onKeyUp();
      this.onValueChange(this.pop.value());
    }
  };

  function compose$1(...args) {
    let newObject = true;

    if (args[args.length - 1] === true) {
      args.pop();
      newObject = false;
    }

    newObject && args.unshift({});
    return Object.assign.apply(Object, args);
  }

  const rxQuery$3 = /^\s*([>+~])?\s*([*\w-]+)?(?:#([\w-]+))?(?:\.([\w.-]+))?\s*/;
  const rxClassOnly$3 = /^\.([-\w]+)$/;
  const rxIdOnly$3 = /^#([-\w]+)$/;

  function get$3(selector, root = document) {
    const id = selector.match(rxIdOnly$3);
    if (id) {
      return document.getElementById(id[1]);
    }

    const className = selector.match(rxClassOnly$3);
    if (className) {
      return root.getElementsByClassName(className[1]);
    }

    return root.querySelectorAll(selector);
  }

  function query$3(selector) {
    let f;
    const out = [];
    if (typeof selector === 'string') {
      while (selector) {
        f = selector.match(rxQuery$3);
        if (f[0] === '') {
          break;
        }

        out.push({
          rel: f[1],
          tag: (f[2] || '').toUpperCase(),
          id: f[3],
          classes: (f[4]) ? f[4].split('.') : undefined
        });
        selector = selector.substring(f[0].length);
      }
    }
    return out;
  }

  function createNs$3(namespaceURI, selector) {
    const s = query$3(selector)[0];
    const tag = s.tag;
    if (!tag) {
      return null;
    }

    const el = document.createElementNs(namespaceURI, tag);
    const id = s.id;
    if (id) {
      el.id = id;
    }

    const classes = s.classes;
    if (classes) {
      el.className = classes.join(' ');
    }

    return el;
  }

  function create$3(selector, content) {
    const s = query$3(selector)[0];
    const tag = s.tag;
    if (!tag) {
      return null;
    }

    const el = document.createElement(tag);
    const id = s.id;
    if (id) {
      el.id = id;
    }

    const classes = s.classes;
    if (classes) {
      el.className = classes.join(' ');
    }

    if (content) {
      el.innerHTML = content;
    }

    return el;
  }

  function closest$3(el, selector) {
    while (!el.matches(selector) && (el = el.parentElement));
    return el;
  }

  function attr$3(el, name, value) {
    if (value === undefined) {
      return el.getAttribute(name);
    }

    el.setAttribute(name, value);
  }

  function append$3(parent, el) {
    parent.appendChild(el);
    return parent;
  }

  function prepend$3(parent, el) {
    parent.insertBefore(el, parent.firstChild);
    return parent;
  }

  function appendTo$3(el, parent) {
    parent.appendChild(el);
    return el;
  }

  function prependTo$3(el, parent) {
    parent.insertBefore(el, parent.firstChild);
    return el;
  }

  function ready$3(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function on$3(el, event, selector, handler, options) {
    if (typeof selector !== 'string') {
      handler = selector;
      selector = undefined;
    }

    if (!selector) {
      el.addEventListener(event, handler, options);
      return handler;
    }

    return on$3(el, event, e => {
      const target = closest$3(e.target, selector);
      if (target) {
        handler.call(target, e);
      }
    }, options);
  }

  function off$3(el, event, handler, options) {
    el.removeEventListener(event, handler, options);
    return handler;
  }

  function once$3(el, event, handler, options) {
    const _handler = (...args) => {
      handler(...args);
      off$3(el, event, handler);
    };

    el.addEventListener(event, handler, options);
    return _handler;
  }

  function addClass$3(el, ...cls) {
    return el.classList.add(...cls);
  }

  function removeClass$3(el, ...cls) {
    return el.classList.remove(...cls);
  }

  function toggleClass$3(el, cls, force) {
    return el.classList.toggle(cls, force);
  }

  function addDelayRemoveClass$3(el, cls, delay) {
    addClass$3(el, cls);
    return setTimeout(() => removeClass$3(el, cls), delay);
  }

  function replaceClass$3(el, rx, newClass) {
    const newClasses = [];
    attr$3(el, 'class').split(' ').forEach(function(cls) {
      const c = rx.test(cls) ? newClass : cls;

      if (newClasses.indexOf(c) === -1) {
        newClasses.push(c);
      }
    });

    attr$3(el, 'class', newClasses.join(' '));
    return newClasses.length;
  }

  function insertBefore$3(el, node) {
    return node.parentNode.insertBefore(el, node);
  }

  function insertAfter$3(el, node) {
    return node.parentNode.insertBefore(el, node.nextSibling);
  }

  function remove$3(el) {
    return el.parentNode.removeChild(el);
  }

  var dom$1 = /*#__PURE__*/Object.freeze({
    get: get$3,
    query: query$3,
    createNs: createNs$3,
    create: create$3,
    closest: closest$3,
    attr: attr$3,
    append: append$3,
    prepend: prepend$3,
    appendTo: appendTo$3,
    prependTo: prependTo$3,
    ready: ready$3,
    on: on$3,
    off: off$3,
    once: once$3,
    addClass: addClass$3,
    removeClass: removeClass$3,
    toggleClass: toggleClass$3,
    addDelayRemoveClass: addDelayRemoveClass$3,
    replaceClass: replaceClass$3,
    insertBefore: insertBefore$3,
    insertAfter: insertAfter$3,
    remove: remove$3
  });

  /*eslint-disable strict */

  const html$1 = [
    'addClass',
    'removeClass',
    'toggleClass',
    'replaceClass',
    'appendTo',
    'prependTo',
    'insertBefore',
    'insertAfter'
  ].reduce((obj, method) => {
    obj[method] = function(...args) {
      dom$1[method].apply(null, [ this.el ].concat(args));
      return this;
    };
    return obj;
  }, {});

  html$1.attr = function(name, value) {
    if (value === undefined) {
      return this.el.getAttribute(name);
    }

    this.el.setAttribute(name, value);
    return this
  };

  html$1.find = function(selector) {
    return get$3(selector, this.el);
  };

  function toCamelCase$1(str) {
    return str.replace(/[-_](\w)/g, (matches, letter) => letter.toUpperCase());
  }

  const SHOW_YEARS = 25;
  const START_YEAR = (function() {
    const year = new Date().getFullYear();
    return Math.floor(year - (SHOW_YEARS - 1) / 2);
  })();

  function getStartYear(year) {
    if (year === START_YEAR) {
      return START_YEAR;
    }

    if (year > START_YEAR && year < START_YEAR + SHOW_YEARS) {
      return START_YEAR;
    }

    return START_YEAR + Math.floor((year - START_YEAR) / SHOW_YEARS) * SHOW_YEARS;
  }

  const DAYS_IN_MONTH = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
  function daysInMonth(year, month) {
    if (month === 1 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {
      return 29;
    }
    return DAYS_IN_MONTH[month];
  }

  function prevMonth({ year, month }) {
    if (month === 0) {
      return {
        year: year - 1,
        month: 11
      }
    }

    return {
      year: year,
      month: month - 1
    }
  }

  function nextMonth({ year, month }) {
    if (month === 11) {
      return {
        year: year + 1,
        month: 0
      }
    }

    return {
      year: year,
      month: month + 1
    }
  }

  function prevYear({ year, month }) {
    return {
      year: year - 1,
      month
    }
  }

  function nextYear({ year, month }) {
    return {
      year: year + 1,
      month
    }
  }

  function prevYears({ year, month }) {
    return {
      year: year - SHOW_YEARS,
      month
    }
  }

  function nextYears({ year, month }) {
    return {
      year: year + SHOW_YEARS,
      month
    }
  }

  function isValidDate(date) {
    return date instanceof Date && !isNaN(date);
  }

  var defaultLocale = {
    code: 'en-US',
    weekStarts: 0, /*Sunday*/
    months: {
      narrow: [ 'J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D' ],
      abbreviated: [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
      wide: [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]
    },
    days: {
      narrow: [ 'S', 'M', 'T', 'W', 'T', 'F', 'S' ],
      short: [ 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa' ],
      abbreviated: [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ],
      wide: [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ]
    }
  };

  function parseDecimal(str) {
    return parseInt(str, 10);
  }

  const MODES = [ 'days', 'months', 'years' ];
  function getNextMode(mode) {
    const nextIndex = MODES.indexOf(mode) + 1;
    if (nextIndex === MODES.length) {
      return MODES[0];
    }

    return MODES[nextIndex];
  }

  const Calendar = function(opts) {
    this.locale = opts.locale || defaultLocale;
    this.weekStarts = opts.weekStarts === undefined ? this.locale.weekStarts : opts.weekStarts;
    this.flip = opts.flip;
    this.onChange = opts.onChange;
    this.el = this.render(opts);
    this.events = {};
    this.init();

    this.value(opts.value || new Date(), true);
    this.addListeners();
    this.setMode(opts.mode || 'days');
  };

  Calendar.prototype = compose$1(
    html$1,
    {
      init: function() {
        this.elMode = this.find('.calendar-mode').item(0);
        this.elDisplay = this.find('.calendar-display').item(0);
      },

      addListeners: function() {
        this.events.onClick = on$3(this.el, 'click', e => e.stopPropagation());
        const self = this;
        this.events.onAClick = on$3(this.el, 'click', 'a', function(e) {
          e.preventDefault();
          const parts = this.hash.split('/');
          self[toCamelCase$1(parts[1])].apply(self, parts.slice(2).map(parseDecimal));
        });
      },

      removeListeneres: function() {
        off$3(this.el, 'click', this.events.onClick);
        off$3(this.el, 'click', this.events.onAClick);
      },

      render: function({ back, forward }) {
        const header = `<nav class="calendar-header">
        <a class="calendar-button calendar-back" href="#/back" title="Back">${back || '<'}</a>
        <a class="calendar-mode" href="#/set-mode"></a>
        <a class="calendar-button calendar-forward" href="#/forward" title="Forward">${forward || '>'}</a>
      </nav>`;

        let html = '<div class="calendar-display"></div>';
        if (this.flip) {
          html += header;
        } else {
          html = header + html;
        }

        return create$3(`div.calendar${this.flip ? '.calendar-flip' : ''}`, html);
      },

      back: function() {
        const display = this.state.display;

        switch (this.mode) {
          case 'days':
            this.state.display = prevMonth(display);
            break;
          case 'months':
            this.state.display = prevYear(display);
            break;
          case 'years':
            this.state.display = prevYears(display);
            break;
        }

        this[toCamelCase$1(`show-${this.mode}`)]();
      },

      forward: function() {
        const display = this.state.display;

        switch (this.mode) {
          case 'days':
            this.state.display = nextMonth(display);
            break;
          case 'months':
            this.state.display = nextYear(display);
            break;
          case 'years':
            this.state.display = nextYears(display);
            break;
        }

        this[toCamelCase$1(`show-${this.mode}`)]();
      },

      setMode: function(mode, force) {
        if (mode === this.mode && !force) {
          return;
        }

        if (mode === undefined) {
          mode = getNextMode(this.mode);
        }

        this.mode = mode;
        this[toCamelCase$1(`show-${mode}`)]();
      },

      select: function(year = this.state.selected.year, month = this.state.selected.month, day = this.state.selected.day) {
        this.value(new Date(year, month, day));
      },

      setTitle: function({ year, month, yearRange }) {
        const localeMonths = this.locale.months.wide;
        this.elMode.innerHTML = yearRange ? yearRange.join(' &ndash; ') :
          `${month === undefined ? '' : `${localeMonths[month]} `}${year}`;
      },

      showDays: function() {
        this.setTitle(this.state.display);
        const { year, month } = this.state.display;
        const firstDay = new Date(year, month, 1).getDay();
        const startingDay = this.weekStarts === 1 ? (firstDay === 0 ? 6 : firstDay - 1) : firstDay;
        const days = daysInMonth(year, month);

        let day = 1;
        let html = '<ul class="calendar-days">';

        for (let i = 0; i < 9; i++) {
          for (let j = 0; j <= 6; j++) {
            if (day <= days && ((j >= startingDay && i === 0) || i > 0)) {
              html += `<li class="${this.isDayActive(day) ? 'calendar-current' : ''}"><a href="#/select/${year}/${month}/${day}">${day}</a></li>`;
              day++;
            } else if (day > days) {
              break;
            } else {
              html += '<li></li>';
            }
          }

          if (day > days) {
            break;
          }
        }

        html += '</ul>';
        this.elDisplay.innerHTML = html;
      },

      showMonths: function() {
        const localeMonths = this.locale.months.abbreviated;
        const { year } = this.state.display;
        this.setTitle({ year });

        let html = '<ul class="calendar-months">';
        for (let month = 0; month < 12; month++) {
          html += `<li class="${this.isMonthActive(month) ? 'calendar-current' : ''}"><a href="#/select/${year}/${month}">${localeMonths[month]}</a></li>`;
        }

        html += '</ul>';
        this.elDisplay.innerHTML = html;
      },

      showYears: function() {
        let year = getStartYear(this.state.display.year);
        const lastYear = year + SHOW_YEARS;
        this.setTitle({ yearRange: [ year, lastYear - 1 ] });

        let html = '<ul class="calendar-years">';
        for (; year < lastYear; year++) {
          html += `<li class="${this.isYearActive(year) ? 'calendar-current' : ''}"><a href="#/select/${year}">${year}</a></li>`;
        }

        html += '</ul>';
        this.elDisplay.innerHTML = html;
      },

      isDayActive: function(day) {
        const { selected, display } = this.state;
        return day === selected.day && display.month === selected.month && display.year === selected.year;
      },

      isMonthActive: function(month) {
        const { selected, display } = this.state;
        return month === selected.month && display.year === selected.year;
      },

      isYearActive: function(year) {
        return year === this.state.selected.year;
      },

      parse: function(value) {
        const date = new Date(value);
        if (isValidDate(date)) {
          return date;
        }

        throw date;
      },

      toString: function() {
        return this.state.date.toLocaleDateString(this.locale.code);
      },

      value: function(value, silent) {
        if (value === undefined) {
          return this.state.date;
        }

        const date = value instanceof Date ? value : this.parse(value);
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        this.state = {
          date,
          display: { year, month, day },
          selected: { year, month, day }
        };

        if (this.mode === 'years') {
          this.setMode('months', true);
        } else {
          this.setMode('days', true);
          !silent && this.onChange(this.state.date);
        }

        return this;
      },

      remove: function() {
        this.removeListeneres();
        delete this.elDisplay;
        remove$3(this.el);
        delete this.el;
      }
    }
  );

  const InputDate = function(opts) {
    this.onValueChange = opts.onChange;

    this.events = {};
    this.addField({
      name: opts.name,
      title: opts.title
    });
    this.addPop({
      pop: new Calendar({
        locale: opts.locale,
        back: opts.back,
        forward: opts.forward
      }),
      direction: opts.direction
    });

    if (opts.value) {
      this.pop.value(opts.value, true);
      this.setValue(this.pop.toString());
    }

    this.addInput(opts);
    this.transforms = [];
  };

  InputDate.prototype = compose(
    html,
    transform,
    input,
    field,
    pop,
    {
      remove: function() {
        this.removePop();
        this.removeInput();
        this.removeField();
      }
    }
  );

  ready(() => {
    const elDisplay = get('#display');

    const input = new InputDate({
      title: 'date field',
      // value: 1446440400000,
      onChange: val => {
        console.log('new value', val);
        if (val === 'error') {
          input.error('Oops!');
        }
      }
    }).appendTo(elDisplay);

    // setTimeout(() => input.remove(), 5000);
  });

}());
