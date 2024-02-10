import { RatingValues } from "@core/video/domain/rating.vo";
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Min,
  validateSync,
} from "class-validator";

export type CreateVideoInputConstructorProps = {
  title: string;
  description: string;
  year_launched: number;
  duration: number;
  rating: RatingValues;
  is_opened: boolean;
  categories_id: string[];
  genres_id: string[];
  cast_members_id: string[];
  is_active?: boolean;
};

export class CreateVideoInput {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Min(1900)
  @IsInt()
  @IsNotEmpty()
  year_launched: number;

  @Min(1)
  @IsInt()
  @IsNotEmpty()
  duration: number;

  @IsString()
  @IsNotEmpty()
  rating: RatingValues;

  @IsBoolean()
  @IsNotEmpty()
  is_opened: boolean;

  @IsUUID("4", { each: true })
  @IsArray()
  @ArrayNotEmpty()
  categories_id: string[];

  @IsUUID("4", { each: true })
  @IsArray()
  @ArrayNotEmpty()
  genres_id: string[];

  @IsUUID("4", { each: true })
  @IsArray()
  @ArrayNotEmpty()
  cast_members_id: string[];

  constructor(props?: CreateVideoInputConstructorProps) {
    if (!props) return;
    this.title = props.title;
    this.description = props.description;
    this.year_launched = props.year_launched;
    this.duration = props.duration;
    this.rating = props.rating;
    this.is_opened = props.is_opened;
    this.categories_id = props.categories_id;
    this.genres_id = props.genres_id;
    this.cast_members_id = props.cast_members_id;
  }
}

export class ValidateCreateVideoInput {
  static validate(input: CreateVideoInput) {
    return validateSync(input);
  }
}
