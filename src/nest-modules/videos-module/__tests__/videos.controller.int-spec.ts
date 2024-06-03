import { ICastMemberRepository } from "@core/cast-member/domain/cast-member.repository";
import { ICategoryRepository } from "@core/category/domain/category.repository";
import { IGenreRepository } from "@core/genre/domain/genre.repository";
import { UnitOfWorkSequelize } from "@core/shared/infra/db/sequelize/unit-of-work-sequelize";
import { CreateVideoUseCase } from "@core/video/application/use-cases/create-video/create-video.use-case";
import { DeleteVideoUseCase } from "@core/video/application/use-cases/delete-video/delete-video.use-case";
import { GetVideoUseCase } from "@core/video/application/use-cases/get-video/get-video.use-case";
import { ListVideosUseCase } from "@core/video/application/use-cases/list-videos/list-videos.use-case";
import { UpdateVideoUseCase } from "@core/video/application/use-cases/update-video/update-video.use-case";
import { IVideoRepository } from "@core/video/domain/video.repository";
import { getConnectionToken } from "@nestjs/sequelize";
import { Test, TestingModule } from "@nestjs/testing";
import { instanceToPlain } from "class-transformer";
import { Sequelize } from "sequelize-typescript";
import { Uuid } from "../../../core/shared/domain/value-objects/uuid.vo";
import { AuthModule } from "../../auth-module/auth.module";
import { CAST_MEMBERS_PROVIDERS } from "../../cast-members-module/cast-members.providers";
import { CATEGORY_PROVIDERS } from "../../categories-module/categories.providers";
import { ConfigModule } from "../../config-module/config.module";
import { DatabaseModule } from "../../database-module/database.module";
import { EventModule } from "../../event-module/event.module";
import { GENRES_PROVIDERS } from "../../genres-module/genres.providers";
import { SharedModule } from "../../shared-module/shared.module";
import { UseCaseModule } from "../../use-case-module/use-case.module";
import { RabbitmqModuleFake } from "../testing/rabbitmq-module-fake";
import {
  AVideoFixture,
  CreateVideoFixture,
  ListVideosFixture,
  UpdateVideoFixture,
} from "../testing/video-fixture";
import { VideosController } from "../videos.controller";
import { VideosModule } from "../videos.module";
import { VideoCollectionPresenter } from "../videos.presenter";
import { VIDEOS_PROVIDERS } from "../videos.providers";

