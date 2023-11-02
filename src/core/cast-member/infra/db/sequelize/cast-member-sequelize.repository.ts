import { Op, literal } from "sequelize";
import { NotFoundError } from "../../../../shared/domain/errors/not-found.error";

import {
  CastMember,
  CastMemberId,
} from "@core/cast-member/domain/cast-member.aggregate";
import {
  CastMemberSearchParams,
  CastMemberSearchResult,
  ICastMemberRepository,
} from "@core/cast-member/domain/cast-member.repository";
import { SortDirection } from "@core/shared/domain/repository/search-params";
import { CastMemberModelMapper } from "./cast-member-model-mapper";
import { CastMemberModel } from "./cast-member.model";
import { InvalidArgumentError } from "@core/shared/domain/errors/invalid-argument.error";

export class CastMemberSequelizeRepository implements ICastMemberRepository {
  sortableFields: string[] = ["name", "created_at"];
  orderBy = {
    mysql: {
      name: (sort_dir: SortDirection) => literal(`binary name ${sort_dir}`),
    },
  };

  constructor(private castMemberModel: typeof CastMemberModel) {}

  async insert(entity: CastMember): Promise<void> {
    await this.castMemberModel.create(entity.toJSON());
  }

  async bulkInsert(entities: CastMember[]): Promise<void> {
    await this.castMemberModel.bulkCreate(entities.map((e) => e.toJSON()));
  }

  async update(entity: CastMember): Promise<void> {
    const id = entity.cast_member_id.id;

    const [affectedRows] = await this.castMemberModel.update(entity.toJSON(), {
      where: { cast_member_id: entity.cast_member_id.id },
    });

    if (affectedRows !== 1) {
      throw new NotFoundError(id, this.getEntity());
    }
  }

  async delete(cast_member_id: CastMemberId): Promise<void> {
    const id = cast_member_id.id;

    const affectedRows = await this.castMemberModel.destroy({
      where: { cast_member_id: id },
    });

    if (affectedRows !== 1) {
      throw new NotFoundError(id, this.getEntity());
    }
  }

  async findById(id: CastMemberId): Promise<CastMember | null> {
    const model = await this._get(id.id);
    return model ? CastMemberModelMapper.toEntity(model) : null;
  }

  private async _get(id: string): Promise<CastMemberModel | null> {
    return this.castMemberModel.findByPk(id);
  }

  async findAll(): Promise<CastMember[]> {
    const models = await this.castMemberModel.findAll();
    return models.map((m) => CastMemberModelMapper.toEntity(m));
  }

  async findByIds(ids: CastMemberId[]): Promise<CastMember[]> {
    const models = await this.castMemberModel.findAll({
      where: {
        cast_member_id: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
    });
    return models.map((m) => CastMemberModelMapper.toEntity(m));
  }

  async existsById(
    ids: CastMemberId[],
  ): Promise<{ exists: CastMemberId[]; not_exists: CastMemberId[] }> {
    if (!ids.length) {
      throw new InvalidArgumentError(
        "ids must be an array with at least one element",
      );
    }

    const existsCastMemberModels = await this.castMemberModel.findAll({
      attributes: ["cast_member_id"],
      where: {
        cast_member_id: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
    });
    const existsCastMemberIds = existsCastMemberModels.map(
      (m) => new CastMemberId(m.cast_member_id),
    );
    const notExistsCastMemberIds = ids.filter(
      (id) => !existsCastMemberIds.some((e) => e.equals(id)),
    );
    return {
      exists: existsCastMemberIds,
      not_exists: notExistsCastMemberIds,
    };
  }

  async search(props: CastMemberSearchParams): Promise<CastMemberSearchResult> {
    const offset = (props.page - 1) * props.per_page;
    const limit = props.per_page;

    const where = {};

    if (props.filter && (props.filter.name || props.filter.type)) {
      if (props.filter.name) {
        where["name"] = { [Op.like]: `%${props.filter.name}%` };
      }

      if (props.filter.type) {
        where["type"] = props.filter.type.type;
      }
    }

    const { rows: models, count } = await this.castMemberModel.findAndCountAll({
      ...(props.filter && {
        where,
      }),
      ...(props.sort && this.sortableFields.includes(props.sort)
        ? { order: this.formatSort(props.sort, props.sort_dir!) }
        : { order: [["created_at", "DESC"]] }),
      offset,
      limit,
    });
    return new CastMemberSearchResult({
      items: models.map((m) => CastMemberModelMapper.toEntity(m)),
      current_page: props.page,
      per_page: props.per_page,
      total: count,
    });
  }

  // to be checked
  private formatSort(sort: string, sort_dir: SortDirection) {
    const dialect = this.castMemberModel.sequelize!.getDialect() as "mysql";
    if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
      return this.orderBy[dialect][sort](sort_dir);
    }
    return [[sort, sort_dir]];
  }

  getEntity(): new (...args: any[]) => CastMember {
    return CastMember;
  }
}
