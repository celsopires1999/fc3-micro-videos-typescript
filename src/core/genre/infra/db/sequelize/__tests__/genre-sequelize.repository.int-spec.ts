import { Category } from "@core/category/domain/category.aggregate";
import { CategorySequelizeRepository } from "@core/category/infra/db/sequelize/category-sequelize.repository";
import { CategoryModel } from "@core/category/infra/db/sequelize/category.model";
import { Genre, GenreId } from "@core/genre/domain/genre.aggregate";
import { NotFoundError } from "@core/shared/domain/errors/not-found.error";
import { setupSequelize } from "@core/shared/infra/testing/helpers";
import { GenreSequelizeRepository } from "../genre-sequelize.repository";
import { GenreCategoryModel, GenreModel } from "../genre.model";

describe("GenreSequelizeRepository Integration Test", () => {
  let genreRepo: GenreSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;
  setupSequelize({ models: [GenreModel, GenreCategoryModel, CategoryModel] });

  beforeEach(async () => {
    genreRepo = new GenreSequelizeRepository(GenreModel);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
  });

  it("should insert a new aggregate", async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();

    await genreRepo.insert(genre);
    const foundGenre = await genreRepo.findById(genre.genre_id);
    expect(foundGenre!.toJSON()).toStrictEqual(genre.toJSON());
  });

  it("should insert many new aggregates", async () => {
    const categories = Category.fake().theCategories(3).build();
    await categoryRepo.bulkInsert(categories);
    const genres = Genre.fake()
      .theGenres(2)
      .addCategoryId(categories[0].category_id)
      .addCategoryId(categories[1].category_id)
      .addCategoryId(categories[2].category_id)
      .build();
    await genreRepo.bulkInsert(genres);
    const foundGenres = await genreRepo.findAll();
    expect(foundGenres.length).toBe(2);
    expect(foundGenres[0].toJSON()).toStrictEqual({
      ...genres[0].toJSON(),
      categories_id: expect.arrayContaining([
        categories[0].category_id.id,
        categories[1].category_id.id,
        categories[2].category_id.id,
      ]),
    });
    expect(foundGenres[1].toJSON()).toStrictEqual({
      ...genres[1].toJSON(),
      categories_id: expect.arrayContaining([
        categories[0].category_id.id,
        categories[1].category_id.id,
        categories[2].category_id.id,
      ]),
    });
  });

  it("should find an aggregate by id", async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);

    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    await genreRepo.insert(genre);
    const foundGenre = await genreRepo.findById(genre.genre_id);
    expect(foundGenre!.toJSON()).toStrictEqual(genre.toJSON());
  });

  it("should not find an aggregate by id when it does not exist", async () => {
    const genreNotFound = await genreRepo.findById(new GenreId());
    expect(genreNotFound).toBeNull();
  });

  it("should return all aggreates", async () => {
    const categories = Category.fake().theCategories(3).build();
    await categoryRepo.bulkInsert(categories);

    const genres = Genre.fake()
      .theGenres(3)
      .addCategoryId(categories[0].category_id)
      .addCategoryId(categories[1].category_id)
      .addCategoryId(categories[2].category_id)
      .build();
    await genreRepo.bulkInsert(genres);

    const foundGenres = await genreRepo.findAll();
    expect(foundGenres).toHaveLength(3);
    expect(foundGenres[0].toJSON()).toStrictEqual({
      ...genres[0].toJSON(),
      categories_id: expect.arrayContaining([
        categories[0].category_id.id,
        categories[1].category_id.id,
        categories[2].category_id.id,
      ]),
    });
    expect(foundGenres[1].toJSON()).toStrictEqual({
      ...genres[1].toJSON(),
      categories_id: expect.arrayContaining([
        categories[0].category_id.id,
        categories[1].category_id.id,
        categories[2].category_id.id,
      ]),
    });
    expect(foundGenres[2].toJSON()).toStrictEqual({
      ...genres[2].toJSON(),
      categories_id: expect.arrayContaining([
        categories[0].category_id.id,
        categories[1].category_id.id,
        categories[2].category_id.id,
      ]),
    });
  });

  it("should throw error on update when an aggregate is not found", async () => {
    const aggregate = Genre.fake().aGenre().build();
    await expect(genreRepo.update(aggregate)).rejects.toThrow(
      new NotFoundError(aggregate.genre_id.id, Genre),
    );
  });

  it("should update an aggregate", async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);

    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    await genreRepo.insert(genre);

    const otherCategory = Category.fake().aCategory().build();
    await categoryRepo.insert(otherCategory);

    genre.changeName("Terror");
    genre.syncCategories([otherCategory.category_id]);
    await genreRepo.update(genre);

    const foundGenre = await genreRepo.findById(genre.genre_id);
    expect(foundGenre?.categories_id.size).toBe(1);
    expect(foundGenre!.toJSON()).toStrictEqual(genre.toJSON());
  });

  it("should throw error on delete when an aggregate is not found", async () => {
    const genreId = new GenreId();
    await expect(genreRepo.delete(genreId)).rejects.toThrow(
      new NotFoundError(genreId.id, Genre),
    );
  });

  it("should delete an aggregate", async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);

    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    await genreRepo.insert(genre);

    await genreRepo.delete(genre.genre_id);
    await expect(genreRepo.findById(genre.genre_id)).resolves.toBeNull();
  });
});
