import { CastMember } from "@core/cast-member/domain/cast-member.aggregate";
import { Category } from "@core/category/domain/category.aggregate";
import { Genre } from "@core/genre/domain/genre.aggregate";
import { SortDirection } from "@core/shared/domain/repository/search-params";
import { Video } from "@core/video/domain/video.aggregate";

const _keysInResponse = [
  "id",
  "title",
  "description",
  "year_launched",
  "duration",
  "rating",
  "is_opened",
  "is_published",
  "categories_id",
  "categories",
  "genres_id",
  "genres",
  "cast_members_id",
  "cast_members",
  "created_at",
];

export class GetVideoFixture {
  static keysInResponse = _keysInResponse;
}

export class CreateVideoFixture {
  static keysInResponse = _keysInResponse;

  static arrangeForSave() {
    const faker = Video.fake().aVideoWithoutMedias();
    const category = Category.fake().aCategory().build();
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    const castMember = CastMember.fake().aCastMember().build();
    const case1SendData = {
      title: faker.title,
      description: faker.description,
      year_launched: faker.year_launched,
      duration: faker.duration,
      rating: faker.rating.value,
      is_opened: faker.is_opened,
      is_published: false,
      categories_id: [category.category_id.id],
      genres_id: [genre.genre_id.id],
      cast_members_id: [castMember.cast_member_id.id],
    };

    const case1 = {
      label: "SIMPLE CASE",
      relations: {
        categories: [category],
        genres: [genre],
        castMembers: [castMember],
      },
      send_data: {
        ...case1SendData,
      },
      expected: {
        ...case1SendData,
        categories: expect.arrayContaining([
          {
            id: category.category_id.id,
            name: category.name,
            created_at: category.created_at.toISOString(),
          },
        ]),
        categories_id: expect.arrayContaining([category.category_id.id]),
        genres: expect.arrayContaining([
          {
            id: genre.genre_id.id,
            name: genre.name,
            is_active: genre.is_active,
            categories_id: expect.arrayContaining([category.category_id.id]),
            categories: expect.arrayContaining([
              {
                id: category.category_id.id,
                name: category.name,
                created_at: category.created_at.toISOString(),
              },
            ]),
            created_at: genre.created_at.toISOString(),
          },
        ]),
        genres_id: expect.arrayContaining([genre.genre_id.id]),
        cast_members: expect.arrayContaining([
          {
            id: castMember.cast_member_id.id,
            name: castMember.name,
            type: castMember.type.type,
            created_at: castMember.created_at.toISOString(),
          },
        ]),
        cast_members_id: expect.arrayContaining([castMember.cast_member_id.id]),
      },
    };

    const categories = Category.fake().theCategories(3).build();
    const genres = Genre.fake()
      .theGenres(2)
      .addCategoryId(categories[0].category_id)
      .addCategoryId(categories[1].category_id)
      .addCategoryId(categories[2].category_id)
      .build();
    const castMembers = CastMember.fake().theCastMembers(3).build();
    const case2SendData = {
      title: faker.title,
      description: faker.description,
      year_launched: faker.year_launched,
      duration: faker.duration,
      rating: faker.rating.value,
      is_opened: faker.is_opened,
      is_published: false,
      categories_id: categories.map((c) => c.category_id.id),
      genres_id: genres.map((g) => g.genre_id.id),
      cast_members_id: castMembers.map((m) => m.cast_member_id.id),
    };

    const case2 = {
      label: "COMPLEX CASE",
      relations: {
        categories,
        genres,
        castMembers,
      },
      send_data: {
        ...case2SendData,
      },
      expected: {
        ...case2SendData,
        categories: expect.arrayContaining(
          categories.map((c) => ({
            id: c.category_id.id,
            name: c.name,
            created_at: c.created_at.toISOString(),
          })),
        ),
        categories_id: expect.arrayContaining(
          categories.map((c) => c.category_id.id),
        ),
        genres: expect.arrayContaining(
          genres.map((g) => ({
            id: g.genre_id.id,
            name: g.name,
            is_active: g.is_active,
            categories_id: expect.arrayContaining(
              categories.map((c) => c.category_id.id),
            ),
            categories: expect.arrayContaining(
              categories.map((c) => ({
                id: c.category_id.id,
                name: c.name,
                created_at: c.created_at.toISOString(),
              })),
            ),
            created_at: g.created_at.toISOString(),
          })),
        ),
        genres_id: expect.arrayContaining(genres.map((g) => g.genre_id.id)),
        cast_members: expect.arrayContaining(
          castMembers.map((m) => ({
            id: m.cast_member_id.id,
            name: m.name,
            type: m.type.type,
            created_at: m.created_at.toISOString(),
          })),
        ),
        cast_members_id: expect.arrayContaining(
          castMembers.map((m) => m.cast_member_id.id),
        ),
      },
    };
    return [case1, case2];
  }

