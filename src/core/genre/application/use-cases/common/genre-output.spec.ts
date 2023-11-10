import { Category } from "@core/category/domain/category.aggregate";
import { Genre } from "@core/genre/domain/genre.aggregate";
import { GenreOutput, GenreOutputMapper } from "./genre-output";

describe("GenreOutputMapper Unit Tests", () => {
  it("should convert a genre into output", () => {
    const categories = Category.fake().theCategories(2).build();
    const created_at = new Date();
    const genre = Genre.fake()
      .aGenre()
      .withName("test")
      .addCategoryId(categories[0].category_id)
      .addCategoryId(categories[0].category_id)
      .withCreatedAt(created_at)
      .build();

    const output = GenreOutputMapper.toOutput(genre, categories);

    // two ways of checking whether the output is ok
    const expectedOutput: GenreOutput = {
      id: genre.genre_id.id,
      name: genre.name,
      is_active: genre.is_active,
      created_at,
      categories: categories.map((c) => ({
        id: c.category_id.id,
        name: c.name,
        created_at: c.created_at,
      })),
      categories_id: categories.map((c) => c.category_id.id),
    };
    expect(output).toEqual(expectedOutput);

    expect(output).toEqual({
      id: genre.genre_id.id,
      name: "test",
      is_active: genre.is_active,
      created_at,
      categories: [
        {
          id: categories[0].category_id.id,
          name: categories[0].name,
          created_at: categories[0].created_at,
        },
        {
          id: categories[1].category_id.id,
          name: categories[1].name,
          created_at: categories[1].created_at,
        },
      ],
      categories_id: [
        categories[0].category_id.id,
        categories[1].category_id.id,
      ],
    });
  });
});
