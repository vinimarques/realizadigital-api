
const Model = require('./model');

class Users extends Model {
  static getUserByAuthentication(email, password) {
    return Model.first(`SELECT id, first_name, last_name, email, age, address, cep, cpf FROM users WHERE email = ? AND password = ?`, [email, password]);
  }

  static insert(data) {
    return Model.insert(data, 'users');
  }

  static alter(data, email, password) {
  	let _data = {
  		'first_name': data.first_name,
  		'last_name': data.last_name,
  		'age': data.age,
  		'address': data.address,
  		'cep': data.cep,
  		'cpf': data.cpf
  	};

    return Model.alter(_data, email, password, 'users');
  }

  static details(id) {
    return Model.first(`SELECT id, first_name, last_name, email, age, address, cep, cpf FROM users WHERE id = ?`, [id]);
  }
}

module.exports = Users;