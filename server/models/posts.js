
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

  static listFeed(user_id) {
    return Model.query(`
      SELECT IFNULL((
         SELECT COUNT(user_id) FROM likes WHERE post_id = p.id AND user_id = 1
       ), 0) AS liked, p.*, u.* FROM posts p
       JOIN users u ON u.id =  p.user_id
       `, [user_id]);
  }

  static details(id) {
    return Model.first(`SELECT id, text, likes FROM posts WHERE id = ?`, [id]);
  }

  static insert(data) {
    return Model.insert(data, 'posts');
  }
}

module.exports = Posts;
