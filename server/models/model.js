
const Promise = require('bluebird');
const mysql = require('mysql');
const ApiError = require('../services/error');

Promise.promisifyAll(require('mysql/lib/Connection').prototype);
Promise.promisifyAll(require('mysql/lib/Pool').prototype);

class Model {

  static initialize(config) {
    Model.pool = mysql.createPool(config);
  }

  static getConn() {
    return Model.pool.getConnectionAsync();
  }

  static query(sql,params,options) {
    options = options || {};

    if (options.limit) sql = sql.match(/LIMIT +[0-9]+/i) ? sql.replace(/LIMIT +[0-9]+/i, `LIMIT ${options.limit}`) : (sql + ` LIMIT ${options.limit}`);

    return Model.getConn()
      .then(conn =>  {
        return conn.queryAsync({sql}, params)
          .finally(() => {
            conn.release();
          });
      })

  }

  static insert(data, table) {
    return Model.query(`INSERT INTO ${table} SET ?`, data)
      .catch(error => {
        throw ApiError.unique(error);
      })
  }

  static insertIgnore(data, table) {
    return Model.query(`INSERT IGNORE INTO ${table} SET ?`, data)
      .catch(error => {
        throw ApiError.unique(error);
      })
  }

  static first(sql, params) {
    return Model.query(sql, params, {limit:1})
      .then(result => {
        if (result[0]) return result[0];
        throw ApiError.notFound();
      });
  }

  static remove(where, table) {
    where = Object.keys(where).map(key => `${key}=${where[key]}`);
    return Model.query(`DELETE FROM ${table} WHERE ${where.join(' AND ')}`);
  }
}

module.exports = Model;