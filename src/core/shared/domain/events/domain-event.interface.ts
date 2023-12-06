import { Uuid } from "../value-objects/uuid.vo";
export interface IDomainEvent {
  aggregate_id: Uuid;
  occurred_on: Date;
  event_version: number;
}
