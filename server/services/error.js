

class ApiError extends Error {

  constructor(message, status, detail) {
    super(message);
    this.statusCode = status;
    this.message = message;
    this.data = {status,message,detail};
  }

  static userNotFound(detail) {
    return new ApiError('Nenhum usuário encontrado.', 430, detail);
  }

  static notFound(detail) {
    return new ApiError('Nenhuma linha encontrada', 431, detail);
  }

  static userRequired(detail) {
    return new ApiError('`email` e `password` são campos obrigatórios', 432, detail);
  }

  static uniqueEmail(detail) {
    return new ApiError('Já existe um usuário com este email', 433, detail);
  }

  static unique(detail) {
    return new ApiError('Há campos duplicados nesta request', 434, detail);
  }

  static validation(detail) {
    return new ApiError(`Há erros no formulário`, 435, detail);
  }

  static postNotFound(detail) {
    return new ApiError(`Post não encontrado`, 436, detail);
  }

  static unknown(detail) {
    return new ApiError(`Erro desconhecido`, 500, detail);
  }

  static alreadyLiked(details) {
    return new ApiError(`Você ja deu like neste post`, 437, details);
  }

  static notLikedYet(details) {
    return new ApiError(`Você ainda não deu like neste post`, 437, details);
  }

}

module.exports = ApiError;