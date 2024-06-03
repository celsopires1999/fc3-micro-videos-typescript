import { CastMember } from "@core/cast-member/domain/cast-member.aggregate";
import { CastMemberSequelizeRepository } from "@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository";
import { CastMemberModel } from "@core/cast-member/infra/db/sequelize/cast-member.model";
import { Category } from "@core/category/domain/category.aggregate";
import { CategorySequelizeRepository } from "@core/category/infra/db/sequelize/category-sequelize.repository";
import { CategoryModel } from "@core/category/infra/db/sequelize/category.model";
import { Genre } from "@core/genre/domain/genre.aggregate";
import { GenreSequelizeRepository } from "@core/genre/infra/db/sequelize/genre-sequelize.repository";
import { GenreModel } from "@core/genre/infra/db/sequelize/genre.model";
import { NotFoundError } from "@core/shared/domain/errors/not-found.error";
import { UnitOfWorkSequelize } from "@core/shared/infra/db/sequelize/unit-of-work-sequelize";
import { Video, VideoId } from "@core/video/domain/video.aggregate";
import { setupSequelizeForVideo } from "@core/video/infra/db/sequelize/testing/helpers";
import { VideoSequelizeRepository } from "@core/video/infra/db/sequelize/video-sequelize.repository";
import { VideoModel } from "@core/video/infra/db/sequelize/video.model";
import { GetVideoUseCase } from "../get-video.use-case";
import { expectVideoOutput } from "./get-video-tests-utils";

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

    const expected = expectVideoOutput(video, categories, genres, castMembers);

    const output = await useCase.execute({ id: video.video_id.id });

    expect(output).toEqual(expected);
  });
});
