import { cookies } from "next/headers";
import { SESSION_TOKEN_KEY } from "../constants/common";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface ApiRequestOptions {
  method?: HttpMethod;
  headers?: HeadersInit;
  next?: RequestInit["next"];
  cache?: RequestInit["cache"];
}

interface StatusErrorT {
  status: number;
  message: string;
}

const MAINTENANCE_STAUTUS_CODE = 550;

const STATUS_MESSAGES: Record<number, string> = {
  400: "Bad Request. Please check your input.",
  401: "Unauthorized. Please log in again.",
  403: "Forbidden. You don't have access to this resource.",
  404: "Resource not found. Please check the URL.",
  500: "Internal Server Error. Please try again later.",
};

class StatusError extends Error {
  status: number;
  message: string;

  constructor({ status, message }: StatusErrorT) {
    super(message);
    this.status = status;
    this.message = message;
    Object.setPrototypeOf(this, StatusError.prototype);
  }
}

const handleResponseErrors = (response: Response): void => {
  if (response.status >= 200 && response.status < 400) return;

  const errorMessage =
    STATUS_MESSAGES[response.status] ||
    `Unexpected error: ${response.statusText}`;

  throw new StatusError({
    status: response.status,
    message: errorMessage,
  });
};

const handleMaintenanceMode = (response: Response): boolean => {
  if (response.status !== MAINTENANCE_STAUTUS_CODE) return true;

  return false;
};

const createHeaders = async (options?: ApiRequestOptions): Promise<HeadersInit> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_TOKEN_KEY);

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token?.value}`,
    ...options?.headers,
  };
};

const buildQueryParams = (queryParam?: Record<string, unknown>): string => {
  const params = new URLSearchParams();

  if (queryParam) {
    Object.entries(queryParam).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          params.append(key, String(item));
        });
      }

      if (
        value !== undefined &&
        value !== null &&
        (typeof value === "string" || typeof value === "number")
      ) {
        params.append(key, String(value));
      }
    });
  }

  return params.toString();
};

export class APIRequest {
  makeRequest = async <REQ_DATA, RES_DATA>({
    url,
    method,
    body,
    queryParam,
    options,
  }: {
    url: string;
    method: HttpMethod;
    body?: REQ_DATA | URLSearchParams | string;
    queryParam?: Record<string, unknown>;
    options?: ApiRequestOptions;
  }): Promise<RES_DATA> => {
    const headers = await createHeaders(options);

    const stringifiedParams = buildQueryParams(queryParam);
    const fetchUrl = stringifiedParams ? `${url}?${stringifiedParams}` : url;

    const getStringifiedBody = (): BodyInit | null | undefined => {
      if (method === "GET") return undefined;

      if (body instanceof URLSearchParams) return body;

      if (typeof body === "object") return JSON.stringify(body);

      return body as BodyInit;
    };

    const fetchOptions: RequestInit = {
      method,
      headers,
      body: getStringifiedBody(),
      next: options?.next,
      cache: options?.cache,
    };

    try {
      const response = await fetch(fetchUrl, fetchOptions);
      if (!handleMaintenanceMode(response)) {
        return (await response.json()) as RES_DATA;
      }

      handleResponseErrors(response);

      return (await response.json()) as RES_DATA;
    } catch (error) {
      if (error instanceof StatusError) {
        console.error("Fetch Error:", error);
        throw error;
      }

      // 여기에 서버에서 내려주는 커스텀 에러 처리 로직 추가
      // 에러를 어떤식으로 사용자에게 표시할지는 추가 논의 필요

      console.error("Network or unknown error:", error);
      throw error;
    }
  };

  get = async <REQ_DATA extends Record<string, unknown> | undefined, RES_DATA>({
    url,
    queryParam,
    options,
  }: {
    url: string;
    queryParam?: REQ_DATA;
    options?: ApiRequestOptions;
  }): Promise<RES_DATA> =>
    await this.makeRequest<REQ_DATA, RES_DATA>({
      url,
      method: "GET",
      queryParam,
      options,
    });

  post = async <REQ_DATA, RES_DATA>({
    url,
    body,
    options,
  }: {
    url: string;
    body?: REQ_DATA;
    options?: ApiRequestOptions;
  }): Promise<RES_DATA> =>
    await this.makeRequest<REQ_DATA, RES_DATA>({
      url,
      method: "POST",
      body,
      options,
    });

  put = async <REQ_DATA, RES_DATA>({
    url,
    body,
    options,
  }: {
    url: string;
    body?: REQ_DATA;
    options?: ApiRequestOptions;
  }): Promise<RES_DATA> =>
    await this.makeRequest<REQ_DATA, RES_DATA>({
      url,
      method: "PUT",
      body,
      options,
    });

  delete = async <
    REQ_DATA extends Record<string, unknown> | undefined,
    RES_DATA,
  >({
    url,
    body,
    queryParam,
    options,
  }: {
    url: string;
    body?: REQ_DATA;
    queryParam?: REQ_DATA;
    options?: ApiRequestOptions;
  }): Promise<RES_DATA> =>
    await this.makeRequest<REQ_DATA, RES_DATA>({
      url,
      method: "DELETE",
      body,
      queryParam,
      options,
    });

  patch = async <REQ_DATA, RES_DATA>({
    url,
    body,
    options,
  }: {
    url: string;
    body?: REQ_DATA;
    options?: ApiRequestOptions;
  }): Promise<RES_DATA> =>
    await this.makeRequest<REQ_DATA, RES_DATA>({
      url,
      method: "PATCH",
      body,
      options,
    });
}

export const apiRequest = new APIRequest();
export const {
  get: getFetch,
  post: postFetch,
  put: putFetch,
  delete: deleteFetch,
  patch: patchFetch,
} = apiRequest;
