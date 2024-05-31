import { CastMemberSequelizeRepository } from "@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository";
import { CastMemberModel } from "@core/cast-member/infra/db/sequelize/cast-member.model";
import { CategorySequelizeRepository } from "@core/category/infra/db/sequelize/category-sequelize.repository";
import { CategoryModel } from "@core/category/infra/db/sequelize/category.model";
import { GenreSequelizeRepository } from "@core/genre/infra/db/sequelize/genre-sequelize.repository";
import { GenreModel } from "@core/genre/infra/db/sequelize/genre.model";
import { UnitOfWorkSequelize } from "@core/shared/infra/db/sequelize/unit-of-work-sequelize";
import { setupSequelizeForVideo } from "@core/video/infra/db/sequelize/testing/helpers";
import { VideoSequelizeRepository } from "@core/video/infra/db/sequelize/video-sequelize.repository";
import { VideoModel } from "@core/video/infra/db/sequelize/video.model";
import { ListVideosUseCase } from "../list-videos.use-case";
import { ListVideosUseCaseFixture } from "./list-videos.use-case.fixture";

describe("ListVideosUseCase Integration Test", () => {
  let uow: UnitOfWorkSequelize;
  let useCase: ListVideosUseCase;
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
    useCase = new ListVideosUseCase(
      videoRepo,
      categoryRepo,
      genreRepo,
      castMemberRepo,
    );
  });

  it("should search sorted by created_at when input param is empty", async () => {
    const { videos, categories, genres, castMembers, expected } =
      ListVideosUseCaseFixture.arrangeEmpty();

    await Promise.all([
      categoryRepo.bulkInsert(categories),
      genreRepo.bulkInsert(genres),
      castMemberRepo.bulkInsert(castMembers),
      videoRepo.bulkInsert(videos),
    ]);

    const output = await useCase.execute({});

    expect(output).toStrictEqual(expected);
  });

  describe("should search applying filter by title, sort by title and paginate", () => {
    const { videos, categories, genres, castMembers, arrange } =
      ListVideosUseCaseFixture.arrangeTitle();

    beforeEach(async () => {
      await Promise.all([
        categoryRepo.bulkInsert(categories),
        genreRepo.bulkInsert(genres),
        castMemberRepo.bulkInsert(castMembers),
        videoRepo.bulkInsert(videos),
      ]);
    });

    test.each(arrange)(
      "when input is $input",
      async ({ input, output: expectedOutput }) => {
        const output = await useCase.execute(input);
        expect(output).toEqual(expectedOutput);
      },
    );
  });

  describe("should search applying filter by categories_id, sort by title and paginate", () => {
    const { videos, categories, genres, castMembers, arrange } =
      ListVideosUseCaseFixture.arrangeCategories();

    beforeEach(async () => {
      await Promise.all([
        categoryRepo.bulkInsert(categories),
        genreRepo.bulkInsert(genres),
        castMemberRepo.bulkInsert(castMembers),
        videoRepo.bulkInsert(videos),
      ]);
    });

    test.each(arrange)(
      "when input is $input",
      async ({ input, output: expectedOutput }) => {
        const output = await useCase.execute(input);
        expect(output).toEqual(expectedOutput);
      },
    );
  });

  describe("should search applying filter by genres_id, sort by title and paginate", () => {
    const { videos, categories, genres, castMembers, arrange } =
      ListVideosUseCaseFixture.arrangeGenres();

    beforeEach(async () => {
      await Promise.all([
        categoryRepo.bulkInsert(categories),
        genreRepo.bulkInsert(genres),
        castMemberRepo.bulkInsert(castMembers),
        videoRepo.bulkInsert(videos),
      ]);
    });

    test.each(arrange)(
      "when input is $input",
      async ({ input, output: expectedOutput }) => {
        const output = await useCase.execute(input);
        expect(output).toEqual(expectedOutput);
      },
    );
  });

  describe("should search applying filter by cast_members_id, sort by title and paginate", () => {
    const { videos, categories, genres, castMembers, arrange } =
      ListVideosUseCaseFixture.arrangeCastMember();

    beforeEach(async () => {
      await Promise.all([
        categoryRepo.bulkInsert(categories),
        genreRepo.bulkInsert(genres),
        castMemberRepo.bulkInsert(castMembers),
        videoRepo.bulkInsert(videos),
      ]);
    });

    test.each(arrange)(
      "when input is $input",
      async ({ input, output: expectedOutput }) => {
        const output = await useCase.execute(input);
        expect(output).toEqual(expectedOutput);
      },
    );
  });

  describe("should search using filter by title, categories_id, genres_id and cast_members_id", () => {
    const {
      videos,
      categories,
      categoryOfGenre,
      genres,
      castMembers,
      arrange,
    } = ListVideosUseCaseFixture.arrangeComplexFilter();

    beforeEach(async () => {
      await Promise.all([
        categoryRepo.bulkInsert([...categories, categoryOfGenre]),
        genreRepo.bulkInsert(genres),
        castMemberRepo.bulkInsert(castMembers),
        videoRepo.bulkInsert(videos),
      ]);
    });

    test.each(arrange)(
      "when input is $input",
      async ({ input, output: expectedOutput }) => {
        const output = await useCase.execute(input);
        expect(output).toEqual(expectedOutput);
      },
    );
  });
});
