import { CategoryId } from "@core/category/domain/category.aggregate";
import { Genre, GenreId } from "../genre.aggregate";

describe("Genre Unit Test", () => {
  beforeEach(() => {
    Genre.prototype.validate = jest
      .fn()
      .mockImplementation(Genre.prototype.validate);
  });
  test("constructor of genre", () => {
    const categoryId = new CategoryId();
    const categoriesId = new Map([[categoryId.id, categoryId]]);
    let genre = new Genre({
      name: "test",
      categories_id: categoriesId,
    });

    expect(genre.genre_id).toBeInstanceOf(GenreId);
    expect(genre.name).toBe("test");
    expect(genre.categories_id).toEqual(categoriesId);
    expect(genre.is_active).toBeTruthy();
    expect(genre.created_at).toBeInstanceOf(Date);
    expect(Genre.prototype.validate).not.toHaveBeenCalled();
  });

  describe("genre_id field", () => {
    const categoryId = new CategoryId();
    const categories_id = new Map([[categoryId.id, categoryId]]);
    const arrange = [
      { name: "Movie", categories_id },
      { name: "Movie", categories_id, genre_id: null },
      { name: "Movie", categories_id, genre_id: undefined },
      { name: "Movie", categories_id, genre_id: new GenreId() },
    ];
    test.each(arrange)("when props is %j", (item) => {
      //@ts-expect-error: it is a test
      const genre = new Genre(item);
      expect(genre.genre_id).toBeInstanceOf(GenreId);
    });
  });

  describe("create command", () => {
    test("should create a genre", () => {
      const categoryId = new CategoryId();
      const categories_id = new Map([[categoryId.id, categoryId]]);
      const genre = Genre.create({
        name: "test",
        categories_id: [categoryId],
      });
      expect(genre.genre_id).toBeInstanceOf(GenreId);
      expect(genre.name).toBe("test");
      expect(genre.categories_id).toEqual(categories_id);
      expect(genre.is_active).toBeTruthy();
      expect(genre.created_at).toBeInstanceOf(Date);
      expect(Genre.prototype.validate).toHaveBeenCalledTimes(1);
      expect(genre.notification.hasErrors()).toBe(false);

      const genre2 = Genre.create({
        name: "test",
        categories_id: [categoryId],
        is_active: false,
      });
      expect(genre2.genre_id).toBeInstanceOf(GenreId);
      expect(genre2.name).toBe("test");
      expect(genre2.categories_id).toEqual(categories_id);
      expect(genre2.is_active).toBeFalsy();
      expect(genre2.created_at).toBeInstanceOf(Date);
      expect(Genre.prototype.validate).toHaveBeenCalledTimes(2);
      expect(genre2.notification.hasErrors()).toBe(false);
    });
  });

  test("should change name", () => {
    const categoryId = new CategoryId();
    const genre = Genre.create({
      name: "test",
      categories_id: [categoryId],
    });
    genre.changeName("test2");
    expect(genre.name).toBe("test2");
    expect(Genre.prototype.validate).toHaveBeenCalledTimes(2);
  });

  test("should add category id", () => {
    const categoryId = new CategoryId();
    const genre = Genre.create({
      name: "test",
      categories_id: [categoryId],
    });
    genre.addCategoryId(categoryId);
    expect(genre.categories_id.size).toBe(1);
    expect(genre.categories_id).toEqual(new Map([[categoryId.id, categoryId]]));
    expect(Genre.prototype.validate).toHaveBeenCalledTimes(1);

    const categoryId2 = new CategoryId();
    genre.addCategoryId(categoryId2);
    expect(genre.categories_id.size).toBe(2);
    expect(genre.categories_id).toEqual(
      new Map([
        [categoryId.id, categoryId],
        [categoryId2.id, categoryId2],
      ]),
    );
    expect(Genre.prototype.validate).toHaveBeenCalledTimes(1);
  });

  describe("Genre Validator", () => {
    describe("create command", () => {
      test("invalid name", () => {
        const categoryId = new CategoryId();
        const genre = Genre.create({
          name: "t".repeat(256),
          categories_id: [categoryId],
        });
        expect(genre.notification.hasErrors()).toBe(true);
        expect(genre.notification).notificationContainsErrorMessages([
          {
            name: ["name must be shorter than or equal to 255 characters"],
          },
        ]);
      });
    });

    describe("changeName method", () => {
      it("should throw an error when name is invalid", () => {
        const genre = Genre.fake().aGenre().build();
        genre.changeName("t".repeat(256));
        expect(genre.notification.hasErrors()).toBeTruthy();
        expect(genre.notification).notificationContainsErrorMessages([
          {
            name: ["name must be shorter than or equal to 255 characters"],
          },
        ]);
      });
    });
  });

  //#region       Additional Tests
  describe("Additional tests", () => {
    it("should remove a category id", () => {
      const genre = Genre.fake().aGenre().build();
      expect(genre.categories_id.size).toBe(1);
      const categoryId = new CategoryId();
      genre.addCategoryId(categoryId);
      expect(genre.categories_id.size).toBe(2);
      genre.removeCategoryId(categoryId);
      expect(genre.categories_id.size).toBe(1);
      expect(genre.categories_id.has(categoryId.id)).toBeFalsy();
    });

    it("should sync categories id", () => {
      const category_id = new CategoryId();
      const genre = Genre.fake().aGenre().addCategoryId(category_id).build();
      const categories_id = [new CategoryId(), new CategoryId()];

      expect(genre.categories_id.size).toBe(1);
      expect(genre.categories_id.get(category_id.id)).toEqual(category_id);

      genre.syncCategories(categories_id);
      expect(genre.categories_id.size).toBe(2);
      categories_id.forEach((categoryId) => {
        expect(genre.categories_id.get(categoryId.id)).toEqual(categoryId);
      });

      categories_id.push(category_id);
      genre.syncCategories(categories_id);
      expect(genre.categories_id.size).toBe(3);
      categories_id.forEach((categoryId) => {
        expect(genre.categories_id.get(categoryId.id)).toEqual(categoryId);
      });
    });

    it("should deactivate a genre", () => {
      const genre = Genre.fake().aGenre().build();
      expect(genre.is_active).toBeTruthy();
      genre.deactivate();
      expect(genre.is_active).toBeFalsy();
    });

    it("should activate a genre", () => {
      const genre = Genre.fake().aGenre().build();
      expect(genre.is_active).toBeTruthy();
      genre.deactivate();
      expect(genre.is_active).toBeFalsy();
      genre.activate();
      expect(genre.is_active).toBeTruthy();
    });

    it("should converte to JSON", () => {
      const genre = Genre.fake().aGenre().build();
      expect(genre.toJSON()).toEqual({
        id: genre.genre_id.id,
        name: genre.name,
        categories_id: [Array.from(genre.categories_id.values())[0].id],
        is_active: genre.is_active,
        created_at: genre.created_at,
      });
    });
  });
  //#endregion    Additional Tests
});
