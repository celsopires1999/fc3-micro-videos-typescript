import { SearchValidationError } from "@core/shared/domain/validators/validation.error";
import { ISearchableRepository } from "../../shared/domain/repository/repository-interface";
import {
  SearchParams,
  SearchParamsConstructorProps,
} from "../../shared/domain/repository/search-params";
import { SearchResult } from "../../shared/domain/repository/search-result";
import { CastMemberType, CastMemberTypes } from "./cast-member-type.vo";
import { CastMember, CastMemberId } from "./cast-member.aggregate";
import { Either } from "@core/shared/domain/either";

export type CastMemberFilter = {
  name?: string;
  type?: CastMemberType;
};

export class CastMemberSearchParams extends SearchParams<CastMemberFilter> {
  private constructor(
    props: SearchParamsConstructorProps<CastMemberFilter> = {},
  ) {
    super(props);
  }

  static create(
    props: Omit<SearchParamsConstructorProps<CastMemberFilter>, "filter"> & {
      filter?: {
        name?: string;
        type?: CastMemberTypes;
      };
    } = {},
  ) {
    const [type, errorCastMemberType] = Either.of(props.filter?.type)
      .map((type) => type || null)
      .chain((type) => (type ? CastMemberType.create(type) : Either.of(null)));

    if (errorCastMemberType) {
      const error = new SearchValidationError([
        { type: [errorCastMemberType.message] },
      ]);
      throw error;
    }
    return new CastMemberSearchParams({
      ...props,
      filter: {
        name: props.filter?.name || undefined,
        type: type,
      },
    });
  }

  get filter(): CastMemberFilter | null {
    return this._filter;
  }

  protected set filter(value: CastMemberFilter | null) {
    const _value =
      !value || (value as unknown) === "" || typeof value !== "object"
        ? null
        : value;

    const filter = {
      ...(_value?.name && { name: `${_value?.name}` }),
      ...(_value?.type && { type: _value.type }),
    };

    this._filter = Object.keys(filter).length === 0 ? null : filter;
  }
}

export class CastMemberSearchResult extends SearchResult<CastMember> {}

export interface ICastMemberRepository
  extends ISearchableRepository<
    CastMember,
    CastMemberId,
    CastMemberFilter,
    CastMemberSearchParams,
    CastMemberSearchResult
  > {}
