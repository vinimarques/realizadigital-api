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
    const regex = /(<([^>]+)>)/ig;
    const data = _.pick(req.body, ['first_name', 'last_name', 'email', 'age', 'address', 'cep', 'cpf', 'password']);

    validator.validate(data);

    if (validator.hasErrors()) throw validator.getErrors();

    data.first_name = data.first_name.replace(regex,'');
    data.last_name = data.last_name.replace(regex,'');

    return Users.insert(data)
      .then(result => {
        return Users.details(result.insertId);
      })
      .catch(error => {
        throw ApiError.uniqueEmail(error);
      });
  }
));

router.post('/alter', Resolve.send(
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
    const regex = /(<([^>]+)>)/ig;
    const data = _.pick(req.body, ['first_name', 'last_name', 'email', 'age', 'address', 'cep', 'cpf', 'password']);

    validator.validate(data);

    if (validator.hasErrors()) throw validator.getErrors();

    data.first_name = data.first_name.replace(regex,'');
    data.last_name = data.last_name.replace(regex,'');

    return Users.alter(data, data.email, data.password)
      .then(result => {
        return Users.getUserByAuthentication(data.email, data.password);
      })
      .catch(error => {
        throw {error};
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

router.get('/feeds/:id', Auth.middleware(false), Resolve.send(
  function (req) {
    return Posts.listFeed(req.params.id)
      .then(result => {
        return Promise.props({
          posts: result
        });
      });
  }
));

router.post('/feed', Auth.middleware(true), Resolve.send(
  function (req) {
    const validator = new Validator([
      {field: 'text', type: 'String', required: true}
    ]);

    const data = _.pick(req.body, ['text']);
    const regex = /(<([^>]+)>)/ig;

    validator.validate(data);

    if (validator.hasErrors()) throw validator.getErrors();

    data.user_id = req.user.id;

    data.text = data.text.replace(regex,'');

    return Posts.insert(data)
      .then(result => {
        return Promise.props({
          post: Posts.details(result.insertId),
          user: Users.details(req.user.id)
        });
      });
  }
));

router.post('/like/:post_id', Auth.middleware(true), Resolve.send(
  function (req) {
    console.log(req);
    const post_id = req.params.post_id;
    const user_id = req.user.id;

    return Likes.insert({post_id, user_id})
      .then(() => Posts.details(post_id))
      .catch(() => {
        throw ApiError.postNotFound();
      });
  }
));

router.post('/unlike/:post_id', Auth.middleware(true), Resolve.send(
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
