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
import { GetCastMemberUseCase } from "../get-cast-member.use-case";

describe("GetCastMemberUseCase Unit Tests", () => {
  let useCase: GetCastMemberUseCase;
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    useCase = new GetCastMemberUseCase(repository);
  });

  it("should throw error when entity is not found", async () => {
    await expect(() => useCase.execute({ id: "fake id" })).rejects.toThrow(
      new InvalidUuidError(),
    );

    const castMemberId = new CastMemberId();
    await expect(() =>
      useCase.execute({ id: castMemberId.id }),
    ).rejects.toThrow(new NotFoundError(castMemberId.id, CastMember));
  });

  it("should return a cast member", async () => {
    const items = [
      CastMember.create({
        name: "John Doe",
        type: CastMemberType.createADirector(),
      }),
    ];
    repository.items = items;
    const spyFindById = jest.spyOn(repository, "findById");
    const output = await useCase.execute({ id: items[0].cast_member_id.id });
    expect(spyFindById).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: items[0].cast_member_id.id,
      name: "John Doe",
      type: CastMemberTypes.DIRECTOR,
      created_at: items[0].created_at,
    });
  });
});
