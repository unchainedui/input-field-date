import { ready, get } from 'uc-dom'
import Input from './index'

ready(() => {
  const elDisplay = get('#display')

  const input = new Input({
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
