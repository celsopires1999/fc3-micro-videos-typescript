import { migrator } from "@core/shared/infra/db/sequelize/migrator";
import { getConnectionToken } from "@nestjs/sequelize";
import { Test, TestingModule } from "@nestjs/testing";
import { Umzug } from "umzug";
import { MigrationsModule } from "../src/nest-modules/database-module/migrations.module";

describe("Migrate (e2e)", () => {
  let umzug: Umzug;
  const totalMigrations = 1;
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
    expect(result[0].name).toBe(
      "2023.10.21T21.53.18.create-categories-table.ts",
    );
    expect(
      result[0].path.endsWith(
        "category/infra/db/sequelize/migrations/2023.10.21T21.53.18.create-categories-table.ts",
      ),
    ).toBeTruthy();
  });

  test("down command", async () => {
    await umzug.up();
    const result = await umzug.down({ to: 0 as any });
    expect(result).toHaveLength(totalMigrations);
    expect(result[0].name).toBe(
      "2023.10.21T21.53.18.create-categories-table.ts",
    );
    expect(
      result[0].path.endsWith(
        "category/infra/db/sequelize/migrations/2023.10.21T21.53.18.create-categories-table.ts",
      ),
    ).toBeTruthy();
  });
});
