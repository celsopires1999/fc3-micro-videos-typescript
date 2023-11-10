import { Category } from "@core/category/domain/category.aggregate";
import { CategorySequelizeRepository } from "@core/category/infra/db/sequelize/category-sequelize.repository";
import { CategoryModel } from "@core/category/infra/db/sequelize/category.model";
import { Genre, GenreId } from "@core/genre/domain/genre.aggregate";
import {
  GenreSearchParams,
  GenreSearchResult,
} from "@core/genre/domain/genre.repository";
import { NotFoundError } from "@core/shared/domain/errors/not-found.error";
import { UnitOfWorkSequelize } from "@core/shared/infra/db/sequelize/unit-of-work-sequelize";
import { setupSequelize } from "@core/shared/infra/testing/helpers";
import { GenreModelMapper } from "../genre-model-mapper";
import { GenreSequelizeRepository } from "../genre-sequelize.repository";
import { GenreCategoryModel, GenreModel } from "../genre.model";

describe("GenreSequelizeRepository Integration Test", () => {
  let uow: UnitOfWorkSequelize;
  let genreRepo: GenreSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;
  const sequelizeHelper = setupSequelize({
    models: [GenreModel, GenreCategoryModel, CategoryModel],
    logging: false,
  });

  beforeEach(async () => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
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
    expect(foundGenre?.genre_id).toBeValueObject(genre.genre_id);
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
    expect(foundGenre?.genre_id).toBeValueObject(genre.genre_id);
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
    expect(foundGenre?.genre_id).toBeValueObject(genre.genre_id);
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

  describe("transaction mode", () => {
    describe("insert method", () => {
      it("should insert a genre", async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.category_id)
          .build();

        await uow.start();
        await genreRepo.insert(genre);
        await uow.commit();

        const foundGenre = await genreRepo.findById(genre.genre_id);
        expect(foundGenre?.genre_id).toBeValueObject(genre.genre_id);
      });

      it("should rollback the insertion", async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.category_id)
          .build();

        await uow.start();
        await genreRepo.insert(genre);
        await uow.rollback();

        await expect(genreRepo.findById(genre.genre_id)).resolves.toBeNull();
      });
    });

    describe("bulkInsert method", () => {
      it("should insert a list of genres", async () => {
        const categories = Category.fake().theCategories(3).build();
        await categoryRepo.bulkInsert(categories);
        const genres = Genre.fake()
          .theGenres(2)
          .addCategoryId(categories[0].category_id)
          .addCategoryId(categories[1].category_id)
          .addCategoryId(categories[2].category_id)
          .build();

        await uow.start();
        await genreRepo.bulkInsert(genres);
        await uow.commit();

        const [genre1, genre2] = await Promise.all([
          genreRepo.findById(genres[0].genre_id),
          genreRepo.findById(genres[1].genre_id),
        ]);

        expect(genre1!.genre_id).toBeValueObject(genres[0].genre_id);
        expect(genre2!.genre_id).toBeValueObject(genres[1].genre_id);
      });

      it("should rollback the insertion of genres", async () => {
        const categories = Category.fake().theCategories(3).build();
        await categoryRepo.bulkInsert(categories);
        const genres = Genre.fake()
          .theGenres(2)
          .addCategoryId(categories[0].category_id)
          .addCategoryId(categories[1].category_id)
          .addCategoryId(categories[2].category_id)
          .build();

        await uow.start();
        await genreRepo.bulkInsert(genres);
        await uow.rollback();

        await expect(
          genreRepo.findById(genres[0].genre_id),
        ).resolves.toBeNull();
        await expect(
          genreRepo.findById(genres[1].genre_id),
        ).resolves.toBeNull();
      });
    });

    describe("findById method", () => {
      it("should return a genre", async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);

        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.category_id)
          .build();

        await uow.start();
        await genreRepo.insert(genre);
        const foundGenre = await genreRepo.findById(genre.genre_id);
        expect(foundGenre?.genre_id).toBeValueObject(genre.genre_id);
        await uow.commit();
      });
    });

    describe("findAll method", () => {
      it("should return a list of genres", async () => {
        const categories = Category.fake().theCategories(3).build();
        await categoryRepo.bulkInsert(categories);

        const genres = Genre.fake()
          .theGenres(3)
          .addCategoryId(categories[0].category_id)
          .addCategoryId(categories[1].category_id)
          .addCategoryId(categories[2].category_id)
          .build();

        await uow.start();
        await genreRepo.bulkInsert(genres);
        const foundGenres = await genreRepo.findAll();
        expect(foundGenres).toHaveLength(3);
        await uow.commit();
      });
    });

    describe("findByIds method", () => {
      it("should return a list of genres", async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        const genres = Genre.fake()
          .theGenres(3)
          .addCategoryId(category.category_id)
          .build();

        await uow.start();
        await genreRepo.bulkInsert(genres);
        const foundGenres = await genreRepo.findByIds(
          genres.map((g) => g.genre_id),
        );
        expect(foundGenres.length).toBe(3);
        await uow.commit();
      });
    });

    describe("existsById method", () => {
      it("should return true if the genre exists", async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);

        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.category_id)
          .build();

        await uow.start();
        await genreRepo.insert(genre);
        const existsResult = await genreRepo.existsById([genre.genre_id]);
        expect(existsResult.exists[0]).toBeValueObject(genre.genre_id);
        await uow.commit();
      });
    });

    describe("update method", () => {
      it("should update a genre", async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);

        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.category_id)
          .build();
        await genreRepo.insert(genre);

        genre.changeName("Terror");

        await uow.start();
        await genreRepo.update(genre);

        const foundGenre = await genreRepo.findById(genre.genre_id);
        expect(foundGenre?.name).toBe("Terror");
        await uow.commit();
      });

      it("should rollback the update of a genre", async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);

        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.category_id)
          .build();
        await genreRepo.insert(genre);

        genre.changeName("Terror");
        await uow.start();
        await genreRepo.update(genre);
        await uow.rollback();

        const foundGenre = await genreRepo.findById(genre.genre_id);
        expect(foundGenre?.name).not.toBe("Terror");
      });
    });

    describe("delete method", () => {
      it("should delete a genre", async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);

        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.category_id)
          .build();
        await genreRepo.insert(genre);

        await uow.start();
        await genreRepo.delete(genre.genre_id);
        await expect(genreRepo.findById(genre.genre_id)).resolves.toBeNull();
        await uow.commit();
      });

      it("should roolback a deletion", async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);

        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.category_id)
          .build();
        await genreRepo.insert(genre);

        await uow.start();
        await genreRepo.delete(genre.genre_id);
        await expect(genreRepo.findById(genre.genre_id)).resolves.toBeNull();
        await uow.rollback();

        const foundGenre = await genreRepo.findById(genre.genre_id);
        expect(foundGenre!.genre_id).toBeValueObject(genre.genre_id);
        expect(foundGenre!.categories_id.size).toBe(1);
      });
    });

    describe("search method", () => {
      it("should return a list of genres", async () => {
        const categories = Category.fake().theCategories(3).build();
        await categoryRepo.bulkInsert(categories);

        const genres = Genre.fake()
          .theGenres(3)
          .withName("Action")
          .addCategoryId(categories[0].category_id)
          .addCategoryId(categories[1].category_id)
          .addCategoryId(categories[2].category_id)
          .build();

        await uow.start();
        await genreRepo.bulkInsert(genres);
        const searchParams = GenreSearchParams.create({
          filter: { name: "Action" },
        });
        const foundGenres = await genreRepo.search(searchParams);
        expect(foundGenres.items.length).toBe(3);
        expect(foundGenres.total).toBe(3);
        await uow.commit();
      });

      it("should order by created_at DESC when search params are null", async () => {
        const categories = Category.fake().theCategories(3).build();
        await categoryRepo.bulkInsert(categories);
        const genres = Genre.fake()
          .theGenres(16)
          .withCreatedAt(
            (index) => new Date(new Date().getTime() + 100 + index),
          )
          .addCategoryId(categories[0].category_id)
          .addCategoryId(categories[1].category_id)
          .addCategoryId(categories[2].category_id)
          .build();
        await genreRepo.bulkInsert(genres);
        const spyToEntity = jest.spyOn(GenreModelMapper, "toEntity");
        const searchOutput = await genreRepo.search(GenreSearchParams.create());
        expect(searchOutput).toBeInstanceOf(GenreSearchResult);
        expect(spyToEntity).toHaveBeenCalledTimes(15);
        expect(searchOutput.toJSON()).toMatchObject({
          total: 16,
          current_page: 1,
          last_page: 2,
          per_page: 15,
        });
      });

      it("should apply paginate and filter by name", async () => {
        const categories = Category.fake().theCategories(3).build();
        await categoryRepo.bulkInsert(categories);

        const genres = [
          Genre.fake()
            .aGenre()
            .withName("test")
            .withCreatedAt(new Date(new Date().getTime() + 4000))
            .addCategoryId(categories[0].category_id)
            .addCategoryId(categories[1].category_id)
            .addCategoryId(categories[2].category_id)
            .build(),
          Genre.fake()
            .aGenre()
            .withName("a")
            .withCreatedAt(new Date(new Date().getTime() + 3000))
            .addCategoryId(categories[0].category_id)
            .addCategoryId(categories[1].category_id)
            .addCategoryId(categories[2].category_id)
            .build(),
          Genre.fake()
            .aGenre()
            .withName("TEST")
            .withCreatedAt(new Date(new Date().getTime() + 2000))
            .addCategoryId(categories[0].category_id)
            .addCategoryId(categories[1].category_id)
            .addCategoryId(categories[2].category_id)
            .build(),
          Genre.fake()
            .aGenre()
            .withName("TeSt")
            .withCreatedAt(new Date(new Date().getTime() + 1000))
            .addCategoryId(categories[0].category_id)
            .addCategoryId(categories[1].category_id)
            .addCategoryId(categories[2].category_id)
            .build(),
        ];

        await genreRepo.bulkInsert(genres);

        let searchOutput = await genreRepo.search(
          GenreSearchParams.create({
            page: 1,
            per_page: 2,
            filter: { name: "TEST" },
          }),
        );

        let expected = new GenreSearchResult({
          items: [genres[0], genres[2]],
          total: 3,
          current_page: 1,
          per_page: 2,
        }).toJSON(true);

        expect(searchOutput.toJSON(true)).toStrictEqual({
          ...expected,
          items: [
            {
              ...expected.items[0],
              categories_id: expect.arrayContaining([
                categories[0].category_id.id,
                categories[1].category_id.id,
                categories[2].category_id.id,
              ]),
            },
            {
              ...expected.items[1],
              categories_id: expect.arrayContaining([
                categories[0].category_id.id,
                categories[1].category_id.id,
                categories[2].category_id.id,
              ]),
            },
          ],
        });

        searchOutput = await genreRepo.search(
          GenreSearchParams.create({
            page: 2,
            per_page: 2,
            filter: { name: "TEST" },
          }),
        );

        expected = new GenreSearchResult({
          items: [genres[3]],
          total: 3,
          current_page: 2,
          per_page: 2,
        }).toJSON(true);

        expect(searchOutput.toJSON(true)).toStrictEqual({
          ...expected,
          items: [
            {
              ...expected.items[0],
              categories_id: expect.arrayContaining([
                categories[0].category_id.id,
                categories[1].category_id.id,
                categories[2].category_id.id,
              ]),
            },
          ],
        });
      });

      it("should apply paginate and filter by categories_id", async () => {
        const categories = Category.fake().theCategories(4).build();
        await categoryRepo.bulkInsert(categories);

        const genres = [
          Genre.fake()
            .aGenre()
            .withCreatedAt(new Date(new Date().getTime() + 4000))
            .addCategoryId(categories[0].category_id)
            .build(),
          Genre.fake()
            .aGenre()
            .withCreatedAt(new Date(new Date().getTime() + 3000))
            .addCategoryId(categories[1].category_id)
            .build(),
          Genre.fake()
            .aGenre()
            .withCreatedAt(new Date(new Date().getTime() + 2000))
            .addCategoryId(categories[2].category_id)
            .build(),
          Genre.fake()
            .aGenre()
            .withCreatedAt(new Date(new Date().getTime() + 1000))
            .addCategoryId(categories[3].category_id)
            .build(),
        ];

        await genreRepo.bulkInsert(genres);

        let searchOutput = await genreRepo.search(
          GenreSearchParams.create({
            page: 1,
            per_page: 2,
            filter: { categories_id: [categories[0].category_id] },
          }),
        );

        expect(searchOutput.toJSON(true)).toMatchObject(
          new GenreSearchResult({
            items: [genres[0]],
            total: 1,
            current_page: 1,
            per_page: 2,
          }).toJSON(true),
        );

        searchOutput = await genreRepo.search(
          GenreSearchParams.create({
            page: 1,
            per_page: 2,
            filter: {
              categories_id: [
                categories[1].category_id,
                categories[2].category_id,
              ],
            },
          }),
        );

        expect(searchOutput.toJSON(true)).toMatchObject(
          new GenreSearchResult({
            items: [genres[1], genres[2]],
            total: 2,
            current_page: 1,
            per_page: 2,
          }).toJSON(true),
        );
      });
    });
  });
});