  static arrangeInvalidRequest() {
    const faker = Video.fake().aVideoWithAllMedias();
    const defaultExpected = {
      statusCode: 422,
      error: "Unprocessable Entity",
    };

    const baseSendData = {
      title: faker.title,
      description: faker.description,
      year_launched: faker.year_launched,
      duration: faker.duration,
      rating: faker.rating.value,
      is_opened: faker.is_opened,
      categories_id: faker.categories_id.map((c) => c.id),
      genres_id: faker.genres_id.map((g) => g.id),
      cast_members_id: faker.cast_members_id.map((m) => m.id),
    };

    return {
      EMPTY: {
        send_data: {},
        expected: {
          message: [
            "title should not be empty",
            "title must be a string",
            "description should not be empty",
            "description must be a string",
            "year_launched should not be empty",
            "year_launched must be an integer number",
            "year_launched must not be less than 1900",
            "duration should not be empty",
            "duration must be an integer number",
            "duration must not be less than 1",
            "rating should not be empty",
            "rating must be a string",
            "is_opened should not be empty",
            "is_opened must be a boolean value",
            "categories_id should not be empty",
            "categories_id must be an array",
            "each value in categories_id must be a UUID",
            "genres_id should not be empty",
            "genres_id must be an array",
            "each value in genres_id must be a UUID",
            "cast_members_id should not be empty",
            "cast_members_id must be an array",
            "each value in cast_members_id must be a UUID",
          ],
          ...defaultExpected,
        },
      },
      TITLE_UNDEFINED: {
        send_data: {
          ...baseSendData,
          title: undefined,
        },
        expected: {
          message: ["title should not be empty", "title must be a string"],
          ...defaultExpected,
        },
      },
      TITLE_NULL: {
        send_data: {
          ...baseSendData,
          title: null,
        },
        expected: {
          message: ["title should not be empty", "title must be a string"],
          ...defaultExpected,
        },
      },
      TITLE_EMPTY: {
        send_data: {
          ...baseSendData,
          title: "",
        },
        expected: {
          message: ["title should not be empty"],
          ...defaultExpected,
        },
      },
      DESCRIPTION_UNDEFINED: {
        send_data: {
          ...baseSendData,
          description: undefined,
        },
        expected: {
          message: [
            "description should not be empty",
            "description must be a string",
          ],
          ...defaultExpected,
        },
      },
      DESCRIPTION_NULL: {
        send_data: {
          ...baseSendData,
          description: null,
        },
        expected: {
          message: [
            "description should not be empty",
            "description must be a string",
          ],
          ...defaultExpected,
        },
      },
      DESCRIPTION_EMPTY: {
        send_data: {
          ...baseSendData,
          description: "",
        },
        expected: {
          message: ["description should not be empty"],
          ...defaultExpected,
        },
      },
      YEAR_LAUCHED_UNDEFINED: {
        send_data: {
          ...baseSendData,
          year_launched: undefined,
        },
        expected: {
          message: [
            "year_launched should not be empty",
            "year_launched must be an integer number",
            "year_launched must not be less than 1900",
          ],
          ...defaultExpected,
        },
      },
      YEAR_LAUCHED_NULL: {
        send_data: {
          ...baseSendData,
          year_launched: null,
        },
        expected: {
          message: [
            "year_launched should not be empty",
            "year_launched must be an integer number",
            "year_launched must not be less than 1900",
          ],
          ...defaultExpected,
        },
      },
      YEAR_LAUCHED_EMPTY: {
        send_data: {
          ...baseSendData,
          year_launched: "",
        },
        expected: {
          message: [
            "year_launched should not be empty",
            "year_launched must be an integer number",
            "year_launched must not be less than 1900",
          ],
          ...defaultExpected,
        },
      },
      YEAR_LAUCHED_1899: {
        send_data: {
          ...baseSendData,
          year_launched: 1899,
        },
        expected: {
          message: ["year_launched must not be less than 1900"],
          ...defaultExpected,
        },
      },
      DURATION_UNDEFINED: {
        send_data: {
          ...baseSendData,
          duration: undefined,
        },
        expected: {
          message: [
            "duration should not be empty",
            "duration must be an integer number",
            "duration must not be less than 1",
          ],
          ...defaultExpected,
        },
      },
      DURATION_NULL: {
        send_data: {
          ...baseSendData,
          duration: null,
        },
        expected: {
          message: [
            "duration should not be empty",
            "duration must be an integer number",
            "duration must not be less than 1",
          ],
          ...defaultExpected,
        },
      },
      DURATION_EMPTY: {
        send_data: {
          ...baseSendData,
          duration: null,
        },
        expected: {
          message: [
            "duration should not be empty",
            "duration must be an integer number",
            "duration must not be less than 1",
          ],
          ...defaultExpected,
        },
      },
      DURATION_ZERO: {
        send_data: {
          ...baseSendData,
          duration: 0,
        },
        expected: {
          message: ["duration must not be less than 1"],
          ...defaultExpected,
        },
      },
      RATING_UNDEFINED: {
        send_data: {
          ...baseSendData,
          rating: undefined,
        },
        expected: {
          message: ["rating should not be empty", "rating must be a string"],
          ...defaultExpected,
        },
      },
      RATING_NULL: {
        send_data: {
          ...baseSendData,
          rating: null,
        },
        expected: {
          message: ["rating should not be empty", "rating must be a string"],
          ...defaultExpected,
        },
      },
      RATING_EMPTY: {
        send_data: {
          ...baseSendData,
          rating: "",
        },
        expected: {
          message: ["rating should not be empty"],
          ...defaultExpected,
        },
      },
      RATING_ZERO: {
        send_data: {
          ...baseSendData,
          rating: 0,
        },
        expected: {
          message: ["rating must be a string"],
          ...defaultExpected,
        },
      },
      IS_OPENED_UNDEFINED: {
        send_data: {
          ...baseSendData,
          is_opened: undefined,
        },
        expected: {
          message: [
            "is_opened should not be empty",
            "is_opened must be a boolean value",
          ],
          ...defaultExpected,
        },
      },
      IS_OPENED_NULL: {
        send_data: {
          ...baseSendData,
          is_opened: null,
        },
        expected: {
          message: [
            "is_opened should not be empty",
            "is_opened must be a boolean value",
          ],
          ...defaultExpected,
        },
      },
      IS_OPENED_EMPTY: {
        send_data: {
          ...baseSendData,
          is_opened: "",
        },
        expected: {
          message: [
            "is_opened should not be empty",
            "is_opened must be a boolean value",
          ],
          ...defaultExpected,
        },
      },
      IS_OPENED_ZERO: {
        send_data: {
          ...baseSendData,
          is_opened: 0,
        },
        expected: {
          message: ["is_opened must be a boolean value"],
          ...defaultExpected,
        },
      },
      CATEGORIES_ID_UNDEFINED: {
        send_data: {
          ...baseSendData,
          categories_id: undefined,
        },
        expected: {
          message: [
            "categories_id should not be empty",
            "categories_id must be an array",
            "each value in categories_id must be a UUID",
          ],
          ...defaultExpected,
        },
      },
      CATEGORIES_ID_NULL: {
        send_data: {
          ...baseSendData,
          categories_id: null,
        },
        expected: {
          message: [
            "categories_id should not be empty",
            "categories_id must be an array",
            "each value in categories_id must be a UUID",
          ],
          ...defaultExpected,
        },
      },
      CATEGORIES_ID_EMPTY_STRING: {
        send_data: {
          ...baseSendData,
          categories_id: "",
        },
        expected: {
          message: [
            "categories_id should not be empty",
            "categories_id must be an array",
            "each value in categories_id must be a UUID",
          ],
          ...defaultExpected,
        },
      },
      CATEGORIES_ID_NOT_VALID: {
        send_data: {
          ...baseSendData,
          categories_id: [1],
        },
        expected: {
          message: ["each value in categories_id must be a UUID"],
          ...defaultExpected,
        },
      },
      CATEGORIES_ID_EMPTY_ARRAY: {
        send_data: {
          ...baseSendData,
          categories_id: [],
        },
        expected: {
          message: ["categories_id should not be empty"],
          ...defaultExpected,
        },
      },

      GENRES_ID_UNDEFINED: {
        send_data: {
          ...baseSendData,
          genres_id: undefined,
        },
        expected: {
          message: [
            "genres_id should not be empty",
            "genres_id must be an array",
            "each value in genres_id must be a UUID",
          ],
          ...defaultExpected,
        },
      },
      GENRES_ID_NULL: {
        send_data: {
          ...baseSendData,
          genres_id: null,
        },
        expected: {
          message: [
            "genres_id should not be empty",
            "genres_id must be an array",
            "each value in genres_id must be a UUID",
          ],
          ...defaultExpected,
        },
      },
      GENRES_ID_EMPTY_STRING: {
        send_data: {
          ...baseSendData,
          genres_id: "",
        },
        expected: {
          message: [
            "genres_id should not be empty",
            "genres_id must be an array",
            "each value in genres_id must be a UUID",
          ],
          ...defaultExpected,
        },
      },
      GENRES_ID_NOT_VALID: {
        send_data: {
          ...baseSendData,
          genres_id: [1],
        },
        expected: {
          message: ["each value in genres_id must be a UUID"],
          ...defaultExpected,
        },
      },
      GENRES_ID_EMPTY_ARRAY: {
        send_data: {
          ...baseSendData,
          genres_id: [],
        },
        expected: {
          message: ["genres_id should not be empty"],
          ...defaultExpected,
        },
      },
      CAST_MEMBERS_ID_UNDEFINED: {
        send_data: {
          ...baseSendData,
          cast_members_id: undefined,
        },
        expected: {
          message: [
            "cast_members_id should not be empty",
            "cast_members_id must be an array",
            "each value in cast_members_id must be a UUID",
          ],
          ...defaultExpected,
        },
      },
      CAST_MEMBERS_ID_NULL: {
        send_data: {
          ...baseSendData,
          cast_members_id: null,
        },
        expected: {
          message: [
            "cast_members_id should not be empty",
            "cast_members_id must be an array",
            "each value in cast_members_id must be a UUID",
          ],
          ...defaultExpected,
        },
      },
      CAST_MEMBERS_ID_EMPTY_STRING: {
        send_data: {
          ...baseSendData,
          cast_members_id: "",
        },
        expected: {
          message: [
            "cast_members_id should not be empty",
            "cast_members_id must be an array",
            "each value in cast_members_id must be a UUID",
          ],
          ...defaultExpected,
        },
      },
      CAST_MEMBERS_ID_NOT_VALID: {
        send_data: {
          ...baseSendData,
          cast_members_id: [1],
        },
        expected: {
          message: ["each value in cast_members_id must be a UUID"],
          ...defaultExpected,
        },
      },
      CAST_MEMBERS_ID_EMPTY_ARRAY: {
        send_data: {
          ...baseSendData,
          cast_members_id: [],
        },
        expected: {
          message: ["cast_members_id should not be empty"],
          ...defaultExpected,
        },
      },
      CATEGORIES_GENRES_CAST_MEMBERS_NOT_FOUND: {
        send_data: {
          ...baseSendData,
          categories_id: ["fff26d29-0152-42ef-bb5d-b9523bbb3e49"],
          genres_id: ["fff26d29-0152-42ef-bb5d-b9523bbb3e49"],
          cast_members_id: ["fff26d29-0152-42ef-bb5d-b9523bbb3e49"],
        },
        expected: {
          message: [
            "Category Not Found using ID fff26d29-0152-42ef-bb5d-b9523bbb3e49",
            "Genre Not Found using ID fff26d29-0152-42ef-bb5d-b9523bbb3e49",
            "CastMember Not Found using ID fff26d29-0152-42ef-bb5d-b9523bbb3e49",
          ],
          ...defaultExpected,
        },
      },
    };
  }

