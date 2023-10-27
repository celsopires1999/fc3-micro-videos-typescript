import {
  CastMemberType,
  CastMemberTypes,
} from "@core/cast-member/domain/cast-member-type.vo";
import { CastMember } from "@core/cast-member/domain/cast-member.aggregate";
import { CastMemberOutputMapper } from "../cast-member-output";

describe("CastMemberOutputMapper Unit Tests", () => {
  it("should convert a cast member aggregate in output", () => {
    const aggregate = CastMember.create({
      name: "John Doe",
      type: CastMemberType.createAnActor(),
    });
    const spyToJSON = jest.spyOn(aggregate, "toJSON");
    const output = CastMemberOutputMapper.toOutput(aggregate);
    expect(spyToJSON).toHaveBeenCalled();
    expect(output).toStrictEqual({
      id: aggregate.cast_member_id.id,
      name: "John Doe",
      type: CastMemberTypes.ACTOR,
      created_at: aggregate.created_at,
    });
  });
});
