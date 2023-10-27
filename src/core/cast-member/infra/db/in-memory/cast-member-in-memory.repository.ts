import {
  CastMember,
  CastMemberId,
} from "@core/cast-member/domain/cast-member.aggregate";
import {
  CastMemberFilter,
  ICastMemberRepository,
} from "@core/cast-member/domain/cast-member.repository";
import { SortDirection } from "@core/shared/domain/repository/search-params";
import { InMemorySearchableRepository } from "@core/shared/infra/db/in-memory/in-memory.repository";

export class CastMemberInMemoryRepository
  extends InMemorySearchableRepository<
    CastMember,
    CastMemberId,
    CastMemberFilter
  >
  implements ICastMemberRepository
{
  sortableFields: string[] = ["name", "created_at"];

  protected async applyFilter(
    items: CastMember[],
    filter: CastMemberFilter,
  ): Promise<CastMember[]> {
    if (!filter) {
      return items;
    }
    return items.filter((i) => {
      const hasName =
        filter.name && i.name.toLowerCase().includes(filter.name.toLowerCase());
      const hasType = filter.type && i.type.equals(filter.type);
      return filter.name && filter.type
        ? hasName && hasType
        : filter.name
        ? hasName
        : hasType;
    });
  }

  getEntity(): new (...args: any[]) => CastMember {
    return CastMember;
  }

  protected applySort(
    items: CastMember[],
    sort: string | null,
    sort_dir: SortDirection | null,
  ) {
    return sort
      ? super.applySort(items, sort, sort_dir)
      : super.applySort(items, "created_at", "desc");
  }
}
