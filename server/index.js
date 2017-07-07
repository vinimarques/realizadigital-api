'use strict';

const fs = require('fs');
const _ = require('lodash');
const express = require('express');
const server = express();
const bodyParser = require('body-parser')
const path = require('path');
const nodeenvconfiguration = require('node-env-configuration');

const Model = require('./models/model');
const Api = require('./controllers/api');

class App {

  constructor() {
    this.config = nodeenvconfiguration({
      defaults: this.config,
      prefix: 'app'
    });

    Model.initialize(this.config.database);

    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));

    server.use('/', Api);

    server.listen(this.config.port || 3000, () => {
      console.log(`server listening on port ${this.config.port || 3000}`);
    });
  }

}

global.app = new App();