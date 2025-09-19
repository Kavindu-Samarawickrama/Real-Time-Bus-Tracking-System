const successResponse = (
  data = null,
  message = "Success",
  statusCode = 200,
  meta = null
) => {
  const response = {
    success: true,
    status: statusCode,
    message,
    timestamp: new Date().toISOString(),
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta) {
    response.meta = meta;
  }

  return response;
};

const errorResponse = (
  message = "Internal Server Error",
  statusCode = 500,
  errors = null,
  stack = null
) => {
  const response = {
    success: false,
    status: statusCode,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errors) {
    response.errors = errors;
  }

  if (stack && process.env.NODE_ENV === "development") {
    response.stack = stack;
  }

  return response;
};

const paginationMeta = (
  currentPage,
  totalPages,
  totalItems,
  limit,
  hasNext,
  hasPrev
) => {
  return {
    pagination: {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNext,
      hasPrev,
    },
  };
};

module.exports = {
  successResponse,
  errorResponse,
  paginationMeta,
};
