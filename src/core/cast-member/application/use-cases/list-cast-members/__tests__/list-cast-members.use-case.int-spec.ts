import {
  CastMemberType,
  CastMemberTypes,
} from "@core/cast-member/domain/cast-member-type.vo";
import { CastMember } from "@core/cast-member/domain/cast-member.aggregate";
import { CastMemberSearchResult } from "@core/cast-member/domain/cast-member.repository";
import { CastMemberSequelizeRepository } from "@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository";
import { CastMemberModel } from "@core/cast-member/infra/db/sequelize/cast-member.model";
import { setupSequelize } from "@core/shared/infra/testing/helpers";
import { CastMemberOutputMapper } from "../../common/cast-member-output";
import { ListCastMembersUseCase } from "../list-cast-members.use-case";

describe("ListCastMembersUseCase Integration Tests", () => {
  let useCase: ListCastMembersUseCase;
  let repository: CastMemberSequelizeRepository;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(() => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new ListCastMembersUseCase(repository);
  });

  it("should return output sorted by created_at when input param is empty", async () => {
    const castMembers = CastMember.fake()
      .theCastMembers(2)
      .withCreatedAt((i) => new Date(new Date().getTime() + 1000 + i))
      .build();

    await repository.bulkInsert(castMembers);
    const output = await useCase.execute({});
    expect(output).toEqual({
      items: [...castMembers].reverse().map(CastMemberOutputMapper.toOutput),
      total: 2,
      current_page: 1,
      per_page: 15,
      last_page: 1,
    });
  });

  it("should return output using pagination, sort and filter", async () => {
    const categories = [
      new CastMember({ name: "a", type: CastMemberType.createAnActor()! }),
      new CastMember({
        name: "AAA",
        type: CastMemberType.createAnActor()!,
      }),
      new CastMember({
        name: "AaA",
        type: CastMemberType.createAnActor()!,
      }),
      new CastMember({
        name: "b",
        type: CastMemberType.createAnActor()!,
      }),
      new CastMember({
        name: "c",
        type: CastMemberType.createAnActor()!,
      }),
    ];
    await repository.bulkInsert(categories);

    let output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: "name",
      filter: { name: "a" },
    });
    expect(output).toEqual({
      items: [categories[1], categories[2]].map(
        CastMemberOutputMapper.toOutput,
      ),
      total: 3,
      current_page: 1,
      per_page: 2,
      last_page: 2,
    });

    output = await useCase.execute({
      page: 2,
      per_page: 2,
      sort: "name",
      filter: { name: "a" },
    });
    expect(output).toEqual({
      items: [categories[0]].map(CastMemberOutputMapper.toOutput),
      total: 3,
      current_page: 2,
      per_page: 2,
      last_page: 2,
    });

    output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: "name",
      sort_dir: "desc",
      filter: { name: "a" },
    });
    expect(output).toEqual({
      items: [categories[0], categories[2]].map(
        CastMemberOutputMapper.toOutput,
      ),
      total: 3,
      current_page: 1,
      per_page: 2,
      last_page: 2,
    });
  });

  //#region     previous version

  test("toOutput method", () => {
    let result = new CastMemberSearchResult({
      items: [],
      total: 1,
      current_page: 1,
      per_page: 2,
    });

    let output = useCase["toOutput"](result);
    expect(output).toStrictEqual({
      items: [],
      total: 1,
      current_page: 1,
      last_page: 1,
      per_page: 2,
    });

    const entity = CastMember.fake().aCastMember().build();
    result = new CastMemberSearchResult({
      items: [entity],
      total: 1,
      current_page: 1,
      per_page: 2,
    });

    output = useCase["toOutput"](result);
    expect(output).toStrictEqual({
      items: [CastMemberOutputMapper.toOutput(entity)],
      total: 1,
      current_page: 1,
      last_page: 1,
      per_page: 2,
    });
  });

  it("should return output with two cast members ordered by created_at when input is empty", async () => {
    const created_at = new Date();
    const faker = CastMember.fake().aCastMember();

    const entities = [
      faker.withCreatedAt(created_at).build(),
      faker.withCreatedAt(new Date(created_at.getTime() + 1000)).build(),
    ];

    await repository.bulkInsert(entities);

    const output = await useCase.execute({});

    expect(output).toStrictEqual({
      items: [entities[1], entities[0]].map(CastMemberOutputMapper.toOutput),
      total: 2,
      current_page: 1,
      last_page: 1,
      per_page: 15,
    });
  });

  it("should return output with three cast members ordered by created_at when input is empty", async () => {
    const created_at = new Date();
    const faker = CastMember.fake().aCastMember();

    const entities = [
      faker.withCreatedAt(created_at).build(),
      faker.withCreatedAt(new Date(created_at.getTime() + 1000)).build(),
      faker.withCreatedAt(new Date(created_at.getTime() + 3000)).build(),
    ];

    await repository.bulkInsert(entities);

    const output = await useCase.execute({});
    expect(output).toStrictEqual({
      items: [...entities].reverse().map(CastMemberOutputMapper.toOutput),
      total: 3,
      current_page: 1,
      last_page: 1,
      per_page: 15,
    });
  });

  it("should return output using paginate, sort and filter", async () => {
    const entities = [
      CastMember.fake().anActor().withName("a").build(),
      CastMember.fake().aDirector().withName("AAA").build(),
      CastMember.fake().aDirector().withName("AaA").build(),
      CastMember.fake().anActor().withName("b").build(),
      CastMember.fake().anActor().withName("c").build(),
    ];

    await repository.bulkInsert(entities);

    let output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: "name",
      filter: { name: "a" },
    });
    expect(output).toStrictEqual({
      items: [entities[1], entities[2]].map(CastMemberOutputMapper.toOutput),
      total: 3,
      current_page: 1,
      last_page: 2,
      per_page: 2,
    });

    output = await useCase.execute({
      page: 2,
      per_page: 2,
      sort: "name",
      filter: { name: "a" },
    });
    expect(output).toStrictEqual({
      items: [entities[0]].map(CastMemberOutputMapper.toOutput),
      total: 3,
      current_page: 2,
      last_page: 2,
      per_page: 2,
    });

    output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: "name",
      sort_dir: "desc",
      filter: { name: "a" },
    });
    expect(output).toStrictEqual({
      items: [entities[0], entities[2]].map(CastMemberOutputMapper.toOutput),
      total: 3,
      current_page: 1,
      last_page: 2,
      per_page: 2,
    });
    output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: "name",
      sort_dir: "desc",
      filter: { type: CastMemberTypes.ACTOR },
    });
    expect(output).toStrictEqual({
      items: [entities[4], entities[3]].map(CastMemberOutputMapper.toOutput),
      total: 3,
      current_page: 1,
      last_page: 2,
      per_page: 2,
    });
    output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: "name",
      sort_dir: "desc",
      filter: { name: "aa", type: CastMemberTypes.DIRECTOR },
    });
    expect(output).toStrictEqual({
      items: [entities[2], entities[1]].map(CastMemberOutputMapper.toOutput),
      total: 2,
      current_page: 1,
      last_page: 1,
      per_page: 2,
    });
  });

  //#endregion  previous version
});
