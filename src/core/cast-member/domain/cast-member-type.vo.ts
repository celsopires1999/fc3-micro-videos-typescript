import { Either } from "@core/shared/domain/either";
import { ValueObject } from "@core/shared/domain/value-object";

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

  static create(
    value: CastMemberTypes,
  ): Either<CastMemberType | null, InvalidCastMemberTypeError | null> {
    return Either.safe(() => new CastMemberType(value));
  }

  private validate() {
    const isValid = TYPES_OPTIONS.includes(this.type);
    if (!isValid) {
      throw new InvalidCastMemberTypeError(this.type);
    }
  }

  static createADirector() {
    return CastMemberType.create(CastMemberTypes.DIRECTOR).ok;
  }

  static createAnActor() {
    return CastMemberType.create(CastMemberTypes.ACTOR).ok;
  }
}

export class InvalidCastMemberTypeError extends Error {
  constructor(invalidType: any) {
    super(`Invalid cast member type: ${invalidType}`);
    this.name = "InvalidCastMemberTypeError";
  }
}
