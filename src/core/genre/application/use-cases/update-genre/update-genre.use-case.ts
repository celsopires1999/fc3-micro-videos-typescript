import { CategoriesIdExistsInDatabaseValidator } from "@core/category/application/validations/categories-ids-exists-in-storage.validator";
import { ICategoryRepository } from "@core/category/domain/category.repository";
import { Genre, GenreId } from "@core/genre/domain/genre.aggregate";
import { IGenreRepository } from "@core/genre/domain/genre.repository";
import { IUseCase } from "@core/shared/application/use-case.interface";
import { NotFoundError } from "@core/shared/domain/errors/not-found.error";
import { IUnitOfWork } from "@core/shared/domain/repository/unit-of-work.interface";
import { EntityValidationError } from "@core/shared/domain/validators/validation.error";
import { GenreOutput, GenreOutputMapper } from "../common/genre-output";
import { UpdateGenreInput } from "./update-genre.input";

export class UpdateGenreUseCase
  implements IUseCase<UpdateGenreInput, UpdateGenreOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private genreRepo: IGenreRepository,
    private categoryRepo: ICategoryRepository,
    private categoriesIdExistsInStorage: CategoriesIdExistsInDatabaseValidator,
  ) {}

  async execute(input: UpdateGenreInput): Promise<UpdateGenreOutput> {
    const genreId = new GenreId(input.id);
    const genre = await this.genreRepo.findById(genreId);

    if (!genre) {
      throw new NotFoundError(input.id, Genre);
    }

    if (input.name !== undefined) {
      genre.changeName(input.name);
    }

    if (input.is_active !== undefined) {
      input.is_active ? genre.activate() : genre.deactivate();
    }

    const notification = genre.notification;

    if (input.categories_id !== undefined) {
      const [categoriesId, categoriesIdErrors] = (
        await this.categoriesIdExistsInStorage.validate(input.categories_id)
      ).asArray();

      categoriesId && genre.syncCategories(categoriesId);

      categoriesIdErrors &&
        notification.setError(
          categoriesIdErrors.map((e) => e.message),
          "categories_id",
        );
    }

    if (notification.hasErrors()) {
      throw new EntityValidationError(notification.toJSON());
    }

    await this.uow.do(async () => {
      return this.genreRepo.update(genre);
    });

    const categories = await this.categoryRepo.findByIds(
      Array.from(genre.categories_id.values()),
    );

    return GenreOutputMapper.toOutput(genre, categories);
  }
}

export type UpdateGenreOutput = GenreOutput;
