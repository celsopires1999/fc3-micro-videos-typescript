import { CastMemberId } from "@core/cast-member/domain/cast-member.aggregate";
import { CategoryId } from "@core/category/domain/category.aggregate";
import { GenreId } from "@core/genre/domain/genre.aggregate";
import { Notification } from "@core/shared/domain/validators/notification";
import { LoadEntityError } from "@core/shared/domain/validators/validation.error";
import { Banner } from "@core/video/domain/banner.vo";
import { Rating } from "@core/video/domain/rating.vo";
import { ThumbnailHalf } from "@core/video/domain/thumbnail-half.vo";
import { Thumbnail } from "@core/video/domain/thumbnail.vo";
import { Trailer } from "@core/video/domain/trailer.vo";
import { VideoMedia } from "@core/video/domain/video-media.vo";
import { Video, VideoId } from "@core/video/domain/video.aggregate";
import {
  AudioVideoMediaModel,
  AudioVideoMediaRelatedField,
} from "./audio-video-media.model";
import { ImageMediaModel, ImageMediaRelatedField } from "./image-media.model";
import {
  VideoCastMemberModel,
  VideoCategoryModel,
  VideoGenreModel,
  VideoModel,
} from "./video.model";

export class VideoModelMapper {
  static toEntity(model: VideoModel) {
    const {
      video_id: id,
      categories_id = [],
      genres_id = [],
      cast_members_id = [],
      image_medias = [],
      audio_video_medias = [],
      ...otherData
    } = model.toJSON();

    const categoriesId = categories_id.map(
      (c) => new CategoryId(c.category_id),
    );
    const genresId = genres_id.map((c) => new GenreId(c.genre_id));
    const castMembersId = cast_members_id.map(
      (c) => new CastMemberId(c.cast_member_id),
    );

    const notification = new Notification();
    if (!categoriesId.length) {
      notification.addError(
        "categories_id should not be empty",
        "categories_id",
      );
    }
    if (!genresId.length) {
      notification.addError("genres_id should not be empty", "genres_id");
    }

    if (!castMembersId.length) {
      notification.addError(
        "cast_members_id should not be empty",
        "cast_members_id",
      );
    }

    const bannerModel = image_medias.find(
      (i) => i.video_related_field === "banner",
    );
    const banner = bannerModel
      ? new Banner({
          name: bannerModel.name,
          location: bannerModel.location,
        })
      : undefined;

    const thumbnailModel = image_medias.find(
      (i) => i.video_related_field === "thumbnail",
    );
    const thumbnail = thumbnailModel
      ? new Thumbnail({
          name: thumbnailModel.name,
          location: thumbnailModel.location,
        })
      : undefined;

    const thumbnailHalfModel = image_medias.find(
      (i) => i.video_related_field === "thumbnail_half",
    );

    const thumbnailHalf = thumbnailHalfModel
      ? new ThumbnailHalf({
          name: thumbnailHalfModel.name,
          location: thumbnailHalfModel.location,
        })
      : undefined;

    const trailerModel = audio_video_medias.find(
      (i) => i.video_related_field === "trailer",
    );

    const trailer = trailerModel
      ? new Trailer({
          name: trailerModel.name,
          raw_location: trailerModel.raw_location,
          encoded_location: trailerModel.encoded_location!,
          status: trailerModel.status,
        })
      : undefined;

    const videoModel = audio_video_medias.find(
      (i) => i.video_related_field === "video",
    );

    const videoMedia = videoModel
      ? new VideoMedia({
          name: videoModel.name,
          raw_location: videoModel.raw_location,
          encoded_location: videoModel.encoded_location!,
          status: videoModel.status,
        })
      : undefined;

    const [rating, errorRating] = Rating.create(otherData.rating).asArray();

    if (errorRating) {
      notification.addError(errorRating.message, "rating");
    }

    const videoEntity = new Video({
      ...otherData,
      rating: rating!,
      video_id: new VideoId(id),
      banner,
      thumbnail,
      thumbnail_half: thumbnailHalf,
      trailer,
      video: videoMedia,
      categories_id: new Map(categoriesId.map((c) => [c.id, c])),
      genres_id: new Map(genresId.map((c) => [c.id, c])),
      cast_members_id: new Map(castMembersId.map((c) => [c.id, c])),
    });

    videoEntity.validate();

    notification.copyErrors(videoEntity.notification);

    if (notification.hasErrors()) {
      throw new LoadEntityError(notification.toJSON());
    }

    return videoEntity;
  }

  static toModelProps(entity: Video) {
    const {
      banner,
      thumbnail,
      thumbnail_half,
      trailer,
      video,
      categories_id,
      genres_id,
      cast_members_id,
      ...otherData
    } = entity.toJSON();
    return {
      ...otherData,
      image_medias: [
        {
          media: banner,
          video_related_field: ImageMediaRelatedField.BANNER,
        },
        {
          media: thumbnail,
          video_related_field: ImageMediaRelatedField.THUMBNAIL,
        },
        {
          media: thumbnail_half,
          video_related_field: ImageMediaRelatedField.THUMBNAIL_HALF,
        },
      ]
        .map((item) => {
          return item.media
            ? ImageMediaModel.build({
                video_id: entity.video_id.id,
                name: item.media.name,
                location: item.media.location,
                video_related_field: item.video_related_field as any,
              } as any)
            : null;
        })
        .filter(Boolean) as ImageMediaModel[],

      audio_video_medias: [trailer, video]
        .map((audio_video_media, index) => {
          return audio_video_media
            ? AudioVideoMediaModel.build({
                video_id: entity.video_id.id,
                name: audio_video_media.name,
                raw_location: audio_video_media.raw_location,
                encoded_location: audio_video_media.encoded_location,
                status: audio_video_media.status,
                video_related_field:
                  index === 0
                    ? AudioVideoMediaRelatedField.TRAILER
                    : AudioVideoMediaRelatedField.VIDEO,
              } as any)
            : null;
        })
        .filter(Boolean) as AudioVideoMediaModel[],
      categories_id: categories_id.map((category_id) =>
        VideoCategoryModel.build({
          video_id: entity.video_id.id,
          category_id: category_id,
        }),
      ),
      genres_id: genres_id.map((category_id) =>
        VideoGenreModel.build({
          video_id: entity.video_id.id,
          genre_id: category_id,
        }),
      ),
      cast_members_id: cast_members_id.map((cast_member_id) =>
        VideoCastMemberModel.build({
          video_id: entity.video_id.id,
          cast_member_id: cast_member_id,
        }),
      ),
    };
  }
}
