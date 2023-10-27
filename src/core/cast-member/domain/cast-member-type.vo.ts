import { ValueObject } from "@core/shared/domain/value-object";
import { Err, Ok, Result } from "@sniptt/monads";

export const CastMemberTypes = {
  DIRECTOR: 1,
  ACTOR: 2,
} as const;

type ObjectValues<T> = T[keyof T];
export type CastMemberTypes = ObjectValues<typeof CastMemberTypes>;
const TYPES_OPTIONS = Object.values(CastMemberTypes);

export class CastMemberType extends ValueObject {
  private constructor(readonly type: CastMemberTypes) {
    super();
    this.validate();
  }

  static create(value: CastMemberTypes): Result<CastMemberType, string> {
    try {
      const type = new CastMemberType(value);
      return Ok(type);
    } catch (e) {
      if (e instanceof InvalidCastMemberTypeError) {
        return Err(e.message);
      }
      throw e;
    }
  }

  private validate() {
    const isValid = TYPES_OPTIONS.includes(this.type);
    if (!isValid) {
      throw new InvalidCastMemberTypeError(this.type);
    }
  }

  static createADirector() {
    return CastMemberType.create(CastMemberTypes.DIRECTOR).unwrap();
  }

  static createAnActor() {
    return CastMemberType.create(CastMemberTypes.ACTOR).unwrap();
  }
}

export class InvalidCastMemberTypeError extends Error {
  constructor(invalidType: any) {
    super(`Invalid cast member type: ${invalidType}`);
    this.name = "InvalidCastMemberTypeError";
  }
}
