import { CategoryOutputMapper } from "@core/category/application/use-cases/common/category-output";
import { CreateCategoryUseCase } from "@core/category/application/use-cases/create-category/create-category.use-case";
import { DeleteCategoryUseCase } from "@core/category/application/use-cases/delete-category/delete-category.use-case";
import { GetCategoryUseCase } from "@core/category/application/use-cases/get-category/get-category.use-case";
import { ListCategoriesUseCase } from "@core/category/application/use-cases/list-categories/list-categories.use-case";
import { UpdateCategoryUseCase } from "@core/category/application/use-cases/update-category/update-category.use-case";
import { Category, CategoryId } from "@core/category/domain/category.aggregate";
import { ICategoryRepository } from "@core/category/domain/category.repository";
import { getConnectionToken } from "@nestjs/sequelize";
import { Test, TestingModule } from "@nestjs/testing";
import { Sequelize } from "sequelize-typescript";
import { ConfigModule } from "../../config-module/config.module";
import { DatabaseModule } from "../../database-module/database.module";
import { CategoriesController } from "../categories.controller";
import { CategoriesModule } from "../categories.module";
import {
  CategoryCollectionPresenter,
  CategoryPresenter,
} from "../categories.presenter";
import { CATEGORY_PROVIDERS } from "../categories.providers";
import {
  CreateCategoryFixture,
  ListCategoriesFixture,
  UpdateCategoryFixture,
} from "../testing/category-fixture";

describe("CategoriesController Integration Tests", () => {
  let controller: CategoriesController;
  let repository: ICategoryRepository;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), DatabaseModule, CategoriesModule],
    }).compile();
    controller = module.get<CategoriesController>(CategoriesController);
    repository = module.get<ICategoryRepository>(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
    const sequelize = module.get<Sequelize>(getConnectionToken());
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    await module?.close();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
    expect(controller["createUseCase"]).toBeInstanceOf(CreateCategoryUseCase);
    expect(controller["updateUseCase"]).toBeInstanceOf(UpdateCategoryUseCase);
    expect(controller["listUseCase"]).toBeInstanceOf(ListCategoriesUseCase);
    expect(controller["getUseCase"]).toBeInstanceOf(GetCategoryUseCase);
    expect(controller["deleteUseCase"]).toBeInstanceOf(DeleteCategoryUseCase);
    expect(repository).toBeDefined();
  });

  describe("should create a category", () => {
    const arrange = CreateCategoryFixture.arrangeForCreate();
    test.each(arrange)(
      "when body is $send_data",
      async ({ send_data, expected }) => {
        const presenter = await controller.create(send_data);
        const entity = await repository.findById(new CategoryId(presenter.id));
        expect(entity!.toJSON()).toStrictEqual({
          ...expected,
          category_id: presenter.id,
          created_at: presenter.created_at,
        });
        const output = CategoryOutputMapper.toOutput(entity!);
        expect(presenter).toStrictEqual(new CategoryPresenter(output));
      },
    );
  });

  describe("should update a category", () => {
    const arrange = UpdateCategoryFixture.arrangeForUpdate();
    const entity = Category.fake().aCategory().build();

    beforeEach(async () => {
      await repository.insert(entity);
    });

    test.each(arrange)(
      "with body is $send_data",
      async ({ send_data, expected }) => {
        const presenter = await controller.update(
          entity.category_id.id,
          send_data,
        );
        const foundEntity = await repository.findById(
          new CategoryId(presenter.id),
        );

        expect(foundEntity!.toJSON()).toStrictEqual({
          category_id: presenter.id,
          created_at: presenter.created_at,
          name: expected.name ?? entity.name,
          description:
            "description" in expected
              ? expected.description
              : entity.description,
          is_active:
            expected.is_active === true || expected.is_active === false
              ? expected.is_active
              : entity.is_active,
        });

        const output = CategoryOutputMapper.toOutput(foundEntity!);
        expect(presenter).toStrictEqual(new CategoryPresenter(output));
      },
    );
  });

  it("should delete a category", async () => {
    const entity = Category.fake().aCategory().build();
    await repository.insert(entity);
    const response = await controller.remove(entity.category_id.id);
    expect(response).not.toBeDefined();
    await expect(repository.findById(entity.category_id)).resolves.toBeNull();
  });

  it("should get a category", async () => {
    const entity = Category.fake().aCategory().build();
    await repository.insert(entity);
    const presenter = await controller.findOne(entity.category_id.id);

    expect(presenter.id).toBe(entity.category_id.id);
    expect(presenter.name).toBe(entity.name);
    expect(presenter.description).toBe(entity.description);
    expect(presenter.is_active).toBe(entity.is_active);
    expect(presenter.created_at).toStrictEqual(entity.created_at);
  });

  describe("search method", () => {
    describe("should sort categories by created_at", () => {
      const { entitiesMap, arrange } =
        ListCategoriesFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        "when send_data is $send_data",
        async ({ send_data, expected }) => {
          const presenter = await controller.search(send_data);
          const { entities, ...paginationProps } = expected;
          expect(presenter).toEqual(
            new CategoryCollectionPresenter({
              items: entities.map(CategoryOutputMapper.toOutput),
              ...paginationProps.meta,
            }),
          );
        },
      );
    });

    describe("should return categories using pagination, sort and filter", () => {
      const { entitiesMap, arrange } = ListCategoriesFixture.arrangeUnsorted();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        "when send_data is $send_data",
        async ({ send_data, expected }) => {
          const presenter = await controller.search(send_data);
          const { entities, ...paginationProps } = expected;
          expect(presenter).toEqual(
            new CategoryCollectionPresenter({
              items: entities.map(CategoryOutputMapper.toOutput),
              ...paginationProps.meta,
            }),
          );
        },
      );
    });
  });
});
