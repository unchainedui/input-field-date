import compose from 'uc-compose';
import html from 'uc-dom/methods';
import input from 'uc-input';
import transform from 'uc-input/transform';
import field from 'uc-input-field/field';
import pop from 'uc-input-field/pop';
import Calendar from 'uc-calendar';

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
}

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

export default InputDate;
