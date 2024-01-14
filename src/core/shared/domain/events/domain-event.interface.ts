import { Uuid } from "../value-objects/uuid.vo";
export interface IDomainEvent {
  aggregate_id: Uuid;
  occurred_on: Date;
  event_version: number;

  getIntegrationEvent?(): IIntegrationEvent;
}

export interface IIntegrationEvent<T = any> {
  event_version: number;
  occurred_on: Date;
  payload: T;
  event_name: string;
}
