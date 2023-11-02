import { CategoryId } from "@core/category/domain/category.aggregate";
import { setupSequelize } from "../../../../../shared/infra/testing/helpers";
import { CategorySequelizeRepository } from "../../../../infra/db/sequelize/category-sequelize.repository";
import { CategoryModel } from "../../../../infra/db/sequelize/category.model";
import { CreateCategoryUseCase } from "../create-category.use-case";

describe("CreateCategoryUseCase Integration Tests", () => {
  let useCase: CreateCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new CreateCategoryUseCase(repository);
  });

  it("should create a category", async () => {
    let output = await useCase.execute({ name: "test" });
    let aggregate = await repository.findById(new CategoryId(output.id));
    expect(output).toStrictEqual({
      id: aggregate!.category_id.id,
      name: "test",
      description: null,
      is_active: true,
      created_at: aggregate!.created_at,
    });

    output = await useCase.execute({
      name: "test",
      description: "some description",
    });
    aggregate = await repository.findById(new CategoryId(output.id));
    expect(output).toStrictEqual({
      id: aggregate!.category_id.id,
      name: "test",
      description: "some description",
      is_active: true,
      created_at: aggregate!.created_at,
    });

    output = await useCase.execute({
      name: "test",
      description: "some description",
      is_active: true,
    });
    aggregate = await repository.findById(new CategoryId(output.id));
    expect(output).toStrictEqual({
      id: aggregate!.category_id.id,
      name: "test",
      description: "some description",
      is_active: true,
      created_at: aggregate!.created_at,
    });

    output = await useCase.execute({
      name: "test",
      description: "some description",
      is_active: false,
    });
    aggregate = await repository.findById(new CategoryId(output.id));
    expect(output).toStrictEqual({
      id: aggregate!.category_id.id,
      name: "test",
      description: "some description",
      is_active: false,
      created_at: aggregate!.created_at,
    });
  });
});
