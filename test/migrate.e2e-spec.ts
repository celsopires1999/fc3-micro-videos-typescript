import { migrator } from "@core/shared/infra/db/sequelize/migrator";
import { getConnectionToken } from "@nestjs/sequelize";
import { Test, TestingModule } from "@nestjs/testing";
import { Umzug } from "umzug";
import { MigrationsModule } from "../src/nest-modules/database-module/migrations.module";

describe("Migrate (e2e)", () => {
  let umzug: Umzug;
  const totalMigrations = 10;
  const expectedMigrations = [
    "2023.10.28T22.20.59.create-cast-members-table.ts",
    "2023.10.21T21.53.18.create-categories-table.ts",
    "2023.12.27T15.36.39.create-genres-table.ts",
    "2023.12.27T15.36.40.create-category-genre-table.ts",
    "2023.12.27T15.36.39.create-videos-table.ts",
    "2023.12.27T15.36.40.create-category-video-table.ts",
    "2023.12.27T15.36.41.create-genre-video-table.ts",
    "2023.12.27T15.36.42.create-cast-member-video-table.ts",
    "2023.12.27T15.36.43.create-audio-video-medias-table.ts",
    "2023.12.27T15.36.43.create-image-medias-table.ts",
  ];
  let moduleFixture: TestingModule;

  beforeEach(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [MigrationsModule],
    }).compile();

    const sequelize = moduleFixture.get(getConnectionToken());
    umzug = migrator(sequelize, { logger: undefined });
  });

  afterEach(async () => {
    await moduleFixture?.close();
  });

  test("up command", async () => {
    await umzug.down({ to: 0 as any });
    const result = await umzug.up();
    expect(result).toHaveLength(totalMigrations);

    const foundMigrations = result.map((migration) => migration.name);
    expect(foundMigrations).toEqual(expectedMigrations);
  });

  test("down command", async () => {
    await umzug.up();
    const result = await umzug.down({ to: 0 as any });
    expect(result).toHaveLength(totalMigrations);

    const foundMigrations = result.map((migration) => migration.name).reverse();
    expect(foundMigrations).toEqual(expectedMigrations);
  });
});
