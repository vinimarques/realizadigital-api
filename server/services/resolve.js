
const Promise = require('bluebird');
const _ = require('lodash');

class Resolve {

  static send(controller) {
    return function (req, res, next) {
      Promise.try(() => controller(req))
        .then(data => {
          res.status(200).send(data);
        })
        .catch(error => {
          if (!error.statusCode) console.error(error);
          res.status(error.statusCode || 500).send({error: error.data || error});
        })
        .then(next);
    }
  }
}

module.exports = Resolve;