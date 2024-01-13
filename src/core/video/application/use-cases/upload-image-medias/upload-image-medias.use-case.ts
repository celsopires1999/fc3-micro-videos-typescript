import { IStorage } from "@core/shared/application/storage.interface";
import { IUseCase } from "@core/shared/application/use-case.interface";
import { NotFoundError } from "@core/shared/domain/errors/not-found.error";
import { IUnitOfWork } from "@core/shared/domain/repository/unit-of-work.interface";
import { EntityValidationError } from "@core/shared/domain/validators/validation.error";
import { Banner } from "@core/video/domain/banner.vo";
import { ThumbnailHalf } from "@core/video/domain/thumbnail-half.vo";
import { Thumbnail } from "@core/video/domain/thumbnail.vo";
import { Video, VideoId } from "@core/video/domain/video.aggregate";
import { IVideoRepository } from "@core/video/domain/video.repository";
import { UploadImageMediasInput } from "./upload-image-medias.input";

export class UploadImageMediasUseCase
  implements IUseCase<UploadImageMediasInput, UploadImageMediasOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private videoRepo: IVideoRepository,
    private storage: IStorage,
  ) {}

  async execute(
    input: UploadImageMediasInput,
  ): Promise<UploadImageMediasOutput> {
    const videoId = new VideoId(input.video_id);
    const video = await this.videoRepo.findById(videoId);

    if (!video) {
      throw new NotFoundError(input.video_id, Video);
    }

    const imagesMap = {
      banner: Banner,
      thumbnail: Thumbnail,
      thumbnail_half: ThumbnailHalf,
    };

    const [image, errorImage] = imagesMap[input.field]
      .createFromFile({
        ...input.file,
        video_id: videoId,
      })
      .asArray();

    if (errorImage) {
      throw new EntityValidationError([
        { [input.field]: [errorImage.message] },
      ]);
    }

    image instanceof Banner && video.replaceBanner(image);
    image instanceof Thumbnail && video.replaceThumbnail(image);
    image instanceof ThumbnailHalf && video.replaceThumbnailHalf(image);

    await this.storage.store({
      data: input.file.data,
      mime_type: input.file.mime_type,
      id: image!.url,
    });

    await this.uow.do(async () => {
      await this.videoRepo.update(video);
    });
  }
}

export type UploadImageMediasOutput = void;
