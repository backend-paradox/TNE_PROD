class ApiResponse {
  constructor(statusCode, data, message = 'Success', meta = {}) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;

    if (Object.keys(meta).length > 0) {
      this.meta = meta;
    }
  }

  static success(data, message = 'Success', meta = {}) {
    return new ApiResponse(200, data, message, meta);
  }

  static created(data, message = 'Resource created successfully', meta = {}) {
    return new ApiResponse(201, data, message, meta);
  }

  static noContent(message = 'No content') {
    return new ApiResponse(204, null, message);
  }

  send(res) {
    const response = {
      success: this.success,
      message: this.message,
    };

    if (this.data !== null && this.data !== undefined) {
      response.data = this.data;
    }

    if (this.meta) {
      response.meta = this.meta;
    }

    return res.status(this.statusCode).json(response);
  }
}

module.exports = ApiResponse;
