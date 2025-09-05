import { getFetch, postFetch } from "@/lib/requests/customFetch";

const KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token";
const KAKAO_USER_DATA_URL = "https://kapi.kakao.com/v2/user/me";

interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
}

interface KakaoUserData {
  id: number;
  kakao_account: {
    email: string;
  };
  properties: {
    nickname: string;
    profile_image?: string | null;
  };
}

export class KakaoAuthService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor() {
    this.clientId = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY!;
    this.clientSecret = process.env.NEXT_PUBLIC_KAKAO_CLIENT_SECRET!;
    this.redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI!;
  }

  async getToken(code: string): Promise<KakaoTokenResponse> {
    const result = await postFetch<any, KakaoTokenResponse>({
      url: KAKAO_TOKEN_URL,
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        code,
      }),
      options: {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    });

    return result;
  }

  async getUserData(accessToken: string): Promise<KakaoUserData> {
    const result = await getFetch<any, KakaoUserData>({
      url: KAKAO_USER_DATA_URL,
      options: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    return result;
  }
}