  static arrangeForEntityValidationError() {
    const faker = Video.fake().aVideoWithAllMedias();
    const defaultExpected = {
      statusCode: 422,
      error: "Unprocessable Entity",
    };
    const baseSendData = {
      title: faker.title,
      description: faker.description,
      year_launched: faker.year_launched,
      duration: faker.duration,
      rating: faker.rating.value,
      is_opened: faker.is_opened,
      categories_id: faker.categories_id.map((c) => c.id),
      genres_id: faker.genres_id.map((g) => g.id),
      cast_members_id: faker.cast_members_id.map((m) => m.id),
    };

    return {
      TITLE_TOO_LONG: {
        send_data: {
          ...baseSendData,
          title: faker.withInvalidTitleTooLong().title,
          categories_id: ["fff26d29-0152-42ef-bb5d-b9523bbb3e49"],
          genres_id: ["fff26d29-0152-42ef-bb5d-b9523bbb3e49"],
          cast_members_id: ["fff26d29-0152-42ef-bb5d-b9523bbb3e49"],
        },
        expected: {
          message: [
            "title must be shorter than or equal to 255 characters",
            "Category Not Found using ID fff26d29-0152-42ef-bb5d-b9523bbb3e49",
            "Genre Not Found using ID fff26d29-0152-42ef-bb5d-b9523bbb3e49",
            "CastMember Not Found using ID fff26d29-0152-42ef-bb5d-b9523bbb3e49",
          ],
          ...defaultExpected,
        },
      },
      CATEGORIES_GENRES_CAST_MEMBERS_NOT_FOUND: {
        send_data: {
          ...baseSendData,
          categories_id: ["fff26d29-0152-42ef-bb5d-b9523bbb3e49"],
          genres_id: ["fff26d29-0152-42ef-bb5d-b9523bbb3e49"],
          cast_members_id: ["fff26d29-0152-42ef-bb5d-b9523bbb3e49"],
        },
        expected: {
          message: [
            "Category Not Found using ID fff26d29-0152-42ef-bb5d-b9523bbb3e49",
            "Genre Not Found using ID fff26d29-0152-42ef-bb5d-b9523bbb3e49",
            "CastMember Not Found using ID fff26d29-0152-42ef-bb5d-b9523bbb3e49",
          ],
          ...defaultExpected,
        },
      },
    };
  }
}

