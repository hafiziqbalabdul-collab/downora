/** Error yang aman ditampilkan ke klien. `key` menjadi field `status` pada respons. */
class AppError extends Error {
  constructor(httpStatus, code, message, key = "analysis_failed") {
    super(message);
    this.httpStatus = httpStatus;
    this.code = code;
    this.key = key;
  }
}
module.exports = { AppError };
