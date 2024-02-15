import { CastMembersIdExistsInDatabaseValidator } from "@core/cast-member/application/validations/cast-members-ids-exists-in-database.validator";
import { CastMember } from "@core/cast-member/domain/cast-member.aggregate";
import { CastMemberSequelizeRepository } from "@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository";
import { CastMemberModel } from "@core/cast-member/infra/db/sequelize/cast-member.model";
import { CategoriesIdExistsInDatabaseValidator } from "@core/category/application/validations/categories-ids-exists-in-database.validator";
import { Category } from "@core/category/domain/category.aggregate";
import { CategorySequelizeRepository } from "@core/category/infra/db/sequelize/category-sequelize.repository";
import { CategoryModel } from "@core/category/infra/db/sequelize/category.model";
import { GenresIdExistsInDatabaseValidator } from "@core/genre/application/validations/genres-ids-exists-in-database.validator";
import { Genre } from "@core/genre/domain/genre.aggregate";
import { GenreSequelizeRepository } from "@core/genre/infra/db/sequelize/genre-sequelize.repository";
import { GenreModel } from "@core/genre/infra/db/sequelize/genre.model";
import { NotFoundError } from "@core/shared/domain/errors/not-found.error";
import { UnitOfWorkSequelize } from "@core/shared/infra/db/sequelize/unit-of-work-sequelize";
import { Video, VideoId } from "@core/video/domain/video.aggregate";
import { setupSequelizeForVideo } from "@core/video/infra/db/sequelize/testing/helpers";
import { VideoSequelizeRepository } from "@core/video/infra/db/sequelize/video-sequelize.repository";
import { VideoModel } from "@core/video/infra/db/sequelize/video.model";
import {
  UpdateVideoInput,
  UpdateVideoInputConstructorProps,
} from "../update-video.input";
import { UpdateVideoUseCase } from "../update-video.use-case";
import { UpdateVideoUseCaseFixture } from "./update-video.use-case.fixture";

describe("UpdateVideoUseCase Integration Tests", () => {
  let uow: UnitOfWorkSequelize;
  let useCase: UpdateVideoUseCase;

  let videoRepo: VideoSequelizeRepository;
  let genreRepo: GenreSequelizeRepository;
  let castMemberRepo: CastMemberSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;

  let categoriesIdsValidator: CategoriesIdExistsInDatabaseValidator;
  let genresIdsValidator: GenresIdExistsInDatabaseValidator;
  let castMembersIdsValidator: CastMembersIdExistsInDatabaseValidator;

  const sequelizeHelper = setupSequelizeForVideo();

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    videoRepo = new VideoSequelizeRepository(VideoModel, uow);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    castMemberRepo = new CastMemberSequelizeRepository(CastMemberModel);
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
    const videoId = new VideoId();
    const input: UpdateVideoInputConstructorProps = {
      id: videoId.id,
    };

    await expect(useCase.execute(input)).rejects.toThrow(
      new NotFoundError(videoId.id, Video),
    );
  });

  describe("invalid input", () => {
    const arrange = UpdateVideoUseCaseFixture.arrangeInvalid();

    test.each(arrange)(
      "when input has $label",
      async ({ send_data, relations, video, expected }) => {
        expect.assertions(1);

        await Promise.all([
          categoryRepo.bulkInsert(relations.categories),
          genreRepo.bulkInsert(relations.genres),
          castMemberRepo.bulkInsert(relations.castMembers),
          videoRepo.insert(video),
        ]);

        try {
          await useCase.execute(new UpdateVideoInput(send_data));
          fail("should not reach here");
        } catch (e) {
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
