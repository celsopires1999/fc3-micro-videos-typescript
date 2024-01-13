import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { Controller, Get } from "@nestjs/common";

@Controller("rabbitmq-fake")
export class RabbitmqFakeController {
  constructor(private amqConnection: AmqpConnection) {}

  @Get()
  async publishMessage() {
    await this.amqConnection.publish("amq.direct", "fake-queue", {
      message: "Hello Celso!",
    });
  }
}
