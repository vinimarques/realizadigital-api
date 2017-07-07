
const Model = require('./model');

class Likes extends Model {
  static insert(data) {
    return Model.insertIgnore(data, 'likes')
      .then(result => Model.query(`UPDATE posts SET likes = likes + ? WHERE id = ?`, [result.affectedRows, data.post_id]));
  }

  static remove(where) {
    return Model.remove(where, 'likes')
      .then(result => Model.query(`UPDATE posts SET likes = likes - ? WHERE id = ?`, [result.affectedRows, where.post_id]));
  }
}

module.exports = Likes;