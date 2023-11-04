import { Genre, GenreId } from "@core/genre/domain/genre.aggregate";
import {
  GenreFilter,
  IGenreRepository,
} from "@core/genre/domain/genre.repository";
import { SortDirection } from "@core/shared/domain/repository/search-params";
import { InMemorySearchableRepository } from "@core/shared/infra/db/in-memory/in-memory.repository";

export class GenreInMemoryRepository
  extends InMemorySearchableRepository<Genre, GenreId, GenreFilter>
  implements IGenreRepository
{
  sortableFields: string[] = ["name", "created_at"];

  protected async applyFilter(
    items: Genre[],
    filter: GenreFilter,
  ): Promise<Genre[]> {
    if (!filter) {
      return items;
    }
    return items.filter((genre) => {
      const hasName =
        filter.name &&
        genre.name.toLowerCase().includes(filter.name.toLowerCase());
      const hasCategories =
        filter.categories_id &&
        filter.categories_id.some((c) => genre.categories_id.has(c.id));
      return filter.name && filter.categories_id
        ? hasName && hasCategories
        : filter.name
        ? hasName
        : hasCategories;
    });
  }

  getEntity(): new (...args: any[]) => Genre {
    return Genre;
  }

  protected applySort(
    items: Genre[],
    sort: string | null,
    sort_dir: SortDirection | null,
  ) {
    return sort
      ? super.applySort(items, sort, sort_dir)
      : super.applySort(items, "created_at", "desc");
  }
}
