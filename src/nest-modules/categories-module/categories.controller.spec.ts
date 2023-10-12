import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseModule } from "../database-module/database.module";
import { CategoriesController } from "./categories.controller";
import { CategoriesModule } from "./categories.module";
import { ConfigModule } from "../config-module/config.module";

describe("CategoriesController", () => {
  let controller: CategoriesController;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), DatabaseModule, CategoriesModule],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  afterEach(async () => {
    await module.close();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
