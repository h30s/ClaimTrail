// Errors services throw on purpose. Their messages are written for the desk,
// because the action wrapper shows them as they are.
export class AppError extends Error {
  constructor(
    message: string,
    readonly status: number = 500,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    readonly fieldErrors?: Record<string, string[] | undefined>,
  ) {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Your session has ended. Sign in again.") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You don't have permission to do that.") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}
