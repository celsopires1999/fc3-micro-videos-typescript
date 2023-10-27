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

export class CastMemberSequelizeRepository implements ICastMemberRepository {
  sortableFields: string[] = ["name", "created_at"];
  orderBy = {
    mysql: {
      name: (sort_dir: SortDirection) => literal(`binary name ${sort_dir}`),
    },
  };

  constructor(private castMemberModel: typeof CastMemberModel) {}

  async insert(entity: CastMember): Promise<void> {
    const modelProps = CastMemberModelMapper.toModel(entity);
    await this.castMemberModel.create(modelProps.toJSON());
  }

  async bulkInsert(entities: CastMember[]): Promise<void> {
    const modelsProps = entities.map((entity) =>
      CastMemberModelMapper.toModel(entity).toJSON(),
    );
    await this.castMemberModel.bulkCreate(modelsProps);
  }

  async update(entity: CastMember): Promise<void> {
    const id = entity.cast_member_id.id;

    const modelProps = CastMemberModelMapper.toModel(entity);
    const [affectedRows] = await this.castMemberModel.update(
      modelProps.toJSON(),
      {
        where: { cast_member_id: entity.cast_member_id.id },
      },
    );

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

  async findById(entity_id: CastMemberId): Promise<CastMember | null> {
    const model = await this.castMemberModel.findByPk(entity_id.id);

    return model ? CastMemberModelMapper.toEntity(model) : null;
  }

  async findAll(): Promise<CastMember[]> {
    const models = await this.castMemberModel.findAll();
    return models.map((model) => {
      return CastMemberModelMapper.toEntity(model);
    });
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
        ? { order: this.formatSort(props.sort, props.sort_dir) }
        : { order: [["created_at", "DESC"]] }),
      offset,
      limit,
    });
    return new CastMemberSearchResult({
      items: models.map((model) => {
        return CastMemberModelMapper.toEntity(model);
      }),
      current_page: props.page,
      per_page: props.per_page,
      total: count,
    });
  }

  private formatSort(sort: string, sort_dir: SortDirection) {
    const dialect = this.castMemberModel.sequelize.getDialect();
    if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
      return this.orderBy[dialect][sort](sort_dir);
    }
    return [[sort, sort_dir]];
  }

  getEntity(): new (...args: any[]) => CastMember {
    return CastMember;
  }
}
