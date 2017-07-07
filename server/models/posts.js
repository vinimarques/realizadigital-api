
const Model = require('./model');

class Posts extends Model {
  static listUserFeed(user_id, requester_id) {
    if (requester_id) {
      return Model.query(`
        SELECT p.* FROM posts p WHERE user_id = ?
      `, [user_id]);
    } else {
      return Model.query(`SELECT * FROM posts WHERE user_id = ?`, [user_id]);
    }
  }

  static details(id) {
    return Model.first(`SELECT id, text, likes FROM posts WHERE id = ?`, [id]);
  }

  static insert(data) {
    return Model.insert(data, 'posts');
  }
}

module.exports = Posts;