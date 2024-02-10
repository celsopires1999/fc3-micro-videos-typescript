import { CastMember } from "@core/cast-member/domain/cast-member.aggregate";
import { ICastMemberRepository } from "@core/cast-member/domain/cast-member.repository";
import request from "supertest";
import { CAST_MEMBERS_PROVIDERS } from "../../src/nest-modules/cast-members-module/cast-members.providers";
import { startApp } from "../../src/nest-modules/shared-module/testing/helpers";

describe("CastMembersController (e2e)", () => {
  describe("/delete/:id (DELETE)", () => {
    const appHelper = startApp();
    describe("unauthenticated", () => {
      test("should return 401 when not authenticated", () => {
        return request(appHelper.app.getHttpServer())
          .delete("/cast-members/88ff2587-ce5a-4769-a8c6-1d63d29c5f7a")
          .send({})
          .expect(401);
      });

      test("should return 403 when not authenticated as admin", () => {
        return request(appHelper.app.getHttpServer())
          .delete("/cast-members/88ff2587-ce5a-4769-a8c6-1d63d29c5f7a")
          .authenticate(appHelper.app, false)
          .send({})
          .expect(403);
      });
    });
    describe("should return a response error when id is invalid or not found", () => {
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
          .delete(`/cast-members/${id}`)
          .authenticate(appHelper.app)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    it("should delete a cast member and get response with status 204", async () => {
      const castMemberRepo = appHelper.app.get<ICastMemberRepository>(
        CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
      );
      const castMember = CastMember.fake().anActor().build();
      await castMemberRepo.insert(castMember);

      await request(appHelper.app.getHttpServer())
        .delete(`/cast-members/${castMember.cast_member_id.id}`)
        .authenticate(appHelper.app)
        .expect(204);

      await expect(
        castMemberRepo.findById(castMember.cast_member_id),
      ).resolves.toBeNull();
    });
  });
});
