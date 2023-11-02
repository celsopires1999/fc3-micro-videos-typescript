import {
  CastMemberType,
  CastMemberTypes,
} from "@core/cast-member/domain/cast-member-type.vo";
import {
  CastMember,
  CastMemberId,
} from "@core/cast-member/domain/cast-member.aggregate";
import { CastMemberInMemoryRepository } from "@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository";
import { NotFoundError } from "../../../../../shared/domain/errors/not-found.error";
import { InvalidUuidError } from "../../../../../shared/domain/value-objects/uuid.vo";
import { UpdateCastMemberUseCase } from "../update-cast-member.use-case";

describe("UpdateCastMemberUseCase Unit Tests", () => {
  let useCase: UpdateCastMemberUseCase;
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    useCase = new UpdateCastMemberUseCase(repository);
  });

  it("should throw error when entity not found", async () => {
    await expect(() =>
      useCase.execute({ id: "fake id", name: "fake" }),
    ).rejects.toThrow(new InvalidUuidError());

    const castMemberId = new CastMemberId();

    await expect(() =>
      useCase.execute({ id: castMemberId.id, name: "fake" }),
    ).rejects.toThrow(new NotFoundError(castMemberId.id, CastMember));
  });

  it("should throw an error when aggregate is not valid", async () => {
    const aggregate = CastMember.create({
      name: "John Doe",
      type: CastMemberType.createADirector()!,
    });
    repository.items = [aggregate];
    await expect(() =>
      useCase.execute({
        id: aggregate.cast_member_id.id,
        name: "t".repeat(256),
      }),
    ).rejects.toThrowError("Entity Validation Error");
  });

  it("should update a cast member", async () => {
    const spyUpdate = jest.spyOn(repository, "update");
    const aggregate = CastMember.create({
      name: "John Doe",
      type: CastMemberType.createADirector()!,
    });
    repository.items = [aggregate];

    let output = await useCase.execute({
      id: aggregate.cast_member_id.id,
      name: "Mary Doe",
    });
    expect(spyUpdate).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: aggregate.cast_member_id.id,
      name: "Mary Doe",
      type: CastMemberTypes.DIRECTOR,
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
        ...("name" in i.input && { name: i.input.name }),
        ...("type" in i.input && { type: i.input.type }),
      });
      expect(output).toStrictEqual({
        id: i.expected.id,
        name: i.expected.name,
        type: i.expected.type,
        created_at: i.expected.created_at,
      });
    }
  });
});