export class UpdateVideoFixture {
  static keysInResponse = _keysInResponse;

  static arrangeForSave() {
    const faker = Genre.fake().aGenre().withName("test name");

    const category = Category.fake().aCategory().build();

    const case1 = {
      entity: faker.addCategoryId(category.category_id).build(),
      relations: {
        categories: [category],
      },
      send_data: {
        name: faker.name,
        categories_id: [category.category_id.id],
      },
      expected: {
        name: faker.name,
        categories_id: expect.arrayContaining([category.category_id.id]),
        categories: expect.arrayContaining([
          {
            id: category.category_id.id,
            name: category.name,
            created_at: category.created_at.toISOString(),
          },
        ]),
        is_active: true,
      },
    };

    const case2 = {
      entity: faker.addCategoryId(category.category_id).build(),
      relations: {
        categories: [category],
      },
      send_data: {
        name: faker.name,
        categories_id: [category.category_id.id],
        is_active: false,
      },
      expected: {
        name: faker.name,
        categories_id: expect.arrayContaining([category.category_id.id]),
        categories: expect.arrayContaining([
          {
            id: category.category_id.id,
            name: category.name,
            created_at: category.created_at.toISOString(),
          },
        ]),
        is_active: false,
      },
    };

    const categories = Category.fake().theCategories(3).build();
    const case3 = {
      entity: faker.addCategoryId(category.category_id).build(),
      relations: {
        categories: [category, ...categories],
      },
      send_data: {
        name: faker.name,
        categories_id: [
          categories[0].category_id.id,
          categories[1].category_id.id,
          categories[2].category_id.id,
        ],
      },
      expected: {
        name: faker.name,
        categories_id: expect.arrayContaining([
          categories[0].category_id.id,
          categories[1].category_id.id,
          categories[2].category_id.id,
        ]),
        categories: expect.arrayContaining([
          {
            id: categories[0].category_id.id,
            name: categories[0].name,
            created_at: categories[0].created_at.toISOString(),
          },
          {
            id: categories[1].category_id.id,
            name: categories[1].name,
            created_at: categories[1].created_at.toISOString(),
          },
          {
            id: categories[2].category_id.id,
            name: categories[2].name,
            created_at: categories[2].created_at.toISOString(),
          },
        ]),
        is_active: true,
      },
    };

    return [case1, case2, case3];
  }

