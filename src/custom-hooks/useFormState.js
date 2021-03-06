import { useReducer, useState } from 'react';

const CHECKBOX = 'checkbox';
const COLOR = 'color';
const DATE = 'date';
const EMAIL = 'email';
const MONTH = 'month';
const NUMBER = 'number';
const PASSWORD = 'password';
const RADIO = 'radio';
const RANGE = 'range';
const SEARCH = 'search';
const SELECT = 'select';
const SELECT_MULTIPLE = 'selectMultiple';
const TEL = 'tel';
const TEXT = 'text';
const TEXTAREA = 'textarea';
const TIME = 'time';
const URL = 'url';
const WEEK = 'week';

const TYPES = [
  CHECKBOX,
  COLOR,
  DATE,
  EMAIL,
  MONTH,
  NUMBER,
  PASSWORD,
  RADIO,
  RANGE,
  SEARCH,
  SELECT,
  SELECT_MULTIPLE,
  TEL,
  TEXT,
  TEXTAREA,
  TIME,
  URL,
  WEEK,
];

const toString = value => {
  switch (typeof value) {
    case 'function':
    case 'symbol':
    case 'undefined':
      return '';
    default:
      return '' + value; // eslint-disable-line prefer-template
  }
};

const stateReducer = (state, newState) => ({ ...state, ...newState });
const noop = () => {};

const defaultFromOptions = {
  onChange: noop,
  onBlur: noop,
  onTouched: noop,
};

export default function useFormState(initialState, options) {
  const formOptions = { ...defaultFromOptions, ...options };

  const [state, setState] = useReducer(stateReducer, initialState || {});
  const [touched, setTouchedState] = useReducer(stateReducer, {});
  const initialErrors = formOptions.validate
    ? formOptions.validate(initialState || {})
    : {};
  const [errors, setErrors] = useState(initialErrors || {});

  const createPropsGetter = type => (name, ownValue) => {
    const hasOwnValue = !!toString(ownValue);
    const hasValueInState = state[name] !== undefined;
    const isCheckbox = type === CHECKBOX;
    const isRadio = type === RADIO;
    const isSelectMultiple = type === SELECT_MULTIPLE;

    const setInitialValue = () => {
      let value = '';
      if (isCheckbox) {
        /**
         * If a checkbox has a user-defined value, its value the form state
         * value will be an array. Otherwise it will be considered a toggle.
         */
        value = hasOwnValue ? [] : false;
      }
      if (isSelectMultiple) {
        value = [];
      }
      setState({ [name]: value });
    };

    const getNextCheckboxValue = e => {
      const { value, checked } = e.target;
      if (!hasOwnValue) {
        return checked;
      }
      const checkedValues = new Set(state[name]);
      if (checked) {
        checkedValues.add(value);
      } else {
        checkedValues.delete(value);
      }
      return Array.from(checkedValues);
    };

    const getNextSelectMultipleValue = e =>
      Array.from(e.target.options).reduce(
        (values, option) =>
          option.selected ? [...values, option.value] : values,
        []
      );

    const inputProps = {
      name,
      get type() {
        return [SELECT, SELECT_MULTIPLE, TEXTAREA].includes(type)
          ? undefined
          : type;
      },
      get multiple() {
        return type === SELECT_MULTIPLE ? true : undefined;
      },
      get checked() {
        if (isRadio) {
          return state[name] === toString(ownValue);
        }
        if (isCheckbox) {
          if (!hasOwnValue) {
            return state[name] || false;
          }
          /**
           * @todo Handle the case where two checkbox inputs share the same
           * name, but one has a value, the other doesn't (throws currently).
           * <input {...input.checkbox('option1')} />
           * <input {...input.checkbox('option1', 'value_of_option1')} />
           */
          return hasValueInState
            ? state[name].includes(toString(ownValue))
            : false;
        }
        return undefined;
      },
      get value() {
        // auto populating initial state values on first render
        if (!hasValueInState) {
          setInitialValue();
        }
        /**
         * Since checkbox and radio inputs have their own user-defined values,
         * and since checkbox inputs can be either an array or a boolean,
         * returning the value of input from the current form state is illogical
         */
        if (isCheckbox || isRadio) {
          return toString(ownValue);
        }
        return hasValueInState ? state[name] : '';
      },
      async onChange(e) {
        let { value } = e.target;
        if (isCheckbox) {
          value = getNextCheckboxValue(e);
        }
        if (isSelectMultiple) {
          value = getNextSelectMultipleValue(e);
        }

        const partialNewState = { [name]: value };
        const newState = { ...state, ...partialNewState };

        formOptions.onChange(e, state, newState);

        setState(partialNewState);
        if (formOptions.validate) {
          const newErrors = await formOptions.validate(newState);
          setErrors(newErrors || {});
        }
      },
      onBlur(e) {
        if (!touched[name]) {
          formOptions.onTouched(e);
        }
        formOptions.onBlur(e);
        setTouchedState({ [name]: true });
      },
    };

    return inputProps;
  };

  const inputPropsCreators = TYPES.reduce(
    (methods, type) => ({ ...methods, [type]: createPropsGetter(type) }),
    {}
  );

  return [{ values: state, errors, touched }, inputPropsCreators];
}
