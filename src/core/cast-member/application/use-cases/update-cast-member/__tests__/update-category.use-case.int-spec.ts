import { CastMemberTypes } from "@core/cast-member/domain/cast-member-type.vo";
import {
  CastMember,
  CastMemberId,
} from "@core/cast-member/domain/cast-member.aggregate";
import { CastMemberSequelizeRepository } from "@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository";
import { CastMemberModel } from "@core/cast-member/infra/db/sequelize/cast-member.model";
import { NotFoundError } from "../../../../../shared/domain/errors/not-found.error";
import { setupSequelize } from "../../../../../shared/infra/testing/helpers";
import { UpdateCastMemberUseCase } from "../update-cast-member.use-case";

describe("UpdateCastMemberUseCase Integration Tests", () => {
  let useCase: UpdateCastMemberUseCase;
  let repository: CastMemberSequelizeRepository;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(() => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new UpdateCastMemberUseCase(repository);
  });

  it("should throw error when entity is not found", async () => {
    const castMemberId = new CastMemberId();
    await expect(() =>
      useCase.execute({ id: castMemberId.id, name: "fake" }),
    ).rejects.toThrow(new NotFoundError(castMemberId.id, CastMember));
  });

  it("should update a cast member", async () => {
    const aggregate = CastMember.fake().aCastMember().build();
    repository.insert(aggregate);

    let output = await useCase.execute({
      id: aggregate.cast_member_id.id,
      name: "test",
    });
    expect(output).toStrictEqual({
      id: aggregate.cast_member_id.id,
      name: "test",
      type: aggregate.type.type,
      created_at: aggregate.created_at,
    });

    type Arrange = {
      input: {
        id: string;
        name?: string;
        type?: CastMemberTypes;
      };
      expected: {
        id: string;
        name: string;
        type: CastMemberTypes;
        created_at: Date;
      };
    };
    const arrange: Arrange[] = [
      {
        input: {
          id: aggregate.cast_member_id.id,
          name: "test",
        },
        expected: {
          id: aggregate.cast_member_id.id,
          name: "test",
          type: aggregate.type.type,
          created_at: aggregate.created_at,
        },
      },
      {
        input: {
          id: aggregate.cast_member_id.id,
          type: CastMemberTypes.ACTOR,
        },
        expected: {
          id: aggregate.cast_member_id.id,
          name: "test",
          type: CastMemberTypes.ACTOR,
          created_at: aggregate.created_at,
        },
      },
    ];

    for (const i of arrange) {
      output = await useCase.execute({
        id: i.input.id,
        ...(i.input.name && { name: i.input.name }),
        ...("type" in i.input && { type: i.input.type }),
      });
      const entityUpdated = await repository.findById(
        new CastMemberId(i.input.id),
      );
      expect(output).toStrictEqual({
        id: i.expected.id,
        name: i.expected.name,
        type: i.expected.type,
        created_at: entityUpdated.created_at,
      });
      expect(entityUpdated.toJSON()).toStrictEqual({
        cast_member_id: i.expected.id,
        name: i.expected.name,
        type: i.expected.type,
        created_at: entityUpdated.created_at,
      });
    }
  });
});
