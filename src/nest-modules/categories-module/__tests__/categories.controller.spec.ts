import { CreateCategoryOutput } from "@core/category/application/use-cases/create-category/create-category.use-case";
import { GetCategoryOutput } from "@core/category/application/use-cases/get-category/get-category.use-case";
import { ListCategoriesOutput } from "@core/category/application/use-cases/list-categories/list-categories.use-case";
import { UpdateCategoryInput } from "@core/category/application/use-cases/update-category/update-category.input";
import { UpdateCategoryOutput } from "@core/category/application/use-cases/update-category/update-category.use-case";
import { SortDirection } from "@core/shared/domain/repository/search-params";
import { CategoriesController } from "../categories.controller";
import {
  CategoryCollectionPresenter,
  CategoryPresenter,
} from "../categories.presenter";
import { CreateCategoryDto } from "../dto/create-category.dto";

describe("CategoriesController Unit Tests", () => {
  let controller: CategoriesController;

  beforeEach(async () => {
    controller = new CategoriesController();
  });

  it("should create a category", async () => {
    //Arrange
    const output: CreateCategoryOutput = {
      id: "9366b7dc-2d71-4799-b91c-c64adb205104",
      name: "Movie",
      description: "some description",
      is_active: true,
      created_at: new Date(),
    };
    const mockCreateUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    //@ts-expect-error defined part of methods
    controller["createUseCase"] = mockCreateUseCase;
    const input: CreateCategoryDto = {
      name: "Movie",
      description: "some description",
      is_active: true,
    };

    //Act
    const presenter = await controller.create(input);

    //Assert
    expect(mockCreateUseCase.execute).toHaveBeenCalledWith(input);
    expect(presenter).toBeInstanceOf(CategoryPresenter);
    expect(presenter).toStrictEqual(new CategoryPresenter(output));
  });

  it("should update a category", async () => {
    const id = "9366b7dc-2d71-4799-b91c-c64adb205104";
    const output: UpdateCategoryOutput = {
      id,
      name: "Movie",
      description: "some description",
      is_active: true,
      created_at: new Date(),
    };
    const mockUpdateUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    //@ts-expect-error defined part of methods
    controller["updateUseCase"] = mockUpdateUseCase;
    const input: Omit<UpdateCategoryInput, "id"> = {
      name: "Movie",
      description: "some description",
      is_active: true,
    };
    const presenter = await controller.update(id, input);
    expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({ id, ...input });
    expect(presenter).toBeInstanceOf(CategoryPresenter);
    expect(presenter).toStrictEqual(new CategoryPresenter(output));
  });

  it("should delete a category", async () => {
    const expectedOutput = undefined;
    const mockDeleteUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(expectedOutput)),
    };
    //@ts-expect-error defined part of methods
    controller["deleteUseCase"] = mockDeleteUseCase;
    const id = "9366b7dc-2d71-4799-b91c-c64adb205104";
    expect(controller.remove(id)).toBeInstanceOf(Promise);
    const output = await controller.remove(id);
    expect(mockDeleteUseCase.execute).toHaveBeenCalledWith({ id });
    expect(expectedOutput).toStrictEqual(output);
  });

  it("should get a category", async () => {
    const id = "9366b7dc-2d71-4799-b91c-c64adb205104";
    const output: GetCategoryOutput = {
      id,
      name: "Movie",
      description: "some description",
      is_active: true,
      created_at: new Date(),
    };
    const mockGetUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    //@ts-expect-error defined part of methods
    controller["getUseCase"] = mockGetUseCase;
    const presenter = await controller.findOne(id);
    expect(mockGetUseCase.execute).toHaveBeenCalledWith({ id });
    expect(presenter).toBeInstanceOf(CategoryPresenter);
    expect(presenter).toStrictEqual(new CategoryPresenter(output));
  });

  it("should list categories", async () => {
    const output: ListCategoriesOutput = {
      items: [
        {
          id: "9366b7dc-2d71-4799-b91c-c64adb205104",
          name: "Movie",
          description: "some description",
          is_active: true,
          created_at: new Date(),
        },
      ],
      current_page: 1,
      last_page: 1,
      per_page: 1,
      total: 1,
    };
    const mockListUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    //@ts-expect-error defined part of methods
    controller["listUseCase"] = mockListUseCase;
    const searchParams = {
      page: 1,
      per_page: 2,
      sort: "name",
      sort_dir: "desc" as SortDirection,
      filter: "test",
    };
    const presenter = await controller.search(searchParams);
    expect(presenter).toBeInstanceOf(CategoryCollectionPresenter);
    expect(mockListUseCase.execute).toHaveBeenCalledWith(searchParams);
    expect(presenter).toEqual(new CategoryCollectionPresenter(output));
  });
});
