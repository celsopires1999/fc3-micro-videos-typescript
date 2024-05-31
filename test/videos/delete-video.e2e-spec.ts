import { ICastMemberRepository } from "@core/cast-member/domain/cast-member.repository";
import { ICategoryRepository } from "@core/category/domain/category.repository";
import { IGenreRepository } from "@core/genre/domain/genre.repository";
import { IVideoRepository } from "@core/video/domain/video.repository";
import request from "supertest";
import { CAST_MEMBERS_PROVIDERS } from "../../src/nest-modules/cast-members-module/cast-members.providers";
import { CATEGORY_PROVIDERS } from "../../src/nest-modules/categories-module/categories.providers";
import { GENRES_PROVIDERS } from "../../src/nest-modules/genres-module/genres.providers";
import { startApp } from "../../src/nest-modules/shared-module/testing/helpers";
import { AVideoFixture } from "../../src/nest-modules/videos-module/testing/video-fixture";
import { VIDEOS_PROVIDERS } from "../../src/nest-modules/videos-module/videos.providers";

describe("VideosController (e2e)", () => {
  const appHelper = startApp();
  describe("/delete/id (DELETE)", () => {
    describe("unauthenticated", () => {
      test("should return 401 when not authenticated", () => {
        return request(appHelper.app.getHttpServer())
          .delete("/videos/88ff2587-ce5a-4769-a8c6-1d63d29c5f7a")
          .send({})
          .expect(401);
      });

      test("should return 403 when not authenticated as admin", () => {
        return request(appHelper.app.getHttpServer())
          .delete("/videos/88ff2587-ce5a-4769-a8c6-1d63d29c5f7a")
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
              "Video Not Found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a",
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
          .delete(`/videos/${id}`)
          .authenticate(appHelper.app)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    it("should delete a video and return a response with status 204", async () => {
      const videoRepo = appHelper.app.get<IVideoRepository>(
        VIDEOS_PROVIDERS.REPOSITORIES.VIDEO_REPOSITORY.provide,
      );
      const genreRepo = appHelper.app.get<IGenreRepository>(
        GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
      );
      const categoryRepo = appHelper.app.get<ICategoryRepository>(
        CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      );
      const castMemberRepo = appHelper.app.get<ICastMemberRepository>(
        CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
      );

      const arrange = AVideoFixture.arrange();
      await Promise.all([
        categoryRepo.bulkInsert(arrange.relations.categories),
        genreRepo.bulkInsert(arrange.relations.genres),
        castMemberRepo.bulkInsert(arrange.relations.castMembers),
        videoRepo.insert(arrange.entity),
      ]);

      await request(appHelper.app.getHttpServer())
        .delete(`/videos/${arrange.entity.video_id.id}`)
        .authenticate(appHelper.app)
        .expect(204);

      await expect(
        videoRepo.findById(arrange.entity.video_id),
      ).resolves.toBeNull();
    });
  });
});
