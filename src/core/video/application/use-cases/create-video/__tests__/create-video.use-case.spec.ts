import { CastMembersIdExistsInDatabaseValidator } from "@core/cast-member/application/validations/cast-members-ids-exists-in-database.validator";
import { CastMember } from "@core/cast-member/domain/cast-member.aggregate";
import { CastMemberInMemoryRepository } from "@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository";
import { CategoriesIdExistsInDatabaseValidator } from "@core/category/application/validations/categories-ids-exists-in-database.validator";
import { Category } from "@core/category/domain/category.aggregate";
import { CategoryInMemoryRepository } from "@core/category/infra/db/in-memory/category-in-memory.repository";
import { GenresIdExistsInDatabaseValidator } from "@core/genre/application/validations/genres-ids-exists-in-database.validator";
import { Genre } from "@core/genre/domain/genre.aggregate";
import { GenreInMemoryRepository } from "@core/genre/infra/db/in-memory/genre-in-memory.repository";
import { EntityValidationError } from "@core/shared/domain/validators/validation.error";
import { UnitOfWorkFakeInMemory } from "@core/shared/infra/db/in-memory/fake-unit-of-work-in-memory";
import { RatingValues } from "@core/video/domain/rating.vo";
import { VideoId } from "@core/video/domain/video.aggregate";
import { VideoInMemoryRepository } from "@core/video/infra/db/in-memory/video-in-memory.repository";
import { CreateVideoInput } from "../create-video.input";
import { CreateVideoUseCase } from "../create-video.use-case";
describe("CreateVideoUseCase Unit Tests", () => {
  let uow: UnitOfWorkFakeInMemory;
  let useCase: CreateVideoUseCase;

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
    useCase = new CreateVideoUseCase(
      uow,
      videoRepo,
      categoriesIdsValidator,
      genresIdsValidator,
      castMembersIdsValidator,
    );
  });

  it("should throw an entity validation error when relations ids do not exist", async () => {
    expect.assertions(5);
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
    try {
      await useCase.execute(
        new CreateVideoInput({
          title: "test video",
          description: "test description",
          year_launched: 2021,
          duration: 90,
          rating: RatingValues.R10,
          is_opened: true,

          categories_id: [
            "0828ac21-05d3-481a-aaf4-63c5f9a55b04",
            "c145b6af-16f9-43f6-9fdb-658615bbd7af",
          ],
          genres_id: ["0828ac21-05d3-481a-aaf4-63c5f9a55b04"],
          cast_members_id: ["0828ac21-05d3-481a-aaf4-63c5f9a55b04"],
        }),
      );
    } catch (e) {
      expect(spyValidateCategoriesId).toHaveBeenCalledWith([
        "0828ac21-05d3-481a-aaf4-63c5f9a55b04",
        "c145b6af-16f9-43f6-9fdb-658615bbd7af",
      ]);
      expect(spyValidateGenresId).toHaveBeenCalledWith([
        "0828ac21-05d3-481a-aaf4-63c5f9a55b04",
      ]);
      expect(spyValidateCastMembersId).toHaveBeenCalledWith([
        "0828ac21-05d3-481a-aaf4-63c5f9a55b04",
      ]);
      expect(e).toBeInstanceOf(EntityValidationError);
      const expected = expect.arrayContaining([
        {
          genres_id: [
            "Genre Not Found using ID 0828ac21-05d3-481a-aaf4-63c5f9a55b04",
          ],
        },
        {
          categories_id: expect.arrayContaining([
            "Category Not Found using ID c145b6af-16f9-43f6-9fdb-658615bbd7af",
            "Category Not Found using ID 0828ac21-05d3-481a-aaf4-63c5f9a55b04",
          ]),
        },
        {
          cast_members_id: [
            "CastMember Not Found using ID 0828ac21-05d3-481a-aaf4-63c5f9a55b04",
          ],
        },
      ]);

      expect(e.error).toEqual(expected);
    }
  });

  it("should create a video", async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepo.bulkInsert(categories);
    const categoriesId = categories.map((c) => c.category_id.id);

    const genres = Genre.fake().theGenres(2).build();
    genres[0].syncCategoriesId([categories[0].category_id]);
    genres[1].syncCategoriesId([categories[1].category_id]);
    await genreRepo.bulkInsert(genres);
    const genresId = genres.map((c) => c.genre_id.id);

    const castMembers = CastMember.fake().theCastMembers(2).build();
    await castMemberRepo.bulkInsert(castMembers);
    const castMembersId = castMembers.map((c) => c.cast_member_id.id);

    const output = await useCase.execute({
      title: "test video",
      description: "test description",
      year_launched: 2021,
      duration: 90,
      rating: RatingValues.R10,
      is_opened: true,
      categories_id: categoriesId,
      genres_id: genresId,
      cast_members_id: castMembersId,
    });
    expect(output).toStrictEqual({
      id: expect.any(String),
    });
    const video = await videoRepo.findById(new VideoId(output.id));
    expect(video!.toJSON()).toStrictEqual({
      video_id: expect.any(String),
      title: "test video",
      description: "test description",
      year_launched: 2021,
      duration: 90,
      rating: RatingValues.R10,
      is_opened: true,
      is_published: false,
      banner: null,
      thumbnail: null,
      thumbnail_half: null,
      trailer: null,
      video: null,
      categories_id: expect.arrayContaining(categoriesId),
      genres_id: expect.arrayContaining(genresId),
      cast_members_id: expect.arrayContaining(castMembersId),
      created_at: expect.any(Date),
    });
  });
});
