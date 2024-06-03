import { IUseCase } from "@core/shared/application/use-case.interface";
import { IUnitOfWork } from "@core/shared/domain/repository/unit-of-work.interface";
import { VideoId } from "@core/video/domain/video.aggregate";
import { IVideoRepository } from "@core/video/domain/video.repository";

export class DeleteVideoUseCase
  implements IUseCase<DeleteVideoInput, DeleteVideoOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private videoRepo: IVideoRepository,
  ) {}

  async execute(input: DeleteVideoInput): Promise<DeleteVideoOutput> {
    const videoId = new VideoId(input.id);
    return this.uow.do(async () => {
      return this.videoRepo.delete(videoId);
    });
  }
}

export type DeleteVideoInput = {
  id: string;
};

type DeleteVideoOutput = void;
