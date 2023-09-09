export type FieldsErrors = {
  [field: string]: string[];
};

export interface IValidatorFields<PropsValidated> {
  errors: FieldsErrors;
  validatedData: PropsValidated;
  validate(data: any): boolean;
}

export abstract class BaseValidationError extends Error {
  constructor(public error: FieldsErrors = {}, message = "Validation Error") {
    super(message);
  }
}

export class EntityValidationError extends BaseValidationError {
  constructor(public error: FieldsErrors) {
    super(error, "Entity Validation Error");
    this.name = "EntityValidationError";
  }
}
