import { SignJWT } from "jose";
import { nanoid } from "nanoid";

interface UserData {
  userId: number | string;
  email: string;
  nickname: string;
}

export class JwtService {
  static async createToken(userData: UserData): Promise<string> {
    return new SignJWT({
      userId: userData.userId,
      email: userData.email,
      nickname: userData.nickname,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setJti(nanoid())
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(new TextEncoder().encode(process.env.JWT_SECRET_KEY));
  }
}
