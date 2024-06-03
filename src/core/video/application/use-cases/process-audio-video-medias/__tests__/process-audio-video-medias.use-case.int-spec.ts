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
import { AudioVideoMediaStatus } from "@core/shared/domain/value-objects/audio-video-media.vo";
import { UnitOfWorkSequelize } from "@core/shared/infra/db/sequelize/unit-of-work-sequelize";
import { Trailer } from "@core/video/domain/trailer.vo";
import { VideoMedia } from "@core/video/domain/video-media.vo";
import { Video, VideoId } from "@core/video/domain/video.aggregate";
import { setupSequelizeForVideo } from "@core/video/infra/db/sequelize/testing/helpers";
import { VideoSequelizeRepository } from "@core/video/infra/db/sequelize/video-sequelize.repository";
import { VideoModel } from "@core/video/infra/db/sequelize/video.model";
import { ProcessAudioVideoMediasInput } from "../process-audio-video-medias.input";
import { ProcessAudioVideoMediasUseCase } from "../process-audio-video-medias.use-case";

describe("ProcessAudioVideoMediasUseCase Integration Tests", () => {
  let uow: UnitOfWorkSequelize;
  let useCase: ProcessAudioVideoMediasUseCase;

  let videoRepo: VideoSequelizeRepository;
  let genreRepo: GenreSequelizeRepository;
  let castMemberRepo: CastMemberSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;

  const sequelizeHelper = setupSequelizeForVideo();

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    videoRepo = new VideoSequelizeRepository(VideoModel, uow);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    castMemberRepo = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new ProcessAudioVideoMediasUseCase(uow, videoRepo);
  });

  it("should throw an error when video is not found ", async () => {
    const videoId = new VideoId();
    const input: ProcessAudioVideoMediasInput = {
      video_id: videoId.id,
      field: "trailer",
      status: AudioVideoMediaStatus.COMPLETED,
      encoded_location: "test_trailer_encoded_location",
    };

    await expect(useCase.execute(input)).rejects.toThrow(
      new NotFoundError(videoId.id, Video),
    );
  });

  it("should set trailer status to completed", async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);

    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    await genreRepo.insert(genre);

    const castMember = CastMember.fake().aCastMember().build();
    await castMemberRepo.insert(castMember);

    const video = Video.fake()
      .aVideoWithAllMedias()
      .addCategoryId(category.category_id)
      .addGenreId(genre.genre_id)
      .addCastMemberId(castMember.cast_member_id)
      .withTrailer(
        Trailer.create({
          name: "test_trailer.mp4",
          raw_location: "test_trailer_raw_location",
        }),
      )
      .build();
    await videoRepo.insert(video);

    const input: ProcessAudioVideoMediasInput = {
      video_id: video.video_id.id,
      field: "trailer",
      status: AudioVideoMediaStatus.COMPLETED,
      encoded_location: "test_trailer_encoded_location",
    };

    await useCase.execute(input);

    const updatedVideo = await videoRepo.findById(video.video_id);

    expect(updatedVideo!.trailer!.status).toBe(AudioVideoMediaStatus.COMPLETED);
    expect(updatedVideo!.trailer!.encoded_location).toBe(
      "test_trailer_encoded_location",
    );
    expect(updatedVideo!.trailer!.name).toBe("test_trailer.mp4");
    expect(updatedVideo!.trailer!.raw_location).toBe(
      "test_trailer_raw_location",
    );
  });

  it("should set video status to completed", async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);

    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    await genreRepo.insert(genre);

    const castMember = CastMember.fake().aCastMember().build();
    await castMemberRepo.insert(castMember);

    const video = Video.fake()
      .aVideoWithAllMedias()
      .addCategoryId(category.category_id)
      .addGenreId(genre.genre_id)
      .addCastMemberId(castMember.cast_member_id)
      .withVideo(
        VideoMedia.create({
          name: "test_video.mp4",
          raw_location: "test_video_raw_location",
        }),
      )
      .build();
    await videoRepo.insert(video);

    const input: ProcessAudioVideoMediasInput = {
      video_id: video.video_id.id,
      field: "video",
      status: AudioVideoMediaStatus.COMPLETED,
      encoded_location: "test_video_encoded_location",
    };

    await useCase.execute(input);

    const updatedVideo = await videoRepo.findById(video.video_id);
    expect(updatedVideo!.video!.status).toBe(AudioVideoMediaStatus.COMPLETED);
    expect(updatedVideo!.video!.encoded_location).toBe(
      "test_video_encoded_location",
    );
    expect(updatedVideo!.video!.name).toBe("test_video.mp4");
    expect(updatedVideo!.video!.raw_location).toBe("test_video_raw_location");
  });
});
