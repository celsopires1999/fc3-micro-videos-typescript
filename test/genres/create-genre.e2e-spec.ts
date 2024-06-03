import { ICategoryRepository } from "@core/category/domain/category.repository";
import { GenreOutputMapper } from "@core/genre/application/use-cases/common/genre-output";
import { GenreId } from "@core/genre/domain/genre.aggregate";
import { IGenreRepository } from "@core/genre/domain/genre.repository";
import { instanceToPlain } from "class-transformer";
import request from "supertest";
import { CATEGORY_PROVIDERS } from "../../src/nest-modules/categories-module/categories.providers";
import { GenresController } from "../../src/nest-modules/genres-module/genres.controller";
import { GENRES_PROVIDERS } from "../../src/nest-modules/genres-module/genres.providers";
import { CreateGenreFixture } from "../../src/nest-modules/genres-module/testing/genre-fixture";
import { startApp } from "../../src/nest-modules/shared-module/testing/helpers";

describe("GenresController (e2e)", () => {
  describe("/genres (POST)", () => {
    describe("unauthenticated", () => {
      const appHelper = startApp();

      test("should return 401 when not authenticated", () => {
        return request(appHelper.app.getHttpServer())
          .post("/genres")
          .send({})
          .expect(401);
      });

      test("should return 403 when not authenticated as admin", () => {
        return request(appHelper.app.getHttpServer())
          .post("/genres")
          .authenticate(appHelper.app, false)
          .send({})
          .expect(403);
      });
    });

    describe("should return a response error with 422 when request body is invalid", () => {
      const appHelper = startApp();
      const invalidRequest = CreateGenreFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));
      test.each(arrange)("when body is $label", ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .post("/genres")
          .authenticate(appHelper.app)
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe("should return a response error with 422 when throw EntityValidationError", () => {
      const appHelper = startApp();
      const validationErrors =
        CreateGenreFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(validationErrors).map((key) => ({
        label: key,
        value: validationErrors[key],
      }));
      test.each(arrange)("when body is $label", ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .post("/genres")
          .authenticate(appHelper.app)
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe("should create a genre", () => {
      const appHelper = startApp();
      const arrange = CreateGenreFixture.arrangeForSave();
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
          await categoryRepo.bulkInsert(relations.categories);
          const res = await request(appHelper.app.getHttpServer())
            .post("/genres")
            .authenticate(appHelper.app)
            .send(send_data)
            .expect(201);
          const keyInResponse = CreateGenreFixture.keysInResponse;
          expect(Object.keys(res.body)).toStrictEqual(["data"]);
          expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);
          const id = res.body.data.id;
          const genreCreated = await genreRepo.findById(new GenreId(id));
          const presenter = GenresController.serialize(
            GenreOutputMapper.toOutput(genreCreated!, relations.categories),
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
