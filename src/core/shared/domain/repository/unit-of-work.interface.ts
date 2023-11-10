import { Transaction } from "sequelize";
// import { AggregateRoot } from "../aggregate-root";

export interface IUnitOfWork {
  //   getAggregateRoots(): AggregateRoot[];
  //   addAggregateRoot(aggregateRoot: AggregateRoot): void;
  start(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  do<T>(workFn: (uow: IUnitOfWork) => Promise<T>): Promise<T>;
  getTransaction(): Transaction;
}
