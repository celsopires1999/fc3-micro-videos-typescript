import { Genre, GenreId } from "@core/genre/domain/genre.aggregate";
import {
  GenreSearchParams,
  GenreSearchResult,
  IGenreRepository,
} from "@core/genre/domain/genre.repository";
import { InvalidArgumentError } from "@core/shared/domain/errors/invalid-argument.error";
import { SortDirection } from "@core/shared/domain/repository/search-params";
import { UnitOfWorkSequelize } from "@core/shared/infra/db/sequelize/unit-of-work-sequelize";
import { Op, literal } from "sequelize";
import { NotFoundError } from "../../../../shared/domain/errors/not-found.error";
import { GenreModelMapper } from "./genre-model-mapper";
import { GenreModel } from "./genre.model";

export class GenreSequelizeRepository implements IGenreRepository {
  sortableFields: string[] = ["name", "created_at"];
  orderBy = {
    mysql: {
      name: (sort_dir: SortDirection) =>
        `binary ${this.genreModel.name}.name ${sort_dir}`,
    },
  };

  constructor(
    private genreModel: typeof GenreModel,
    private uow: UnitOfWorkSequelize,
  ) {}

  async insert(aggregate: Genre): Promise<void> {
    await this.genreModel.create(GenreModelMapper.toModelProps(aggregate), {
      include: ["categories_id"],
      transaction: this.uow.getTransaction(),
    });
  }

  async bulkInsert(aggregate: Genre[]): Promise<void> {
    const models = aggregate.map((e) => GenreModelMapper.toModelProps(e));
    await this.genreModel.bulkCreate(models, {
      include: ["categories_id"],
      transaction: this.uow.getTransaction(),
    });
  }

  async update(aggregate: Genre): Promise<void> {
    const model = await this._get(aggregate.genre_id.id);

    if (!model) {
      throw new NotFoundError(aggregate.genre_id.id, this.getEntity());
    }

    await model.$remove(
      "categories",
      model.categories_id.map((c) => c.category_id),
    );
    const { categories_id, ...props } =
      GenreModelMapper.toModelProps(aggregate);
    await this.genreModel.update(props, {
      where: { genre_id: aggregate.genre_id.id },
    });
    await model.$add(
      "categories",
      categories_id.map((c) => c.category_id),
    );
  }

  async delete(id: GenreId): Promise<void> {
    const genreCategoryRelation =
      this.genreModel.associations.categories_id.target;
    await genreCategoryRelation.destroy({
      where: { genre_id: id.id },
      transaction: this.uow.getTransaction(),
    });

    const affectedRows = await this.genreModel.destroy({
      where: { genre_id: id.id },
    });

    if (affectedRows !== 1) {
      throw new NotFoundError(id, this.getEntity());
    }
  }

  async findById(id: GenreId): Promise<Genre | null> {
    const model = await this._get(id.id);
    return model ? GenreModelMapper.toEntity(model) : null;
  }

  private async _get(id: string): Promise<GenreModel | null> {
    return this.genreModel.findByPk(id, {
      include: ["categories_id"],
      transaction: this.uow.getTransaction(),
    });
  }

  async findAll(): Promise<Genre[]> {
    const models = await this.genreModel.findAll({
      include: ["categories_id"],
      transaction: this.uow.getTransaction(),
    });
    return models.map((m) => GenreModelMapper.toEntity(m));
  }

