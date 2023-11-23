import { CategoryId } from "@core/category/domain/category.aggregate";
import { ICategoryRepository } from "@core/category/domain/category.repository";
import {
  GenreSearchParams,
  GenreSearchResult,
  IGenreRepository,
} from "@core/genre/domain/genre.repository";
import {
  PaginationOutput,
  PaginationOutputMapper,
} from "@core/shared/application/pagination-output";
import { IUseCase } from "@core/shared/application/use-case.interface";
import { GenreOutput, GenreOutputMapper } from "../common/genre-output";
import { ListGenresInput } from "./list-genres.input";

export class ListGenresUseCase
  implements IUseCase<ListGenresInput, ListGenresOutput>
{
  constructor(
    private genreRepo: IGenreRepository,
    private categoryRepo: ICategoryRepository,
  ) {}

  async execute(input: ListGenresInput): Promise<ListGenresOutput> {
    const params = GenreSearchParams.create(input);
    const searchResult = await this.genreRepo.search(params);
    return this.toOutput(searchResult);
  }

  private async toOutput(
    searchResult: GenreSearchResult,
  ): Promise<ListGenresOutput> {
    const { items: _items } = searchResult;

    const categoriesIdSelectedGenres = searchResult.items.reduce<CategoryId[]>(
      (acc, item) => {
        return acc.concat([...item.categories_id.values()]);
      },
      [],
    );
    const categoriesIdRelated = Array.from(new Set(categoriesIdSelectedGenres));
    const categoriesRelated =
      await this.categoryRepo.findByIds(categoriesIdRelated);

    const items = _items.map((i) => {
      const categoriesOfGenre = categoriesRelated.filter((c) =>
        i.categories_id.has(c.category_id.id),
      );
      return GenreOutputMapper.toOutput(i, categoriesOfGenre);
    });
    return PaginationOutputMapper.toOutput(items, searchResult);
  }
}

export type ListGenresOutput = PaginationOutput<GenreOutput>;
