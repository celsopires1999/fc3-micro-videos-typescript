import { CategoryModel } from "@core/category/infra/db/sequelize/category.model";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SequelizeModule } from "@nestjs/sequelize";
import { CONFIG_SCHEMA_TYPE } from "../config-module/config.module";

const models = [CategoryModel];

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: async (configService: ConfigService<CONFIG_SCHEMA_TYPE>) => {
        const dbVendor = configService.get("DB_VENDOR");
        if (dbVendor === "sqlite") {
          return {
            dialect: "sqlite",
            host: configService.get("DB_HOST"),
            models,
            autoLoadModels: configService.get("DB_AUTO_LOAD_MODELS"),
            logging: configService.get("DB_LOGGING"),
          };
        }

        if (dbVendor === "mysql") {
          return {
            dialect: "mysql",
            host: configService.get("DB_HOST"),
            port: configService.get("DB_PORT"),
            database: configService.get("DB_DATABASE"),
            username: configService.get("DB_USERNAME"),
            password: configService.get("DB_PASSWORD"),
            models,
            autoLoadModels: configService.get("DB_AUTO_LOAD_MODELS"),
            logging: configService.get("DB_LOGGING"),
          };
        }

        throw new Error(`Unsupported database configuration: ${dbVendor}`);
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
