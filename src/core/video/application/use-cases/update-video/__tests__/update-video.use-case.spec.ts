import { CastMembersIdExistsInDatabaseValidator } from "@core/cast-member/application/validations/cast-members-ids-exists-in-database.validator";
import { CastMember } from "@core/cast-member/domain/cast-member.aggregate";
import { CastMemberInMemoryRepository } from "@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository";
import { CategoriesIdExistsInDatabaseValidator } from "@core/category/application/validations/categories-ids-exists-in-database.validator";
import { Category } from "@core/category/domain/category.aggregate";
import { CategoryInMemoryRepository } from "@core/category/infra/db/in-memory/category-in-memory.repository";
import { GenresIdExistsInDatabaseValidator } from "@core/genre/application/validations/genres-ids-exists-in-database.validator";
import { Genre } from "@core/genre/domain/genre.aggregate";
import { GenreInMemoryRepository } from "@core/genre/infra/db/in-memory/genre-in-memory.repository";
import { NotFoundError } from "@core/shared/domain/errors/not-found.error";
import { UnitOfWorkFakeInMemory } from "@core/shared/infra/db/in-memory/fake-unit-of-work-in-memory";
import { Video, VideoId } from "@core/video/domain/video.aggregate";
import { VideoInMemoryRepository } from "@core/video/infra/db/in-memory/video-in-memory.repository";
import { cloneDeep } from "lodash";
import {
  UpdateVideoInput,
  UpdateVideoInputConstructorProps,
} from "../update-video.input";
import { UpdateVideoUseCase } from "../update-video.use-case";
import { UpdateVideoUseCaseFixture } from "./update-video.use-case.fixture";

