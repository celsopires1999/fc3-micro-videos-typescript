import { CategoryInMemoryRepository } from "@core/category/infra/db/in-memory/category-in-memory.repository";
import { CategoriesIdExistsInStorageValidator } from "./categories-ids-exists-in-storage.validator";
import { Category, CategoryId } from "@core/category/domain/category.aggregate";
import { NotFoundError } from "@core/shared/domain/errors/not-found.error";

describe("CategoriesIdExistsInDatabaseValidator Unit Tests", () => {
  let categoryRepo: CategoryInMemoryRepository;
  let validator: CategoriesIdExistsInStorageValidator;
  beforeEach(() => {
    categoryRepo = new CategoryInMemoryRepository();
    validator = new CategoriesIdExistsInStorageValidator(categoryRepo);
  });

  it("should return many not found error when categories id does not exist in storage", async () => {
    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();
    const spyExistsById = jest.spyOn(categoryRepo, "existsById");
    let [categoriesId, categoriesIdErrors] = await validator.validate([
      categoryId1.id,
      categoryId2.id,
    ]);
    expect(categoriesId).toStrictEqual(null);
    expect(categoriesIdErrors).toStrictEqual([
      new NotFoundError(categoryId1.id, Category),
      new NotFoundError(categoryId2.id, Category),
    ]);
    expect(spyExistsById).toHaveBeenCalledTimes(1);

    const category1 = Category.fake().aCategory().build();
    await categoryRepo.insert(category1);

    [categoriesId, categoriesIdErrors] = await validator.validate([
      category1.category_id.id,
      categoryId2.id,
    ]);

    expect(categoriesId).toStrictEqual(null);
    expect(categoriesIdErrors).toStrictEqual([
      new NotFoundError(categoryId2.id, Category),
    ]);
    expect(spyExistsById).toHaveBeenCalledTimes(2);
  });

  it("should return a list of categories id", async () => {
    const category1 = Category.fake().aCategory().build();
    const category2 = Category.fake().aCategory().build();
    await categoryRepo.bulkInsert([category1, category2]);
    const [categoriesId, categoriesIdErrors] = await validator.validate([
      category1.category_id.id,
      category2.category_id.id,
    ]);
    expect(categoriesId).toHaveLength(2);
    expect(categoriesIdErrors).toStrictEqual(null);
    expect(categoriesId![0]).toEqual(category1.category_id);
    expect(categoriesId![1]).toEqual(category2.category_id);
  });
});
