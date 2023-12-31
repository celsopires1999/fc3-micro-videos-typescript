import { Controller, Get, Inject } from "@nestjs/common";
import EventEmitter2 from "eventemitter2";

@Controller("fake-event")
export class FakeController {
  @Inject()
  private readonly eventEmitter: EventEmitter2;

  @Get()
  dispatchEvent() {
    this.eventEmitter.emit("test", { data: "events data" });
    return { ok: true };
  }
}
