import { NotFoundError } from "@core/shared/domain/errors/not-found.error";
import { EntityValidationError } from "@core/shared/domain/validators/validation.error";
import { Nack } from "@golevelup/nestjs-rabbitmq";
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  UnprocessableEntityException,
} from "@nestjs/common";

@Catch()
export class RabbitmqConsumeErrorFilter implements ExceptionFilter {
  static readonly NON_RETRYABLE_ERRORS = [
    NotFoundError,
    EntityValidationError,
    UnprocessableEntityException,
  ];

  catch(exception: Error, host: ArgumentsHost) {
    if (host.getType<"rmq">() !== "rmq") {
      return;
    }

    const hasNonRetryableError =
      RabbitmqConsumeErrorFilter.NON_RETRYABLE_ERRORS.some(
        (error) => exception instanceof error,
      );

    if (hasNonRetryableError) {
      return new Nack(false);
    }
  }
}
