import { AudioVideoMediaStatus } from "@core/shared/domain/value-objects/audio-video-media.vo";
import { ProcessAudioVideoMediasInputConstructorProps } from "../process-audio-video-medias.input";

export class ProcessAudioVideoMediasInputFixture {
  static arrangeInvalid() {
    const arrange: {
      label: string;
      send_data: ProcessAudioVideoMediasInputConstructorProps;
      expected: { value: string; property: string; constraints: object };
    }[] = [
      {
        label: "invalid video_id",
        send_data: {
          video_id: "1",
          encoded_location: "encoded_location",
          field: "trailer",
          status: AudioVideoMediaStatus.COMPLETED,
        },
        expected: {
          value: "1",
          property: "video_id",
          constraints: { isUuid: "video_id must be a UUID" },
        },
      },
      {
        label: "invalid encoded_location",
        send_data: {
          video_id: "2fd18fce-349d-4975-b763-4276cc28ffe3",
          encoded_location: "",
          field: "trailer",
          status: AudioVideoMediaStatus.COMPLETED,
        },
        expected: {
          value: "",
          property: "encoded_location",
          constraints: { isNotEmpty: "encoded_location should not be empty" },
        },
      },
      {
        label: "invalid field",
        send_data: {
          video_id: "2fd18fce-349d-4975-b763-4276cc28ffe3",
          encoded_location: "encoded_location",
          //@ts-expect-error - this is a test
          field: "invalid",
          status: AudioVideoMediaStatus.COMPLETED,
        },
        expected: {
          value: "invalid",
          property: "field",
          constraints: {
            isIn: "field must be one of the following values: trailer, video",
          },
        },
      },
      {
        label: "invalid status",
        send_data: {
          video_id: "2fd18fce-349d-4975-b763-4276cc28ffe3",
          encoded_location: "encoded_location",
          field: "trailer",
          //@ts-expect-error - this is a test
          status: "invalid",
        },
        expected: {
          value: "invalid",
          property: "status",
          constraints: {
            isIn: "status must be one of the following values: completed, failed",
          },
        },
      },
    ];
    return arrange;
  }
}
