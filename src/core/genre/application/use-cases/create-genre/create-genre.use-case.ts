import { ICategoryRepository } from "@core/category/domain/category.repository";
import { Genre } from "@core/genre/domain/genre.aggregate";
import { IGenreRepository } from "@core/genre/domain/genre.repository";
import { IUseCase } from "@core/shared/application/use-case.interface";
import { IUnitOfWork } from "@core/shared/domain/repository/unit-of-work.interface";
import { EntityValidationError } from "@core/shared/domain/validators/validation.error";
import { GenreOutput, GenreOutputMapper } from "../common/genre-output";
import { CategoriesIdExistsInStorageValidator } from "../validations/categories-ids-exists-in-storage.validator";
import { CreateGenreInput } from "./create-genre.input";

export class CreateGenreUseCase
  implements IUseCase<CreateGenreInput, CreateGenreOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private genreRepo: IGenreRepository,
    private categoryRepo: ICategoryRepository,
    private categoriesIdExistsInStorage: CategoriesIdExistsInStorageValidator,
  ) {}

  async execute(input: CreateGenreInput): Promise<CreateGenreOutput> {
    const [categoriesId, categoriesIdErrors] = (
      await this.categoriesIdExistsInStorage.validate(input.categories_id)
    ).asArray();

    const { name, is_active } = input;
    const entity = Genre.create({
      name,
      categories_id: categoriesId ?? [],
      is_active,
    });

    const notification = entity.notification;

    if (categoriesIdErrors) {
      notification.setError(
        categoriesIdErrors.map((e) => e.message),
        "categories_id",
      );
    }

    if (notification.hasErrors()) {
      throw new EntityValidationError(notification.toJSON());
    }

    await this.uow.do(async () => {
      this.genreRepo.insert(entity);
    });

    const categories = await this.categoryRepo.findByIds(
      Array.from(entity.categories_id.values()),
    );

    return GenreOutputMapper.toOutput(entity, categories);
  }
}

export type CreateGenreOutput = GenreOutput;
