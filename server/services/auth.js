
const Users = require('../models/users');
const ApiError = require('./error');
const Resolve = require('./resolve');

class Auth {

  static middleware(required) {
    return function(req, res, next) {

      const password = req.body.password || req.query.password;
      const email = req.body.email || req.query.email;

      if (password && email) {
        return Users.getUserByAuthentication(email, password)
          .then(user => {
            req.user = user;
            next();
          })
          .catch(() => {
            const error = ApiError.userNotFound();
            res.status(error.statusCode).send({error: error.data});
          })
      }

      if (required) {
        const error = ApiError.userRequired();
        return res.status(error.statusCode).send({error: error.data});
      }

      next();
    }
  }
}

module.exports = Auth;