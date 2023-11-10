import { Category } from "@core/category/domain/category.aggregate";
import { CategoryInMemoryRepository } from "@core/category/infra/db/in-memory/category-in-memory.repository";
import { GenreInMemoryRepository } from "@core/genre/infra/db/in-memory/genre-in-memory.repository";
import { EntityValidationError } from "@core/shared/domain/validators/validation.error";
import { UnitOfWorkFakeInMemory } from "@core/shared/infra/db/in-memory/fake-unit-of-work-in-memory";
import { CategoriesIdExistsInStorageValidator } from "../../validations/categories-ids-exists-in-storage.validator";
import { CreateGenreUseCase } from "../create-genre.use-case";

describe("CreateGenreUseCase Unit Tests", () => {
  let useCase: CreateGenreUseCase;
  let genreRepo: GenreInMemoryRepository;
  let categoryRepo: CategoryInMemoryRepository;
  let categoriesIdExistsInStorageValidator: CategoriesIdExistsInStorageValidator;
  let uow: UnitOfWorkFakeInMemory;

  beforeEach(() => {
    uow = new UnitOfWorkFakeInMemory();
    genreRepo = new GenreInMemoryRepository();
    categoryRepo = new CategoryInMemoryRepository();
    categoriesIdExistsInStorageValidator =
      new CategoriesIdExistsInStorageValidator(categoryRepo);
    useCase = new CreateGenreUseCase(
      uow,
      genreRepo,
      categoryRepo,
      categoriesIdExistsInStorageValidator,
    );
  });

  describe("execute method", () => {
    it("should throw an entity validation error when categories ids do not exist", async () => {
      expect.assertions(3);
      const spyValidateCategoriesId = jest.spyOn(
        categoriesIdExistsInStorageValidator,
        "validate",
      );
      try {
        await useCase.execute({
          name: "test",
          categories_id: [
            "0828ac21-05d3-481a-aaf4-63c5f9a55b04",
            "c145b6af-16f9-43f6-9fdb-658615bbd7af",
          ],
        });
      } catch (e) {
        expect(spyValidateCategoriesId).toHaveBeenCalledWith([
          "0828ac21-05d3-481a-aaf4-63c5f9a55b04",
          "c145b6af-16f9-43f6-9fdb-658615bbd7af",
        ]);
        expect(e).toBeInstanceOf(EntityValidationError);
        expect(e.error).toStrictEqual([
          {
            categories_id: [
              "Category Not Found using ID 0828ac21-05d3-481a-aaf4-63c5f9a55b04",
              "Category Not Found using ID c145b6af-16f9-43f6-9fdb-658615bbd7af",
            ],
          },
        ]);
      }
    });

    it("should create a genre", async () => {
      const category1 = Category.fake().aCategory().build();
      const category2 = Category.fake().aCategory().build();
      await categoryRepo.bulkInsert([category1, category2]);
      const spyInsert = jest.spyOn(genreRepo, "insert");
      const spyUowDo = jest.spyOn(uow, "do");
      let output = await useCase.execute({
        name: "test",
        categories_id: [category1.category_id.id, category2.category_id.id],
      });
      expect(spyUowDo).toHaveBeenCalledTimes(1);
      expect(spyInsert).toHaveBeenCalledTimes(1);
      expect(output).toStrictEqual({
        id: genreRepo.items[0].genre_id.id,
        name: "test",
        categories: [category1, category2].map((e) => ({
          id: e.category_id.id,
          name: e.name,
          created_at: e.created_at,
        })),
        categories_id: [category1.category_id.id, category2.category_id.id],
        is_active: true,
        created_at: genreRepo.items[0].created_at,
      });

      output = await useCase.execute({
        name: "test",
        categories_id: [category1.category_id.id, category2.category_id.id],
        is_active: false,
      });
      expect(spyInsert).toHaveBeenCalledTimes(2);
      expect(spyUowDo).toHaveBeenCalledTimes(2);
      expect(output).toStrictEqual({
        id: genreRepo.items[1].genre_id.id,
        name: "test",
        categories_id: [category1.category_id.id, category2.category_id.id],
        categories: [category1, category2].map((e) => ({
          id: e.category_id.id,
          name: e.name,
          created_at: e.created_at,
        })),
        is_active: false,
        created_at: genreRepo.items[1].created_at,
      });
    });
  });
});
