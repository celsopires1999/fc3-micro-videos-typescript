import { CategoryId } from "@core/category/domain/category.aggregate";
import { Chance } from "chance";
import { GenreFakeBuilder } from "../genre-fake.builder";
import { GenreId } from "../genre.aggregate";

describe("GenreFakerBuilder Unit Tests", () => {
  describe("genre_id prop", () => {
    const faker = GenreFakeBuilder.aGenre();

    test("should throw error when genre_id with methods has been called", () => {
      expect(() => faker.genre_id).toThrowError(
        new Error(
          `Property genre_id does not have a factory, use "with" method instead`,
        ),
      );
    });

    test("should be undefined", () => {
      expect(faker["_genre_id"]).toBeUndefined();
    });

    test("withGenreId", () => {
      const genre_id = new GenreId();
      const $this = faker.withGenreId(genre_id);
      expect($this).toBeInstanceOf(GenreFakeBuilder);
      expect(faker["_genre_id"]).toBe(genre_id);

      faker.withGenreId(() => genre_id);
      //@ts-expect-error _genre_id is a callable
      expect(faker["_genre_id"]()).toBe(genre_id);

      expect(faker.genre_id).toBe(genre_id);
    });

    test("should pass index to genre_id factory", () => {
      let mockFactory = jest.fn(() => new GenreId());
      faker.withGenreId(mockFactory);
      faker.build();
      expect(mockFactory).toHaveBeenCalledTimes(1);

      const genreId = new GenreId();
      mockFactory = jest.fn(() => genreId);
      const fakerMany = GenreFakeBuilder.theGenres(2);
      fakerMany.withGenreId(mockFactory);
      fakerMany.build();

      expect(mockFactory).toHaveBeenCalledTimes(2);
      expect(fakerMany.build()[0].genre_id).toBe(genreId);
      expect(fakerMany.build()[1].genre_id).toBe(genreId);
    });
  });

  describe("name prop", () => {
    const faker = GenreFakeBuilder.aGenre();
    test("should be a function", () => {
      expect(typeof faker["_name"]).toBe("function");
    });

    test("should call the word method", () => {
      const chance = Chance();
      const spyWordMethod = jest.spyOn(chance, "word");
      faker["chance"] = chance;
      faker.build();

      expect(spyWordMethod).toHaveBeenCalled();
    });

    test("withName", () => {
      const $this = faker.withName("test name");
      expect($this).toBeInstanceOf(GenreFakeBuilder);
      expect(faker["_name"]).toBe("test name");

      faker.withName(() => "test name");
      //@ts-expect-error name is callable
      expect(faker["_name"]()).toBe("test name");

      expect(faker.name).toBe("test name");
    });

    test("should pass index to name factory", () => {
      faker.withName((index) => `test name ${index}`);
      const genre = faker.build();
      expect(genre.name).toBe(`test name 0`);

      const fakerMany = GenreFakeBuilder.theGenres(2);
      fakerMany.withName((index) => `test name ${index}`);
      const genres = fakerMany.build();

      expect(genres[0].name).toBe(`test name 0`);
      expect(genres[1].name).toBe(`test name 1`);
    });

    test("invalid too long case", () => {
      const $this = faker.withInvalidNameTooLong();
      expect($this).toBeInstanceOf(GenreFakeBuilder);
      expect(faker["_name"].length).toBe(256);

      const tooLong = "a".repeat(256);
      faker.withInvalidNameTooLong(tooLong);
      expect(faker["_name"].length).toBe(256);
      expect(faker["_name"]).toBe(tooLong);
    });
  });

  describe("categories_id prop", () => {
    const faker = GenreFakeBuilder.aGenre();
    test("addCategoryId", () => {
      const categoryId = new CategoryId();
      const $this = faker.addCategoryId(categoryId);
      expect($this).toBeInstanceOf(GenreFakeBuilder);
      expect(faker.categories_id).toEqual([categoryId]);
    });
  });

  describe("created_at prop", () => {
    const faker = GenreFakeBuilder.aGenre();

    test("should throw error when any with methods has called", () => {
      const fakerCastMember = GenreFakeBuilder.aGenre();
      expect(() => fakerCastMember.created_at).toThrowError(
        new Error(
          `Property created_at does not have a factory, use "with" method instead`,
        ),
      );
    });

    test("should be undefined", () => {
      expect(faker["_created_at"]).toBeUndefined();
    });

    test("withCreatedAt", () => {
      const date = new Date();
      const $this = faker.withCreatedAt(date);
      expect($this).toBeInstanceOf(GenreFakeBuilder);
      expect(faker["_created_at"]).toBe(date);

      faker.withCreatedAt(() => date);
      //@ts-expect-error _created_at is a callable
      expect(faker["_created_at"]()).toBe(date);
      expect(faker.created_at).toBe(date);
    });

    test("should pass index to created_at factory", () => {
      const date = new Date();
      faker.withCreatedAt((index) => new Date(date.getTime() + index + 2));
      const genre = faker.build();
      expect(genre.created_at.getTime()).toBe(date.getTime() + 2);

      const fakerMany = GenreFakeBuilder.theGenres(2);
      fakerMany.withCreatedAt((index) => new Date(date.getTime() + index + 2));
      const genres = fakerMany.build();

      expect(genres[0].created_at.getTime()).toBe(date.getTime() + 2);
      expect(genres[1].created_at.getTime()).toBe(date.getTime() + 3);
    });
  });

  test("should create a genre", () => {
    const faker = GenreFakeBuilder.aGenre();
    let genre = faker.build();

    expect(genre.genre_id).toBeInstanceOf(GenreId);
    expect(typeof genre.name === "string").toBeTruthy();
    expect(genre.created_at).toBeInstanceOf(Date);

    const created_at = new Date();
    const genre_id = new GenreId();
    const categoryId = new CategoryId();
    genre = faker
      .withGenreId(genre_id)
      .withName("name test")
      .addCategoryId(categoryId)
      .withCreatedAt(created_at)
      .build();

    expect(genre.genre_id.id).toBe(genre_id.id);
    expect(genre.name).toBe("name test");
    expect(genre.categories_id).toEqual(new Map([[categoryId.id, categoryId]]));
    expect(genre.created_at).toBe(created_at);
  });

  test("should create many genres", () => {
    const faker = GenreFakeBuilder.theGenres(2);
    let genres = faker.build();

    genres.forEach((genre) => {
      expect(genre.genre_id).toBeInstanceOf(GenreId);
      expect(typeof genre.name === "string").toBeTruthy();
      expect(genre.created_at).toBeInstanceOf(Date);
    });

    const created_at = new Date();
    const genre_id = new GenreId();
    genres = faker
      .withGenreId(genre_id)
      .withName("name test")
      .withCreatedAt(created_at)
      .build();

    genres.forEach((genre) => {
      expect(genre.genre_id.id).toBe(genre_id.id);
      expect(genre.name).toBe("name test");
      expect(genre.categories_id.size).toBe(1);
      expect(
        typeof genre.categories_id.keys().next().value === "string",
      ).toBeTruthy();
      expect(
        genre.categories_id.values().next().value instanceof CategoryId,
      ).toBeTruthy();
      expect(genre.created_at).toBe(created_at);
    });
  });
});
