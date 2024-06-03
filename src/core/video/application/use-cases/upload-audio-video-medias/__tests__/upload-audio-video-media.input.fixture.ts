import { FileMediaInput } from "../../common/file-media.input";
import { UploadAudioVideoMediaInputConstructorProps } from "../upload-audio-video-media.input";

export class UploadAudioVideoMediaInputFixture {
  static arrangeInvalid() {
    const data = Buffer.alloc(1024);
    const file = new FileMediaInput({
      data,
      mime_type: "video/mp4",
      raw_name: "test.mp4",
      size: data.length,
    });
    const arrange: {
      label: string;
      send_data: UploadAudioVideoMediaInputConstructorProps;
      expected: {
        value: string | number | object;
        property: string;
        children: object[];
        constraints?: object;
      };
    }[] = [
      {
        label: "invalid video_id",
        send_data: {
          //@ts-expect-error - this is a test
          video_id: 9,
          field: "video",
          file,
        },
        expected: {
          value: 9,
          property: "video_id",
          children: [],
          constraints: {
            isString: "video_id must be a string",
            isUuid: "video_id must be a UUID",
          },
        },
      },
      {
        label: "invalid field",
        send_data: {
          video_id: "2fd18fce-349d-4975-b763-4276cc28ffe3",
          //@ts-expect-error - this is a test
          field: "invalid",
          file,
        },
        expected: {
          value: "invalid",
          property: "field",
          children: [],
          constraints: {
            isIn: "field must be one of the following values: trailer, video",
          },
        },
      },
      {
        label: "invalid file",
        send_data: {
          video_id: "2fd18fce-349d-4975-b763-4276cc28ffe3",
          field: "video",
          file: new FileMediaInput({
            //@ts-expect-error - this is a test
            data: "fake",
            //@ts-expect-error - this is a test
            mime_type: 999,
            //@ts-expect-error - this is a test
            raw_name: 999,
            //@ts-expect-error - this is a test
            size: "fake",
          }),
        },
        expected: {
          value: {
            data: "fake",
            mime_type: 999,
            raw_name: 999,
            size: "fake",
          },
          property: "file",
          children: [
            {
              target: {
                raw_name: 999,
                data: "fake",
                mime_type: 999,
                size: "fake",
              },
              value: 999,
              property: "raw_name",
              children: [],
              constraints: { isString: "raw_name must be a string" },
            },
            {
              target: {
                raw_name: 999,
                data: "fake",
                mime_type: 999,
                size: "fake",
              },
              value: "fake",
              property: "data",
              children: [],
              constraints: { isInstance: "data must be an instance of Buffer" },
            },
            {
              target: {
                raw_name: 999,
                data: "fake",
                mime_type: 999,
                size: "fake",
              },
              value: 999,
              property: "mime_type",
              children: [],
              constraints: { isString: "mime_type must be a string" },
            },
            {
              target: {
                raw_name: 999,
                data: "fake",
                mime_type: 999,
                size: "fake",
              },
              value: "fake",
              property: "size",
              children: [],
              constraints: { isInt: "size must be an integer number" },
            },
          ],
        },
      },
    ];
    return arrange;
  }
}
