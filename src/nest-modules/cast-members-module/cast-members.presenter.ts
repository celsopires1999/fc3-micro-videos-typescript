import { CastMemberOutput } from "@core/cast-member/application/use-cases/common/cast-member-output";
import { ListCastMembersOutput } from "@core/cast-member/application/use-cases/list-cast-members/list-cast-members.use-case";
import { CastMemberTypes } from "@core/cast-member/domain/cast-member-type.vo";
import { Transform } from "class-transformer";
import { CollectionPresenter } from "../shared-module/collection.presenter";

export class CastMemberPresenter {
  id: string;
  name: string;
  type: CastMemberTypes;
  @Transform(({ value }: { value: Date }) => value.toISOString())
  created_at: Date;

  constructor(output: CastMemberOutput) {
    this.id = output.id;
    this.name = output.name;
    this.type = output.type;
    this.created_at = output.created_at;
  }
}

export class CastMemberCollectionPresenter extends CollectionPresenter {
  data: CastMemberPresenter[];

  constructor(output: ListCastMembersOutput) {
    const { items, ...paginationProps } = output;
    super(paginationProps);
    this.data = items.map((i) => new CastMemberPresenter(i));
  }
}
