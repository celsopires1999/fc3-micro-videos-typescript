import { ICastMemberRepository } from "@core/cast-member/domain/cast-member.repository";
import { IUseCase } from "../../../../shared/application/use-case.interface";
import { EntityValidationError } from "../../../../shared/domain/validators/validation.error";
import { CreateCastMemberInput } from "./create-cast-member.input";
import { CastMember } from "@core/cast-member/domain/cast-member.aggregate";
import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from "../common/cast-member-output";
import { CastMemberType } from "@core/cast-member/domain/cast-member-type.vo";

export class CreateCastMemberUseCase
  implements IUseCase<CreateCastMemberInput, CreateCastMemberOutput>
{
  constructor(private readonly castMemberRepo: ICastMemberRepository) {}

  async execute(input: CreateCastMemberInput): Promise<CreateCastMemberOutput> {
    const castMemberTypeResult = CastMemberType.create(input.type);
    const type = castMemberTypeResult.isOk()
      ? castMemberTypeResult.unwrap()
      : null;

    const entity = CastMember.create({ ...input, type });

    const notification = entity.notification;
    if (castMemberTypeResult.isErr()) {
      notification.setError(castMemberTypeResult.unwrapErr(), "type");
    }

    if (entity.notification.hasErrors()) {
      throw new EntityValidationError(entity.notification.toJSON());
    }

    await this.castMemberRepo.insert(entity);

    return CastMemberOutputMapper.toOutput(entity);
  }
}

export type CreateCastMemberOutput = CastMemberOutput;
