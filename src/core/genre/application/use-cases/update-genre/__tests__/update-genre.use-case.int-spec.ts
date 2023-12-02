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
import { UpdateGenreInput } from "../update-genre.input";
import {
  UpdateGenreOutput,
  UpdateGenreUseCase,
} from "../update-genre.use-case";

describe("UpdateGenreUseCase Integration Tests", () => {
  let uow: UnitOfWorkSequelize;
  let useCase: UpdateGenreUseCase;
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
    useCase = new UpdateGenreUseCase(
      uow,
      genreRepo,
      categoryRepo,
      categoriesIdExistsInStorageValidator,
    );
  });

  describe("execute method", () => {
    it("should update a genre", async () => {
      const categories = Category.fake().theCategories(3).build();
      await categoryRepo.bulkInsert(categories);

      const entity = Genre.fake()
        .aGenre()
        .addCategoryId(categories[0].category_id)
        .build();

      await genreRepo.insert(entity);

      let output = await useCase.execute(
        new UpdateGenreInput({
          id: entity.genre_id.id,
          name: "test genre",
          categories_id: [categories[0].category_id.id],
        }),
      );

      expect(output).toStrictEqual({
        id: entity.genre_id.id,
        name: "test genre",
        categories: expect.arrayContaining(
          [categories[0]].map((c) => ({
            id: c.category_id.id,
            name: c.name,
            created_at: c.created_at,
          })),
        ),
        categories_id: expect.arrayContaining([categories[0].category_id.id]),
        is_active: entity.is_active,
        created_at: entity.created_at,
      });

      type Arrange = {
        input: UpdateGenreInput;
        expected: UpdateGenreOutput;
      };

      const arrange: Arrange[] = [
        {
          input: {
            id: entity.genre_id.id,
            categories_id: [
              categories[1].category_id.id,
              categories[2].category_id.id,
            ],
            is_active: true,
          },
          expected: {
            id: entity.genre_id.id,
            name: "test genre",
            categories: expect.arrayContaining(
              [categories[1], categories[2]].map((c) => ({
                id: c.category_id.id,
                name: c.name,
                created_at: c.created_at,
              })),
            ),
            categories_id: expect.arrayContaining([
              categories[1].category_id.id,
              categories[2].category_id.id,
            ]),
            is_active: true,
            created_at: entity.created_at,
          },
        },
      ];

      for (const i of arrange) {
        output = await useCase.execute(i.input);
        const updatedEntity = await genreRepo.findById(new GenreId(i.input.id));
        expect(output).toStrictEqual({
          id: entity.genre_id.id,
          name: i.expected.name,
          categories: i.expected.categories,
          categories_id: i.expected.categories_id,
          is_active: i.expected.is_active,
          created_at: i.expected.created_at,
        });
        expect(updatedEntity!.toJSON()).toStrictEqual({
          genre_id: entity.genre_id.id,
          name: i.expected.name,
          categories_id: i.expected.categories_id,
          is_active: i.expected.is_active,
          created_at: i.expected.created_at,
        });
      }
    });

    it("should rollback a transaction", async () => {
      const category = Category.fake().aCategory().build();
      await categoryRepo.insert(category);
      const entity = Genre.fake()
        .aGenre()
        .addCategoryId(category.category_id)
        .build();
      await genreRepo.insert(entity);

      GenreModel.afterBulkUpdate("hook-test", () => {
        return Promise.reject(new Error("Generic Error"));
      });

      await expect(
        useCase.execute(
          new UpdateGenreInput({
            id: entity.genre_id.id,
            name: "test",
            categories_id: [category.category_id.id],
          }),
        ),
      ).rejects.toThrow(new Error("Generic Error"));

      GenreModel.removeHook("afterBulkUpdate", "hook-test");

      const notUpdatedGenre = await genreRepo.findById(entity.genre_id);
      expect(notUpdatedGenre!.name).toBe(entity.name);
    });
  });
});
