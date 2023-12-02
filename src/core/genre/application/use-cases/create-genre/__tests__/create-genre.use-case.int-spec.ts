import { CategoriesIdExistsInDatabaseValidator } from "@core/category/application/validations/categories-ids-exists-in-database.validator";
import { Category } from "@core/category/domain/category.aggregate";
import { CategorySequelizeRepository } from "@core/category/infra/db/sequelize/category-sequelize.repository";
import { CategoryModel } from "@core/category/infra/db/sequelize/category.model";
import { Genre, GenreId } from "@core/genre/domain/genre.aggregate";
import { GenreSequelizeRepository } from "@core/genre/infra/db/sequelize/genre-sequelize.repository";
import {
  GenreCategoryModel,
  GenreModel,
} from "@core/genre/infra/db/sequelize/genre.model";
import { UnitOfWorkSequelize } from "@core/shared/infra/db/sequelize/unit-of-work-sequelize";
import { setupSequelize } from "@core/shared/infra/testing/helpers";
import { DatabaseError } from "sequelize";
import { CreateGenreUseCase } from "../create-genre.use-case";

describe("CreateGenreUseCase Integration Tests", () => {
  let uow: UnitOfWorkSequelize;
  let useCase: CreateGenreUseCase;
  let genreRepo: GenreSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;
  let categoriesIdExistsInStorageValidator: CategoriesIdExistsInDatabaseValidator;

  const sequelizeHelper = setupSequelize({
    models: [GenreModel, GenreCategoryModel, CategoryModel],
  });

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    categoriesIdExistsInStorageValidator =
      new CategoriesIdExistsInDatabaseValidator(categoryRepo);
    useCase = new CreateGenreUseCase(
      uow,
      genreRepo,
      categoryRepo,
      categoriesIdExistsInStorageValidator,
    );
  });

  describe("execute method", () => {
    it("should create a genre", async () => {
      const categories = Category.fake().theCategories(2).build();
      await categoryRepo.bulkInsert(categories);
      const categoriesId = categories.map((c) => c.category_id.id);

      let output = await useCase.execute({
        name: "test genre",
        categories_id: categoriesId,
      });

      let foundGenre = await genreRepo.findById(new GenreId(output.id));

      expect(output).toStrictEqual({
        id: foundGenre!.genre_id.id,
        name: "test genre",
        categories: expect.arrayContaining(
          categories.map((c) => ({
            id: c.category_id.id,
            name: c.name,
            created_at: c.created_at,
          })),
        ),
        categories_id: expect.arrayContaining(categoriesId),
        is_active: true,
        created_at: foundGenre!.created_at,
      });

      output = await useCase.execute({
        name: "test genre",
        categories_id: [categories[0].category_id.id],
      });

      foundGenre = await genreRepo.findById(new GenreId(output.id));

      expect(output).toStrictEqual({
        id: foundGenre!.genre_id.id,
        name: "test genre",
        categories: expect.arrayContaining(
          [categories[0]].map((c) => ({
            id: c.category_id.id,
            name: c.name,
            created_at: c.created_at,
          })),
        ),
        categories_id: expect.arrayContaining([categories[0].category_id.id]),
        is_active: true,
        created_at: foundGenre!.created_at,
      });
    });

    it("should rollback a transaction", async () => {
      const categories = Category.fake().theCategories(2).build();
      await categoryRepo.bulkInsert(categories);
      const categoriesId = categories.map((c) => c.category_id.id);
      const genre = Genre.fake().aGenre().build();
      genre.name = "t".repeat(256);
      const mockCreate = jest
        .spyOn(Genre, "create")
        .mockImplementation(() => genre);
      await expect(
        useCase.execute({ name: "test rollback", categories_id: categoriesId }),
      ).rejects.toThrow(DatabaseError);
      const foundGenres = await genreRepo.findAll();
      expect(foundGenres.length).toEqual(0);
      mockCreate.mockRestore();
    });
  });
});
