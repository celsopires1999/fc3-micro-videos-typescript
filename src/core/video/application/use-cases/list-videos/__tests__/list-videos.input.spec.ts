import {
  ListVideosFilter,
  ListVideosInput,
  ValidateListVideosInput,
} from "../list-videos.input";

describe("ValidateListVideosInput", () => {
  it("should pass if all fields are valid", () => {
    const input = new ListVideosInput();
    input.page = 1;
    input.per_page = 10;
    input.sort = "title";
    input.sort_dir = "asc";
    input.filter = new ListVideosFilter();
    input.filter.title = "title";
    input.filter.categories_id = ["26e69ede-9c73-45ab-8f1c-9880efa1cbf2"];
    input.filter.genres_id = ["26e69ede-9c73-45ab-8f1c-9880efa1cbf2"];
    input.filter.cast_members_id = ["26e69ede-9c73-45ab-8f1c-9880efa1cbf2"];

    const errors = ValidateListVideosInput.validate(input);
    expect(errors.length).toBe(0);
  });

  it("should fail if filter.categories_id is not an array", () => {
    const input = new ListVideosInput();
    input.page = 1;
    input.per_page = 10;
    input.sort = "title";
    input.sort_dir = "asc";
    input.filter = new ListVideosFilter();
    input.filter.title = "title";
    //@ts-expect-error Type 'string' is not assignable to type 'string[]'
    input.filter.categories_id = "26e69ede-9c73-45ab-8f1c-9880efa1cbf2";
    input.filter.genres_id = ["26e69ede-9c73-45ab-8f1c-9880efa1cbf2"];
    input.filter.cast_members_id = ["26e69ede-9c73-45ab-8f1c-9880efa1cbf2"];

    const errors = ValidateListVideosInput.validate(input);
    expect(errors.length).toBe(1);
  });
});
