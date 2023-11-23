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
import { GetGenreUseCase } from "../get-genre.use-case";

describe("GetGenreUseCase Integration Tests", () => {
  let uow: UnitOfWorkSequelize;
  let useCase: GetGenreUseCase;
  let genreRepo: GenreSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;

  const sequelizeHelper = setupSequelize({
    models: [GenreModel, GenreCategoryModel, CategoryModel],
  });

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    useCase = new GetGenreUseCase(genreRepo, categoryRepo);
  });

  it("should throw an error when entity is not found", async () => {
    const genreId = new GenreId();
    await expect(useCase.execute({ id: genreId.id })).rejects.toThrow(
      new NotFoundError(genreId.id, Genre),
    );
  });

  it("should return a genre", async () => {
    const categories = Category.fake().theCategories(3).build();
    await categoryRepo.bulkInsert(categories);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(categories[0].category_id)
      .addCategoryId(categories[2].category_id)
      .build();
    await genreRepo.insert(genre);

    const output = await useCase.execute({ id: genre.genre_id.id });

    expect(output).toStrictEqual({
      id: genre.genre_id.id,
      name: genre.name,
      categories: expect.arrayContaining(
        [categories[0], categories[2]].map((c) => ({
          id: c.category_id.id,
          name: c.name,
          created_at: c.created_at,
        })),
      ),
      categories_id: expect.arrayContaining(
        [categories[0], categories[2]].map((c) => c.category_id.id),
      ),
      is_active: genre.is_active,
      created_at: genre.created_at,
    });
  });
});
