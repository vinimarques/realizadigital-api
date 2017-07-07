const express = require('express');
const router = express.Router();
const Auth = require('../services/auth');
const Resolve = require('../services/resolve');
const Validator = require('../services/validator');
const _ = require('lodash');
const ApiError = require('../services/error');
const Users = require('../models/users');
const Posts = require('../models/posts');
const Likes = require('../models/likes');
const Promise = require('bluebird');

router.post('/login', Auth.middleware(false), Resolve.send(
  function (req) {
    return req.user;
  }
));

router.post('/register', Resolve.send(
  function (req) {
    const validator = new Validator([
      {field: 'first_name', type: 'String', required: true},
      {field: 'last_name', type: 'String', required: true},
      {field: 'email', type: 'String', required: true},
      {field: 'age', type: 'String', required: true},
      {field: 'address', type: 'String', required: true},
      {field: 'cep', type: 'String', required: true},
      {field: 'cpf', type: 'String', required: true},
      {field: 'password', type: 'String', required: true},
    ]);

    const data = _.pick(req.body, ['first_name', 'last_name', 'email', 'age', 'address', 'cep', 'cpf', 'password']);

    validator.validate(data);

    if (validator.hasErrors()) throw validator.getErrors();

    return Users.insert(data)
      .then(result => {
        return Users.details(result.insertId);
      })
      .catch(error => {
        throw ApiError.uniqueEmail(error);
      });
  }
));

router.get('/user/:id', Auth.middleware(false), Resolve.send(
  function (req) {
    return Promise.props({
      user: Users.details(req.params.id),
      feed: Posts.listUserFeed(req.params.id, _.get(req, 'query.user'))
    });
  }
));

router.post('/feed', Auth.middleware(true), Resolve.send(
  function (req) {
    const validator = new Validator([
      {field: 'text', type: 'String', required: true}
    ]);

    const data = _.pick(req.body, ['text']);

    validator.validate(data);

    if (validator.hasErrors()) throw validator.getErrors();

    data.user_id = req.user.id;

    return Posts.insert(data)
      .then(result => {
        return Promise.props({
          post: Posts.details(result.insertId),
          user: Users.details(req.user.id)
        });
      });
  }
));

router.get('/like/:post_id', Auth.middleware(true), Resolve.send(
  function (req) {
    const post_id = req.params.post_id;
    const user_id = req.user.id;

    return Likes.insert({post_id, user_id})
      .then(() => Posts.details(post_id))
      .catch(() => {
        throw ApiError.postNotFound();
      });
  }
));

router.get('/unlike/:post_id', Auth.middleware(true), Resolve.send(
  function (req) {
    const post_id = req.params.post_id;
    const user_id = req.user.id;

    return Likes.remove({post_id, user_id})
      .then(() => Posts.details(post_id))
      .catch(() => {
        throw ApiError.postNotFound();
      });
  }
));

module.exports = router;