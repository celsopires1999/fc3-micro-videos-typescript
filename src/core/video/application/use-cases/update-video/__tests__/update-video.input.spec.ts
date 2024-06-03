import {
  UpdateVideoInput,
  ValidateUpdateVideoInput,
} from "../update-video.input";
import { UpdateVideoInputFixture } from "./update-video.input.fixture";

describe("UpdateVideoInput Unit Tests", () => {
  describe("invalid input", () => {
    const arrange = UpdateVideoInputFixture.arrangeInvalid();
    test.each(arrange)("when input has $label", ({ send_data, expected }) => {
      const input = new UpdateVideoInput(send_data);
      const expectedResult = [
        {
          target: {
            id: send_data.id,
            title: send_data.title,
            description: send_data.description,
            year_launched: send_data.year_launched,
            duration: send_data.duration,
            rating: send_data.rating,
            is_opened: send_data.is_opened,
            categories_id: send_data.categories_id,
            genres_id: send_data.genres_id,
            cast_members_id: send_data.cast_members_id,
          },
          value: expected.value,
          property: expected.property,
          children: [],
          constraints: expected.constraints,
        },
      ];
      const errors = ValidateUpdateVideoInput.validate(input);
      expect(errors).toEqual(expectedResult);
    });
  });
  test("valid input", () => {
    const input = new UpdateVideoInput({
      id: "2fd18fce-349d-4975-b763-4276cc28ffe3",
      year_launched: 2020,
    });
    const errors = ValidateUpdateVideoInput.validate(input);
    expect(errors).toHaveLength(0);
  });
});
