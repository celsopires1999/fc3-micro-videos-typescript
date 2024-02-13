import { CastMemberOutputMapper } from "@core/cast-member/application/use-cases/common/cast-member-output";
import { ICastMemberRepository } from "@core/cast-member/domain/cast-member.repository";
import { instanceToPlain } from "class-transformer";
import qs from "qs";
import request from "supertest";
import { CastMembersController } from "../../src/nest-modules/cast-members-module/cast-members.controller";
import { CAST_MEMBERS_PROVIDERS } from "../../src/nest-modules/cast-members-module/cast-members.providers";
import { ListCastMembersFixture } from "../../src/nest-modules/cast-members-module/testing/cast-member-fixtures";
import { startApp } from "../../src/nest-modules/shared-module/testing/helpers";

describe("CastMembersController (e2e)", () => {
  describe("/cast-members (GET)", () => {
    const appHelper = startApp();
    describe("unauthenticated", () => {
      test("should return 401 when not authenticated", () => {
        return request(appHelper.app.getHttpServer())
          .get("/cast-members")
          .send({})
          .expect(401);
      });

      test("should return 403 when not authenticated as admin", () => {
        return request(appHelper.app.getHttpServer())
          .get("/cast-members")
          .authenticate(appHelper.app, false)
          .send({})
          .expect(403);
      });
    });
    describe("should return cast members sorted by created_at when request query is empty", () => {
      let castMemberRepo: ICastMemberRepository;
      const { entitiesMap, arrange } =
        ListCastMembersFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        castMemberRepo = appHelper.app.get<ICastMemberRepository>(
          CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
        await castMemberRepo.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        "when query params is $send_data",
        async ({ send_data, expected }) => {
          const queryParams = new URLSearchParams(send_data as any).toString();
          return request(appHelper.app.getHttpServer())
            .get(`/cast-members/?${queryParams}`)
            .authenticate(appHelper.app)
            .expect(200)
            .expect({
              data: expected.entities.map((e) =>
                instanceToPlain(
                  CastMembersController.serialize(
                    CastMemberOutputMapper.toOutput(e),
                  ),
                ),
              ),
              meta: expected.meta,
            });
        },
      );
    });

    describe("should return cast members using paginate, filter and sort", () => {
      let castMemberRepo: ICastMemberRepository;
      const { entitiesMap, arrange } = ListCastMembersFixture.arrangeUnsorted();

      beforeEach(async () => {
        castMemberRepo = appHelper.app.get<ICastMemberRepository>(
          CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
        await castMemberRepo.bulkInsert(Object.values(entitiesMap));
      });

      test.each([arrange[0]])(
        "when query params is $send_data",
        async ({ send_data, expected }) => {
          const queryParams = qs.stringify(send_data as any);
          return request(appHelper.app.getHttpServer())
            .get(`/cast-members/?${queryParams}`)
            .authenticate(appHelper.app)
            .expect(200)
            .expect({
              data: expected.entities.map((e) =>
                instanceToPlain(
                  CastMembersController.serialize(
                    CastMemberOutputMapper.toOutput(e),
                  ),
                ),
              ),
              meta: expected.meta,
            });
        },
      );
    });
  });
});
