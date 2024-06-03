import { CastMember } from "@core/cast-member/domain/cast-member.aggregate";
import { CastMemberInMemoryRepository } from "@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository";
import { Category } from "@core/category/domain/category.aggregate";
import { CategoryInMemoryRepository } from "@core/category/infra/db/in-memory/category-in-memory.repository";
import { Genre } from "@core/genre/domain/genre.aggregate";
import { GenreInMemoryRepository } from "@core/genre/infra/db/in-memory/genre-in-memory.repository";
import { AudioVideoMediaStatus } from "@core/shared/domain/value-objects/audio-video-media.vo";
import { UnitOfWorkFakeInMemory } from "@core/shared/infra/db/in-memory/fake-unit-of-work-in-memory";
import { Trailer } from "@core/video/domain/trailer.vo";
import { VideoMedia } from "@core/video/domain/video-media.vo";
import { Video, VideoId } from "@core/video/domain/video.aggregate";
import { VideoInMemoryRepository } from "@core/video/infra/db/in-memory/video-in-memory.repository";
import { ProcessAudioVideoMediasInput } from "../process-audio-video-medias.input";
import { ProcessAudioVideoMediasUseCase } from "../process-audio-video-medias.use-case";
import { NotFoundError } from "@core/shared/domain/errors/not-found.error";

describe("ProcessAudioVideoMediasUseCase Unit Tests", () => {
  let uow: UnitOfWorkFakeInMemory;
  let useCase: ProcessAudioVideoMediasUseCase;

  let videoRepo: VideoInMemoryRepository;
  let genreRepo: GenreInMemoryRepository;
  let castMemberRepo: CastMemberInMemoryRepository;
  let categoryRepo: CategoryInMemoryRepository;

  beforeEach(() => {
    uow = new UnitOfWorkFakeInMemory();
    videoRepo = new VideoInMemoryRepository();
    genreRepo = new GenreInMemoryRepository();
    categoryRepo = new CategoryInMemoryRepository();
    castMemberRepo = new CastMemberInMemoryRepository();
    useCase = new ProcessAudioVideoMediasUseCase(uow, videoRepo);
  });

  it("should throw an error when video is not found ", async () => {
    const spyVideoFindById = jest.spyOn(videoRepo, "findById");

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
    expect(spyVideoFindById).toHaveBeenCalledTimes(1);
  });

  it("should set trailer status to completed", async () => {
    const spyVideoFindById = jest.spyOn(videoRepo, "findById");
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

    expect(spyVideoFindById).toHaveBeenCalledTimes(1);

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
    const spyVideoFindById = jest.spyOn(videoRepo, "findById");
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

    expect(spyVideoFindById).toHaveBeenCalledTimes(1);

    const updatedVideo = await videoRepo.findById(video.video_id);
    expect(updatedVideo!.video!.status).toBe(AudioVideoMediaStatus.COMPLETED);
    expect(updatedVideo!.video!.encoded_location).toBe(
      "test_video_encoded_location",
    );
    expect(updatedVideo!.video!.name).toBe("test_video.mp4");
    expect(updatedVideo!.video!.raw_location).toBe("test_video_raw_location");
  });
});
