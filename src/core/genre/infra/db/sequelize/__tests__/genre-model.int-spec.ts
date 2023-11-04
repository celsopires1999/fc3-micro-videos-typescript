import { DataType } from "sequelize-typescript";
import { setupSequelize } from "../../../../../shared/infra/testing/helpers";
import { GenreCategoryModel, GenreModel } from "../genre.model";
import { CategoryModel } from "@core/category/infra/db/sequelize/category.model";
import { Category } from "@core/category/domain/category.aggregate";
import { CategorySequelizeRepository } from "@core/category/infra/db/sequelize/category-sequelize.repository";

describe("GenreCategoryModel Integration Tests", () => {
  setupSequelize({ models: [CategoryModel, GenreModel, GenreCategoryModel] });
  test("table name", () => {
    expect(GenreCategoryModel.tableName).toBe("category_genre");
  });

  test("mapping props", () => {
    const attributesMap = GenreCategoryModel.getAttributes();
    const attributes = Object.keys(GenreCategoryModel.getAttributes());
    expect(attributes).toStrictEqual(["genre_id", "category_id"]);

    const genreIdAttr = attributesMap.genre_id;
    expect(genreIdAttr).toMatchObject({
      field: "genre_id",
      fieldName: "genre_id",
      primaryKey: true,
      type: DataType.UUID(),
      references: {
        model: "genres",
        key: "genre_id",
      },
      unique: "category_genre_genre_id_category_id_unique",
    });

    const categoryIdAttr = attributesMap.category_id;
    expect(categoryIdAttr).toMatchObject({
      field: "category_id",
      fieldName: "category_id",
      primaryKey: true,
      type: DataType.UUID(),
      references: {
        model: "categories",
        key: "category_id",
      },
      unique: "category_genre_genre_id_category_id_unique",
    });
  });
});

