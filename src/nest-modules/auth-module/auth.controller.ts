import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";

export class Input {
  @MaxLength(100)
  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  email: string;

  @MaxLength(20)
  @MinLength(8)
  password: string;
}

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post()
  login(@Body() body: Input) {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(AuthGuard)
  @Get()
  protected() {
    return { message: "ok" };
  }
}
