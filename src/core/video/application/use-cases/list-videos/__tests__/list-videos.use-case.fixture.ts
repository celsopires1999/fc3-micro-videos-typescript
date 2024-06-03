import { CastMember } from "@core/cast-member/domain/cast-member.aggregate";
import { Category } from "@core/category/domain/category.aggregate";
import { Genre } from "@core/genre/domain/genre.aggregate";
import { Video } from "@core/video/domain/video.aggregate";
import { expectVideoOutput } from "./list-videos-tests-utils";

export class ListVideosUseCaseFixture {
  static arrangeEmpty() {
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

    return {
      videos,
      categories,
      genres,
      castMembers,
      expected,
    };
  }

  static arrangeTitle() {
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

    return {
      videos,
      categories,
      genres,
      castMembers,
      arrange,
    };
  }

  static arrangeCategories() {
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

    return {
      videos,
      categories,
      genres,
      castMembers,
      arrange,
    };
  }

  static arrangeGenres() {
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

    return {
      videos,
      categories,
      genres,
      castMembers,
      arrange,
    };
  }

  static arrangeCastMember() {
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

    return {
      videos,
      categories,
      genres,
      castMembers,
      arrange,
    };
  }

  static arrangeComplexFilter() {
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
    return {
      videos,
      categories,
      categoryOfGenre,
      genres,
      castMembers,
      arrange,
    };
  }
}
