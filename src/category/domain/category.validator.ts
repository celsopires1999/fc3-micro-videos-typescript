import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { ClassValidatorFields } from "../../shared/domain/validators/class-validator-fields";
import { Category, CategoryConstructorProps } from "./category.entity";

export class CategoryRules {
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsBoolean()
  @IsOptional()
  is_active: boolean;

  @IsDate()
  @IsOptional()
  created_at: Date;

  constructor({ name, description, is_active, created_at }: Category) {
    Object.assign(this, { name, description, is_active, created_at });
  }
}

export class CategoryValidator extends ClassValidatorFields<CategoryRules> {
  validate(entity: Category): boolean {
    return super.validate(new CategoryRules(entity));
  }
}

export class CategoryValidatorFactory {
  static create() {
    return new CategoryValidator();
  }
}