describe("VideosController Integration Tests", () => {
  let controller: VideosController;
  let videoRepo: IVideoRepository;
  let categoryRepo: ICategoryRepository;
  let genreRepo: IGenreRepository;
  let castMemberRepo: ICastMemberRepository;
  let module: TestingModule;
  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        SharedModule,
        EventModule,
        UseCaseModule,
        DatabaseModule,
        AuthModule,
        RabbitmqModuleFake.forRoot(),
        VideosModule,
      ],
    })
      .overrideProvider("UnitOfWork")
      .useFactory({
        factory: (sequelize: Sequelize) => {
          return new UnitOfWorkSequelize(sequelize);
        },
        inject: [getConnectionToken()],
      })
      .compile();
    await module.init();

    controller = module.get(VideosController);
    videoRepo = module.get(
      VIDEOS_PROVIDERS.REPOSITORIES.VIDEO_REPOSITORY.provide,
    );
    categoryRepo = module.get(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
    genreRepo = module.get(
      GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
    );
    castMemberRepo = module.get(
      CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
    );
  });

  afterEach(async () => {
    await module?.close();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
    expect(controller["createUseCase"]).toBeInstanceOf(CreateVideoUseCase);
    expect(controller["getUseCase"]).toBeInstanceOf(GetVideoUseCase);
    expect(controller["updateUseCase"]).toBeInstanceOf(UpdateVideoUseCase);
    expect(controller["deleteUseCase"]).toBeInstanceOf(DeleteVideoUseCase);
    expect(controller["listUseCase"]).toBeInstanceOf(ListVideosUseCase);
  });

  describe("should create a video", () => {
    const arrange = CreateVideoFixture.arrangeForSave();

    test.each(arrange)(
      "with $label",
      async ({ send_data, expected, relations }) => {
        await categoryRepo.bulkInsert(relations.categories);
        await genreRepo.bulkInsert(relations.genres);
        await castMemberRepo.bulkInsert(relations.castMembers);
        const presenter = await controller.create(send_data);
        const entity = await videoRepo.findById(new Uuid(presenter.id));

        const serialized = instanceToPlain(presenter);
        expect(serialized).toEqual({
          ...expected,
          id: entity!.entity_id.id,
          created_at: entity!.created_at.toISOString(),
        });
      },
    );
  });

  describe("should update a video", () => {
    const arrange = UpdateVideoFixture.arrangeForSave();

    test.each(arrange)(
      "with $label",
      async ({ entity: video, send_data, expected, relations }) => {
        await Promise.all([
          categoryRepo.bulkInsert(relations.categories),
          genreRepo.bulkInsert(relations.genres),
          castMemberRepo.bulkInsert(relations.castMembers),
          videoRepo.insert(video),
        ]);

        const presenter = await controller.update(
          video.video_id.id,
          send_data,
          {},
        );
        const serialized = instanceToPlain(presenter);
        expect(serialized).toEqual(expected);
      },
    );
  });

  it("should get a video", async () => {
    const arrange = AVideoFixture.arrange();
    await Promise.all([
      categoryRepo.bulkInsert(arrange.relations.categories),
      genreRepo.bulkInsert(arrange.relations.genres),
      castMemberRepo.bulkInsert(arrange.relations.castMembers),
      videoRepo.insert(arrange.entity),
    ]);

    const presenter = await controller.findOne(arrange.entity.video_id.id);
    const serialized = instanceToPlain(presenter);
    expect(serialized).toEqual(arrange.expected);
  });

  it("should delete a video", async () => {
    const arrange = AVideoFixture.arrange();
    await Promise.all([
      categoryRepo.bulkInsert(arrange.relations.categories),
      genreRepo.bulkInsert(arrange.relations.genres),
      castMemberRepo.bulkInsert(arrange.relations.castMembers),
      videoRepo.insert(arrange.entity),
    ]);

    await controller.remove(arrange.entity.video_id.id);
    await expect(
      videoRepo.findById(arrange.entity.video_id),
    ).resolves.toBeNull();
  });

  describe("search method", () => {
    describe("should return videos using query empty ordered by created_at", () => {
      const { relations, entitiesMap, arrange } =
        ListVideosFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        await Promise.all([
          categoryRepo.bulkInsert(Array.from(relations.categories.values())),
          genreRepo.bulkInsert(Array.from(relations.genres.values())),
          castMemberRepo.bulkInsert(Array.from(relations.castMembers.values())),
          videoRepo.bulkInsert(Object.values(entitiesMap)),
        ]);
      });

      test.each(arrange)("with $label", async ({ send_data, expected }) => {
        const presenter = await controller.search(send_data);
        const { entities, ...paginatioProps } = expected;
        const expectedPresenter = new VideoCollectionPresenter({
          items: entities.map((e) => ({
            ...e.toJSON(),
            id: e.video_id.id,
            categories_id: expect.arrayContaining(
              Array.from(e.categories_id.keys()),
            ),
            categories: Array.from(e.categories_id.keys()).map((id) => ({
              id: relations.categories.get(id)!.category_id.id,
              name: relations.categories.get(id)!.name,
              created_at: relations.categories.get(id)!.created_at,
            })),
            genres_id: expect.arrayContaining(Array.from(e.genres_id.keys())),
            genres: Array.from(e.genres_id.keys()).map((id) => ({
              id: relations.genres.get(id)!.genre_id.id,
              name: relations.genres.get(id)!.name,
              is_active: relations.genres.get(id)!.is_active,
              categories_id: expect.arrayContaining(
                Array.from(relations.genres.get(id)!.categories_id.keys()),
              ),
              categories: Array.from(
                relations.genres.get(id)!.categories_id.keys(),
              ).map((id) => ({
                id: relations.categories.get(id)!.category_id.id,
                name: relations.categories.get(id)!.name,
                created_at: relations.categories.get(id)!.created_at,
              })),
              created_at: relations.genres.get(id)!.created_at,
            })),
            cast_members_id: expect.arrayContaining(
              Array.from(e.cast_members_id.keys()),
            ),
            cast_members: Array.from(e.cast_members_id.keys()).map((id) => ({
              id: relations.castMembers.get(id)!.cast_member_id.id,
              name: relations.castMembers.get(id)!.name,
              type: relations.castMembers.get(id)!.type.type,
              created_at: relations.castMembers.get(id)!.created_at,
            })),
          })),
          ...paginatioProps.meta,
        });
        presenter.data = presenter.data.map((item) => ({
          ...item,
          categories: expect.arrayContaining(item.categories),
          genres: expect.arrayContaining(item.genres),
          cast_members: expect.arrayContaining(item.cast_members),
        }));
        expect(presenter).toEqual(expectedPresenter);
      });
    });

    describe("should return output using pagination, sort and filter", () => {
      const { relations, entitiesMap, arrange } =
        ListVideosFixture.arrangeUnsorted();

      beforeEach(async () => {
        await Promise.all([
          categoryRepo.bulkInsert(Array.from(relations.categories.values())),
          genreRepo.bulkInsert(Array.from(relations.genres.values())),
          castMemberRepo.bulkInsert(Array.from(relations.castMembers.values())),
          videoRepo.bulkInsert(Object.values(entitiesMap)),
        ]);
      });

      test.each(arrange)("with $label", async ({ send_data, expected }) => {
        const presenter = await controller.search(send_data);
        const { entities, ...paginatioProps } = expected;
        const expectedPresenter = new VideoCollectionPresenter({
          items: entities.map((e) => ({
            ...e.toJSON(),
            id: e.video_id.id,
            categories_id: expect.arrayContaining(
              Array.from(e.categories_id.keys()),
            ),
            categories: Array.from(e.categories_id.keys()).map((id) => ({
              id: relations.categories.get(id)!.category_id.id,
              name: relations.categories.get(id)!.name,
              created_at: relations.categories.get(id)!.created_at,
            })),
            genres_id: expect.arrayContaining(Array.from(e.genres_id.keys())),
            genres: Array.from(e.genres_id.keys()).map((id) => ({
              id: relations.genres.get(id)!.genre_id.id,
              name: relations.genres.get(id)!.name,
              is_active: relations.genres.get(id)!.is_active,
              categories_id: expect.arrayContaining(
                Array.from(relations.genres.get(id)!.categories_id.keys()),
              ),
              categories: Array.from(
                relations.genres.get(id)!.categories_id.keys(),
              ).map((id) => ({
                id: relations.categories.get(id)!.category_id.id,
                name: relations.categories.get(id)!.name,
                created_at: relations.categories.get(id)!.created_at,
              })),
              created_at: relations.genres.get(id)!.created_at,
            })),
            cast_members_id: expect.arrayContaining(
              Array.from(e.cast_members_id.keys()),
            ),
            cast_members: Array.from(e.cast_members_id.keys()).map((id) => ({
              id: relations.castMembers.get(id)!.cast_member_id.id,
              name: relations.castMembers.get(id)!.name,
              type: relations.castMembers.get(id)!.type.type,
              created_at: relations.castMembers.get(id)!.created_at,
            })),
          })),
          ...paginatioProps.meta,
        });
        presenter.data = presenter.data.map((item) => ({
          ...item,
          categories: expect.arrayContaining(item.categories),
          genres: expect.arrayContaining(item.genres),
          cast_members: expect.arrayContaining(item.cast_members),
        }));
        expect(presenter).toEqual(expectedPresenter);
      });
    });
  });
});
