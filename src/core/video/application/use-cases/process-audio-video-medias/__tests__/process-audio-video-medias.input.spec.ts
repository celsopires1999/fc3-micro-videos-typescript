import { AudioVideoMediaStatus } from "@core/shared/domain/value-objects/audio-video-media.vo";
import {
  ProcessAudioVideoMediasInput,
  ValidateProcessAudioVideoMediasInput,
} from "../process-audio-video-medias.input";
import { ProcessAudioVideoMediasInputFixture } from "./process-audio-video-medias.input.fixture";

describe("ProcessAudioVideoMediasInput Unit Tests", () => {
  describe("invalid input", () => {
    const arrange = ProcessAudioVideoMediasInputFixture.arrangeInvalid();
    test.each(arrange)("when input has $label", ({ send_data, expected }) => {
      const input = new ProcessAudioVideoMediasInput(send_data);
      const expectedResult = [
        {
          target: {
            video_id: send_data.video_id,
            encoded_location: send_data.encoded_location,
            field: send_data.field,
            status: send_data.status,
          },
          value: expected.value,
          property: expected.property,
          children: [],
          constraints: expected.constraints,
        },
      ];
      const errors = ValidateProcessAudioVideoMediasInput.validate(input);
      expect(errors).toEqual(expectedResult);
    });
  });
  test("valid input", () => {
    const input = new ProcessAudioVideoMediasInput({
      video_id: "2fd18fce-349d-4975-b763-4276cc28ffe3",
      encoded_location: "encoded_location",
      field: "trailer",
      status: AudioVideoMediaStatus.COMPLETED,
    });
    const errors = ValidateProcessAudioVideoMediasInput.validate(input);
    expect(errors).toHaveLength(0);
  });
});
