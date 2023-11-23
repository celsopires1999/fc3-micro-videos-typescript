import { GenreId } from "@core/genre/domain/genre.aggregate";
import { IGenreRepository } from "@core/genre/domain/genre.repository";
import { IUseCase } from "@core/shared/application/use-case.interface";
import { IUnitOfWork } from "@core/shared/domain/repository/unit-of-work.interface";

export class DeleteGenreUseCase
  implements IUseCase<DeleteGenreInput, DeleteGenreOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private genreRepo: IGenreRepository,
  ) {}

  async execute(input: DeleteGenreInput): Promise<DeleteGenreOutput> {
    const genreId = new GenreId(input.id);
    return this.uow.do(async () => {
      return this.genreRepo.delete(genreId);
    });
  }
}

export type DeleteGenreInput = {
  id: string;
};

type DeleteGenreOutput = void;
