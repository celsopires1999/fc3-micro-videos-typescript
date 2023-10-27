import { CastMemberType } from "@core/cast-member/domain/cast-member-type.vo";
import {
  CastMember,
  CastMemberId,
} from "@core/cast-member/domain/cast-member.aggregate";
import { LoadEntityError } from "../../../../../shared/domain/validators/validation.error";
import { setupSequelize } from "../../../../../shared/infra/testing/helpers";
import { CastMemberModelMapper } from "../cast-member-model-mapper";
import { CastMemberModel } from "../cast-member.model";

describe("CastMemberModelMapper Integration Tests", () => {
  setupSequelize({ models: [CastMemberModel] });

  it("should throw error when CastMember is invalid", () => {
    expect.assertions(2);
    const model = CastMemberModel.build({
      cast_member_id: "9366b7dc-2d71-4799-b91c-c64adb205104",
      name: "a".repeat(256),
      type: 1,
    });
    try {
      CastMemberModelMapper.toEntity(model);
    } catch (e) {
      expect(e).toBeInstanceOf(LoadEntityError);
      expect((e as LoadEntityError).error).toMatchObject([
        {
          name: ["name must be shorter than or equal to 255 characters"],
        },
      ]);
    }
  });

  it("should convert a cast member model to a cast member aggregate", () => {
    const created_at = new Date();
    const model = CastMemberModel.build({
      cast_member_id: "5490020a-e866-4229-9adc-aa44b83234c4",
      name: "some value",
      type: 1,
      created_at,
    });
    const aggregate = CastMemberModelMapper.toEntity(model);
    expect(aggregate.toJSON()).toStrictEqual(
      new CastMember({
        cast_member_id: new CastMemberId(
          "5490020a-e866-4229-9adc-aa44b83234c4",
        ),
        name: "some value",
        type: CastMemberType.create(1).unwrap(),
        created_at,
      }).toJSON(),
    );
  });
});
