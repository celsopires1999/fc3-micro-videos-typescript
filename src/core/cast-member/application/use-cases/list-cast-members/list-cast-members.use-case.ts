import { CastMemberTypes } from "@core/cast-member/domain/cast-member-type.vo";
import {
  CastMemberSearchParams,
  CastMemberSearchResult,
  ICastMemberRepository,
} from "@core/cast-member/domain/cast-member.repository";
import {
  PaginationOutput,
  PaginationOutputMapper,
} from "../../../../shared/application/pagination-output";
import { IUseCase } from "../../../../shared/application/use-case.interface";
import { SortDirection } from "../../../../shared/domain/repository/search-params";
import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from "../common/cast-member-output";
import { ListCastMembersInput } from "./list-cast-members.input";

export class ListCastMembersUseCase
  implements IUseCase<ListCastMembersInput, ListCastMembersOutput>
{
  constructor(private castMembersRepo: ICastMemberRepository) {}

  async execute(input: ListCastMembersInput): Promise<ListCastMembersOutput> {
    const params = CastMemberSearchParams.create(input);
    const searchResult = await this.castMembersRepo.search(params);
    return this.toOutput(searchResult);
  }

  private toOutput(
    searchResult: CastMemberSearchResult,
  ): ListCastMembersOutput {
    const { items: _items } = searchResult;
    const items = _items.map((i) => {
      return CastMemberOutputMapper.toOutput(i);
    });
    return PaginationOutputMapper.toOutput(items, searchResult);
  }
}

// export type ListCastMembersInput = {
//   page?: number;
//   per_page?: number;
//   sort?: string | null;
//   sort_dir?: SortDirection | null;
//   filter?: {
//     name?: string;
//     type?: CastMemberTypes;
//   };
// };

export type ListCastMembersOutput = PaginationOutput<CastMemberOutput>;
