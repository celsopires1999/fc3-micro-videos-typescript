import { UpdateVideoInputConstructorProps } from "../update-video.input";

export class UpdateVideoInputFixture {
  static arrangeInvalid() {
    const arrange: {
      label: string;
      send_data: UpdateVideoInputConstructorProps;
      expected: {
        value: string | number | string[];
        property: string;
        constraints: object;
      };
    }[] = [
      {
        label: "invalid video_id",
        send_data: {
          //@ts-expect-error - this is a test
          id: 9,
        },
        expected: {
          value: 9,
          property: "id",
          constraints: { isString: "id must be a string" },
        },
      },
      {
        label: "invalid title",
        send_data: {
          id: "1",
          //@ts-expect-error - this is a test
          title: 9,
        },
        expected: {
          value: 9,
          property: "title",
          constraints: { isString: "title must be a string" },
        },
      },
      {
        label: "invalid description",
        send_data: {
          id: "1",
          title: "title",
          //@ts-expect-error - this is a test
          description: 9,
        },
        expected: {
          value: 9,
          property: "description",
          constraints: { isString: "description must be a string" },
        },
      },
      {
        label: "invalid year_launched",
        send_data: {
          id: "1",
          //@ts-expect-error - this is a test
          year_launched: "invalid",
        },
        expected: {
          value: "invalid",
          property: "year_launched",
          constraints: {
            isInt: "year_launched must be an integer number",
            min: "year_launched must not be less than 1900",
          },
        },
      },
      {
        label: "invalid duration with string",
        send_data: {
          id: "1",
          //@ts-expect-error - this is a test
          duration: "invalid",
        },
        expected: {
          value: "invalid",
          property: "duration",
          constraints: {
            isInt: "duration must be an integer number",
            min: "duration must not be less than 1",
          },
        },
      },
      {
        label: "invalid duration with 0",
        send_data: {
          id: "1",
          duration: 0,
        },
        expected: {
          value: 0,
          property: "duration",
          constraints: {
            min: "duration must not be less than 1",
          },
        },
      },
      {
        label: "invalid duration with -1",
        send_data: {
          id: "1",
          duration: -1,
        },
        expected: {
          value: -1,
          property: "duration",
          constraints: {
            min: "duration must not be less than 1",
          },
        },
      },
      {
        label: "invalid rating",
        send_data: {
          id: "1",
          //@ts-expect-error - this is a test
          rating: 9,
        },
        expected: {
          value: 9,
          property: "rating",
          constraints: {
            isString: "rating must be a string",
          },
        },
      },
      {
        label: "invalid is_opened",
        send_data: {
          id: "1",
          //@ts-expect-error - this is a test
          is_opened: 9,
        },
        expected: {
          value: 9,
          property: "is_opened",
          constraints: {
            isBoolean: "is_opened must be a boolean value",
          },
        },
      },
      {
        label: "invalid categories_id without UUID",
        send_data: {
          id: "1",
          categories_id: ["1", "2"],
        },
        expected: {
          value: ["1", "2"],
          property: "categories_id",
          constraints: {
            isUuid: "each value in categories_id must be a UUID",
          },
        },
      },
      {
        label: "invalid categories_id without array",
        send_data: {
          id: "1",
          //@ts-expect-error - this is a test
          categories_id: "invalid",
        },
        expected: {
          value: "invalid",
          property: "categories_id",
          constraints: {
            isArray: "categories_id must be an array",
            isUuid: "each value in categories_id must be a UUID",
          },
        },
      },
      {
        label: "invalid genres_id without UUID",
        send_data: {
          id: "1",
          genres_id: ["1", "2"],
        },
        expected: {
          value: ["1", "2"],
          property: "genres_id",
          constraints: {
            isUuid: "each value in genres_id must be a UUID",
          },
        },
      },
      {
        label: "invalid genres_id without array",
        send_data: {
          id: "1",
          //@ts-expect-error - this is a test
          genres_id: "invalid",
        },
        expected: {
          value: "invalid",
          property: "genres_id",
          constraints: {
            isArray: "genres_id must be an array",
            isUuid: "each value in genres_id must be a UUID",
          },
        },
      },
      {
        label: "invalid cast_members_id without UUID",
        send_data: {
          id: "1",
          cast_members_id: ["1", "2"],
        },
        expected: {
          value: ["1", "2"],
          property: "cast_members_id",
          constraints: {
            isUuid: "each value in cast_members_id must be a UUID",
          },
        },
      },
      {
        label: "invalid cast_members_id without array",
        send_data: {
          id: "1",
          //@ts-expect-error - this is a test
          cast_members_id: "invalid",
        },
        expected: {
          value: "invalid",
          property: "cast_members_id",
          constraints: {
            isArray: "cast_members_id must be an array",
            isUuid: "each value in cast_members_id must be a UUID",
          },
        },
      },
    ];
    return arrange;
  }
}
