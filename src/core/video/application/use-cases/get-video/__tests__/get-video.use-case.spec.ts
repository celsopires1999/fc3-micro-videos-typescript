import { CastMember } from "@core/cast-member/domain/cast-member.aggregate";
import { CastMemberInMemoryRepository } from "@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository";
import { Category } from "@core/category/domain/category.aggregate";
import { CategoryInMemoryRepository } from "@core/category/infra/db/in-memory/category-in-memory.repository";
import { Genre } from "@core/genre/domain/genre.aggregate";
import { GenreInMemoryRepository } from "@core/genre/infra/db/in-memory/genre-in-memory.repository";
import { NotFoundError } from "@core/shared/domain/errors/not-found.error";
import { Video, VideoId } from "@core/video/domain/video.aggregate";
import { VideoInMemoryRepository } from "@core/video/infra/db/in-memory/video-in-memory.repository";
import { GetVideoUseCase } from "../get-video.use-case";
import { expectVideoOutput } from "./get-video-tests-utils";

describe("GetVideoUseCase Unit Tests", () => {
  let useCase: GetVideoUseCase;

  let videoRepo: VideoInMemoryRepository;
  let genreRepo: GenreInMemoryRepository;
  let castMemberRepo: CastMemberInMemoryRepository;
  let categoryRepo: CategoryInMemoryRepository;

  beforeEach(() => {
    videoRepo = new VideoInMemoryRepository();
    genreRepo = new GenreInMemoryRepository();
    categoryRepo = new CategoryInMemoryRepository();
    castMemberRepo = new CastMemberInMemoryRepository();
    useCase = new GetVideoUseCase(
      videoRepo,
      categoryRepo,
      genreRepo,
      castMemberRepo,
    );
  });

  it("should throw an error when video is not found", async () => {
    const spyVideoFindById = jest.spyOn(videoRepo, "findById");
    const spyCategoryFindByIds = jest.spyOn(categoryRepo, "findByIds");
    const spyGenreFindByIds = jest.spyOn(categoryRepo, "findByIds");
    const spyCastMemberFindByIds = jest.spyOn(castMemberRepo, "findByIds");

    const videoId = new VideoId();
    await expect(useCase.execute({ id: videoId.id })).rejects.toThrow(
      new NotFoundError(videoId.id, Video),
    );
    expect(spyVideoFindById).toHaveBeenCalledTimes(1);
    expect(spyCategoryFindByIds).not.toHaveBeenCalled();
    expect(spyGenreFindByIds).not.toHaveBeenCalled();
    expect(spyCastMemberFindByIds).not.toHaveBeenCalled();
  });

  it("should get a video", async () => {
    const spyVideoFindById = jest.spyOn(videoRepo, "findById");
    const spyCategoryFindByIds = jest.spyOn(categoryRepo, "findByIds");
    const spyGenreFindByIds = jest.spyOn(categoryRepo, "findByIds");
    const spyCastMemberFindByIds = jest.spyOn(castMemberRepo, "findByIds");

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

    expect(spyVideoFindById).toHaveBeenCalledTimes(1);
    expect(spyCategoryFindByIds).toHaveBeenCalledTimes(1);
    expect(spyGenreFindByIds).toHaveBeenCalledTimes(1);
    expect(spyCastMemberFindByIds).toHaveBeenCalledTimes(1);
  });
});
