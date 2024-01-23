import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { Request } from "express";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jtwService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    //Bearer XXXXX
    const token = request.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      // const payload = this.jtwService.verify(token, { secret: "123456" });
      const payload = this.jtwService.verify(token);
      request["user"] = payload;
      return true;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
