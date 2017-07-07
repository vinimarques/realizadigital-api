
const Model = require('./model');

class Users extends Model {
  static getUserByAuthentication(email, password) {
    return Model.first(`SELECT id, first_name, last_name, email, age, address, cep, cpf FROM users WHERE email = ? AND password = ?`, [email, password]);
  }

  static insert(data) {
    return Model.insert(data, 'users');
  }

  static details(id) {
    return Model.first(`SELECT id, first_name, last_name, email, age, address, cep, cpf FROM users WHERE id = ?`, [id]);
  }
}

module.exports = Users;