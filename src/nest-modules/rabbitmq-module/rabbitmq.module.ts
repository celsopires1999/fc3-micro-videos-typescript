import { RabbitMQMessageBroker } from "@core/shared/infra/message-broker/rabbitmq-message-broker";
import { AmqpConnection, RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { DynamicModule } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

// @Module({
//   imports: [
//     RabbitMQModule.forRootAsync(RabbitMQModule, {
//       useFactory: (configService: ConfigService) => ({
//         uri: configService.get("RABBITMQ_URI") as string,
//       }),
//       inject: [ConfigService],
//     }),
//   ],
//   providers: [
//     {
//       provide: "IMessageBroker",
//       useFactory: (amqConnection: AmqpConnection) => {
//         return new RabbitMQMessageBroker(amqConnection);
//       },
//       inject: [AmqpConnection],
//     },
//   ],
//   exports: ["IMessageBroker"],
// })
export class RabbitmqModule {
  static forRoot(): DynamicModule {
    return {
      module: RabbitmqModule,
      imports: [
        RabbitMQModule.forRootAsync(RabbitMQModule, {
          useFactory: (configService: ConfigService) => ({
            uri: configService.get("RABBITMQ_URI") as string,
          }),
          inject: [ConfigService],
        }),
      ],
      global: true,
      exports: [RabbitMQModule],
    };
  }
  static forFeature(): DynamicModule {
    return {
      module: RabbitmqModule,
      providers: [
        {
          provide: "IMessageBroker",
          useFactory: (amqConnection: AmqpConnection) => {
            return new RabbitMQMessageBroker(amqConnection);
          },
          inject: [AmqpConnection],
        },
      ],
      exports: ["IMessageBroker"],
    };
  }
}
