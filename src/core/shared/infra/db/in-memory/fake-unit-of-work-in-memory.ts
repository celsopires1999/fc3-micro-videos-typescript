// import { AggregateRoot } from "@core/shared/domain/aggregate-root";
import { IUnitOfWork } from "@core/shared/domain/repository/unit-of-work.interface";

export class UnitOfWorkFakeInMemory implements IUnitOfWork {
  //   private aggregateRoots: Set<AggregateRoot> = new Set();

  //   constructor() {}

  //   getAggregateRoots(): AggregateRoot[] {
  //     return [...this.aggregateRoots];
  //   }
  //   addAggregateRoot(aggregateRoot: AggregateRoot): void {
  //     this.aggregateRoots.add(aggregateRoot);
  //   }
  async start(): Promise<void> {
    return;
  }
  async commit(): Promise<void> {
    return;
  }
  async rollback(): Promise<void> {
    return;
  }
  async do<T>(workFn: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
    return workFn(this);
  }

  getTransaction(): void {
    return;
  }
}
