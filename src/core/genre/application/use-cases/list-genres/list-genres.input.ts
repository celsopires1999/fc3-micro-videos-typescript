import { SearchInput } from "@core/shared/application/search-input";
import { SortDirection } from "@core/shared/domain/repository/search-params";
import {
  IsArray,
  IsOptional,
  IsUUID,
  ValidateNested,
  validateSync,
} from "class-validator";

export class ListGenresFilter {
  name?: string | null;
  @IsUUID("4", { each: true })
  @IsArray()
  @IsOptional()
  categories_id?: string[] | null;
}

export class ListGenresInput implements SearchInput<ListGenresFilter> {
  page?: number;
  per_page?: number;
  sort?: string;
  sort_dir?: SortDirection;
  @ValidateNested()
  filter: ListGenresFilter;
}

export class ValidateCreateGenreInput {
  static validate(input: ListGenresFilter) {
    return validateSync(input);
  }
}