describe("UpdateVideoUseCase Unit Tests", () => {
  let uow: UnitOfWorkFakeInMemory;
  let useCase: UpdateVideoUseCase;

  let videoRepo: VideoInMemoryRepository;
  let genreRepo: GenreInMemoryRepository;
  let castMemberRepo: CastMemberInMemoryRepository;
  let categoryRepo: CategoryInMemoryRepository;

  let categoriesIdsValidator: CategoriesIdExistsInDatabaseValidator;
  let genresIdsValidator: GenresIdExistsInDatabaseValidator;
  let castMembersIdsValidator: CastMembersIdExistsInDatabaseValidator;

  beforeEach(() => {
    uow = new UnitOfWorkFakeInMemory();
    videoRepo = new VideoInMemoryRepository();
    genreRepo = new GenreInMemoryRepository();
    categoryRepo = new CategoryInMemoryRepository();
    castMemberRepo = new CastMemberInMemoryRepository();
    categoriesIdsValidator = new CategoriesIdExistsInDatabaseValidator(
      categoryRepo,
    );
    genresIdsValidator = new GenresIdExistsInDatabaseValidator(genreRepo);
    castMembersIdsValidator = new CastMembersIdExistsInDatabaseValidator(
      castMemberRepo,
    );
    useCase = new UpdateVideoUseCase(
      uow,
      videoRepo,
      categoriesIdsValidator,
      genresIdsValidator,
      castMembersIdsValidator,
    );
  });

  it("should throw an error when video is not found ", async () => {
    const spyVideoFindById = jest.spyOn(videoRepo, "findById");

    const videoId = new VideoId();
    const input: UpdateVideoInputConstructorProps = {
      id: videoId.id,
    };

    await expect(useCase.execute(input)).rejects.toThrow(
      new NotFoundError(videoId.id, Video),
    );
    expect(spyVideoFindById).toHaveBeenCalledTimes(1);
  });

  describe("invalid input", () => {
    const arrange = UpdateVideoUseCaseFixture.arrangeInvalid();

    test.each(arrange)(
      "when input has $label",
      async ({ send_data, relations, video, expected }) => {
        const localVideo = cloneDeep(video);
        expect.assertions(4);
        const spyValidateCategoriesId = jest.spyOn(
          CategoriesIdExistsInDatabaseValidator.prototype,
          "validate",
        );
        const spyValidateGenresId = jest.spyOn(
          GenresIdExistsInDatabaseValidator.prototype,
          "validate",
        );
        const spyValidateCastMembersId = jest.spyOn(
          CastMembersIdExistsInDatabaseValidator.prototype,
          "validate",
        );

        await Promise.all([
          categoryRepo.bulkInsert(relations.categories),
          genreRepo.bulkInsert(relations.genres),
          castMemberRepo.bulkInsert(relations.castMembers),
          videoRepo.insert(localVideo),
        ]);

        try {
          await useCase.execute(new UpdateVideoInput(send_data));
          fail("should not reach here");
        } catch (e) {
          send_data.categories_id
            ? expect(spyValidateCategoriesId).toHaveBeenCalledWith(
                send_data.categories_id,
              )
            : expect(spyValidateCategoriesId).not.toHaveBeenCalled();
          send_data.genres_id
            ? expect(spyValidateGenresId).toHaveBeenCalledWith(
                send_data.genres_id,
              )
            : expect(spyValidateGenresId).not.toHaveBeenCalled();
          send_data.cast_members_id
            ? expect(spyValidateCastMembersId).toHaveBeenCalledWith(
                send_data.cast_members_id,
              )
            : expect(spyValidateCastMembersId).not.toHaveBeenCalled();

          expect(e.error).toStrictEqual(expected);
        }
      },
    );
  });

  it("should update a video", async () => {
    const categories = Category.fake().theCategories(3).build();
    const genres = Genre.fake()
      .theGenres(3)
      .addCategoryId(categories[0].category_id)
      .addCategoryId(categories[1].category_id)
      .addCategoryId(categories[2].category_id)
      .build();
    const castMembers = CastMember.fake().theCastMembers(3).build();
    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(categories[0].category_id)
      .addCategoryId(categories[1].category_id)
      .addCategoryId(categories[2].category_id)
      .addGenreId(genres[0].genre_id)
      .addGenreId(genres[1].genre_id)
      .addGenreId(genres[2].genre_id)
      .addCastMemberId(castMembers[0].cast_member_id)
      .addCastMemberId(castMembers[1].cast_member_id)
      .addCastMemberId(castMembers[2].cast_member_id)
      .build();

    await Promise.all([
      categoryRepo.bulkInsert(categories),
      genreRepo.bulkInsert(genres),
      castMemberRepo.bulkInsert(castMembers),
      videoRepo.insert(video),
    ]);

    const faker = Video.fake().aVideoWithoutMedias();
    const inputProps: UpdateVideoInputConstructorProps = {
      id: video.video_id.id,
      title: faker.title,
      description: faker.description,
      year_launched: faker.year_launched,
      duration: faker.duration,
      rating: faker.rating.value,
      is_opened: faker.is_opened,
      categories_id: [categories[0].category_id.id],
      genres_id: [genres[0].genre_id.id],
      cast_members_id: [castMembers[0].cast_member_id.id],
    };
    const output = await useCase.execute(new UpdateVideoInput(inputProps));
    const updatedVideo = await videoRepo.findById(new VideoId(output.id));

    expect(output).toEqual(video.video_id);
    expect(updatedVideo?.toJSON()).toStrictEqual({
      video_id: output.id,
      title: inputProps.title,
      description: inputProps.description,
      year_launched: inputProps.year_launched,
      duration: inputProps.duration,
      rating: inputProps.rating,
      is_opened: inputProps.is_opened,
      is_published: expect.any(Boolean),
      banner: null,
      thumbnail: null,
      thumbnail_half: null,
      trailer: null,
      video: null,
      categories_id: expect.arrayContaining([categories[0].category_id.id]),
      genres_id: expect.arrayContaining([genres[0].genre_id.id]),
      cast_members_id: expect.arrayContaining([
        castMembers[0].cast_member_id.id,
      ]),
      created_at: video.created_at,
    });
  });
});
