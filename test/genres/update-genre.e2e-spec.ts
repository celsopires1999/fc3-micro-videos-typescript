import { Category } from "@core/category/domain/category.aggregate";
import { ICategoryRepository } from "@core/category/domain/category.repository";
import { GenreOutputMapper } from "@core/genre/application/use-cases/common/genre-output";
import { Genre, GenreId } from "@core/genre/domain/genre.aggregate";
import { IGenreRepository } from "@core/genre/domain/genre.repository";
import { instanceToPlain } from "class-transformer";
import request from "supertest";
import { CATEGORY_PROVIDERS } from "../../src/nest-modules/categories-module/categories.providers";
import { GenresController } from "../../src/nest-modules/genres-module/genres.controller";
import { GENRES_PROVIDERS } from "../../src/nest-modules/genres-module/genres.providers";
import { UpdateGenreFixture } from "../../src/nest-modules/genres-module/testing/genre-fixture";
import { startApp } from "../../src/nest-modules/shared-module/testing/helpers";

describe("GenresController (e2e)", () => {
  const uuid = "9366b7dc-2d71-4799-b91c-c64adb205104";
  const appHelper = startApp();

  describe("/genres/:id (PATCH)", () => {
    describe("unauthenticated", () => {
      test("should return 401 when not authenticated", () => {
        return request(appHelper.app.getHttpServer())
          .patch("/genres/88ff2587-ce5a-4769-a8c6-1d63d29c5f7a")
          .send({})
          .expect(401);
      });

      test("should return 403 when not authenticated as admin", () => {
        return request(appHelper.app.getHttpServer())
          .patch("/genres/88ff2587-ce5a-4769-a8c6-1d63d29c5f7a")
          .authenticate(appHelper.app, false)
          .send({})
          .expect(403);
      });
    });

    describe("should return a response error when id is invalid or not found", () => {
      const faker = Genre.fake().aGenre();
      const arrange = [
        {
          id: "88ff2587-ce5a-4769-a8c6-1d63d29c5f7a",
          send_data: { name: faker.name },
          expected: {
            message:
              "Genre Not Found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a",
            statusCode: 404,
            error: "Not Found",
          },
        },
        {
          id: "fake id",
          send_data: { name: faker.name },
          expected: {
            statusCode: 422,
            message: "Validation failed (uuid is expected)",
            error: "Unprocessable Entity",
          },
        },
      ];

      test.each(arrange)(
        "when id is $id",
        async ({ id, send_data, expected }) => {
          return request(appHelper.app.getHttpServer())
            .patch(`/genres/${id}`)
            .authenticate(appHelper.app)
            .send(send_data)
            .expect(expected.statusCode)
            .expect(expected);
        },
      );
    });

    describe("should return a response error with 422 when request body is invalid", () => {
      const invalidRequest = UpdateGenreFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));
      test.each(arrange)("when body is $label", ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .patch(`/genres/${uuid}`)
          .authenticate(appHelper.app)
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe("should return a response error with 422 when throw EntityValidationError", () => {
      const validationErrors =
        UpdateGenreFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(validationErrors).map((key) => ({
        label: key,
        value: validationErrors[key],
      }));
      let genreRepo: IGenreRepository;
      let categoryRepo: ICategoryRepository;

      beforeEach(() => {
        genreRepo = appHelper.app.get<IGenreRepository>(
          GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
        );
        categoryRepo = appHelper.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
      });
      test.each(arrange)("when body is $label", async ({ value }) => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.category_id)
          .build();
        await genreRepo.insert(genre);
        return request(appHelper.app.getHttpServer())
          .patch(`/genres/${genre.genre_id.id}`)
          .authenticate(appHelper.app)
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe("should update a genre", () => {
      const arrange = UpdateGenreFixture.arrangeForSave();
      let genreRepo: IGenreRepository;
      let categoryRepo: ICategoryRepository;
      beforeEach(async () => {
        genreRepo = appHelper.app.get<IGenreRepository>(
          GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
        );
        categoryRepo = appHelper.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
      });
      test.each(arrange)(
        "when body is $send_data",
        async ({ send_data, expected, relations }) => {
          const category = Category.fake().aCategory().build();
          await categoryRepo.bulkInsert([category, ...relations.categories]);
          const genreCreated = Genre.fake()
            .aGenre()
            .addCategoryId(category.category_id)
            .build();
          await genreRepo.insert(genreCreated);

          const res = await request(appHelper.app.getHttpServer())
            .patch(`/genres/${genreCreated.genre_id.id}`)
            .authenticate(appHelper.app)
            .send(send_data)
            .expect(200);

          const keyInResponse = UpdateGenreFixture.keysInResponse;
          expect(Object.keys(res.body)).toStrictEqual(["data"]);
          expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);
          const id = res.body.data.id;
          const genreUpdated = await genreRepo.findById(new GenreId(id));
          const presenter = GenresController.serialize(
            GenreOutputMapper.toOutput(genreUpdated!, relations.categories),
          );
          const serialized = instanceToPlain(presenter);
          expect(res.body.data).toStrictEqual({
            id: serialized.id,
            created_at: serialized.created_at,
            ...expected,
          });
        },
      );
    });
  });
});
