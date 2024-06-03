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
import { DeleteVideoUseCase } from "../delete-video.use-case";

describe("DeleteVideoUseCase Integration Tests", () => {
  let uow: UnitOfWorkSequelize;
  let useCase: DeleteVideoUseCase;
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
    useCase = new DeleteVideoUseCase(uow, videoRepo);
  });

  it("should throw an error when video is not found", async () => {
    const videoId = new VideoId();
    await expect(useCase.execute({ id: videoId.id })).rejects.toThrow(
      new NotFoundError(videoId.id, Video),
    );
  });

  it("should delete a video", async () => {
    const category = Category.fake().aCategory().build();
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    const castMember = CastMember.fake().anActor().build();

    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(category.category_id)
      .addGenreId(genre.genre_id)
      .addCastMemberId(castMember.cast_member_id)
      .build();

    await Promise.all([
      categoryRepo.insert(category),
      genreRepo.insert(genre),
      castMemberRepo.insert(castMember),
      videoRepo.insert(video),
    ]);

    await useCase.execute({ id: video.video_id.id });
    await expect(videoRepo.findById(video.video_id)).resolves.toBeNull();
  });
});
