import { ICastMemberRepository } from "@core/cast-member/domain/cast-member.repository";
import { ICategoryRepository } from "@core/category/domain/category.repository";
import { IGenreRepository } from "@core/genre/domain/genre.repository";
import { VideoOutputMapper } from "@core/video/application/use-cases/common/video-output";
import { VideoId } from "@core/video/domain/video.aggregate";
import { IVideoRepository } from "@core/video/domain/video.repository";
import { instanceToPlain } from "class-transformer";
import request from "supertest";
import { CAST_MEMBERS_PROVIDERS } from "../../src/nest-modules/cast-members-module/cast-members.providers";
import { CATEGORY_PROVIDERS } from "../../src/nest-modules/categories-module/categories.providers";
import { GENRES_PROVIDERS } from "../../src/nest-modules/genres-module/genres.providers";
import { startApp } from "../../src/nest-modules/shared-module/testing/helpers";
import { CreateVideoFixture } from "../../src/nest-modules/videos-module/testing/video-fixture";
import { VideosController } from "../../src/nest-modules/videos-module/videos.controller";
import { VIDEOS_PROVIDERS } from "../../src/nest-modules/videos-module/videos.providers";

describe("VideosController (e2e)", () => {
  describe("/videos (POST)", () => {
    const appHelper = startApp();

    describe("unauthenticated", () => {
      test("should return 401 when not authenticated", () => {
        return request(appHelper.app.getHttpServer())
          .post("/videos")
          .send({})
          .expect(401);
      });

      test("should return 403 when not authenticated as admin", () => {
        return request(appHelper.app.getHttpServer())
          .post("/videos")
          .authenticate(appHelper.app, false)
          .send({})
          .expect(403);
      });
    });

    describe("should return a response error with 422 when request body is invalid", () => {
      const invalidRequest = CreateVideoFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));
      test.each(arrange)("when body has $label", ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .post("/videos")
          .authenticate(appHelper.app)
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe("should return a response error with 422 when throw EntityValidationError", () => {
      const validationErrors =
        CreateVideoFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(validationErrors).map((key) => ({
        label: key,
        value: validationErrors[key],
      }));
      test.each(arrange)("when body has $label", ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .post("/videos")
          .authenticate(appHelper.app)
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe("should create a video", () => {
      const arrange = CreateVideoFixture.arrangeForSave();
      let videoRepo: IVideoRepository;
      let genreRepo: IGenreRepository;
      let categoryRepo: ICategoryRepository;
      let castMemberRepo: ICastMemberRepository;
      beforeEach(async () => {
        videoRepo = appHelper.app.get<IVideoRepository>(
          VIDEOS_PROVIDERS.REPOSITORIES.VIDEO_REPOSITORY.provide,
        );
        genreRepo = appHelper.app.get<IGenreRepository>(
          GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
        );
        categoryRepo = appHelper.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
        castMemberRepo = appHelper.app.get<ICastMemberRepository>(
          CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
      });
      test.each(arrange)(
        "when body has $label",
        async ({ send_data, expected, relations }) => {
          await categoryRepo.bulkInsert(relations.categories);
          await castMemberRepo.bulkInsert(relations.castMembers);
          await genreRepo.bulkInsert(relations.genres);
          const res = await request(appHelper.app.getHttpServer())
            .post("/videos")
            .authenticate(appHelper.app)
            .send(send_data)
            .expect(201);
          const keyInResponse = CreateVideoFixture.keysInResponse;
          expect(Object.keys(res.body)).toStrictEqual(["data"]);
          expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);
          const id = res.body.data.id;
          const videoCreated = await videoRepo.findById(new VideoId(id));
          const presenter = VideosController.serialize(
            VideoOutputMapper.toOutput({
              video: videoCreated!,
              allCategoriesOfVideoAndGenre: relations.categories,
              genres: relations.genres,
              cast_members: relations.castMembers,
            }),
          );
          const serialized = instanceToPlain(presenter);
          expect(res.body.data).toStrictEqual({
            id: serialized.id,
            created_at: serialized.created_at,
            ...expected,
          });
        },
      );
    });
  });
});
