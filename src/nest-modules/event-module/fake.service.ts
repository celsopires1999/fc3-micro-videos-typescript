import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class FakeService {
  @OnEvent("test")
  handle(event: any) {
    console.log("test event: ", event);
  }
}
