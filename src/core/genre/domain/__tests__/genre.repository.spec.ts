import { CategoryId } from "@core/category/domain/category.aggregate";
import { GenreSearchParams } from "../genre.repository";

describe("GenreSearchParams", () => {
  describe("create", () => {
    it("should create a new instance with default values", () => {
      const searchParams = GenreSearchParams.create();
      expect(searchParams).toBeInstanceOf(GenreSearchParams);
      expect(searchParams.filter).toBeNull();
    });

    it("should create a new instance with provided values", () => {
      const searchParams = GenreSearchParams.create({
        filter: {
          name: "Action",
          categories_id: ["71b1097c-d831-4b10-8170-045dc2d6217b"],
        },
      });
      expect(searchParams).toBeInstanceOf(GenreSearchParams);
      expect(searchParams.filter).toEqual({
        name: "Action",
        categories_id: [new CategoryId("71b1097c-d831-4b10-8170-045dc2d6217b")],
      });
    });
  });
});
