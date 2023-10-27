import { CastMemberType, CastMemberTypes } from "../cast-member-type.vo";

describe("CastMemberType Unit Tests", () => {
  it("should return error when type is invalid", () => {
    const validateSpy = jest.spyOn(CastMemberType.prototype, "validate" as any);
    const res = CastMemberType.create("1" as any);
    expect(res.isOk()).toBeFalsy();
    expect(res.isErr()).toBeTruthy();
    expect(res.unwrapErr()).toBe("Invalid cast member type: 1");
    expect(validateSpy).toHaveBeenCalledTimes(1);
  });

  it("should create a director", () => {
    const vo1 = CastMemberType.create(CastMemberTypes.DIRECTOR).unwrap();

    expect(vo1).toBeInstanceOf(CastMemberType);
    expect(vo1.type).toBe(CastMemberTypes.DIRECTOR);

    const vo2 = CastMemberType.createADirector();
    expect(vo2).toBeInstanceOf(CastMemberType);
    expect(vo2.type).toBe(CastMemberTypes.DIRECTOR);
  });

  it("should create an actor", () => {
    const vo1 = CastMemberType.create(CastMemberTypes.ACTOR).unwrap();
    expect(vo1).toBeInstanceOf(CastMemberType);
    expect(vo1.type).toBe(CastMemberTypes.ACTOR);

    const vo2 = CastMemberType.createAnActor();
    expect(vo2).toBeInstanceOf(CastMemberType);
    expect(vo2.type).toBe(CastMemberTypes.ACTOR);
  });
});
