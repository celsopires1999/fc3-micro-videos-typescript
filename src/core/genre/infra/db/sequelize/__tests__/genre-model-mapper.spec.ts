import { ICategoryRepository } from "@core/category/domain/category.repository";
import { CategorySequelizeRepository } from "@core/category/infra/db/sequelize/category-sequelize.repository";
import { CategoryModel } from "@core/category/infra/db/sequelize/category.model";
import { setupSequelize } from "@core/shared/infra/testing/helpers";
import { GenreCategoryModel, GenreModel } from "../genre.model";
import { GenreModelMapper } from "../genre-model-mapper";
import { LoadEntityError } from "@core/shared/domain/validators/validation.error";
import { Category, CategoryId } from "@core/category/domain/category.aggregate";
import { Genre, GenreId } from "@core/genre/domain/genre.aggregate";

describe("GenreModelMapper Unit Tests", () => {
  let categoryRepo: ICategoryRepository;
  setupSequelize({ models: [CategoryModel, GenreModel, GenreCategoryModel] });

  beforeEach(() => {
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
  });

  it("should throw error when Genre is invalid", () => {
    const arrange = [
      {
        makeModel: () => {
          //@ts-expect-error - an invalid genre
          return GenreModel.build({
            genre_id: "594b38f8-1952-4bef-973a-0c490f20fe83",
            name: "t".repeat(256),
            categories_id: [],
          });
        },
        expectedErrors: [
          {
            categories_id: ["categories_id should not be empty"],
          },
          {
            name: ["name must be shorter than or equal to 255 characters"],
          },
        ],
      },
    ];

    for (const item of arrange) {
      try {
        GenreModelMapper.toEntity(item.makeModel());
        fail("The genre is valid, but it should throw a LoadEntityError");
      } catch (e) {
        expect(e).toBeInstanceOf(LoadEntityError);
        expect(e.error).toMatchObject(item.expectedErrors);
      }
    }
  });

  it("should convert a genre model to a genre aggregate", async () => {
    const category1 = Category.fake().aCategory().build();
    const category2 = Category.fake().aCategory().build();
    await categoryRepo.bulkInsert([category1, category2]);
    const created_at = new Date();
    const model = await GenreModel.create(
      {
        genre_id: "5490020a-e866-4229-9adc-aa44b83234c4",
        name: "some value",
        categories_id: [
          GenreCategoryModel.build({
            category_id: category1.category_id.id,
            genre_id: "5490020a-e866-4229-9adc-aa44b83234c4",
          }),
          GenreCategoryModel.build({
            category_id: category2.category_id.id,
            genre_id: "5490020a-e866-4229-9adc-aa44b83234c4",
          }),
        ],
        is_active: true,
        created_at,
      },
      { include: ["categories_id"] },
    );
    const aggregate = GenreModelMapper.toEntity(model);
    expect(aggregate.toJSON()).toStrictEqual(
      new Genre({
        genre_id: new GenreId("5490020a-e866-4229-9adc-aa44b83234c4"),
        name: "some value",
        categories_id: new Map([
          [category1.category_id.id, category1.category_id],
          [category2.category_id.id, category2.category_id],
        ]),
        is_active: true,
        created_at,
      }).toJSON(),
    );
  });
});
