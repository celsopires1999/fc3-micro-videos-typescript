import { CastMemberSequelizeRepository } from "@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository";
import { CategorySequelizeRepository } from "@core/category/infra/db/sequelize/category-sequelize.repository";
import { GenreSequelizeRepository } from "@core/genre/infra/db/sequelize/genre-sequelize.repository";
import { setupSequelizeForVideo } from "@core/video/infra/db/sequelize/testing/helpers";
import { VideoSequelizeRepository } from "@core/video/infra/db/sequelize/video-sequelize.repository";
import { GetVideoUseCase } from "../get-video.use-case";
import { VideoModel } from "@core/video/infra/db/sequelize/video.model";
import { UnitOfWorkSequelize } from "@core/shared/infra/db/sequelize/unit-of-work-sequelize";
import { GenreModel } from "@core/genre/infra/db/sequelize/genre.model";
import { CastMemberModel } from "@core/cast-member/infra/db/sequelize/cast-member.model";
import { CategoryModel } from "@core/category/infra/db/sequelize/category.model";
import { Category } from "@core/category/domain/category.aggregate";
import { Genre } from "@core/genre/domain/genre.aggregate";
import { CastMember } from "@core/cast-member/domain/cast-member.aggregate";
import { Video, VideoId } from "@core/video/domain/video.aggregate";
import { VideoOutputMapper } from "../../common/video-output";
import { NotFoundError } from "@core/shared/domain/errors/not-found.error";

describe("GetVideoUseCase Integration Tests", () => {
  let uow: UnitOfWorkSequelize;
  let useCase: GetVideoUseCase;
  let videoRepo: VideoSequelizeRepository;
  let genreRepo: GenreSequelizeRepository;
  let castMemberRepo: CastMemberSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;

  const sequelizeHelper = setupSequelizeForVideo();

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);

    videoRepo = new VideoSequelizeRepository(VideoModel, uow);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    castMemberRepo = new CastMemberSequelizeRepository(CastMemberModel);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    useCase = new GetVideoUseCase(
      videoRepo,
      categoryRepo,
      genreRepo,
      castMemberRepo,
    );
  });

  it("should throw an error when video is not found", async () => {
    const videoId = new VideoId();
    await expect(useCase.execute({ id: videoId.id })).rejects.toThrow(
      new NotFoundError(videoId.id, Video),
    );
  });

  it("should get a video", async () => {
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

    const expected = VideoOutputMapper.toOutput({
      video,
      allCategoriesOfVideoAndGenre: categories,
      genres: [genres[0], genres[1]],
      cast_members: [castMembers[0], castMembers[1]],
    });

    expected.categories_id = expect.arrayContaining(
      expected.categories_id.map((id: string) => id),
    );
    expected.categories = expect.arrayContaining(
      expected.categories.map((category: any) => ({
        id: category.id,
        name: category.name,
        created_at: category.created_at,
      })),
    );

    expected.genres_id = expect.arrayContaining(
      expected.genres_id.map((id: string) => id),
    );
    expected.genres = expect.arrayContaining(
      expected.genres.map((genre: any) => ({
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

    expected.cast_members_id = expect.arrayContaining(
      expected.cast_members_id.map((id: string) => id),
    );
    expected.cast_members = expect.arrayContaining(
      expected.cast_members.map((cast_member: any) => ({
        id: cast_member.id,
        name: cast_member.name,
        type: cast_member.type,
        created_at: cast_member.created_at,
      })),
    );

    const output = await useCase.execute({ id: video.video_id.id });

    expect(output).toEqual(expected);
  });
});
