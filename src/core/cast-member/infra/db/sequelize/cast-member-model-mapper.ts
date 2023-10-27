import { CastMemberType } from "@core/cast-member/domain/cast-member-type.vo";
import {
  CastMember,
  CastMemberId,
} from "@core/cast-member/domain/cast-member.aggregate";
import { LoadEntityError } from "../../../../shared/domain/validators/validation.error";
import { CastMemberModel } from "./cast-member.model";

export class CastMemberModelMapper {
  static toModel(entity: CastMember): CastMemberModel {
    return CastMemberModel.build({
      cast_member_id: entity.cast_member_id.id,
      name: entity.name,
      type: entity.type.type,
      created_at: entity.created_at,
    });
  }

  static toEntity(model: CastMemberModel): CastMember {
    const castMemberTypeResult = CastMemberType.create(model.type);
    const type = castMemberTypeResult.isOk()
      ? castMemberTypeResult.unwrap()
      : null;

    const castMember = new CastMember({
      cast_member_id: new CastMemberId(model.cast_member_id),
      name: model.name,
      type,
      created_at: model.created_at,
    });

    castMember.validate();

    const notification = castMember.notification;
    if (castMemberTypeResult.isErr()) {
      notification.setError(castMemberTypeResult.unwrapErr(), "type");
    }

    if (notification.hasErrors()) {
      throw new LoadEntityError(notification.toJSON());
    }

    return castMember;
  }
}
