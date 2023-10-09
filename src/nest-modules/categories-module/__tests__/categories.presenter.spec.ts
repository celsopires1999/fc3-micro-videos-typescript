import { CategoryOutput } from "@core/category/application/use-cases/common/category-output";
import { instanceToPlain } from "class-transformer";
import { CategoryPresenter } from "../categories.presenter";

describe("CategoryPresenter Unit Test", () => {
  it("should convert an output into a presenter", () => {
    const created_at = new Date("2023-10-08 21:50:00");
    console.log(created_at);
    const output: CategoryOutput = {
      id: "f804236f-937b-4fb5-abda-a9b267c77b96",
      name: "some name",
      description: "some description",
      is_active: true,
      created_at,
    };
    const presenter = new CategoryPresenter(output);

    expect(instanceToPlain(presenter)).toStrictEqual({
      id: "f804236f-937b-4fb5-abda-a9b267c77b96",
      name: "some name",
      description: "some description",
      is_active: true,
      created_at: "2023-10-08T21:50:00.000Z",
    });
  });
});
