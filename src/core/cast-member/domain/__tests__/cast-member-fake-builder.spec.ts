import { Chance } from "chance";
import { CastMemberFakeBuilder } from "../cast-member-fake.builder";
import { CastMemberType } from "../cast-member-type.vo";
import { CastMemberId } from "../cast-member.aggregate";

describe("CastMemberFakerBuilder Unit Tests", () => {
  describe("cast_member_id prop", () => {
    const faker = CastMemberFakeBuilder.aCastMember();
    test("should throw error when any with methods has called", () => {
      expect(() => faker.cast_member_id).toThrowError(
        new Error(
          `Property cast_member_id does not have a factory, use "with" method instead`,
        ),
      );
    });

    test("should be undefined", () => {
      expect(faker["_cast_member_id"]).toBeUndefined();
    });

    test("withUuid", () => {
      const cast_member_id = new CastMemberId();
      const $this = faker.withUuid(cast_member_id);
      expect($this).toBeInstanceOf(CastMemberFakeBuilder);
      expect(faker["_cast_member_id"]).toBe(cast_member_id);

      faker.withUuid(() => cast_member_id);
      //@ts-expect-error _cast_member_id is a callable
      expect(faker["_cast_member_id"]()).toBe(cast_member_id);

      expect(faker.cast_member_id).toBe(cast_member_id);
    });

    //TODO - melhorar este nome
    test("should pass index to cast_member_id factory", () => {
      let mockFactory = jest.fn(() => new CastMemberId());
      faker.withUuid(mockFactory);
      faker.build();
      expect(mockFactory).toHaveBeenCalledTimes(1);

      const castMemberId = new CastMemberId();
      mockFactory = jest.fn(() => castMemberId);
      const fakerMany = CastMemberFakeBuilder.theCastMembers(2);
      fakerMany.withUuid(mockFactory);
      fakerMany.build();

      expect(mockFactory).toHaveBeenCalledTimes(2);
      expect(fakerMany.build()[0].cast_member_id).toBe(castMemberId);
      expect(fakerMany.build()[1].cast_member_id).toBe(castMemberId);
    });
  });

  describe("name prop", () => {
    const faker = CastMemberFakeBuilder.aCastMember();
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
      expect($this).toBeInstanceOf(CastMemberFakeBuilder);
      expect(faker["_name"]).toBe("test name");

      faker.withName(() => "test name");
      //@ts-expect-error name is callable
      expect(faker["_name"]()).toBe("test name");

      expect(faker.name).toBe("test name");
    });

    test("should pass index to name factory", () => {
      faker.withName((index) => `test name ${index}`);
      const category = faker.build();
      expect(category.name).toBe(`test name 0`);

      const fakerMany = CastMemberFakeBuilder.theCastMembers(2);
      fakerMany.withName((index) => `test name ${index}`);
      const categories = fakerMany.build();

      expect(categories[0].name).toBe(`test name 0`);
      expect(categories[1].name).toBe(`test name 1`);
    });

    test("invalid too long case", () => {
      const $this = faker.withInvalidNameTooLong();
      expect($this).toBeInstanceOf(CastMemberFakeBuilder);
      expect(faker["_name"].length).toBe(256);

      const tooLong = "a".repeat(256);
      faker.withInvalidNameTooLong(tooLong);
      expect(faker["_name"].length).toBe(256);
      expect(faker["_name"]).toBe(tooLong);
    });
  });

  describe("type prop", () => {
    const faker = CastMemberFakeBuilder.aCastMember();
    it("should be a function", () => {
      expect(typeof faker["_type"] === "function").toBeTruthy();
    });

    it("should call the integer method", () => {
      const chance = Chance();
      const spyIntegerMethod = jest.spyOn(chance, "integer");
      faker["chance"] = chance;
      faker.build();

      expect(spyIntegerMethod).toHaveBeenCalled();
    });

    test("withType", () => {
      const $this = faker.withType(null);
      expect($this).toBeInstanceOf(CastMemberFakeBuilder);
      expect(faker["_type"]).toBeNull();

      const actor = CastMemberType.createAnActor();
      faker.withType(actor);
      expect(faker["_type"]).toEqual(actor);

      faker.withType(() => actor);
      // @ts-expect-error This expression is not callable
      expect(faker["_type"]()).toEqual(actor);

      expect(faker.type).toEqual(actor);
    });

    it("should pass an index to type factory", () => {
      faker.withType((index) =>
        index % 2 === 0
          ? CastMemberType.createADirector()
          : CastMemberType.createAnActor(),
      );
      const castMember = faker.build();
      expect(
        castMember.type.equals(CastMemberType.createADirector()),
      ).toBeTruthy();

      const fakerMany = CastMemberFakeBuilder.theCastMembers(2);
      fakerMany.withType((index) =>
        index % 2 === 0
          ? CastMemberType.createADirector()
          : CastMemberType.createAnActor(),
      );
      const castMembers = fakerMany.build();

      expect(
        castMembers[0].type.equals(CastMemberType.createADirector()),
      ).toBeTruthy();
      expect(
        castMembers[1].type.equals(CastMemberType.createAnActor()),
      ).toBeTruthy();
    });

    test("invalid empty case", () => {
      const $this = faker.withInvalidTypeEmpty(undefined);
      expect($this).toBeInstanceOf(CastMemberFakeBuilder);
      expect(faker["_type"]).toBeUndefined();

      faker.withInvalidTypeEmpty(null);
      expect(faker["_type"]).toBeNull();

      faker.withInvalidTypeEmpty("");
      expect(faker["_type"]).toBe("");
    });

    test("invalid not a cast member type case", () => {
      const $this = faker.withInvalidTypeNotACastMemberType();
      expect($this).toBeInstanceOf(CastMemberFakeBuilder);
      expect(faker["_type"]).toBe("fake cast member type");

      faker.withInvalidTypeNotACastMemberType(5);
      expect(faker["_type"]).toBe(5);
    });
  });

  describe("created_at prop", () => {
    const faker = CastMemberFakeBuilder.aCastMember();

    test("should throw error when any with methods has called", () => {
      const fakerCategory = CastMemberFakeBuilder.aCastMember();
      expect(() => fakerCategory.created_at).toThrowError(
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
      expect($this).toBeInstanceOf(CastMemberFakeBuilder);
      expect(faker["_created_at"]).toBe(date);

      faker.withCreatedAt(() => date);
      //@ts-expect-error _created_at is a callable
      expect(faker["_created_at"]()).toBe(date);
      expect(faker.created_at).toBe(date);
    });

    test("should pass index to created_at factory", () => {
      const date = new Date();
      faker.withCreatedAt((index) => new Date(date.getTime() + index + 2));
      const castMember = faker.build();
      expect(castMember.created_at.getTime()).toBe(date.getTime() + 2);

      const fakerMany = CastMemberFakeBuilder.theCastMembers(2);
      fakerMany.withCreatedAt((index) => new Date(date.getTime() + index + 2));
      const categories = fakerMany.build();

      expect(categories[0].created_at.getTime()).toBe(date.getTime() + 2);
      expect(categories[1].created_at.getTime()).toBe(date.getTime() + 3);
    });
  });

  test("should create a castMember", () => {
    const faker = CastMemberFakeBuilder.aCastMember();
    let castMember = faker.build();

    expect(castMember.cast_member_id).toBeInstanceOf(CastMemberId);
    expect(typeof castMember.name === "string").toBeTruthy();
    expect(castMember.type).toBeInstanceOf(CastMemberType);
    expect(castMember.created_at).toBeInstanceOf(Date);

    const type = CastMemberType.createADirector();
    const created_at = new Date();
    const cast_member_id = new CastMemberId();
    castMember = faker
      .withUuid(cast_member_id)
      .withName("name test")
      .withType(type)
      .withCreatedAt(created_at)
      .build();

    expect(castMember.cast_member_id.id).toBe(cast_member_id.id);
    expect(castMember.name).toBe("name test");
    expect(castMember.type).toBe(type);
    expect(castMember.created_at).toBe(created_at);
  });

  test("should create many castMembers", () => {
    const faker = CastMemberFakeBuilder.theCastMembers(2);
    let castMembers = faker.build();

    castMembers.forEach((castMember) => {
      expect(castMember.cast_member_id).toBeInstanceOf(CastMemberId);
      expect(typeof castMember.name === "string").toBeTruthy();
      expect(castMember.type).toBeInstanceOf(CastMemberType);
      expect(castMember.created_at).toBeInstanceOf(Date);
    });

    const type = CastMemberType.createAnActor();
    const created_at = new Date();
    const cast_member_id = new CastMemberId();
    castMembers = faker
      .withUuid(cast_member_id)
      .withName("name test")
      .withType(type)
      .withCreatedAt(created_at)
      .build();

    castMembers.forEach((category) => {
      expect(category.cast_member_id.id).toBe(cast_member_id.id);
      expect(category.name).toBe("name test");
      expect(category.type).toBe(type);
      expect(category.created_at).toBe(created_at);
    });
  });
});
