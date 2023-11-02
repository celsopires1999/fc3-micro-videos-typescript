import { CastMemberTypes } from "@core/cast-member/domain/cast-member-type.vo";
import { CastMemberSequelizeRepository } from "@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository";
import { CastMemberModel } from "@core/cast-member/infra/db/sequelize/cast-member.model";
import { CategoryId } from "@core/category/domain/category.aggregate";
import { setupSequelize } from "@core/shared/infra/testing/helpers";
import { CreateCastMemberUseCase } from "../create-cast-member.use-case";

describe("CreateCastMemberUseCase Integration Tests", () => {
  let useCase: CreateCastMemberUseCase;
  let repository: CastMemberSequelizeRepository;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(() => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new CreateCastMemberUseCase(repository);
  });

  it("should create a cast member", async () => {
    let output = await useCase.execute({
      name: "John Doe",
      type: CastMemberTypes.ACTOR,
    });
    let aggregate = await repository.findById(new CategoryId(output.id));
    expect(output).toStrictEqual({
      id: aggregate!.cast_member_id.id,
      name: "John Doe",
      type: CastMemberTypes.ACTOR,
      created_at: aggregate!.created_at,
    });

    output = await useCase.execute({
      name: "Mary Doe",
      type: CastMemberTypes.DIRECTOR,
    });
    aggregate = await repository.findById(new CategoryId(output.id));
    expect(output).toStrictEqual({
      id: aggregate!.cast_member_id.id,
      name: "Mary Doe",
      type: CastMemberTypes.DIRECTOR,
      created_at: aggregate!.created_at,
    });
  });
});
