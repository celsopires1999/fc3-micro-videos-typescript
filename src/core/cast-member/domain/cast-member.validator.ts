import { IsInstance, IsNotEmpty, MaxLength } from "class-validator";
import { ClassValidatorFields } from "../../shared/domain/validators/class-validator-fields";
import { Notification } from "../../shared/domain/validators/notification";
import { CastMemberType } from "./cast-member-type.vo";
import { CastMember } from "./cast-member.aggregate";

//criar um testes que verifique os decorators
export class CastMemberRules {
  @MaxLength(255, { groups: ["name"] })
  name: string;

  constructor(entity: CastMember) {
    Object.assign(this, entity);
  }
}

export class CastMemberValidator extends ClassValidatorFields {
  validate(notification: Notification, data: any, fields?: string[]): boolean {
    const newFields = fields?.length ? fields : ["name"];
    return super.validate(notification, new CastMemberRules(data), newFields);
  }
}

export class CastMemberValidatorFactory {
  static create() {
    return new CastMemberValidator();
  }
}
