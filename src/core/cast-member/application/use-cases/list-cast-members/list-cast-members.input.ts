import { CastMemberTypes } from "@core/cast-member/domain/cast-member-type.vo";
import { SearchInput } from "@core/shared/application/search-input";
import { SortDirection } from "@core/shared/domain/repository/search-params";
import { Transform } from "class-transformer";
import { IsInt, ValidateNested, validateSync } from "class-validator";

export class ListCastMembersFilter {
  name?: string | null;
  @IsInt()
  type?: CastMemberTypes | null;
}

export class ListCastMembersInput
  implements SearchInput<ListCastMembersFilter>
{
  page?: number;
  per_page?: number;
  sort?: string;
  sort_dir?: SortDirection;
  @Transform(({ value }) => {
    if (value) {
      return {
        ...(value.name && { name: value.name }),
        ...(value.type && {
          // NaN será considerado como undefined ou null lá no SearchParams, então verificamos se é um número para manter o valor inválido original
          type: !Number.isNaN(parseInt(value.type))
            ? parseInt(value.type)
            : value.type,
        }),
      };
    }

    return value;
  })
  @ValidateNested()
  filter?: ListCastMembersFilter;
}

export class ValidateListCastMembersInput {
  static validate(input: ListCastMembersInput) {
    return validateSync(input);
  }
}
