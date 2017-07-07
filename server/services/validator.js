'use strict';

const _ = require('lodash');
const ApiError = require('./error');

const parseMap = {
  String: {
    parse: _.toString,
    test: _.isString,
    empty: _.isEmpty
  },
  Integer: {
    parse: _.toInteger,
    test: _.isInteger,
    empty: data => _.isNil(data) || _.isNaN(data)
  },
  Number: {
    parse: _.toNumber,
    test: _.isNumber,
    empty: data => _.isNil(data) || _.isNaN(data)
  },
  Boolean: {
    test: _.isBoolean,
    empty: _.isNil
  },
  Array: {
    test: _.isArray,
    empty: data => _.isNil(data) || _.isEmpty(data)
  },
  Object: {
    test: _.isObject,
    empty: data => _.isNil(data) || _.isEmpty(data)
  }
};

class Validator {

  constructor(options) {
    this.errors = {};
    this.options = options;
  }

  validate(data) {
    this.options.map(options => {

      let parsed, error;

      if (_.isArray(options.props)) {
        if (_.isObject(data[options.field])) {
          const validator = new Validator(options.props);
          parsed = validator.validate(data[options.field]);
          error = validator.hasErrors() ? validator.getErrors(): null;
        } else if (options.required) {
          error = 'é obrigatório';
        }
      } else {
        const validation = Validator._validate(options, data[options.field]);
        parsed = validation.parsed;
        error = validation.error;
      }

      if (error) {
        this.errors[options.field] = this.errors[options.field] || [];
        this.errors[options.field].push(error);
      }

      data[options.field] = parsed;
    });

    return data;
  }

  static _validate(options, data) {
    const validation = {};

    if (options.type) options = _.defaults(options, parseMap[options.type]);

    if (_.isNil(data)) data = options.default;
    if (options.parse) data = options.parse(data);

    validation.parsed = data;

    if (options.required && ((options.empty && options.empty(data)) || _.isNil(data))) {
      validation.error = 'é obrigatório';
    } else if (options.test && !_.isNil(data) && !options.test(data)) {
      validation.error = 'não está no formato correto';
    }

    return validation;
  }

  getErrors() {
    const errors = ApiError.validation(this.errors);
    this.errors = {};
    return errors;
  }

  hasErrors() {
    return !_.isEmpty(this.errors);
  }
}

module.exports = Validator;