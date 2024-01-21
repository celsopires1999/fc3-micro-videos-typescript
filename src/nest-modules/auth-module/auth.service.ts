import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  login(email: string, password: string) {
    // alguma lógica para validar o usuário
    if (password != "12345678") {
      throw new Error("Invalid password");
    }
    const payload = { email, name: "John Doe" };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
