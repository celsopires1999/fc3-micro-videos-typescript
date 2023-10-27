import { CastMemberType } from "@core/cast-member/domain/cast-member-type.vo";
import {
  CastMember,
  CastMemberId,
} from "@core/cast-member/domain/cast-member.aggregate";
import { CastMemberInMemoryRepository } from "@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository";
import { NotFoundError } from "../../../../../shared/domain/errors/not-found.error";
import { InvalidUuidError } from "../../../../../shared/domain/value-objects/uuid.vo";
import { DeleteCastMemberUseCase } from "../delete-cast-member.use-case";

describe("DeleteCastMemberUseCase Unit Tests", () => {
  let useCase: DeleteCastMemberUseCase;
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    useCase = new DeleteCastMemberUseCase(repository);
  });

  it("should throw error when entity is not found", async () => {
    await expect(() => useCase.execute({ id: "fake id" })).rejects.toThrow(
      new InvalidUuidError(),
    );

    const cast_member_id = new CastMemberId();

    await expect(() =>
      useCase.execute({ id: cast_member_id.id }),
    ).rejects.toThrow(new NotFoundError(cast_member_id.id, CastMember));
  });

  it("should delete a cast member", async () => {
    const items = [
      CastMember.create({
        name: "test 1",
        type: CastMemberType.createADirector(),
      }),
    ];
    repository.items = items;
    await useCase.execute({
      id: items[0].cast_member_id.id,
    });
    expect(repository.items).toHaveLength(0);
  });
});
