import { CastMemberTypes } from "@core/cast-member/domain/cast-member-type.vo";
import { CastMemberInMemoryRepository } from "@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository";
import { CreateCastMemberUseCase } from "../create-cast-member.use-case";

describe("CreateCastMemberUseCase Unit Tests", () => {
  let useCase: CreateCastMemberUseCase;
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    useCase = new CreateCastMemberUseCase(repository);
  });

  it("should throw an error when aggregate is not valid", async () => {
    const input = { name: "t".repeat(256), type: CastMemberTypes.ACTOR };
    await expect(() => useCase.execute(input)).rejects.toThrowError(
      "Entity Validation Error",
    );
  });

  it("should create a cast member", async () => {
    const spyInsert = jest.spyOn(repository, "insert");
    let output = await useCase.execute({
      name: "John Doe",
      type: CastMemberTypes.DIRECTOR,
    });
    expect(spyInsert).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: repository.items[0].cast_member_id.id,
      name: "John Doe",
      type: CastMemberTypes.DIRECTOR,
      created_at: repository.items[0].created_at,
    });

    output = await useCase.execute({
      name: "Mary Doe",
      type: CastMemberTypes.ACTOR,
    });
    expect(spyInsert).toHaveBeenCalledTimes(2);
    expect(output).toStrictEqual({
      id: repository.items[1].cast_member_id.id,
      name: "Mary Doe",
      type: CastMemberTypes.ACTOR,
      created_at: repository.items[1].created_at,
    });
  });
});