  async findByIds(ids: GenreId[]): Promise<Genre[]> {
    const models = await this.genreModel.findAll({
      where: {
        genre_id: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
      include: ["categories_id"],
      transaction: this.uow.getTransaction(),
    });
    return models.map((m) => GenreModelMapper.toEntity(m));
  }

  async existsById(
    ids: GenreId[],
  ): Promise<{ exists: GenreId[]; not_exists: GenreId[] }> {
    if (!ids.length) {
      throw new InvalidArgumentError(
        "ids must be an array with at least one element",
      );
    }

    const existsGenreModels = await this.genreModel.findAll({
      attributes: ["genre_id"],
      where: {
        genre_id: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
      transaction: this.uow.getTransaction(),
    });
    const existsGenreIds = existsGenreModels.map(
      (m) => new GenreId(m.genre_id),
    );
    const notExistsGenreIds = ids.filter(
      (id) => !existsGenreIds.some((e) => e.equals(id)),
    );
    return {
      exists: existsGenreIds,
      not_exists: notExistsGenreIds,
    };
  }

  async search(props: GenreSearchParams): Promise<GenreSearchResult> {
    const offset = (props.page - 1) * props.per_page;
    const limit = props.per_page;
    const genreCategoryRelation =
      this.genreModel.associations.categories_id.target;
    const genreTableName = this.genreModel.getTableName();
    const genreCategoryTableName = genreCategoryRelation.getTableName();
    const genreAlias = this.genreModel.name;

    const wheres: any[] = [];

    if (props.filter && (props.filter.name || props.filter.categories_id)) {
      if (props.filter.name) {
        wheres.push({
          field: "name",
          value: `%${props.filter.name}%`,
          get condition() {
            return {
              [this.field]: {
                [Op.like]: this.value,
              },
            };
          },
          rawCondition: `${genreAlias}.name LIKE :name`,
        });
      }

      if (props.filter.categories_id) {
        wheres.push({
          field: "categories_id",
          value: props.filter.categories_id.map((c) => c.id),
          get condition() {
            return {
              ["$categories_id.category_id$"]: {
                [Op.in]: this.value,
              },
            };
          },
          rawCondition: `${genreCategoryTableName}.category_id IN (:categories_id)`,
        });
      }
    }

    const orderBy =
      props.sort && this.sortableFields.includes(props.sort)
        ? this.formatSort(props.sort, props.sort_dir!)
        : `${genreAlias}.\`created_at\` DESC`;

    //@ts-expect-error - count is a number
    const count: number = await this.genreModel.count({
      distinct: true,
      //@ts-expect-error - add include only if categories_id is defined
      include: [props.filter?.categories_id && "categories_id"].filter(
        (i) => i,
      ),
      where: wheres.length ? { [Op.and]: wheres.map((w) => w.condition) } : {},
      transaction: this.uow.getTransaction(),
    });

    const columnOrder = orderBy.replace("binary", "").trim().split(" ")[0];

    const query = [
      "SELECT",
      `DISTINCT ${genreAlias}.\`genre_id\`,${columnOrder} FROM ${genreTableName} as ${genreAlias}`,
      props.filter?.categories_id
        ? `INNER JOIN ${genreCategoryTableName} ON ${genreAlias}.\`genre_id\` = ${genreCategoryTableName}.\`genre_id\``
        : "",
      wheres.length
        ? `WHERE ${wheres.map((w) => w.rawCondition).join(" AND ")}`
        : "",
      `ORDER BY ${orderBy}`,
      `LIMIT ${limit}`,
      `OFFSET ${offset}`,
    ];

    const [idsResult] = await this.genreModel.sequelize!.query(
      query.join(" "),
      {
        replacements: wheres.reduce(
          (acc, w) => ({ ...acc, [w.field]: w.value }),
          {},
        ),
        transaction: this.uow.getTransaction(),
      },
    );

    const models = await this.genreModel.findAll({
      where: {
        genre_id: {
          [Op.in]: idsResult.map(
            (id: { genre_id: string }) => id.genre_id,
          ) as string[],
        },
      },
      include: ["categories_id"],
      order: literal(orderBy),
      transaction: this.uow.getTransaction(),
    });

    return new GenreSearchResult({
      items: models.map((m) => GenreModelMapper.toEntity(m)),
      current_page: props.page,
      per_page: props.per_page,
      total: count,
    });
  }

  private formatSort(sort: string, sort_dir: SortDirection) {
    const dialect = this.genreModel.sequelize!.getDialect();
    if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
      return this.orderBy[dialect][sort](sort_dir);
    }
    return [[sort, sort_dir]];
  }

  getEntity(): new (...args: any[]) => Genre {
    return Genre;
  }
}
