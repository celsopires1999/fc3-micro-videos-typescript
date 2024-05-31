import { ICastMemberRepository } from "@core/cast-member/domain/cast-member.repository";
import { ICategoryRepository } from "@core/category/domain/category.repository";
import { IGenreRepository } from "@core/genre/domain/genre.repository";
import { IVideoRepository } from "@core/video/domain/video.repository";
import request from "supertest";
import { CAST_MEMBERS_PROVIDERS } from "../../src/nest-modules/cast-members-module/cast-members.providers";
import { CATEGORY_PROVIDERS } from "../../src/nest-modules/categories-module/categories.providers";
import { GENRES_PROVIDERS } from "../../src/nest-modules/genres-module/genres.providers";
import { startApp } from "../../src/nest-modules/shared-module/testing/helpers";
import { ListVideosFixture } from "../../src/nest-modules/videos-module/testing/video-fixture";
import { VIDEOS_PROVIDERS } from "../../src/nest-modules/videos-module/videos.providers";
import { Video } from "@core/video/domain/video.aggregate";
import { Category } from "@core/category/domain/category.aggregate";
import { Genre } from "@core/genre/domain/genre.aggregate";
import { CastMember } from "@core/cast-member/domain/cast-member.aggregate";
import qs from "qs";

describe("VideosController (e2e)", () => {
  describe("/videos (GET)", () => {
    const appHelper = startApp();
    describe("unauthenticated", () => {
      test("should return 401 when not authenticated", () => {
        return request(appHelper.app.getHttpServer())
          .get("/videos")
          .send({})
          .expect(401);
      });

      test("should return 403 when not authenticated as admin", () => {
        return request(appHelper.app.getHttpServer())
          .get("/videos")
          .authenticate(appHelper.app, false)
          .send({})
          .expect(403);
      });
    });

    describe("should return videos sorted by created_at when request query is empty", () => {
      const { relations, entitiesMap, arrange } =
        ListVideosFixture.arrangeIncrementedWithCreatedAt();
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
        await Promise.all([
          categoryRepo.bulkInsert(Array.from(relations.categories.values())),
          genreRepo.bulkInsert(Array.from(relations.genres.values())),
          castMemberRepo.bulkInsert(Array.from(relations.castMembers.values())),
          videoRepo.bulkInsert(Object.values(entitiesMap)),
        ]);
      });
      test.each(arrange)("with $label", async ({ send_data, expected }) => {
        // const queryParams = new URLSearchParams(send_data as any).toString();
        const queryParams = qs.stringify(send_data as any);

        const data = formatExpectedData(expected, relations);
        const response = await request(appHelper.app.getHttpServer())
          .get(`/videos/?${queryParams}`)
          .authenticate(appHelper.app)
          .expect(200);
        expect(response.body).toEqual({
          data: data,
          meta: expected.meta,
        });
      });
    });

    describe("should return videos using paginate, filter and sort", () => {
      const { relations, entitiesMap, arrange } =
        ListVideosFixture.arrangeUnsorted();
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
        await Promise.all([
          categoryRepo.bulkInsert(Array.from(relations.categories.values())),
          genreRepo.bulkInsert(Array.from(relations.genres.values())),
          castMemberRepo.bulkInsert(Array.from(relations.castMembers.values())),
          videoRepo.bulkInsert(Object.values(entitiesMap)),
        ]);
      });
      test.each(arrange)("with $label", async ({ send_data, expected }) => {
        const queryParams = qs.stringify(send_data as any);
        const data = formatExpectedData(expected, relations);
        const response = await request(appHelper.app.getHttpServer())
          .get(`/videos/?${queryParams}`)
          .authenticate(appHelper.app)
          .expect(200);
        expect(response.body).toEqual({
          data: data,
          meta: expected.meta,
        });
      });
    });
  });
});

function formatExpectedData(
  expected: { entities: Video[] },
  relations: {
    categories: Map<string, Category>;
    genres: Map<string, Genre>;
    castMembers: Map<string, CastMember>;
  },
) {
  return expected.entities.map((e) => ({
    id: e.video_id.id,
    title: e.title,
    description: e.description,
    year_launched: e.year_launched,
    rating: e.rating.value,
    duration: e.duration,
    is_opened: e.is_opened,
    is_published: e.is_published,
    created_at: e.created_at.toISOString(),
    categories_id: expect.arrayContaining(Array.from(e.categories_id.keys())),
    categories: expect.arrayContaining(
      Array.from(e.categories_id.keys()).map((id) => ({
        id: relations.categories.get(id)!.category_id.id,
        name: relations.categories.get(id)!.name,
        created_at: relations.categories.get(id)!.created_at.toISOString(),
      })),
    ),
    genres_id: expect.arrayContaining(Array.from(e.genres_id.keys())),
    genres: expect.arrayContaining(
      Array.from(e.genres_id.keys()).map((id) => ({
        id: relations.genres.get(id)!.genre_id.id,
        name: relations.genres.get(id)!.name,
        is_active: relations.genres.get(id)!.is_active,
        categories_id: expect.arrayContaining(
          Array.from(relations.genres.get(id)!.categories_id.keys()),
        ),
        categories: expect.arrayContaining(
          Array.from(relations.genres.get(id)!.categories_id.keys()).map(
            (id) => ({
              id: relations.categories.get(id)!.category_id.id,
              name: relations.categories.get(id)!.name,
              created_at: relations.categories
                .get(id)!
                .created_at.toISOString(),
            }),
          ),
        ),
        created_at: relations.genres.get(id)!.created_at.toISOString(),
      })),
    ),
    cast_members_id: expect.arrayContaining(
      Array.from(e.cast_members_id.keys()),
    ),
    cast_members: expect.arrayContaining(
      Array.from(e.cast_members_id.keys()).map((id) => ({
        id: relations.castMembers.get(id)!.cast_member_id.id,
        name: relations.castMembers.get(id)!.name,
        type: relations.castMembers.get(id)!.type.type,
        created_at: relations.castMembers.get(id)!.created_at.toISOString(),
      })),
    ),
  }));
}
