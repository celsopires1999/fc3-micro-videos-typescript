import { CastMember } from "@core/cast-member/domain/cast-member.aggregate";
import { CastMemberSequelizeRepository } from "@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository";
import { CastMemberModel } from "@core/cast-member/infra/db/sequelize/cast-member.model";
import { Category } from "@core/category/domain/category.aggregate";
import { CategorySequelizeRepository } from "@core/category/infra/db/sequelize/category-sequelize.repository";
import { CategoryModel } from "@core/category/infra/db/sequelize/category.model";
import { Genre } from "@core/genre/domain/genre.aggregate";
import { GenreSequelizeRepository } from "@core/genre/infra/db/sequelize/genre-sequelize.repository";
import { GenreModel } from "@core/genre/infra/db/sequelize/genre.model";
import { UnitOfWorkSequelize } from "@core/shared/infra/db/sequelize/unit-of-work-sequelize";
import { Video } from "@core/video/domain/video.aggregate";
import { setupSequelizeForVideo } from "@core/video/infra/db/sequelize/testing/helpers";
import { VideoSequelizeRepository } from "@core/video/infra/db/sequelize/video-sequelize.repository";
import { VideoModel } from "@core/video/infra/db/sequelize/video.model";
import { ListVideosUseCase } from "../list-videos.use-case";
import { expectVideoOutput } from "./list-videos-tests-utils";

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
    const categories = Category.fake().theCategories(3).build();
    const genres = [
      Genre.fake().aGenre().addCategoryId(categories[0].category_id).build(),
      Genre.fake()
        .aGenre()
        .addCategoryId(categories[0].category_id)
        .addCategoryId(categories[1].category_id)
        .build(),
      Genre.fake()
        .aGenre()
        .addCategoryId(categories[0].category_id)
        .addCategoryId(categories[1].category_id)
        .addCategoryId(categories[2].category_id)
        .build(),
    ];
    const castMembers = CastMember.fake().theCastMembers(3).build();
    const videos = [
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle("a")
        .addCategoryId(categories[0].category_id)
        .addGenreId(genres[0].genre_id)
        .addCastMemberId(castMembers[0].cast_member_id)
        .withCreatedAt(new Date(new Date().getTime() + 100))
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle("b")
        .addCategoryId(categories[1].category_id)
        .addGenreId(genres[1].genre_id)
        .addCastMemberId(castMembers[1].cast_member_id)
        .withCreatedAt(new Date(new Date().getTime() + 200))
        .build(),

      Video.fake()
        .aVideoWithoutMedias()
        .withTitle("c")
        .addCategoryId(categories[2].category_id)
        .addGenreId(genres[2].genre_id)
        .addCastMemberId(castMembers[2].cast_member_id)
        .withCreatedAt(new Date(new Date().getTime() + 300))
        .build(),
    ];

    await Promise.all([
      categoryRepo.bulkInsert(categories),
      genreRepo.bulkInsert(genres),
      castMemberRepo.bulkInsert(castMembers),
      videoRepo.bulkInsert(videos),
    ]);

    const expected = {
      items: [
        expectVideoOutput(
          videos[2],
          [categories[0], categories[1], categories[2]],
          [genres[2]],
          [castMembers[2]],
        ),
        expectVideoOutput(
          videos[1],
          [categories[0], categories[1]],
          [genres[1]],
          [castMembers[1]],
        ),
        expectVideoOutput(
          videos[0],
          [categories[0]],
          [genres[0]],
          [castMembers[0]],
        ),
      ],
      total: 3,
      current_page: 1,
      per_page: 15,
      last_page: 1,
    };

    const output = await useCase.execute({});

    expect(output).toStrictEqual(expected);
  });

  describe("should search applying filter by title, sort by title and paginate", () => {
    const categories = [Category.fake().aCategory().build()];
    const genres = [
      Genre.fake().aGenre().addCategoryId(categories[0].category_id).build(),
    ];
    const castMembers = [CastMember.fake().aCastMember().build()];
    const videos = [
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle("test")
        .addCategoryId(categories[0].category_id)
        .addGenreId(genres[0].genre_id)
        .addCastMemberId(castMembers[0].cast_member_id)
        .withCreatedAt(new Date(new Date().getTime() + 4000))
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle("a")
        .addCategoryId(categories[0].category_id)
        .addGenreId(genres[0].genre_id)
        .addCastMemberId(castMembers[0].cast_member_id)
        .withCreatedAt(new Date(new Date().getTime() + 3000))
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle("TEST")
        .addCategoryId(categories[0].category_id)
        .addGenreId(genres[0].genre_id)
        .addCastMemberId(castMembers[0].cast_member_id)
        .withCreatedAt(new Date(new Date().getTime() + 2000))
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle("TeSt")
        .addCategoryId(categories[0].category_id)
        .addGenreId(genres[0].genre_id)
        .addCastMemberId(castMembers[0].cast_member_id)
        .withCreatedAt(new Date(new Date().getTime() + 1000))
        .build(),
    ];
    const arrange = [
      {
        input: {
          page: 1,
          per_page: 2,
          sort: "title",
          filter: { title: "TEST" },
        },
        output: {
          items: [videos[2], videos[3]].map((i) =>
            expectVideoOutput(i, categories, genres, castMembers),
          ),
          total: 3,
          current_page: 1,
          per_page: 2,
          last_page: 2,
        },
      },
      {
        input: {
          page: 2,
          per_page: 2,
          sort: "title",
          filter: { title: "TEST" },
        },
        output: {
          items: [videos[0]].map((i) =>
            expectVideoOutput(i, categories, genres, castMembers),
          ),
          total: 3,
          current_page: 2,
          per_page: 2,
          last_page: 2,
        },
      },
    ];

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
    const categories = Category.fake().theCategories(4).build();
    const genres = [
      Genre.fake().aGenre().addCategoryId(categories[0].category_id).build(),
    ];
    const castMembers = [CastMember.fake().aCastMember().build()];
    const videos = [
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle("test")
        .addCategoryId(categories[0].category_id)
        .addGenreId(genres[0].genre_id)
        .addCastMemberId(castMembers[0].cast_member_id)
        .withCreatedAt(new Date(new Date().getTime() + 4000))
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle("a")
        .addCategoryId(categories[0].category_id)
        .addCategoryId(categories[1].category_id)
        .addGenreId(genres[0].genre_id)
        .addCastMemberId(castMembers[0].cast_member_id)
        .withCreatedAt(new Date(new Date().getTime() + 3000))
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle("TEST")
        .addCategoryId(categories[0].category_id)
        .addCategoryId(categories[1].category_id)
        .addCategoryId(categories[2].category_id)
        .addGenreId(genres[0].genre_id)
        .addCastMemberId(castMembers[0].cast_member_id)
        .withCreatedAt(new Date(new Date().getTime() + 2000))
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle("e")
        .addCategoryId(categories[3].category_id)
        .addGenreId(genres[0].genre_id)
        .addCastMemberId(castMembers[0].cast_member_id)
        .withCreatedAt(new Date(new Date().getTime() + 1000))
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle("TeSt")
        .addCategoryId(categories[1].category_id)
        .addCategoryId(categories[2].category_id)
        .addGenreId(genres[0].genre_id)
        .addCastMemberId(castMembers[0].cast_member_id)
        .withCreatedAt(new Date(new Date().getTime() + 1000))
        .build(),
    ];
    const arrange = [
      {
        input: {
          page: 1,
          per_page: 2,
          sort: "title",
          filter: { categories_id: [categories[0].category_id.id] },
        },
        output: {
          items: [
            expectVideoOutput(
              videos[2],
              [categories[0], categories[1], categories[2]],
              genres,
              castMembers,
            ),
            expectVideoOutput(
              videos[1],
              [categories[0], categories[1]],
              genres,
              castMembers,
            ),
          ],
          total: 3,
          current_page: 1,
          per_page: 2,
          last_page: 2,
        },
      },
      {
        input: {
          page: 2,
          per_page: 2,
          sort: "title",
          filter: { categories_id: [categories[0].category_id.id] },
        },
        output: {
          items: [
            expectVideoOutput(videos[0], [categories[0]], genres, castMembers),
          ],
          total: 3,
          current_page: 2,
          per_page: 2,
          last_page: 2,
        },
      },
    ];

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
    const categories = [Category.fake().aCategory().build()];
    const genres = Genre.fake()
      .theGenres(4)
      .addCategoryId(categories[0].category_id)
      .build();
    const castMembers = [CastMember.fake().aCastMember().build()];
    const videos = [
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle("test")
        .addCategoryId(categories[0].category_id)
        .addGenreId(genres[0].genre_id)
        .addCastMemberId(castMembers[0].cast_member_id)
        .withCreatedAt(new Date(new Date().getTime() + 4000))
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle("a")
        .addCategoryId(categories[0].category_id)
        .addGenreId(genres[0].genre_id)
        .addGenreId(genres[1].genre_id)
        .addCastMemberId(castMembers[0].cast_member_id)
        .withCreatedAt(new Date(new Date().getTime() + 3000))
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle("TEST")
        .addCategoryId(categories[0].category_id)
        .addGenreId(genres[0].genre_id)
        .addGenreId(genres[1].genre_id)
        .addGenreId(genres[2].genre_id)
        .addCastMemberId(castMembers[0].cast_member_id)
        .withCreatedAt(new Date(new Date().getTime() + 2000))
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle("e")
        .addCategoryId(categories[0].category_id)
        .addGenreId(genres[3].genre_id)
        .addCastMemberId(castMembers[0].cast_member_id)
        .withCreatedAt(new Date(new Date().getTime() + 1000))
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle("TeSt")
        .addCategoryId(categories[0].category_id)
        .addGenreId(genres[1].genre_id)
        .addGenreId(genres[2].genre_id)
        .addCastMemberId(castMembers[0].cast_member_id)
        .withCreatedAt(new Date(new Date().getTime() + 1000))
        .build(),
    ];
    const arrange = [
      {
        input: {
          page: 1,
          per_page: 2,
          sort: "title",
          filter: { genres_id: [genres[0].genre_id.id] },
        },
        output: {
          items: [
            expectVideoOutput(
              videos[2],
              categories,
              [genres[0], genres[1], genres[2]],
              castMembers,
            ),
            expectVideoOutput(
              videos[1],
              categories,
              [genres[0], genres[1]],
              castMembers,
            ),
          ],
          total: 3,
          current_page: 1,
          per_page: 2,
          last_page: 2,
        },
      },
      {
        input: {
          page: 2,
          per_page: 2,
          sort: "title",
          filter: { genres_id: [genres[0].genre_id.id] },
        },
        output: {
          items: [
            expectVideoOutput(videos[0], categories, [genres[0]], castMembers),
          ],
          total: 3,
          current_page: 2,
          per_page: 2,
          last_page: 2,
        },
      },
    ];

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
    const categories = [Category.fake().aCategory().build()];
    const genres = [
      Genre.fake().aGenre().addCategoryId(categories[0].category_id).build(),
    ];
    const castMembers = CastMember.fake().theCastMembers(4).build();
    const videos = [
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle("test")
        .addCategoryId(categories[0].category_id)
        .addGenreId(genres[0].genre_id)
        .addCastMemberId(castMembers[0].cast_member_id)
        .withCreatedAt(new Date(new Date().getTime() + 4000))
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle("a")
        .addCategoryId(categories[0].category_id)
        .addGenreId(genres[0].genre_id)
        .addCastMemberId(castMembers[0].cast_member_id)
        .addCastMemberId(castMembers[1].cast_member_id)
        .withCreatedAt(new Date(new Date().getTime() + 3000))
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle("TEST")
        .addCategoryId(categories[0].category_id)
        .addGenreId(genres[0].genre_id)
        .addCastMemberId(castMembers[0].cast_member_id)
        .addCastMemberId(castMembers[1].cast_member_id)
        .addCastMemberId(castMembers[2].cast_member_id)
        .withCreatedAt(new Date(new Date().getTime() + 2000))
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle("e")
        .addCategoryId(categories[0].category_id)
        .addGenreId(genres[0].genre_id)
        .addCastMemberId(castMembers[3].cast_member_id)
        .withCreatedAt(new Date(new Date().getTime() + 1000))
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle("TeSt")
        .addCategoryId(categories[0].category_id)
        .addGenreId(genres[0].genre_id)
        .addCastMemberId(castMembers[1].cast_member_id)
        .addCastMemberId(castMembers[2].cast_member_id)
        .withCreatedAt(new Date(new Date().getTime() + 1000))
        .build(),
    ];
    const arrange = [
      {
        input: {
          page: 1,
          per_page: 2,
          sort: "title",
          filter: { cast_members_id: [castMembers[0].cast_member_id.id] },
        },
        output: {
          items: [
            expectVideoOutput(videos[2], categories, genres, [
              castMembers[0],
              castMembers[1],
              castMembers[2],
            ]),
            expectVideoOutput(videos[1], categories, genres, [
              castMembers[0],
              castMembers[1],
            ]),
          ],
          total: 3,
          current_page: 1,
          per_page: 2,
          last_page: 2,
        },
      },
      {
        input: {
          page: 2,
          per_page: 2,
          sort: "title",
          filter: { cast_members_id: [castMembers[0].cast_member_id.id] },
        },
        output: {
          items: [
            expectVideoOutput(videos[0], categories, genres, [castMembers[0]]),
          ],
          total: 3,
          current_page: 2,
          per_page: 2,
          last_page: 2,
        },
      },
    ];

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
    const categoryOfGenre = Category.fake().aCategory().build();

    const categories = Category.fake().theCategories(2).build();
    const genres = Genre.fake()
      .theGenres(2)
      .addCategoryId(categoryOfGenre.category_id)
      .build();
    const castMembers = CastMember.fake().theCastMembers(2).build();
    const videos = [
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle("test")
        .addCategoryId(categories[0].category_id)
        .addGenreId(genres[0].genre_id)
        .addCastMemberId(castMembers[0].cast_member_id)
        .withCreatedAt(new Date(new Date().getTime() + 4000))
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle("a")
        .addCategoryId(categories[1].category_id)
        .addGenreId(genres[1].genre_id)
        .addCastMemberId(castMembers[1].cast_member_id)
        .withCreatedAt(new Date(new Date().getTime() + 3000))
        .build(),
    ];
    const arrange = [
      {
        input: {
          page: 1,
          per_page: 2,
          sort: "title",
          filter: {
            title: "a",
            categories_id: [categories[1].category_id.id],
            genres_id: [genres[1].genre_id.id],
            cast_members_id: [castMembers[1].cast_member_id.id],
          },
        },
        output: {
          items: [
            expectVideoOutput(videos[1], categories, genres, castMembers),
          ],
          total: 1,
          current_page: 1,
          per_page: 2,
          last_page: 1,
        },
      },
    ];

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
