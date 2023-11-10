import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { UnitOfWorkSequelize } from "./unit-of-work-sequelize";
import { setupSequelize } from "../../testing/helpers";

type StubModelProps = {
  key: number;
  field: string;
};

@Table({ tableName: "stubs", timestamps: false })
export class StubModel extends Model<StubModelProps> {
  @PrimaryKey
  @Column({ type: DataType.INTEGER })
  declare key: number;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare field: string;
}

describe("UnitOfWorkSequelize Unit Tests", () => {
  let uow: UnitOfWorkSequelize;
  let spyValidateTransaction: never;
  const sequelizeHelper = setupSequelize({
    models: [StubModel],
  });

  beforeEach(async () => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    //@ts-expect-error - validateTransaction is private
    spyValidateTransaction = jest.spyOn(uow, "validateTransaction");
  });

  it("should create a transaction", async () => {
    await uow.start();
    expect(uow.getTransaction()).not.toBeNull();
    await uow.commit();
    expect(uow.getTransaction()).toBeNull();
    expect(spyValidateTransaction).toHaveBeenCalledTimes(1);
  });

  it("should commit a transaction", async () => {
    await uow.start();
    await StubModel.create(
      { key: 1, field: "stub field" },
      { transaction: uow.getTransaction() },
    );
    await uow.commit();
    const foundStub = await StubModel.findByPk(1);
    expect(foundStub!.field).toBe("stub field");
    expect(uow.getTransaction()).toBeNull();
    expect(spyValidateTransaction).toHaveBeenCalledTimes(1);
  });

  it("should rollback a transaction", async () => {
    await uow.start();
    await StubModel.create(
      { key: 1, field: "stub field" },
      { transaction: uow.getTransaction() },
    );
    await uow.rollback();
    await expect(StubModel.findByPk(1)).resolves.toBeNull();
    expect(uow.getTransaction()).toBeNull();
    expect(spyValidateTransaction).toHaveBeenCalledTimes(1);
  });

  it("should do an auto transaction successfully", async () => {
    await uow.do(async () => {
      return StubModel.create({ key: 1, field: "stub field" });
    });
    const foundStub = await StubModel.findByPk(1);
    expect(foundStub!.field).toBe("stub field");
    expect(uow.getTransaction()).toBeNull();
    expect(spyValidateTransaction).not.toHaveBeenCalled();
  });

  it("should rollback an auto transaction with Error", async () => {
    expect.assertions(5);
    await StubModel.create({ key: 1, field: "stub field" });
    try {
      await uow.do(async () => {
        await StubModel.update(
          { field: "another stub field" },
          {
            where: {
              key: 1,
            },
          },
        );
        const updatedStub = await StubModel.findByPk(1);
        expect(updatedStub!.field).toBe("another stub field");
        throw new Error("rollback test");
      });
    } catch (e) {
      expect(e.message).toBe("rollback test");
    }
    const foundStub = await StubModel.findByPk(1);
    expect(foundStub!.field).toBe("stub field");
    expect(uow.getTransaction()).toBeNull();
    expect(spyValidateTransaction).not.toHaveBeenCalled();
  });

  it("should do a started transaction successfully", async () => {
    await uow.start();
    await uow.do(async () => {
      return StubModel.create({ key: 1, field: "stub field" });
    });
    await uow.commit();
    const foundStub = await StubModel.findByPk(1);
    expect(foundStub!.field).toBe("stub field");
    expect(uow.getTransaction()).toBeNull();
    expect(spyValidateTransaction).toHaveBeenCalledTimes(1);
  });

  it("should rollback a started transaction with Error", async () => {
    expect.assertions(5);
    await StubModel.create({ key: 1, field: "stub field" });
    try {
      await uow.start();
      await uow.do(async () => {
        await StubModel.update(
          { field: "another stub field" },
          {
            where: {
              key: 1,
            },
          },
        );
        const updatedStub = await StubModel.findByPk(1);
        expect(updatedStub!.field).toBe("another stub field");
        throw new Error("rollback test");
      });
    } catch (e) {
      expect(e.message).toBe("rollback test");
    }
    const foundStub = await StubModel.findByPk(1);
    expect(foundStub!.field).toBe("stub field");
    expect(uow.getTransaction()).toBeNull();
    expect(spyValidateTransaction).not.toHaveBeenCalled();
  });
});
