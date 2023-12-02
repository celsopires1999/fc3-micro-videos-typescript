import { UnitOfWorkSequelize } from "@core/shared/infra/db/sequelize/unit-of-work-sequelize";
import { Global, Module, Scope } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SequelizeModule, getConnectionToken } from "@nestjs/sequelize";
import { Sequelize } from "sequelize";
import { CONFIG_SCHEMA_TYPE } from "../config-module/config.module";

@Global()
@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: async (configService: ConfigService<CONFIG_SCHEMA_TYPE>) => {
        const dbVendor = configService.get("DB_VENDOR");
        if (dbVendor === "sqlite") {
          return {
            dialect: "sqlite",
            host: configService.get("DB_HOST"),
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
            autoLoadModels: configService.get("DB_AUTO_LOAD_MODELS"),
            logging: configService.get("DB_LOGGING"),
          };
        }

        throw new Error(`Unsupported database configuration: ${dbVendor}`);
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: UnitOfWorkSequelize,
      useFactory: (sequelize: Sequelize) => {
        return new UnitOfWorkSequelize(sequelize);
      },
      inject: [getConnectionToken()],
      scope: Scope.REQUEST,
    },
    {
      provide: "UnitOfWork",
      useExisting: UnitOfWorkSequelize,
      scope: Scope.REQUEST,
    },
  ],
  exports: ["UnitOfWork"],
})
export class DatabaseModule {}
