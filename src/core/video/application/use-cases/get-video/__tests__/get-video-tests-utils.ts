import { CastMember } from "@core/cast-member/domain/cast-member.aggregate";
import { Category } from "@core/category/domain/category.aggregate";
import { Genre } from "@core/genre/domain/genre.aggregate";
import { Video } from "@core/video/domain/video.aggregate";
import { VideoOutputMapper } from "../../common/video-output";

export function expectVideoOutput(
  video: Video,
  categories: Category[],
  genres: Genre[],
  castMembers: CastMember[],
) {
  const expected = VideoOutputMapper.toOutput({
    video,
    allCategoriesOfVideoAndGenre: categories,
    genres: [genres[0], genres[1]],
    cast_members: [castMembers[0], castMembers[1]],
  });

  expected.categories_id = expect.arrayContaining(
    expected.categories_id.map((id: string) => id),
  );
  expected.categories = expect.arrayContaining(
    expected.categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      created_at: category.created_at,
    })),
  );

  expected.genres_id = expect.arrayContaining(
    expected.genres_id.map((id: string) => id),
  );
  expected.genres = expect.arrayContaining(
    expected.genres.map((genre: any) => ({
      id: genre.id,
      name: genre.name,
      is_active: genre.is_active,
      created_at: genre.created_at,
      categories_id: expect.arrayContaining(
        genre.categories_id.map((id: string) => id),
      ),
      categories: expect.arrayContaining(
        genre.categories.map((category: any) => ({
          id: category.id,
          name: category.name,
          created_at: category.created_at,
        })),
      ),
    })),
  );

  expected.cast_members_id = expect.arrayContaining(
    expected.cast_members_id.map((id: string) => id),
  );
  expected.cast_members = expect.arrayContaining(
    expected.cast_members.map((cast_member: any) => ({
      id: cast_member.id,
      name: cast_member.name,
      type: cast_member.type,
      created_at: cast_member.created_at,
    })),
  );

  return expected;
}
