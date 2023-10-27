import { CastMemberTypes } from "@core/cast-member/domain/cast-member-type.vo";
import { CastMember } from "@core/cast-member/domain/cast-member.aggregate";

export type CastMemberOutput = {
  id: string;
  name: string;
  type: CastMemberTypes;
  created_at: Date;
};

export class CastMemberOutputMapper {
  static toOutput(entity: CastMember): CastMemberOutput {
    const { cast_member_id, ...otherProps } = entity.toJSON();
    return {
      id: cast_member_id,
      ...otherProps,
    };
  }
}
