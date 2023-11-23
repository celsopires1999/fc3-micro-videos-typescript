import { Category } from "@core/category/domain/category.aggregate";
import { CategorySequelizeRepository } from "@core/category/infra/db/sequelize/category-sequelize.repository";
import { CategoryModel } from "@core/category/infra/db/sequelize/category.model";
import { Genre, GenreId } from "@core/genre/domain/genre.aggregate";
import { GenreSequelizeRepository } from "@core/genre/infra/db/sequelize/genre-sequelize.repository";
import {
  GenreCategoryModel,
  GenreModel,
} from "@core/genre/infra/db/sequelize/genre.model";
import { NotFoundError } from "@core/shared/domain/errors/not-found.error";
import { UnitOfWorkSequelize } from "@core/shared/infra/db/sequelize/unit-of-work-sequelize";
import { setupSequelize } from "@core/shared/infra/testing/helpers";
import { DeleteGenreUseCase } from "../delete-genre.use-case";

describe("DeleteGenreUseCase Integration Tests", () => {
  let uow: UnitOfWorkSequelize;
  let useCase: DeleteGenreUseCase;
  let genreRepo: GenreSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;

  const sequelizeHelper = setupSequelize({
    models: [GenreModel, GenreCategoryModel, CategoryModel],
  });

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    useCase = new DeleteGenreUseCase(uow, genreRepo);
  });

  it("should throw error when entity not found", async () => {
    const genreId = new GenreId();
    await expect(() => useCase.execute({ id: genreId.id })).rejects.toThrow(
      new NotFoundError(genreId.id, Genre),
    );
  });

  it("should delete a genre", async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepo.bulkInsert(categories);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(categories[0].category_id)
      .addCategoryId(categories[1].category_id)
      .build();
    await genreRepo.insert(genre);
    await useCase.execute({
      id: genre.genre_id.id,
    });
    await expect(genreRepo.findById(genre.genre_id)).resolves.toBeNull();
  });

  it("rollback transaction", async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepo.bulkInsert(categories);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(categories[0].category_id)
      .addCategoryId(categories[1].category_id)
      .build();
    await genreRepo.insert(genre);

    GenreModel.afterBulkDestroy("hook-test", () => {
      return Promise.reject(new Error("Generic Error"));
    });

    await expect(
      useCase.execute({
        id: genre.genre_id.id,
      }),
    ).rejects.toThrow("Generic Error");

    GenreModel.removeHook("afterBulkDestroy", "hook-test");

    const genres = await genreRepo.findAll();
    expect(genres.length).toEqual(1);
  });
});
