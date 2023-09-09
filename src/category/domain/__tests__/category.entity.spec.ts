import { Uuid } from "../../../shared/domain/value-objects/uuid.vo";
import { Category } from "../category.entity";

describe("Category Unit Tests", () => {
  describe("constructor", () => {
    test("with default values ", () => {
      const category = new Category({ name: "Movie" });
      expect(category.category_id).toBeInstanceOf(Uuid);
      expect(category.name).toBe("Movie");
      expect(category.description).toBeNull();
      expect(category.is_active).toBeTruthy();
      expect(category.created_at).toBeInstanceOf(Date);
    });

    test("with all values ", () => {
      const category_id = new Uuid("7f104946-a32a-4288-9de1-b60b3cf1af67");
      const created_at = new Date();
      const category = new Category({
        category_id,
        name: "Movie",
        description: "Movie description",
        is_active: false,
        created_at,
      });
      expect(category.category_id).toEqual(category_id);
      expect(category.name).toBe("Movie");
      expect(category.description).toBe("Movie description");
      expect(category.is_active).toBeFalsy();
      expect(category.created_at).toEqual(created_at);
    });

    test("with name and description", () => {
      const category = new Category({
        name: "Movie",
        description: "Movie description",
      });
      expect(category.category_id).toBeInstanceOf(Uuid);
      expect(category.name).toBe("Movie");
      expect(category.description).toBe("Movie description");
      expect(category.is_active).toBeTruthy();
      expect(category.created_at).toBeInstanceOf(Date);
    });
  });
  describe("getters and setters", () => {
    test("entity_id", () => {
      const category_id = new Uuid("7f104946-a32a-4288-9de1-b60b3cf1af67");
      const category = new Category({ category_id, name: "Movie" });
      expect(category.entity_id).toBe(category_id);
    });
  });
  describe("methods", () => {
    test("changeName", () => {
      const category = Category.create({ name: "Movie" });
      category.changeName("Other Movie");
      expect(category.category_id).toBeInstanceOf(Uuid);
      expect(category.name).toBe("Other Movie");
      expect(category.description).toBeNull();
      expect(category.is_active).toBeTruthy();
      expect(category.created_at).toBeInstanceOf(Date);
    });
    test("changeDescription", () => {
      const category = Category.create({
        name: "Movie",
        description: "Movie Description",
      });
      category.changeDescription("Other Description");
      expect(category.category_id).toBeInstanceOf(Uuid);
      expect(category.name).toBe("Movie");
      expect(category.description).toBe("Other Description");
      expect(category.is_active).toBeTruthy();
      expect(category.created_at).toBeInstanceOf(Date);
    });
    test("activate", () => {
      const category = Category.create({
        name: "Movie",
        is_active: false,
      });
      expect(category.is_active).toBeFalsy();
      category.activate();
      expect(category.category_id).toBeInstanceOf(Uuid);
      expect(category.name).toBe("Movie");
      expect(category.description).toBeNull();
      expect(category.is_active).toBeTruthy();
      expect(category.created_at).toBeInstanceOf(Date);
    });
    test("deactivate", () => {
      const category = Category.create({
        name: "Movie",
        is_active: true,
      });
      expect(category.is_active).toBeTruthy();
      category.deactivate();
      expect(category.category_id).toBeInstanceOf(Uuid);
      expect(category.name).toBe("Movie");
      expect(category.description).toBeNull();
      expect(category.is_active).toBeFalsy();
      expect(category.created_at).toBeInstanceOf(Date);
    });
    test("toJSON", () => {
      const category = Category.create({
        name: "Movie",
        description: "Movie description",
      });
      expect(category.toJSON()).toEqual({
        category_id: category.category_id.id,
        name: category.name,
        description: category.description,
        is_active: category.is_active,
        created_at: category.created_at,
      });
    });
  });
});
describe("Category Validator", () => {
  describe("create command", () => {
    test("invalid name", () => {
      expect(() => Category.create({ name: null })).containsErrorMessages({
        name: [
          "name should not be empty",
          "name must be a string",
          "name must be shorter than or equal to 255 characters",
        ],
      });

      expect(() => Category.create({ name: "" })).containsErrorMessages({
        name: ["name should not be empty"],
      });

      expect(() => Category.create({ name: 5 as any })).containsErrorMessages({
        name: [
          "name must be a string",
          "name must be shorter than or equal to 255 characters",
        ],
      });

      expect(() =>
        Category.create({ name: "t".repeat(256) })
      ).containsErrorMessages({
        name: ["name must be shorter than or equal to 255 characters"],
      });
    });

    test("invalid description", () => {
      expect(() =>
        Category.create({ description: 5 } as any)
      ).containsErrorMessages({
        description: ["description must be a string"],
      });
    });

    test("invalid is_active", () => {
      expect(() =>
        Category.create({ is_active: "" } as any)
      ).containsErrorMessages({
        is_active: ["is_active must be a boolean value"],
      });
    });
  });

  describe("changeName method", () => {
    it("should throw an error when name is invalid", () => {
      const category = Category.create({ name: "Movie" });
      expect(() => category.changeName(null)).containsErrorMessages({
        name: [
          "name should not be empty",
          "name must be a string",
          "name must be shorter than or equal to 255 characters",
        ],
      });

      expect(() => category.changeName("")).containsErrorMessages({
        name: ["name should not be empty"],
      });

      expect(() => category.changeName(5 as any)).containsErrorMessages({
        name: [
          "name must be a string",
          "name must be shorter than or equal to 255 characters",
        ],
      });

      expect(() => category.changeName("t".repeat(256))).containsErrorMessages({
        name: ["name must be shorter than or equal to 255 characters"],
      });
    });
  });

  describe("changeDescription method", () => {
    test("invalid description", () => {
      const category = Category.create({ name: "Movie" });

      expect(() => category.changeDescription(5 as any)).containsErrorMessages({
        description: ["description must be a string"],
      });

      expect(() =>
        category.changeDescription(true as any)
      ).containsErrorMessages({
        description: ["description must be a string"],
      });

      expect(() =>
        category.changeDescription(false as any)
      ).containsErrorMessages({
        description: ["description must be a string"],
      });

      expect(() =>
        category.changeDescription(new Date() as any)
      ).containsErrorMessages({
        description: ["description must be a string"],
      });
    });
  });
});
