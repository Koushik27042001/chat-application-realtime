/**
 * Standard API response format for consistency across all endpoints.
 */
class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.status = statusCode < 400 ? "success" : "error";
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

module.exports = ApiResponse;
