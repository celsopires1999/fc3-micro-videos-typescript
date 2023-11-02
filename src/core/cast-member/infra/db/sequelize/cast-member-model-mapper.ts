import { LoadEntityError } from "@core/shared/domain/validators/validation.error";
import { CastMemberModel } from "./cast-member.model";
import { CastMemberType } from "@core/cast-member/domain/cast-member-type.vo";
import {
  CastMember,
  CastMemberId,
} from "@core/cast-member/domain/cast-member.aggregate";

export class CastMemberModelMapper {
  static toEntity(model: CastMemberModel) {
    const { cast_member_id: id, ...otherData } = model.toJSON();
    const [type, errorCastMemberType] = CastMemberType.create(
      otherData.type as any,
    ).asArray();

    const castMember = new CastMember({
      ...otherData,
      cast_member_id: new CastMemberId(id),
      type: type!,
    });

    castMember.validate();

    const notification = castMember.notification;
    if (errorCastMemberType) {
      notification.setError(errorCastMemberType.message, "type");
    }

    if (notification.hasErrors()) {
      throw new LoadEntityError(notification.toJSON());
    }

    return castMember;
  }
}
