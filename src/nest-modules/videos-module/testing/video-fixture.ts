import { CastMember } from "@core/cast-member/domain/cast-member.aggregate";
import { Category } from "@core/category/domain/category.aggregate";
import { Genre } from "@core/genre/domain/genre.aggregate";
import { SortDirection } from "@core/shared/domain/repository/search-params";
import { Rating } from "@core/video/domain/rating.vo";
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

export class AVideoFixture {
  static keysInResponse = _keysInResponse;

  static arrange() {
    const category = Category.fake().aCategory().build();
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    const castMember = CastMember.fake().aCastMember().build();
    const video = Video.fake()
      .aVideoWithAllMedias()
      .addCategoryId(category.category_id)
      .addGenreId(genre.genre_id)
      .addCastMemberId(castMember.cast_member_id)
      .build();

    return {
      entity: video,
      relations: {
        categories: [category],
        genres: [genre],
        castMembers: [castMember],
      },
      send_data: {
        id: video.video_id.id,
      },
      expected: {
        id: video.video_id.id,
        title: video.title,
        description: video.description,
        rating: video.rating.value,
        year_launched: video.year_launched,
        duration: video.duration,
        is_opened: video.is_opened,
        is_published: video.is_published,
        created_at: video.created_at.toISOString(),
        categories_id: expect.arrayContaining([category.category_id.id]),
        categories: expect.arrayContaining([
          {
            id: category.category_id.id,
            name: category.name,
            created_at: category.created_at.toISOString(),
          },
        ]),
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
  }
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
    const category = Category.fake().aCategory().build();
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    const castMember = CastMember.fake().aCastMember().build();
    const video = Video.fake()
      .aVideoWithAllMedias()
      .withTitle("test name")
      .addCategoryId(category.category_id)
      .addGenreId(genre.genre_id)
      .addCastMemberId(castMember.cast_member_id)
      .build();

    const faker = Video.fake().aVideoWithAllMedias();
    const newCategory = Category.fake().aCategory().build();
    const title = faker.title;
    const case1 = {
      label: "TITLE & TWO CATEGORIES",
      entity: video,
      relations: {
        categories: [category, newCategory],
        genres: [genre],
        castMembers: [castMember],
      },
      send_data: {
        title: title,
        categories_id: [category.category_id.id, newCategory.category_id.id],
      },
      expected: {
        id: video.video_id.id,
        title: title,
        description: video.description,
        rating: video.rating.value,
        year_launched: video.year_launched,
        duration: video.duration,
        is_opened: video.is_opened,
        is_published: video.is_published,
        created_at: video.created_at.toISOString(),
        categories_id: expect.arrayContaining([
          category.category_id.id,
          newCategory.category_id.id,
        ]),
        categories: expect.arrayContaining([
          {
            id: category.category_id.id,
            name: category.name,
            created_at: category.created_at.toISOString(),
          },
          {
            id: newCategory.category_id.id,
            name: newCategory.name,
            created_at: newCategory.created_at.toISOString(),
          },
        ]),
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

    const rating = Rating.create18().value;

    const case2 = {
      label: "RATING",
      entity: video,
      relations: {
        categories: [category],
        genres: [genre],
        castMembers: [castMember],
      },
      send_data: {
        rating: rating,
      },
      expected: {
        id: video.video_id.id,
        title: video.title,
        description: video.description,
        rating: rating,
        year_launched: video.year_launched,
        duration: video.duration,
        is_opened: video.is_opened,
        is_published: video.is_published,
        created_at: video.created_at.toISOString(),
        categories_id: expect.arrayContaining([category.category_id.id]),
        categories: expect.arrayContaining([
          {
            id: category.category_id.id,
            name: category.name,
            created_at: category.created_at.toISOString(),
          },
        ]),
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

    return [case1, case2];
  }

  static arrangeInvalidRequest() {
    const defaultExpected = {
      statusCode: 422,
      error: "Unprocessable Entity",
    };
    const category = Category.fake().aCategory().build();
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    const castMember = CastMember.fake().anActor().build();
    const entity = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(category.category_id)
      .addGenreId(genre.genre_id)
      .addCastMemberId(castMember.cast_member_id)
      .build();

    const relations = {
      category: category,
      genre: genre,
      castMember: castMember,
    };

    const cases = {
      YEAR_LAUCHED_1899: {
        send_data: {
          year_launched: 1899,
        },
        expected: {
          message: ["year_launched must not be less than 1900"],
          ...defaultExpected,
        },
      },
      DURATION_ZERO: {
        send_data: {
          duration: 0,
        },
        expected: {
          message: ["duration must not be less than 1"],
          ...defaultExpected,
        },
      },
      RATING_ZERO: {
        send_data: {
          rating: 0,
        },
        expected: {
          message: ["rating must be a string"],
          ...defaultExpected,
        },
      },
      IS_OPENED_ZERO: {
        send_data: {
          is_opened: 0,
        },
        expected: {
          message: ["is_opened must be a boolean value"],
          ...defaultExpected,
        },
      },
      CATEGORIES_ID_EMPTY_STRING: {
        send_data: {
          categories_id: "",
        },
        expected: {
          message: [
            "categories_id must be an array",
            "each value in categories_id must be a UUID",
          ],
          ...defaultExpected,
        },
      },
      CATEGORIES_ID_NOT_VALID: {
        send_data: {
          categories_id: [1],
        },
        expected: {
          message: ["each value in categories_id must be a UUID"],
          ...defaultExpected,
        },
      },
      GENRES_ID_EMPTY_STRING: {
        send_data: {
          genres_id: "",
        },
        expected: {
          message: [
            "genres_id must be an array",
            "each value in genres_id must be a UUID",
          ],
          ...defaultExpected,
        },
      },
      GENRES_ID_NOT_VALID: {
        send_data: {
          genres_id: [1],
        },
        expected: {
          message: ["each value in genres_id must be a UUID"],
          ...defaultExpected,
        },
      },
      CAST_MEMBERS_ID_EMPTY_STRING: {
        send_data: {
          cast_members_id: "",
        },
        expected: {
          message: [
            "cast_members_id must be an array",
            "each value in cast_members_id must be a UUID",
          ],
          ...defaultExpected,
        },
      },
      CAST_MEMBERS_ID_NOT_VALID: {
        send_data: {
          cast_members_id: [1],
        },
        expected: {
          message: ["each value in cast_members_id must be a UUID"],
          ...defaultExpected,
        },
      },
      CATEGORIES_GENRES_CAST_MEMBERS_NOT_FOUND: {
        send_data: {
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

    return {
      entity,
      relations,
      cases,
    };
  }

  static arrangeForEntityValidationError() {
    const faker = Video.fake().aVideoWithAllMedias();
    const defaultExpected = {
      statusCode: 422,
      error: "Unprocessable Entity",
    };

    const category = Category.fake().aCategory().build();
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    const castMember = CastMember.fake().anActor().build();
    const entity = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(category.category_id)
      .addGenreId(genre.genre_id)
      .addCastMemberId(castMember.cast_member_id)
      .build();

    const relations = {
      category: category,
      genre: genre,
      castMember: castMember,
    };

    const cases = {
      TITLE_TOO_LONG: {
        send_data: {
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

    return {
      entity,
      relations,
      cases,
    };
  }
}

export class ListVideosFixture {
  static arrangeIncrementedWithCreatedAt() {
    const category = Category.fake().aCategory().build();
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    const castMember = CastMember.fake().aCastMember().build();
    const _entities = Video.fake()
      .theVideosWithAllMedias(4)
      .addCategoryId(category.category_id)
      .addGenreId(genre.genre_id)
      .addCastMemberId(castMember.cast_member_id)
      .withTitle((i) => i + "")
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
      genres: new Map([[genre.genre_id.id, genre]]),
      castMembers: new Map([[castMember.cast_member_id.id, castMember]]),
    };

    const arrange = [
      {
        label: "EMPTY",
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
        label: "PAGE 1 PER_PAGE 2",
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
        label: "PAGE 2 PER_PAGE 2",
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
    const genres = [
      Genre.fake().aGenre().addCategoryId(categories[0].category_id).build(),
      Genre.fake().aGenre().addCategoryId(categories[1].category_id).build(),
      Genre.fake().aGenre().addCategoryId(categories[2].category_id).build(),
      Genre.fake().aGenre().addCategoryId(categories[3].category_id).build(),
    ];
    const castMembers = CastMember.fake().theCastMembers(4).build();

    const relations = {
      categories: new Map(
        categories.map((category) => [category.category_id.id, category]),
      ),
      genres: new Map(genres.map((genre) => [genre.genre_id.id, genre])),
      castMembers: new Map(
        castMembers.map((castMember) => [
          castMember.cast_member_id.id,
          castMember,
        ]),
      ),
    };

    const created_at = new Date();

    const entitiesMap = {
      test: Video.fake()
        .aVideoWithAllMedias()
        .addCategoryId(categories[0].category_id)
        .addCategoryId(categories[1].category_id)
        .addGenreId(genres[0].genre_id)
        .addGenreId(genres[1].genre_id)
        .addCastMemberId(castMembers[0].cast_member_id)
        .addCastMemberId(castMembers[1].cast_member_id)
        .withTitle("test")
        .withCreatedAt(new Date(created_at.getTime() + 1000))
        .build(),
      a: Video.fake()
        .aVideoWithAllMedias()
        .addCategoryId(categories[0].category_id)
        .addCategoryId(categories[1].category_id)
        .addGenreId(genres[0].genre_id)
        .addGenreId(genres[1].genre_id)
        .addCastMemberId(castMembers[0].cast_member_id)
        .addCastMemberId(castMembers[1].cast_member_id)
        .withTitle("a")
        .withCreatedAt(new Date(created_at.getTime() + 2000))
        .build(),
      TEST: Video.fake()
        .aVideoWithAllMedias()
        .addCategoryId(categories[0].category_id)
        .addCategoryId(categories[1].category_id)
        .addCategoryId(categories[2].category_id)
        .addGenreId(genres[0].genre_id)
        .addGenreId(genres[1].genre_id)
        .addGenreId(genres[2].genre_id)
        .addCastMemberId(castMembers[0].cast_member_id)
        .addCastMemberId(castMembers[1].cast_member_id)
        .addCastMemberId(castMembers[2].cast_member_id)
        .withTitle("TEST")
        .withCreatedAt(new Date(created_at.getTime() + 3000))
        .build(),
      e: Video.fake()
        .aVideoWithAllMedias()
        .addCategoryId(categories[3].category_id)
        .addGenreId(genres[3].genre_id)
        .addCastMemberId(castMembers[3].cast_member_id)
        .withTitle("e")
        .withCreatedAt(new Date(created_at.getTime() + 4000))
        .build(),
      TeSt: Video.fake()
        .aVideoWithAllMedias()
        .addCategoryId(categories[1].category_id)
        .addCategoryId(categories[2].category_id)
        .addGenreId(genres[1].genre_id)
        .addGenreId(genres[2].genre_id)
        .addCastMemberId(castMembers[1].cast_member_id)
        .addCastMemberId(castMembers[2].cast_member_id)
        .withTitle("TeSt")
        .withCreatedAt(new Date(created_at.getTime() + 5000))
        .build(),
    };

    const arrange_filter_by_title_sort_title_asc = [
      {
        send_data: {
          page: 1,
          per_page: 2,
          sort: "title",
          filter: { title: "TEST" },
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
          sort: "title",
          filter: { title: "TEST" },
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
        ...arrange_filter_by_title_sort_title_asc,
        ...arrange_filter_by_categories_id_and_sort_by_created_desc,
      ],
      entitiesMap,
      relations,
    };
  }
}