  static arrangeInvalidRequest() {
    const faker = Genre.fake().aGenre();
    const defaultExpected = {
      statusCode: 422,
      error: "Unprocessable Entity",
    };

    return {
      CATEGORIES_ID_NOT_VALID: {
        send_data: {
          name: faker.name,
          categories_id: ["a"],
        },
        expected: {
          message: ["each value in categories_id must be a UUID"],
          ...defaultExpected,
        },
      },
    };
  }

  static arrangeForEntityValidationError() {
    const faker = Genre.fake().aGenre();
    const defaultExpected = {
      statusCode: 422,
      error: "Unprocessable Entity",
    };

    return {
      CATEGORIES_ID_NOT_EXISTS: {
        send_data: {
          name: faker.withName("action").name,
          categories_id: ["d8952775-5f69-42d5-9e94-00f097e1b98c"],
        },
        expected: {
          message: [
            "Category Not Found using ID d8952775-5f69-42d5-9e94-00f097e1b98c",
          ],
          ...defaultExpected,
        },
      },
    };
  }
}

export class ListVideosFixture {
  static arrangeIncrementedWithCreatedAt() {
    const category = Category.fake().aCategory().build();
    const _entities = Genre.fake()
      .theGenres(4)
      .addCategoryId(category.category_id)
      .withName((i) => i + "")
      .withCreatedAt((i) => new Date(new Date().getTime() + i * 2000))
      .build();

    const entitiesMap = {
      first: _entities[0],
      second: _entities[1],
      third: _entities[2],
      fourth: _entities[3],
    };

    const relations = {
      categories: new Map([[category.category_id.id, category]]),
    };

    const arrange = [
      {
        send_data: {},
        expected: {
          entities: [
            entitiesMap.fourth,
            entitiesMap.third,
            entitiesMap.second,
            entitiesMap.first,
          ],
          meta: {
            current_page: 1,
            last_page: 1,
            per_page: 15,
            total: 4,
          },
        },
      },
      {
        send_data: {
          page: 1,
          per_page: 2,
        },
        expected: {
          entities: [entitiesMap.fourth, entitiesMap.third],
          meta: {
            current_page: 1,
            last_page: 2,
            per_page: 2,
            total: 4,
          },
        },
      },
      {
        send_data: {
          page: 2,
          per_page: 2,
        },
        expected: {
          entities: [entitiesMap.second, entitiesMap.first],
          meta: {
            current_page: 2,
            last_page: 2,
            per_page: 2,
            total: 4,
          },
        },
      },
    ];

    return { arrange, entitiesMap, relations };
  }

