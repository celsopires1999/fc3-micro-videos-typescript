import { CastMemberInMemoryRepository } from "@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository";
import { CategoryInMemoryRepository } from "@core/category/infra/db/in-memory/category-in-memory.repository";
import { GenreInMemoryRepository } from "@core/genre/infra/db/in-memory/genre-in-memory.repository";
import { VideoInMemoryRepository } from "@core/video/infra/db/in-memory/video-in-memory.repository";
import { ListVideosUseCase } from "../list-videos.use-case";
import { VideoSearchResult } from "@core/video/domain/video.repository";
import { Category } from "@core/category/domain/category.aggregate";
import { Genre } from "@core/genre/domain/genre.aggregate";
import { CastMember } from "@core/cast-member/domain/cast-member.aggregate";

describe("ListVideosUseCase Unit Tests", () => {
  let useCase: ListVideosUseCase;

  let videoRepo: VideoInMemoryRepository;
  let genreRepo: GenreInMemoryRepository;
  let castMemberRepo: CastMemberInMemoryRepository;
  let categoryRepo: CategoryInMemoryRepository;

  beforeEach(() => {
    videoRepo = new VideoInMemoryRepository();
    genreRepo = new GenreInMemoryRepository();
    categoryRepo = new CategoryInMemoryRepository();
    castMemberRepo = new CastMemberInMemoryRepository();
    useCase = new ListVideosUseCase(
      videoRepo,
      categoryRepo,
      genreRepo,
      castMemberRepo,
    );
  });

  test("toOutput method", async () => {
    let result = new VideoSearchResult({
      items: [],
      total: 1,
      current_page: 1,
      per_page: 2,
    });
    let output = await useCase["toOutput"](result);
    expect(output).toStrictEqual({
      items: [],
      total: 1,
      current_page: 1,
      per_page: 2,
      last_page: 1,
    });

    // const { video, categories, genres, castMembers } = await buildTestVideo(
    //   categoryRepo,
    //   genreRepo,
    //   castMemberRepo,
    //   videoRepo,
    // );
    const categories = Category.fake().theCategories(2).build();
    const genres = Genre.fake()
      .theGenres(2)
      .addCategoryId(categories[0].category_id)
      .addCategoryId(categories[1].category_id)
      .build();
    const castMembers = CastMember.fake().theCastMembers(2).build();

    await Promise.all([
      categoryRepo.bulkInsert(categories),
      genreRepository.bulkInsert(genres),
      castMemberRepository.bulkInsert(castMembers),
    ]);

    const video = Video.fake()
      .aVideoWithAllMedias()
      .addCategoryId(categories[0].category_id)
      .addCategoryId(categories[1].category_id)
      .addGenreId(genres[0].genre_id)
      .addGenreId(genres[1].genre_id)
      .addCastMemberId(castMembers[0].cast_member_id)
      .addCastMemberId(castMembers[1].cast_member_id)
      .build();
    videoRepository.insert(video);

    result = new VideoSearchResult({
      items: [video],
      total: 1,
      current_page: 1,
      per_page: 2,
    });

    output = await useCase["toOutput"](result);
    const expected = {
      items: [
        {
          id: video.video_id.id,
          title: video.title,
          description: video.description,
          year_launched: video.year_launched,
          duration: video.duration,
          rating: video.rating.value,
          is_opened: video.is_opened,
          is_published: video.is_published,
          categories_id: [
            categories[0].category_id.id,
            categories[1].category_id.id,
          ],
          categories: [
            {
              id: categories[0].category_id.id,
              name: categories[0].name,
              created_at: categories[0].created_at,
            },
            {
              id: categories[1].category_id.id,
              name: categories[1].name,
              created_at: categories[1].created_at,
            },
          ],
          genres_id: [genres[0].genre_id.id, genres[1].genre_id.id],
          genres: [
            {
              id: genres[0].genre_id.id,
              name: genres[0].name,
              is_active: genres[0].is_active,
              categories_id: [
                categories[0].category_id.id,
                categories[1].category_id.id,
              ],
              categories: [
                {
                  id: categories[0].category_id.id,
                  name: categories[0].name,
                  created_at: categories[0].created_at,
                },
                {
                  id: categories[1].category_id.id,
                  name: categories[1].name,
                  created_at: categories[1].created_at,
                },
              ],
              created_at: genres[0].created_at,
            },
            {
              id: genres[1].genre_id.id,
              name: genres[1].name,
              is_active: genres[1].is_active,
              categories_id: [
                categories[0].category_id.id,
                categories[1].category_id.id,
              ],
              categories: [
                {
                  id: categories[0].category_id.id,
                  name: categories[0].name,
                  created_at: categories[0].created_at,
                },
                {
                  id: categories[1].category_id.id,
                  name: categories[1].name,
                  created_at: categories[1].created_at,
                },
              ],
              created_at: genres[1].created_at,
            },
          ],
          cast_members_id: [
            castMembers[0].cast_member_id.id,
            castMembers[1].cast_member_id.id,
          ],
          cast_members: [
            {
              id: castMembers[0].cast_member_id.id,
              name: castMembers[0].name,
              type: castMembers[0].type.type,
              created_at: castMembers[0].created_at,
            },
            {
              id: castMembers[1].cast_member_id.id,
              name: castMembers[1].name,
              type: castMembers[1].type.type,
              created_at: castMembers[1].created_at,
            },
          ],
          created_at: video.created_at,
        },
      ],
      total: 1,
      current_page: 1,
      per_page: 2,
      last_page: 1,
    };
    expect(output).toStrictEqual(expected);
  });
});
