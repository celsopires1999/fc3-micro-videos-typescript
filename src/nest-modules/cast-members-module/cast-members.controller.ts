import { CastMemberOutput } from "@core/cast-member/application/use-cases/common/cast-member-output";
import { CreateCastMemberUseCase } from "@core/cast-member/application/use-cases/create-cast-member/create-cast-member.use-case";
import { DeleteCastMemberUseCase } from "@core/cast-member/application/use-cases/delete-cast-member/delete-cast-member.use-case";
import { GetCastMemberUseCase } from "@core/cast-member/application/use-cases/get-cast-member/get-cast-member.use-case";
import { ListCastMembersUseCase } from "@core/cast-member/application/use-cases/list-cast-members/list-cast-members.use-case";
import { UpdateCastMemberUseCase } from "@core/cast-member/application/use-cases/update-cast-member/update-cast-member.use-case";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import {
  CastMemberCollectionPresenter,
  CastMemberPresenter,
} from "./cast-members.presenter";
import { CreateCastMemberDto } from "./dto/create-cast-member.dto";
import { UpdateCastMemberDto } from "./dto/update-cast-member.dto";
import { SearchCastMemberDto } from "./dto/search-cast-members.dto";

@Controller("cast-members")
export class CastMembersController {
  @Inject(CreateCastMemberUseCase)
  private createUseCase: CreateCastMemberUseCase;

  @Inject(UpdateCastMemberUseCase)
  private updateUseCase: UpdateCastMemberUseCase;

  @Inject(DeleteCastMemberUseCase)
  private deleteUseCase: DeleteCastMemberUseCase;

  @Inject(GetCastMemberUseCase)
  private getUseCase: GetCastMemberUseCase;

  @Inject(ListCastMembersUseCase)
  private listUseCase: ListCastMembersUseCase;

  @Post()
  async create(@Body() createCastMemberDto: CreateCastMemberDto) {
    const output = await this.createUseCase.execute(createCastMemberDto);
    return CastMembersController.serialize(output);
  }

  @Get()
  async search(@Query() searchParams: SearchCastMemberDto) {
    const output = await this.listUseCase.execute(searchParams);
    return new CastMemberCollectionPresenter(output);
  }

  @Get(":id")
  async findOne(
    @Param("id", new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
  ) {
    const output = await this.getUseCase.execute({ id });
    return CastMembersController.serialize(output);
  }

  @Patch(":id")
  async update(
    @Param("id", new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
    @Body() updateCastMemberDto: UpdateCastMemberDto,
  ) {
    const output = await this.updateUseCase.execute({
      id,
      ...updateCastMemberDto,
    });
    return CastMembersController.serialize(output);
  }

  @HttpCode(204)
  @Delete(":id")
  remove(
    @Param("id", new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
  ) {
    return this.deleteUseCase.execute({ id });
  }

  static serialize(output: CastMemberOutput) {
    return new CastMemberPresenter(output);
  }
}
