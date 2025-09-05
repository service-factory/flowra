import { getFetch, postFetch } from "@/lib/requests/customFetch";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USER_DATA_URL = "https://www.googleapis.com/oauth2/v1/userinfo";

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
}

interface GoogleUserData {
  id: string;
  email: string;
  name: string;
  picture: string;
  verified_email: boolean;
}

export class GoogleAuthService {
  static async getToken(code: string): Promise<GoogleTokenResponse> {
    const result = await postFetch<any, GoogleTokenResponse>({
      url: GOOGLE_TOKEN_URL,
      body: new URLSearchParams({
        code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
      options: {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    });

    return result;
  }

  static async getUserData(accessToken: string): Promise<GoogleUserData> {
    const result = await getFetch<any, GoogleUserData>({
      url: `${GOOGLE_USER_DATA_URL}?access_token=${accessToken}`,
      options: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    return result;
  }
}
