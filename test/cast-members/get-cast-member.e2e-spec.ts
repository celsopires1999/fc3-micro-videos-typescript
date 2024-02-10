import { CastMemberOutputMapper } from "@core/cast-member/application/use-cases/common/cast-member-output";
import { CastMember } from "@core/cast-member/domain/cast-member.aggregate";
import { ICastMemberRepository } from "@core/cast-member/domain/cast-member.repository";
import { instanceToPlain } from "class-transformer";
import request from "supertest";
import { CastMembersController } from "../../src/nest-modules/cast-members-module/cast-members.controller";
import { CAST_MEMBERS_PROVIDERS } from "../../src/nest-modules/cast-members-module/cast-members.providers";
import { GetCastMemberFixture } from "../../src/nest-modules/cast-members-module/testing/cast-member-fixtures";
import { startApp } from "../../src/nest-modules/shared-module/testing/helpers";

describe("CastMembersController (e2e)", () => {
  const appHelper = startApp();
  describe("unauthenticated", () => {
    test("should return 401 when not authenticated", () => {
      return request(appHelper.app.getHttpServer())
        .get("/cast-members/88ff2587-ce5a-4769-a8c6-1d63d29c5f7a")
        .send({})
        .expect(401);
    });

    test("should return 403 when not authenticated as admin", () => {
      return request(appHelper.app.getHttpServer())
        .get("/cast-members/88ff2587-ce5a-4769-a8c6-1d63d29c5f7a")
        .authenticate(appHelper.app, false)
        .send({})
        .expect(403);
    });
  });
  describe("/cast-members/:id (GET)", () => {
    describe("should give a response error when id is invalid or not found", () => {
      const arrange = [
        {
          id: "88ff2587-ce5a-4769-a8c6-1d63d29c5f7a",
          expected: {
            message:
              "CastMember Not Found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a",
            statusCode: 404,
            error: "Not Found",
          },
        },
        {
          id: "fake id",
          expected: {
            statusCode: 422,
            message: "Validation failed (uuid is expected)",
            error: "Unprocessable Entity",
          },
        },
      ];

      test.each(arrange)("when id is $id", async ({ id, expected }) => {
        return request(appHelper.app.getHttpServer())
          .get(`/cast-members/${id}`)
          .authenticate(appHelper.app)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    it("should return a cast-member ", async () => {
      const castMemberRepo = appHelper.app.get<ICastMemberRepository>(
        CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
      );
      const castMember = CastMember.fake().anActor().build();
      await castMemberRepo.insert(castMember);

      const res = await request(appHelper.app.getHttpServer())
        .get(`/cast-members/${castMember.cast_member_id.id}`)
        .authenticate(appHelper.app)
        .expect(200);
      const keyInResponse = GetCastMemberFixture.keysInResponse;
      expect(Object.keys(res.body)).toStrictEqual(["data"]);
      expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);

      const presenter = CastMembersController.serialize(
        CastMemberOutputMapper.toOutput(castMember),
      );
      const serialized = instanceToPlain(presenter);
      expect(res.body.data).toStrictEqual(serialized);
    });
  });
});
