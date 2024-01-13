import { RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import { Injectable } from "@nestjs/common";

@Injectable()
export class RabbitMQFakeConsumer {
  @RabbitSubscribe({
    exchange: "amq.direct",
    queue: "fake-queue",
    routingKey: "fake-queue",
  })
  handle(msg) {
    console.log(msg);
  }
}
