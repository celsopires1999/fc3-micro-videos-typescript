import { CastMember } from "@core/cast-member/domain/cast-member.aggregate";
import { ICastMemberRepository } from "@core/cast-member/domain/cast-member.repository";
import { Category } from "@core/category/domain/category.aggregate";
import { ICategoryRepository } from "@core/category/domain/category.repository";
import { Genre } from "@core/genre/domain/genre.aggregate";
import { IGenreRepository } from "@core/genre/domain/genre.repository";
import { VideoOutputMapper } from "@core/video/application/use-cases/common/video-output";
import { Video } from "@core/video/domain/video.aggregate";
import { IVideoRepository } from "@core/video/domain/video.repository";
import { instanceToPlain } from "class-transformer";
import request from "supertest";
import { CAST_MEMBERS_PROVIDERS } from "../../src/nest-modules/cast-members-module/cast-members.providers";
import { CATEGORY_PROVIDERS } from "../../src/nest-modules/categories-module/categories.providers";
import { GENRES_PROVIDERS } from "../../src/nest-modules/genres-module/genres.providers";
import { startApp } from "../../src/nest-modules/shared-module/testing/helpers";
import { AVideoFixture } from "../../src/nest-modules/videos-module/testing/video-fixture";
import { VideosController } from "../../src/nest-modules/videos-module/videos.controller";
import { VIDEOS_PROVIDERS } from "../../src/nest-modules/videos-module/videos.providers";

describe("VideosController (e2e)", () => {
  const appHelper = startApp();
  describe("unauthenticated", () => {
    test("should return 401 when not authenticated", () => {
      return request(appHelper.app.getHttpServer())
        .get("/videos/88ff2587-ce5a-4769-a8c6-1d63d29c5f7a")
        .send({})
        .expect(401);
    });

    test("should return 403 when not authenticated as admin", () => {
      return request(appHelper.app.getHttpServer())
        .get("/videos/88ff2587-ce5a-4769-a8c6-1d63d29c5f7a")
        .authenticate(appHelper.app, false)
        .send({})
        .expect(403);
    });
  });
  describe("/videos/:id (GET)", () => {
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
          .get(`/videos/${id}`)
          .authenticate(appHelper.app)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    it("should return a video ", async () => {
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

      const categories = Category.fake().theCategories(3).build();
      await categoryRepo.bulkInsert(categories);

      const genres = Genre.fake()
        .theGenres(3)
        .addCategoryId(categories[0].category_id)
        .addCategoryId(categories[1].category_id)
        .addCategoryId(categories[2].category_id)
        .build();
      await genreRepo.bulkInsert(genres);

      const castMembers = CastMember.fake().theCastMembers(3).build();
      await castMemberRepo.bulkInsert(castMembers);

      const video = Video.fake()
        .aVideoWithAllMedias()
        .addCategoryId(categories[0].category_id)
        .addCategoryId(categories[1].category_id)
        .addGenreId(genres[0].genre_id)
        .addGenreId(genres[1].genre_id)
        .addCastMemberId(castMembers[0].cast_member_id)
        .addCastMemberId(castMembers[1].cast_member_id)
        .build();
      await videoRepo.insert(video);

      const res = await request(appHelper.app.getHttpServer())
        .get(`/videos/${video.video_id.id}`)
        .authenticate(appHelper.app)
        .expect(200);
      const keyInResponse = AVideoFixture.keysInResponse;
      expect(Object.keys(res.body)).toStrictEqual(["data"]);
      expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);

      const presenter = VideosController.serialize(
        VideoOutputMapper.toOutput({
          video: video,
          allCategoriesOfVideoAndGenre: categories,
          genres: [genres[0], genres[1]],
          cast_members: [castMembers[0], castMembers[1]],
        }),
      );
      const serialized = instanceToPlain(presenter);
      serialized.categories_id = expect.arrayContaining(
        serialized.categories_id.map((id: string) => id),
      );
      serialized.categories = expect.arrayContaining(
        serialized.categories.map((category: any) => ({
          id: category.id,
          name: category.name,
          created_at: category.created_at,
        })),
      );

      //
      serialized.genres_id = expect.arrayContaining(
        serialized.genres_id.map((id: string) => id),
      );
      serialized.genres = expect.arrayContaining(
        serialized.genres.map((genre: any) => ({
          id: genre.id,
          name: genre.name,
          is_active: genre.is_active,
          created_at: genre.created_at,
          categories_id: expect.arrayContaining(
            genre.categories_id.map((id: string) => id),
          ),
          categories: expect.arrayContaining(
            genre.categories.map((category: any) => ({
              id: category.id,
              name: category.name,
              created_at: category.created_at,
            })),
          ),
        })),
      );
      //
      serialized.cast_members_id = expect.arrayContaining(
        serialized.cast_members_id.map((id: string) => id),
      );
      serialized.cast_members = expect.arrayContaining(
        serialized.cast_members.map((cast_member: any) => ({
          id: cast_member.id,
          name: cast_member.name,
          type: cast_member.type,
          created_at: cast_member.created_at,
        })),
      );
      //
      expect(res.body.data).toEqual(serialized);
    });
  });
});
