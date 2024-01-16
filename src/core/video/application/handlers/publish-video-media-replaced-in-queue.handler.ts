import { IIntegrationEventHandler } from "@core/shared/application/domain-event-handler.interface";
import { IMessageBroker } from "@core/shared/application/message-broker.interface";
import { VideoAudioMediaUploadedIntegrationEvent } from "@core/video/domain/domain-events/video-audio-media-replaced.event";
import { OnEvent } from "@nestjs/event-emitter";

export class PublishVideoMediaReplacedInQueueHandler
  implements IIntegrationEventHandler
{
  constructor(private messageBroker: IMessageBroker) {}

  @OnEvent(VideoAudioMediaUploadedIntegrationEvent.name)
  async handle(event: VideoAudioMediaUploadedIntegrationEvent): Promise<void> {
    await this.messageBroker.publishEvent(event);
  }
}
