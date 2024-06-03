import { ICastMemberRepository } from "@core/cast-member/domain/cast-member.repository";
import { ICategoryRepository } from "@core/category/domain/category.repository";
import { IGenreRepository } from "@core/genre/domain/genre.repository";
import { Video } from "@core/video/domain/video.aggregate";
import { IVideoRepository } from "@core/video/domain/video.repository";
import request from "supertest";
import { CAST_MEMBERS_PROVIDERS } from "../../src/nest-modules/cast-members-module/cast-members.providers";
import { CATEGORY_PROVIDERS } from "../../src/nest-modules/categories-module/categories.providers";
import { GENRES_PROVIDERS } from "../../src/nest-modules/genres-module/genres.providers";
import { startApp } from "../../src/nest-modules/shared-module/testing/helpers";
import { UpdateVideoFixture } from "../../src/nest-modules/videos-module/testing/video-fixture";
import { VIDEOS_PROVIDERS } from "../../src/nest-modules/videos-module/videos.providers";

describe("VideosController (e2e)", () => {
  describe("/videos/:id (PATCH)", () => {
    const appHelper = startApp();

    describe("unauthenticated", () => {
      test("should return 401 when not authenticated", () => {
        return request(appHelper.app.getHttpServer())
          .patch("/videos/88ff2587-ce5a-4769-a8c6-1d63d29c5f7a")
          .send({})
          .expect(401);
      });

      test("should return 403 when not authenticated as admin", () => {
        return request(appHelper.app.getHttpServer())
          .patch("/videos/88ff2587-ce5a-4769-a8c6-1d63d29c5f7a")
          .authenticate(appHelper.app, false)
          .send({})
          .expect(403);
      });
    });

    describe("should return a response error when id is invalid or not found", () => {
      const faker = Video.fake().aVideoWithoutMedias();
      const arrange = [
        {
          id: "88ff2587-ce5a-4769-a8c6-1d63d29c5f7a",
          send_data: { title: faker.title },
          expected: {
            message:
              "Video Not Found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a",
            statusCode: 404,
            error: "Not Found",
          },
        },
        {
          id: "fake id",
          send_data: { title: faker.title },
          expected: {
            statusCode: 422,
            message: "Validation failed (uuid is expected)",
            error: "Unprocessable Entity",
          },
        },
      ];

      test.each(arrange)(
        "when id is $id",
        async ({ id, send_data, expected }) => {
          return request(appHelper.app.getHttpServer())
            .patch(`/videos/${id}`)
            .authenticate(appHelper.app)
            .send(send_data)
            .expect(expected.statusCode)
            .expect(expected);
        },
      );
    });

    describe("should return a response error with 422 when request body is invalid", () => {
      const invalidRequest = UpdateVideoFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest.cases).map((key) => ({
        label: key,
        value: invalidRequest.cases[key],
      }));
      let videoRepo: IVideoRepository;
      let categoryRepo: ICategoryRepository;
      let genreRepo: IGenreRepository;
      let castMemberRepo: ICastMemberRepository;
      beforeEach(async () => {
        categoryRepo = appHelper.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
        genreRepo = appHelper.app.get<IGenreRepository>(
          GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
        );
        castMemberRepo = appHelper.app.get<ICastMemberRepository>(
          CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
        videoRepo = appHelper.app.get<IVideoRepository>(
          VIDEOS_PROVIDERS.REPOSITORIES.VIDEO_REPOSITORY.provide,
        );
      });
      test.each(arrange)("when body has $label", async ({ value }) => {
        await Promise.all([
          categoryRepo.insert(invalidRequest.relations.category),
          genreRepo.insert(invalidRequest.relations.genre),
          castMemberRepo.insert(invalidRequest.relations.castMember),
          videoRepo.insert(invalidRequest.entity),
        ]);

        const id = invalidRequest.entity.video_id.id;

        return request(appHelper.app.getHttpServer())
          .patch(`/videos/${id}`)
          .authenticate(appHelper.app)
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe("should return a response error with 422 when throw EntityValidationError", () => {
      const validationErrors =
        UpdateVideoFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(validationErrors.cases).map((key) => ({
        label: key,
        value: validationErrors.cases[key],
      }));
      let videoRepo: IVideoRepository;
      let categoryRepo: ICategoryRepository;
      let genreRepo: IGenreRepository;
      let castMemberRepo: ICastMemberRepository;
      beforeEach(async () => {
        categoryRepo = appHelper.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
        genreRepo = appHelper.app.get<IGenreRepository>(
          GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
        );
        castMemberRepo = appHelper.app.get<ICastMemberRepository>(
          CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
        videoRepo = appHelper.app.get<IVideoRepository>(
          VIDEOS_PROVIDERS.REPOSITORIES.VIDEO_REPOSITORY.provide,
        );
      });
      test.each(arrange)("when body has $label", async ({ value }) => {
        await Promise.all([
          categoryRepo.insert(validationErrors.relations.category),
          genreRepo.insert(validationErrors.relations.genre),
          castMemberRepo.insert(validationErrors.relations.castMember),
          videoRepo.insert(validationErrors.entity),
        ]);

        const id = validationErrors.entity.video_id.id;

        return request(appHelper.app.getHttpServer())
          .patch(`/videos/${id}`)
          .authenticate(appHelper.app)
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe("should update a video", () => {
      const arrange = UpdateVideoFixture.arrangeForSave();

      let videoRepo: IVideoRepository;
      let categoryRepo: ICategoryRepository;
      let genreRepo: IGenreRepository;
      let castMemberRepo: ICastMemberRepository;

      beforeEach(async () => {
        categoryRepo = appHelper.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
        genreRepo = appHelper.app.get<IGenreRepository>(
          GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
        );
        castMemberRepo = appHelper.app.get<ICastMemberRepository>(
          CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
        videoRepo = appHelper.app.get<IVideoRepository>(
          VIDEOS_PROVIDERS.REPOSITORIES.VIDEO_REPOSITORY.provide,
        );
      });

      test.each(arrange)(
        "with $label",
        async ({ entity: video, send_data, expected, relations }) => {
          await Promise.all([
            categoryRepo.bulkInsert(relations.categories),
            genreRepo.bulkInsert(relations.genres),
            castMemberRepo.bulkInsert(relations.castMembers),
            videoRepo.insert(video),
          ]);

          const res = await request(appHelper.app.getHttpServer())
            .patch(`/videos/${video.video_id.id}`)
            .authenticate(appHelper.app)
            .send(send_data)
            .expect(200);

          const keyInResponse = UpdateVideoFixture.keysInResponse;
          expect(Object.keys(res.body)).toStrictEqual(["data"]);
          expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);
          expect(res.body.data).toStrictEqual({
            ...expected,
          });
        },
      );
    });
  });
});