describe("GenreModel Integration Tests", () => {
  setupSequelize({ models: [CategoryModel, GenreModel, GenreCategoryModel] });
  test("table name", () => {
    expect(GenreModel.tableName).toBe("genres");
  });

  test("mapping props", () => {
    const attributesMap = GenreModel.getAttributes();
    const attributes = Object.keys(GenreModel.getAttributes());
    expect(attributes).toStrictEqual([
      "genre_id",
      "name",
      "is_active",
      "created_at",
    ]);

    expect(attributesMap.genre_id).toMatchObject({
      field: "genre_id",
      fieldName: "genre_id",
      primaryKey: true,
      type: DataType.UUID(),
    });

    expect(attributesMap.name).toMatchObject({
      field: "name",
      fieldName: "name",
      allowNull: false,
      type: DataType.STRING(255),
    });

    expect(attributesMap.is_active).toMatchObject({
      field: "is_active",
      fieldName: "is_active",
      allowNull: false,
      type: DataType.BOOLEAN(),
    });

    expect(attributesMap.created_at).toMatchObject({
      field: "created_at",
      fieldName: "created_at",
      allowNull: false,
      type: DataType.DATE(6),
    });
  });

  test("mapping associations ", () => {
    const associationsMap = GenreModel.associations;
    const associations = Object.keys(associationsMap);
    expect(associations).toStrictEqual(["categories_id", "categories"]);

    const categoriesIdRelation = associationsMap.categories_id;
    expect(categoriesIdRelation).toMatchObject({
      associationType: "HasMany",
      source: GenreModel,
      target: GenreCategoryModel,
      options: {
        foreignKey: { name: "genre_id" },
        as: "categories_id",
      },
    });

    const categoriesRelation = associationsMap.categories;
    expect(categoriesRelation).toMatchObject({
      associationType: "BelongsToMany",
      source: GenreModel,
      target: CategoryModel,
      options: {
        through: { model: GenreCategoryModel },
        foreignKey: { name: "genre_id" },
        otherKey: { name: "category_id" },
        as: "categories",
      },
    });
  });

  test("create and association relations separately", async () => {
    const categories = Category.fake().theCategories(3).build();
    const categoryRepo = new CategorySequelizeRepository(CategoryModel);
    await categoryRepo.bulkInsert(categories);

    const genreData = {
      genre_id: "594b38f8-1952-4bef-973a-0c490f20fe83",
      name: "test",
      is_active: true,
      created_at: new Date(),
    };

    const genreModel = await GenreModel.create(genreData);
    await genreModel.$add("categories", [
      categories[0].category_id.id,
      categories[1].category_id.id,
      categories[2].category_id.id,
    ]);

    const genreWithCategories = await GenreModel.findByPk(genreModel.genre_id, {
      include: [
        {
          model: CategoryModel,
          attributes: ["category_id", "name"],
        },
      ],
    });

    expect(genreWithCategories).toMatchObject(genreData);
    expect(genreWithCategories!.categories).toHaveLength(3);
    expect(genreWithCategories!.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category_id: categories[0].category_id.id,
          name: categories[0].name,
        }),
        expect.objectContaining({
          category_id: categories[1].category_id.id,
          name: categories[1].name,
        }),
        expect.objectContaining({
          category_id: categories[2].category_id.id,
          name: categories[2].name,
        }),
      ]),
    );

    const genreWithCategoriesId = await GenreModel.findByPk(
      genreModel.genre_id,
      {
        include: ["categories_id"],
      },
    );

    expect(genreWithCategoriesId).toMatchObject(genreData);
    expect(genreWithCategoriesId!.categories_id).toHaveLength(3);
    expect(genreWithCategoriesId!.categories_id).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          genre_id: genreModel.genre_id,
          category_id: categories[0].category_id.id,
        }),
        expect.objectContaining({
          genre_id: genreModel.genre_id,
          category_id: categories[1].category_id.id,
        }),
        expect.objectContaining({
          genre_id: genreModel.genre_id,
          category_id: categories[2].category_id.id,
        }),
      ]),
    );
  });

  test("create with association in single transaction", async () => {
    const categories = Category.fake().theCategories(3).build();
    const categoryRepo = new CategorySequelizeRepository(CategoryModel);
    await categoryRepo.bulkInsert(categories);

    const genreModelData = {
      genre_id: "594b38f8-1952-4bef-973a-0c490f20fe83",
      name: "test",
      is_active: true,
      categories_id: [
        GenreCategoryModel.build({
          category_id: categories[0].category_id.id,
          genre_id: "594b38f8-1952-4bef-973a-0c490f20fe83",
        }),
        GenreCategoryModel.build({
          category_id: categories[1].category_id.id,
          genre_id: "594b38f8-1952-4bef-973a-0c490f20fe83",
        }),
        GenreCategoryModel.build({
          category_id: categories[2].category_id.id,
          genre_id: "594b38f8-1952-4bef-973a-0c490f20fe83",
        }),
      ],
      created_at: new Date(),
    };
    const genreModel = await GenreModel.create(genreModelData, {
      include: ["categories_id"],
    });
    const genreWithCategories = await GenreModel.findByPk(genreModel.genre_id, {
      include: [
        {
          model: CategoryModel,
          attributes: ["category_id", "name"],
        },
      ],
    });

    const { categories_id, ...genreCommonProps } = genreModelData;
    expect(genreWithCategories).toMatchObject(genreCommonProps);
    expect(genreWithCategories!.categories).toHaveLength(3);
    expect(genreWithCategories!.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category_id: categories[0].category_id.id,
          name: categories[0].name,
        }),
        expect.objectContaining({
          category_id: categories[1].category_id.id,
          name: categories[1].name,
        }),
        expect.objectContaining({
          category_id: categories[2].category_id.id,
          name: categories[2].name,
        }),
      ]),
    );

    const genreWithCategoriesId = await GenreModel.findByPk(
      genreModel.genre_id,
      {
        include: ["categories_id"],
      },
    );

    expect(genreWithCategoriesId!.categories_id).toHaveLength(3);
    expect(genreWithCategoriesId!.categories_id).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          genre_id: genreModel.genre_id,
          category_id: categories[0].category_id.id,
        }),
        expect.objectContaining({
          genre_id: genreModel.genre_id,
          category_id: categories[1].category_id.id,
        }),
        expect.objectContaining({
          genre_id: genreModel.genre_id,
          category_id: categories[2].category_id.id,
        }),
      ]),
    );
  });
});
