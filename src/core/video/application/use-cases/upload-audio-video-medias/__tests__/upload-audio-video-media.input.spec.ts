import { FileMediaInput } from "../../common/file-media.input";
import {
  UploadAudioVideoMediaInput,
  ValidateUploadVideoMediaInput,
} from "../upload-audio-video-media.input";
import { UploadAudioVideoMediaInputFixture } from "./upload-audio-video-media.input.fixture";

describe("UploadAudioVideoMediaInput Unit Tests", () => {
  describe("invalid input", () => {
    const arrange = UploadAudioVideoMediaInputFixture.arrangeInvalid();
    test.each(arrange)("when input has $label", ({ send_data, expected }) => {
      const input = new UploadAudioVideoMediaInput(send_data);
      const expectedResult = [
        {
          target: {
            ...send_data,
          },
          ...expected,
        },
      ];
      const errors = ValidateUploadVideoMediaInput.validate(input);
      expect(errors).toEqual(expectedResult);
    });
  });
  test("valid input", () => {
    const data = Buffer.alloc(1024);
    const input = new UploadAudioVideoMediaInput({
      video_id: "2fd18fce-349d-4975-b763-4276cc28ffe3",
      field: "video",
      file: new FileMediaInput({
        data,
        mime_type: "mime_type",
        raw_name: "raw_name",
        size: data.length,
      }),
    });
    const errors = ValidateUploadVideoMediaInput.validate(input);
    expect(errors).toHaveLength(0);
  });
});
