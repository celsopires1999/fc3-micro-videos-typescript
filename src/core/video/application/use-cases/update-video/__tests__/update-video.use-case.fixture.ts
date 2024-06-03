import { Category } from "@core/category/domain/category.aggregate";
import { UpdateVideoInputConstructorProps } from "../update-video.input";
import { Genre } from "@core/genre/domain/genre.aggregate";
import { CastMember } from "@core/cast-member/domain/cast-member.aggregate";
import { Video } from "@core/video/domain/video.aggregate";

export class UpdateVideoUseCaseFixture {
  static arrangeInvalid() {
    const categories = Category.fake().theCategories(3).build();
    const genres = Genre.fake()
      .theGenres(3)
      .addCategoryId(categories[0].category_id)
      .addCategoryId(categories[1].category_id)
      .addCategoryId(categories[2].category_id)
      .build();
    const castMembers = CastMember.fake().theCastMembers(3).build();
    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(categories[0].category_id)
      .addCategoryId(categories[1].category_id)
      .addCategoryId(categories[2].category_id)
      .addGenreId(genres[0].genre_id)
      .addGenreId(genres[1].genre_id)
      .addGenreId(genres[2].genre_id)
      .addCastMemberId(castMembers[0].cast_member_id)
      .addCastMemberId(castMembers[1].cast_member_id)
      .addCastMemberId(castMembers[2].cast_member_id)
      .build();

    const arrange: {
      label: string;
      relations: {
        categories: Category[];
        genres: Genre[];
        castMembers: CastMember[];
      };
      video: Video;
      send_data: UpdateVideoInputConstructorProps;
      expected: object[];
    }[] = [
      {
        label: "category_id not found",
        relations: {
          categories,
          genres,
          castMembers,
        },
        video,
        send_data: {
          id: video.video_id.id,
          categories_id: ["0828ac21-05d3-481a-aaf4-63c5f9a55b04"],
        },
        expected: [
          {
            categories_id: [
              "Category Not Found using ID 0828ac21-05d3-481a-aaf4-63c5f9a55b04",
            ],
          },
        ],
      },
      {
        label: "genres_id not found",
        relations: {
          categories,
          genres,
          castMembers,
        },
        video,
        send_data: {
          id: video.video_id.id,
          genres_id: ["0828ac21-05d3-481a-aaf4-63c5f9a55b04"],
        },
        expected: [
          {
            genres_id: [
              "Genre Not Found using ID 0828ac21-05d3-481a-aaf4-63c5f9a55b04",
            ],
          },
        ],
      },
      {
        label: "cast_members_id not found",
        relations: {
          categories,
          genres,
          castMembers,
        },
        video,
        send_data: {
          id: video.video_id.id,
          cast_members_id: ["0828ac21-05d3-481a-aaf4-63c5f9a55b04"],
        },
        expected: [
          {
            cast_members_id: [
              "CastMember Not Found using ID 0828ac21-05d3-481a-aaf4-63c5f9a55b04",
            ],
          },
        ],
      },
      {
        label: "title too long",
        relations: {
          categories,
          genres,
          castMembers,
        },
        video,
        send_data: {
          id: video.video_id.id,
          title: "t".repeat(256),
        },
        expected: [
          {
            title: ["title must be shorter than or equal to 255 characters"],
          },
        ],
      },
    ];

    return arrange;
  }
}
