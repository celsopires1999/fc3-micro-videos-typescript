import { Genre } from "@core/genre/domain/genre.aggregate";
import { GenreInMemoryRepository } from "../genre-in-memory.repository";
import { GenreFilter } from "@core/genre/domain/genre.repository";
import { CategoryId } from "@core/category/domain/category.aggregate";

describe("GenreInMemoryRepository", () => {
  let repository: GenreInMemoryRepository;

  beforeEach(() => (repository = new GenreInMemoryRepository()));
  it("should not filter items when filter object is null", async () => {
    const items = [Genre.fake().aGenre().build()];
    const filterSpy = jest.spyOn(items, "filter" as any);

    const itemsFiltered = await repository["applyFilter"](
      items,
      null as unknown as GenreFilter,
    );
    expect(filterSpy).not.toHaveBeenCalled();
    expect(itemsFiltered).toStrictEqual(items);
  });

  it("should filter items by name", async () => {
    const faker = Genre.fake().aGenre();
    const items = [
      faker.withName("test").build(),
      faker.withName("TEST").build(),
      faker.withName("fake").build(),
    ];
    const filterSpy = jest.spyOn(items, "filter" as any);

    const itemsFiltered = await repository["applyFilter"](items, {
      name: "TEST",
    });
    expect(filterSpy).toHaveBeenCalledTimes(1);
    expect(itemsFiltered).toStrictEqual([items[0], items[1]]);
  });

  it("should filter items by categories_id", async () => {
    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();
    const categoryId3 = new CategoryId();
    const categoryId4 = new CategoryId();
    const items = [
      Genre.fake()
        .aGenre()
        .addCategoryId(categoryId1)
        .addCategoryId(categoryId2)
        .build(),
      Genre.fake()
        .aGenre()
        .addCategoryId(categoryId3)
        .addCategoryId(categoryId4)
        .build(),
    ];
    const spyFilterMethod = jest.spyOn(items, "filter" as any);

    let filteredItems = await repository["applyFilter"](items, {
      categories_id: [categoryId1],
    });
    expect(spyFilterMethod).toHaveBeenCalledTimes(1);
    expect(filteredItems).toStrictEqual([items[0]]);

    filteredItems = await repository["applyFilter"](items, {
      categories_id: [categoryId2],
    });
    expect(spyFilterMethod).toHaveBeenCalledTimes(2);
    expect(filteredItems).toStrictEqual([items[0]]);

    filteredItems = await repository["applyFilter"](items, {
      categories_id: [categoryId1, categoryId2],
    });
    expect(spyFilterMethod).toHaveBeenCalledTimes(3);
    expect(filteredItems).toStrictEqual([items[0]]);

    filteredItems = await repository["applyFilter"](items, {
      categories_id: [categoryId1, categoryId3],
    });
    expect(spyFilterMethod).toHaveBeenCalledTimes(4);
    expect(filteredItems).toStrictEqual([...items]);
  });

  it("should filter items by name and categories_id", async () => {
    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();
    const categoryId3 = new CategoryId();
    const categoryId4 = new CategoryId();
    const items = [
      Genre.fake()
        .aGenre()
        .withName("test")
        .addCategoryId(categoryId1)
        .addCategoryId(categoryId2)
        .build(),
      Genre.fake()
        .aGenre()
        .withName("fake")
        .addCategoryId(categoryId3)
        .addCategoryId(categoryId4)
        .build(),

      Genre.fake()
        .aGenre()
        .withName("test fake")
        .addCategoryId(categoryId1)
        .build(),
    ];
    const spyFilterMethod = jest.spyOn(items, "filter" as any);

    let filteredItems = await repository["applyFilter"](items, {
      name: "test",
      categories_id: [categoryId1],
    });
    expect(spyFilterMethod).toHaveBeenCalledTimes(1);
    expect(filteredItems).toStrictEqual([items[0], items[2]]);

    filteredItems = await repository["applyFilter"](items, {
      name: "test",
      categories_id: [categoryId3],
    });
    expect(spyFilterMethod).toHaveBeenCalledTimes(2);
    expect(filteredItems).toStrictEqual([]);

    filteredItems = await repository["applyFilter"](items, {
      name: "fake",
      categories_id: [categoryId4],
    });
    expect(spyFilterMethod).toHaveBeenCalledTimes(3);
    expect(filteredItems).toStrictEqual([items[1]]);
  });

  it("should sort by created_at when sort param is null", async () => {
    const created_at = new Date();

    const items = [
      Genre.fake().aGenre().withName("test").withCreatedAt(created_at).build(),
      Genre.fake()
        .aGenre()
        .withName("TEST")
        .withCreatedAt(new Date(created_at.getTime() + 100))
        .build(),
      Genre.fake()
        .aGenre()
        .withName("fake")
        .withCreatedAt(new Date(created_at.getTime() + 200))
        .build(),
    ];

    const itemsSorted = await repository["applySort"](items, null, null);
    expect(itemsSorted).toStrictEqual([items[2], items[1], items[0]]);
  });

  it("should sort by name", async () => {
    const items = [
      Genre.fake().aGenre().withName("c").build(),
      Genre.fake().aGenre().withName("b").build(),
      Genre.fake().aGenre().withName("a").build(),
    ];

    let itemsSorted = await repository["applySort"](items, "name", "asc");
    expect(itemsSorted).toStrictEqual([items[2], items[1], items[0]]);

    itemsSorted = await repository["applySort"](items, "name", "desc");
    expect(itemsSorted).toStrictEqual([items[0], items[1], items[2]]);
  });
});
