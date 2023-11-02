import {
  CastMember,
  CastMemberId,
} from "@core/cast-member/domain/cast-member.aggregate";
import { NotFoundError } from "../../../../../shared/domain/errors/not-found.error";
import { setupSequelize } from "../../../../../shared/infra/testing/helpers";
import { CastMemberSequelizeRepository } from "../cast-member-sequelize.repository";
import { CastMemberModel } from "../cast-member.model";
import {
  CastMemberType,
  CastMemberTypes,
} from "@core/cast-member/domain/cast-member-type.vo";
import { CastMemberModelMapper } from "../cast-member-model-mapper";
import {
  CastMemberSearchParams,
  CastMemberSearchResult,
} from "@core/cast-member/domain/cast-member.repository";

describe("CastMemberSequelizeRepository Integration Test", () => {
  let repository: CastMemberSequelizeRepository;
  setupSequelize({ models: [CastMemberModel] });

  beforeEach(async () => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
  });

  it("should insert a new aggregate", async () => {
    let castMember = CastMember.fake().aCastMember().build();
    await repository.insert(castMember);
    let aggregate = await repository.findById(castMember.cast_member_id);
    expect(aggregate!.toJSON()).toStrictEqual(castMember.toJSON());
  });

  it("should find an aggregate by id", async () => {
    let aggregateFound = await repository.findById(new CastMemberId());
    expect(aggregateFound).toBeNull();

    const aggregate = CastMember.fake().aCastMember().build();
    await repository.insert(aggregate);
    aggregateFound = await repository.findById(aggregate.cast_member_id);
    expect(aggregate.toJSON()).toStrictEqual(aggregateFound!.toJSON());
  });

  it("should return all aggreates", async () => {
    const aggregate = CastMember.fake().aCastMember().build();
    await repository.insert(aggregate);
    const entities = await repository.findAll();
    expect(entities).toHaveLength(1);
    expect(JSON.stringify(entities)).toBe(JSON.stringify([aggregate]));
  });

  it("should throw error on update when an aggregate is not found", async () => {
    const aggregate = CastMember.fake().aCastMember().build();
    await expect(repository.update(aggregate)).rejects.toThrow(
      new NotFoundError(aggregate.cast_member_id.id, CastMember),
    );
  });

  it("should update an aggregate", async () => {
    const aggregate = CastMember.fake().aCastMember().build();
    await repository.insert(aggregate);

    aggregate.changeName("Mary Doe");
    await repository.update(aggregate);

    const aggregateFound = await repository.findById(aggregate.cast_member_id);
    expect(aggregate.toJSON()).toStrictEqual(aggregateFound!.toJSON());
  });

  it("should throw error on delete when an aggregate is not found", async () => {
    const categoryId = new CastMemberId();
    await expect(repository.delete(categoryId)).rejects.toThrow(
      new NotFoundError(categoryId.id, CastMember),
    );
  });

  it("should delete an aggregate", async () => {
    const aggregate = CastMember.fake().aDirector().build();
    await repository.insert(aggregate);

    await repository.delete(aggregate.cast_member_id);
    await expect(
      repository.findById(aggregate.cast_member_id),
    ).resolves.toBeNull();
  });

  describe("search method tests", () => {
    it("should order by created_at DESC when search params are null", async () => {
      const created_at = new Date();
      const categories = CastMember.fake()
        .theCastMembers(16)
        .withName("John Doe")
        .withType(CastMemberType.createADirector()!)
        .withCreatedAt(created_at)
        .build();
      await repository.bulkInsert(categories);
      const spyToEntity = jest.spyOn(CastMemberModelMapper, "toEntity");

      const searchOutput = await repository.search(
        CastMemberSearchParams.create(),
      );
      expect(searchOutput).toBeInstanceOf(CastMemberSearchResult);
      expect(spyToEntity).toHaveBeenCalledTimes(15);
      expect(searchOutput.toJSON()).toMatchObject({
        total: 16,
        current_page: 1,
        last_page: 2,
        per_page: 15,
      });
      searchOutput.items.forEach((item) => {
        expect(item).toBeInstanceOf(CastMember);
        expect(item.cast_member_id).toBeDefined();
      });
      const items = searchOutput.items.map((item) => item.toJSON());
      expect(items).toMatchObject(
        new Array(15).fill({
          name: "John Doe",
          type: CastMemberTypes.DIRECTOR,
          created_at: created_at,
        }),
      );
    });

    it("should order by created_at DESC when search params are null - WITHOUT NAME CHECKING", async () => {
      const castMembers = CastMember.fake()
        .theCastMembers(16)
        .withCreatedAt((index) => new Date(new Date().getTime() + 100 + index))
        .build();
      await repository.bulkInsert(castMembers);
      const spyToEntity = jest.spyOn(CastMemberModelMapper, "toEntity");

      const searchOutput = await repository.search(
        CastMemberSearchParams.create(),
      );
      expect(searchOutput).toBeInstanceOf(CastMemberSearchResult);
      expect(spyToEntity).toHaveBeenCalledTimes(15);
      expect(searchOutput.toJSON()).toMatchObject({
        total: 16,
        current_page: 1,
        last_page: 2,
        per_page: 15,
      });

      [...castMembers.slice(1, 16)].reverse().forEach((item, index) => {
        expect(searchOutput.items[index]).toBeInstanceOf(CastMember);
        expect(item.toJSON()).toStrictEqual(searchOutput.items[index].toJSON());
      });
    });

    it("should order by created_at DESC when search params are null - WITH NAME CHECKING", async () => {
      const created_at = new Date();
      const categories = CastMember.fake()
        .theCastMembers(16)
        .withName((index) => `John Doe ${index}`)
        .withCreatedAt((index) => new Date(created_at.getTime() + index))
        .build();
      const searchOutput = await repository.search(
        CastMemberSearchParams.create(),
      );
      const items = searchOutput.items;
      [...items].reverse().forEach((_item, index) => {
        expect(`John Doe ${index}`).toBe(`${categories[index + 1].name}`);
      });
    });

    it("should apply paginate and filter by name", async () => {
      const castMembers = [
        CastMember.fake()
          .aCastMember()
          .withName("test")
          .withCreatedAt(new Date(new Date().getTime() + 5000))
          .build(),
        CastMember.fake()
          .aCastMember()
          .withName("a")
          .withCreatedAt(new Date(new Date().getTime() + 4000))
          .build(),
        CastMember.fake()
          .aCastMember()
          .withName("TEST")
          .withCreatedAt(new Date(new Date().getTime() + 3000))
          .build(),
        CastMember.fake()
          .aCastMember()
          .withName("TeSt")
          .withCreatedAt(new Date(new Date().getTime() + 1000))
          .build(),
      ];

      await repository.bulkInsert(castMembers);

      let searchOutput = await repository.search(
        CastMemberSearchParams.create({
          page: 1,
          per_page: 2,
          filter: { name: "TEST" },
        }),
      );
      expect(searchOutput.toJSON(true)).toMatchObject(
        new CastMemberSearchResult({
          items: [castMembers[0], castMembers[2]],
          total: 3,
          current_page: 1,
          per_page: 2,
        }).toJSON(true),
      );

      searchOutput = await repository.search(
        CastMemberSearchParams.create({
          page: 2,
          per_page: 2,
          filter: { name: "TEST" },
        }),
      );
      expect(searchOutput.toJSON(true)).toMatchObject(
        new CastMemberSearchResult({
          items: [castMembers[3]],
          total: 3,
          current_page: 2,
          per_page: 2,
        }).toJSON(true),
      );
    });

    it("should apply paginate and filter by type", async () => {
      const castMembers = [
        CastMember.fake()
          .anActor()
          .withName("test")
          .withCreatedAt(new Date(new Date().getTime() + 5000))
          .build(),
        CastMember.fake()
          .aDirector()
          .withName("a")
          .withCreatedAt(new Date(new Date().getTime() + 4000))
          .build(),
        CastMember.fake()
          .aDirector()
          .withName("TEST")
          .withCreatedAt(new Date(new Date().getTime() + 3000))
          .build(),
        CastMember.fake()
          .aDirector()
          .withName("TeSt")
          .withCreatedAt(new Date(new Date().getTime() + 1000))
          .build(),
      ];

      await repository.bulkInsert(castMembers);

      let searchOutput = await repository.search(
        CastMemberSearchParams.create({
          page: 1,
          per_page: 2,
          filter: { type: CastMemberTypes.DIRECTOR },
        }),
      );
      expect(searchOutput.toJSON(true)).toMatchObject(
        new CastMemberSearchResult({
          items: [castMembers[1], castMembers[2]],
          total: 3,
          current_page: 1,
          per_page: 2,
        }).toJSON(true),
      );

      searchOutput = await repository.search(
        CastMemberSearchParams.create({
          page: 2,
          per_page: 2,
          filter: { type: CastMemberTypes.DIRECTOR },
        }),
      );
      expect(searchOutput.toJSON(true)).toMatchObject(
        new CastMemberSearchResult({
          items: [castMembers[3]],
          total: 3,
          current_page: 2,
          per_page: 2,
        }).toJSON(true),
      );
    });

    it("should apply paginate and sort", async () => {
      expect(repository.sortableFields).toStrictEqual(["name", "created_at"]);

      const castMembers = [
        CastMember.fake().aCastMember().withName("b").build(),
        CastMember.fake().aCastMember().withName("a").build(),
        CastMember.fake().aCastMember().withName("d").build(),
        CastMember.fake().aCastMember().withName("e").build(),
        CastMember.fake().aCastMember().withName("c").build(),
      ];
      await repository.bulkInsert(castMembers);

      const arrange = [
        {
          params: CastMemberSearchParams.create({
            page: 1,
            per_page: 2,
            sort: "name",
          }),
          result: new CastMemberSearchResult({
            items: [castMembers[1], castMembers[0]],
            total: 5,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          params: CastMemberSearchParams.create({
            page: 2,
            per_page: 2,
            sort: "name",
          }),
          result: new CastMemberSearchResult({
            items: [castMembers[4], castMembers[2]],
            total: 5,
            current_page: 2,
            per_page: 2,
          }),
        },
        {
          params: CastMemberSearchParams.create({
            page: 1,
            per_page: 2,
            sort: "name",
            sort_dir: "desc",
          }),
          result: new CastMemberSearchResult({
            items: [castMembers[3], castMembers[2]],
            total: 5,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          params: CastMemberSearchParams.create({
            page: 2,
            per_page: 2,
            sort: "name",
            sort_dir: "desc",
          }),
          result: new CastMemberSearchResult({
            items: [castMembers[4], castMembers[0]],
            total: 5,
            current_page: 2,
            per_page: 2,
          }),
        },
      ];

      for (const i of arrange) {
        const result = await repository.search(i.params);
        expect(result.toJSON(true)).toMatchObject(i.result.toJSON(true));
      }
    });

    describe("should search using filter by name, sort and paginate", () => {
      const castMembers = [
        CastMember.fake().aCastMember().withName("test").build(),
        CastMember.fake().aCastMember().withName("a").build(),
        CastMember.fake().aCastMember().withName("TEST").build(),
        CastMember.fake().aCastMember().withName("e").build(),
        CastMember.fake().aCastMember().withName("TeSt").build(),
      ];

      const arrange = [
        {
          search_params: CastMemberSearchParams.create({
            page: 1,
            per_page: 2,
            sort: "name",
            filter: { name: "TEST" },
          }),
          search_result: new CastMemberSearchResult({
            items: [castMembers[2], castMembers[4]],
            total: 3,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          search_params: CastMemberSearchParams.create({
            page: 2,
            per_page: 2,
            sort: "name",
            filter: { name: "TEST" },
          }),
          search_result: new CastMemberSearchResult({
            items: [castMembers[0]],
            total: 3,
            current_page: 2,
            per_page: 2,
          }),
        },
      ];

      beforeEach(async () => {
        await repository.bulkInsert(castMembers);
      });

      test.each(arrange)(
        "when value is $search_params",
        async ({ search_params, search_result }) => {
          const result = await repository.search(search_params);
          expect(result.toJSON(true)).toMatchObject(search_result.toJSON(true));
        },
      );
    });

    describe("should search using filter by type, sort and paginate", () => {
      const castMembers = [
        CastMember.fake().anActor().withName("test").build(),
        CastMember.fake().aDirector().withName("a").build(),
        CastMember.fake().anActor().withName("TEST").build(),
        CastMember.fake().aDirector().withName("e").build(),
        CastMember.fake().anActor().withName("TeSt").build(),
        CastMember.fake().aDirector().withName("b").build(),
      ];

      const arrange = [
        {
          search_params: CastMemberSearchParams.create({
            page: 1,
            per_page: 2,
            sort: "name",
            filter: { type: CastMemberTypes.ACTOR },
          }),
          search_result: new CastMemberSearchResult({
            items: [castMembers[2], castMembers[4]],
            total: 3,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          search_params: CastMemberSearchParams.create({
            page: 2,
            per_page: 2,
            sort: "name",
            filter: { type: CastMemberTypes.ACTOR },
          }),
          search_result: new CastMemberSearchResult({
            items: [castMembers[0]],
            total: 3,
            current_page: 2,
            per_page: 2,
          }),
        },
        {
          search_params: CastMemberSearchParams.create({
            page: 1,
            per_page: 2,
            sort: "name",
            filter: { type: CastMemberTypes.DIRECTOR },
          }),
          search_result: new CastMemberSearchResult({
            items: [castMembers[1], castMembers[5]],
            total: 3,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          search_params: CastMemberSearchParams.create({
            page: 2,
            per_page: 2,
            sort: "name",
            filter: { type: CastMemberTypes.DIRECTOR },
          }),
          search_result: new CastMemberSearchResult({
            items: [castMembers[3]],
            total: 3,
            current_page: 2,
            per_page: 2,
          }),
        },
      ];

      beforeEach(async () => {
        await repository.bulkInsert(castMembers);
      });

      test.each(arrange)(
        "when value is $search_params",
        async ({ search_params, search_result }) => {
          const result = await repository.search(search_params);
          expect(result.toJSON(true)).toMatchObject(search_result.toJSON(true));
        },
      );
    });

    describe("should search using filter by name and type, sort and paginate", () => {
      const castMembers = [
        CastMember.fake().anActor().withName("test").build(),
        CastMember.fake().aDirector().withName("a director").build(),
        CastMember.fake().anActor().withName("TEST").build(),
        CastMember.fake().aDirector().withName("e director").build(),
        CastMember.fake().anActor().withName("TeSt").build(),
        CastMember.fake().aDirector().withName("b director").build(),
      ];

      const arrange = [
        {
          search_params: CastMemberSearchParams.create({
            page: 1,
            per_page: 2,
            sort: "name",
            filter: { name: "TEST", type: CastMemberTypes.ACTOR },
          }),
          search_result: new CastMemberSearchResult({
            items: [castMembers[2], castMembers[4]],
            total: 3,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          search_params: CastMemberSearchParams.create({
            page: 2,
            per_page: 2,
            sort: "name",
            filter: { name: "TEST", type: CastMemberTypes.ACTOR },
          }),
          search_result: new CastMemberSearchResult({
            items: [castMembers[0]],
            total: 3,
            current_page: 2,
            per_page: 2,
          }),
        },
      ];

      beforeEach(async () => {
        await repository.bulkInsert(castMembers);
      });

      test.each(arrange)(
        "when value is $search_params",
        async ({ search_params, search_result }) => {
          const result = await repository.search(search_params);
          expect(result.toJSON(true)).toMatchObject(search_result.toJSON(true));
        },
      );
    });
  });
});
