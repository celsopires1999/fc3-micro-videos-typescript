import { CastMemberType } from "../cast-member-type.vo";
import {
  CastMember,
  CastMemberConstructorProps,
  CastMemberId,
} from "../cast-member.aggregate";

describe("CastMember Unit Tests", () => {
  beforeEach(() => {
    CastMember.prototype.validate = jest
      .fn()
      .mockImplementation(CastMember.prototype.validate);
  });
  describe("constructor", () => {
    test("with default values ", () => {
      const type = CastMemberType.createADirector();
      const castMember = new CastMember({ name: "John Doe", type: type! });
      expect(castMember.cast_member_id).toBeInstanceOf(CastMemberId);
      expect(castMember.name).toBe("John Doe");
      expect(castMember.type).toStrictEqual(type);
      expect(castMember.created_at).toBeInstanceOf(Date);
    });

    test("with all values ", () => {
      const castMemberId = new CastMemberId(
        "7f104946-a32a-4288-9de1-b60b3cf1af67",
      );
      const type = CastMemberType.createAnActor();
      const created_at = new Date();
      const castMember = new CastMember({
        cast_member_id: castMemberId,
        name: "John Doe",
        type: type!,
        created_at,
      });
      expect(castMember.cast_member_id).toEqual(castMemberId);
      expect(castMember.name).toBe("John Doe");
      expect(castMember.type).toStrictEqual(type);
      expect(castMember.created_at).toEqual(created_at);
    });

    test("with name and type", () => {
      const type = CastMemberType.createAnActor();
      const castMember = new CastMember({
        name: "John Doe",
        type: type!,
      });
      expect(castMember.cast_member_id).toBeInstanceOf(CastMemberId);
      expect(castMember.name).toBe("John Doe");
      expect(castMember.type).toStrictEqual(type);
      expect(castMember.created_at).toBeInstanceOf(Date);
    });
  });

  describe("id prop", () => {
    type CastMemberData = {
      props: CastMemberConstructorProps;
    };
    const type = CastMemberType.createAnActor();
    const arrange: CastMemberData[] = [
      { props: { name: "John Doe", type: type! } },
      {
        props: {
          name: "John Doe",
          type: type!,
          cast_member_id: null as unknown as CastMemberId,
        },
      },
      { props: { name: "John Doe", type: type!, cast_member_id: undefined } },
      {
        props: {
          name: "John Doe",
          type: type!,
          cast_member_id: new CastMemberId(),
        },
      },
    ];
    test.each(arrange)("%#) when props are %j", (item) => {
      const castMember = new CastMember(item.props);
      expect(castMember.cast_member_id).not.toBeNull();
      expect(castMember.cast_member_id).toBeInstanceOf(CastMemberId);
    });
  });

  describe("getters and setters", () => {
    test("getter and setter of name prop", () => {
      const type = CastMemberType.createAnActor();
      const castMember = new CastMember({ name: "John Doe", type: type! });
      expect(castMember.name).toBe("John Doe");

      castMember["name"] = "Mary Doe";
      expect(castMember.name).toBe("Mary Doe");
    });

    test("getter and setter of type prop", () => {
      const type = CastMemberType.createAnActor();
      const castMember = new CastMember({ name: "John Doe", type: type! });
      expect(castMember.type).toStrictEqual(type);
      expect(castMember.type.equals(type!)).toBeTruthy();

      castMember["type"] = type!;
      expect(castMember.type).toStrictEqual(type);
    });

    test("setter of created_at prop", () => {
      const type = CastMemberType.createAnActor();
      const created_at = new Date();
      let castMember = new CastMember({
        name: "John Doe",
        type: type!,
        created_at,
      });
      expect(castMember.created_at).toBe(created_at);
      expect(castMember.created_at).toBeInstanceOf(Date);
    });
  });

  describe("create command", () => {
    test("should create a castMember", () => {
      const type = CastMemberType.createADirector();
      const castMember = CastMember.create({
        name: "John Doe",
        type: type!,
      });
      expect(castMember.cast_member_id).toBeInstanceOf(CastMemberId);
      expect(castMember.name).toBe("John Doe");
      expect(castMember.type).toStrictEqual(type);
      expect(castMember.created_at).toBeInstanceOf(Date);
      expect(CastMember.prototype.validate).toHaveBeenCalledTimes(1);
      expect(castMember.notification.hasErrors()).toBe(false);
    });
  });

  describe("methods", () => {
    test("changeName", () => {
      const actor = CastMemberType.createAnActor();
      const castMember = CastMember.create({ name: "John Doe", type: actor! });
      castMember.changeName("Mary Doe");
      expect(castMember.cast_member_id).toBeInstanceOf(CastMemberId);
      expect(castMember.name).toBe("Mary Doe");
      expect(castMember.type).toBe(actor);
      expect(castMember.created_at).toBeInstanceOf(Date);
      expect(CastMember.prototype.validate).toHaveBeenCalledTimes(2);
      expect(castMember.notification.hasErrors()).toBe(false);
    });
    test("changeType", () => {
      const actor = CastMemberType.createAnActor();
      const director = CastMemberType.createADirector();
      const castMember = CastMember.create({ name: "John Doe", type: actor! });
      castMember.changeType(director!);
      expect(castMember.cast_member_id).toBeInstanceOf(CastMemberId);
      expect(castMember.name).toBe("John Doe");
      expect(castMember.type).toBe(director);
      expect(castMember.created_at).toBeInstanceOf(Date);
      expect(CastMember.prototype.validate).toHaveBeenCalledTimes(1);
      expect(castMember.notification.hasErrors()).toBe(false);
    });

    test("toJSON", () => {
      const type = CastMemberType.createADirector();
      const castMember = CastMember.create({
        name: "John Doe",
        type: type!,
      });
      expect(castMember.toJSON()).toEqual({
        cast_member_id: castMember.cast_member_id.id,
        name: castMember.name,
        type: castMember.type.type,
        created_at: castMember.created_at,
      });
    });
  });
});
describe("CastMember Validator", () => {
  describe("create command", () => {
    test("invalid name", () => {
      const type = CastMemberType.createADirector();
      const castMember = CastMember.create({
        name: "t".repeat(256),
        type: type!,
      });

      expect(castMember.notification.hasErrors()).toBe(true);
      expect(castMember.notification).notificationContainsErrorMessages([
        {
          name: ["name must be shorter than or equal to 255 characters"],
        },
      ]);
    });
  });

  describe("changeName method", () => {
    it("should throw an error when name is invalid", () => {
      const type = CastMemberType.createADirector();
      const castMember = CastMember.create({ name: "Movie", type: type! });
      castMember.changeName("t".repeat(256));
      expect(castMember.notification.hasErrors()).toBeTruthy();
      expect(castMember.notification).notificationContainsErrorMessages([
        {
          name: ["name must be shorter than or equal to 255 characters"],
        },
      ]);
    });
  });
});
