import { ICastMemberRepository } from "@core/cast-member/domain/cast-member.repository";
import { ICategoryRepository } from "@core/category/domain/category.repository";
import { IGenreRepository } from "@core/genre/domain/genre.repository";
import {
  PaginationOutput,
  PaginationOutputMapper,
} from "@core/shared/application/pagination-output";
import { IUseCase } from "@core/shared/application/use-case.interface";
import {
  IVideoRepository,
  VideoSearchParams,
  VideoSearchResult,
} from "@core/video/domain/video.repository";
import { VideoOutput, VideoOutputMapper } from "../common/video-output";
import { ListVideosInput } from "./list-videos.input";

export class ListVideosUseCase
  implements IUseCase<ListVideosInput, ListVideosOutput>
{
  constructor(
    private videoRepo: IVideoRepository,
    private categoryRepo: ICategoryRepository,
    private genreRepo: IGenreRepository,
    private castMemberRepo: ICastMemberRepository,
  ) {}

  async execute(input: ListVideosInput): Promise<ListVideosOutput> {
    const params = VideoSearchParams.create(input);
    const searchResult = await this.videoRepo.search(params);
    return this.toOutput(searchResult);
  }

  private async toOutput(
    searchResult: VideoSearchResult,
  ): Promise<ListVideosOutput> {
    const { items: _items } = searchResult;
    const items = await Promise.all(
      _items.map(async (video) => {
        const genres = await this.genreRepo.findByIds(
          Array.from(video.genres_id.values()),
        );

        const allCategoriesOfVideoAndGenre = await this.categoryRepo.findByIds(
          Array.from(video.categories_id.values()).concat(
            genres.flatMap((g) => Array.from(g.categories_id.values())),
          ),
        );

        const cast_members = await this.castMemberRepo.findByIds(
          Array.from(video.cast_members_id.values()),
        );

        return VideoOutputMapper.toOutput({
          video,
          allCategoriesOfVideoAndGenre,
          genres,
          cast_members,
        });
      }),
    );
    return PaginationOutputMapper.toOutput(items, searchResult);
  }
}

export type ListVideosOutput = PaginationOutput<VideoOutput>;