  static arrangeUnsorted() {
    const categories = Category.fake().theCategories(4).build();

    const relations = {
      categories: new Map(
        categories.map((category) => [category.category_id.id, category]),
      ),
    };

    const created_at = new Date();

    const entitiesMap = {
      test: Genre.fake()
        .aGenre()
        .addCategoryId(categories[0].category_id)
        .addCategoryId(categories[1].category_id)
        .withName("test")
        .withCreatedAt(new Date(created_at.getTime() + 1000))
        .build(),
      a: Genre.fake()
        .aGenre()
        .addCategoryId(categories[0].category_id)
        .addCategoryId(categories[1].category_id)
        .withName("a")
        .withCreatedAt(new Date(created_at.getTime() + 2000))
        .build(),
      TEST: Genre.fake()
        .aGenre()
        .addCategoryId(categories[0].category_id)
        .addCategoryId(categories[1].category_id)
        .addCategoryId(categories[2].category_id)
        .withName("TEST")
        .withCreatedAt(new Date(created_at.getTime() + 3000))
        .build(),
      e: Genre.fake()
        .aGenre()
        .addCategoryId(categories[3].category_id)
        .withName("e")
        .withCreatedAt(new Date(created_at.getTime() + 4000))
        .build(),
      TeSt: Genre.fake()
        .aGenre()
        .addCategoryId(categories[1].category_id)
        .addCategoryId(categories[2].category_id)
        .withName("TeSt")
        .withCreatedAt(new Date(created_at.getTime() + 5000))
        .build(),
    };

    const arrange_filter_by_name_sort_name_asc = [
      {
        send_data: {
          page: 1,
          per_page: 2,
          sort: "name",
          filter: { name: "TEST" },
        },
        get label() {
          return JSON.stringify(this.send_data);
        },
        expected: {
          entities: [entitiesMap.TEST, entitiesMap.TeSt],
          meta: {
            total: 3,
            current_page: 1,
            last_page: 2,
            per_page: 2,
          },
        },
      },
      {
        send_data: {
          page: 2,
          per_page: 2,
          sort: "name",
          filter: { name: "TEST" },
        },
        get label() {
          return JSON.stringify(this.send_data);
        },
        expected: {
          entities: [entitiesMap.test],
          meta: {
            total: 3,
            current_page: 2,
            last_page: 2,
            per_page: 2,
          },
        },
      },
    ];

    const arrange_filter_by_categories_id_and_sort_by_created_desc = [
      {
        send_data: {
          page: 1,
          per_page: 2,
          sort: "created_at",
          sort_dir: "desc" as SortDirection,
          filter: { categories_id: [categories[0].category_id.id] },
        },
        get label() {
          return JSON.stringify({
            ...this.send_data,
            filter: { categories_id_length: 1 },
          });
        },
        expected: {
          entities: [entitiesMap.TEST, entitiesMap.a],
          meta: {
            total: 3,
            current_page: 1,
            last_page: 2,
            per_page: 2,
          },
        },
      },
      {
        send_data: {
          page: 2,
          per_page: 2,
          sort: "created_at",
          sort_dir: "desc" as SortDirection,
          filter: { categories_id: [categories[0].category_id.id] },
        },
        get label() {
          return JSON.stringify({
            ...this.send_data,
            filter: { categories_id_length: 1 },
          });
        },
        expected: {
          entities: [entitiesMap.test],
          meta: {
            total: 3,
            current_page: 2,
            last_page: 2,
            per_page: 2,
          },
        },
      },
      {
        send_data: {
          page: 1,
          per_page: 2,
          sort: "created_at",
          sort_dir: "desc" as SortDirection,
          filter: {
            categories_id: [
              categories[0].category_id.id,
              categories[1].category_id.id,
            ],
          },
        },
        get label() {
          return JSON.stringify({
            ...this.send_data,
            filter: { categories_id_length: 2 },
          });
        },
        expected: {
          entities: [entitiesMap.TeSt, entitiesMap.TEST],
          meta: {
            total: 4,
            current_page: 1,
            last_page: 2,
            per_page: 2,
          },
        },
      },
      {
        send_data: {
          page: 2,
          per_page: 2,
          sort: "created_at",
          sort_dir: "desc" as SortDirection,
          filter: {
            categories_id: [
              categories[0].category_id.id,
              categories[1].category_id.id,
            ],
          },
        },
        get label() {
          return JSON.stringify({
            ...this.send_data,
            filter: { categories_id_length: 2 },
          });
        },
        expected: {
          entities: [entitiesMap.a, entitiesMap.test],
          meta: {
            total: 4,
            current_page: 2,
            last_page: 2,
            per_page: 2,
          },
        },
      },
    ];

    return {
      arrange: [
        ...arrange_filter_by_name_sort_name_asc,
        ...arrange_filter_by_categories_id_and_sort_by_created_desc,
      ],
      entitiesMap,
      relations,
    };
  }
}
