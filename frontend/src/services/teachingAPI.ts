import axios from "axios";
import type {
  KeyFields,
  TeachingErrorResponse,
  TeachingKey,
  TeachingValidationError,
} from "../types/teaching";

/** The teaching API rejected the request with structured validation errors (HTTP 400). */
export class TeachingValidationFailure extends Error {
  readonly errors: TeachingValidationError[];

  constructor(errors: TeachingValidationError[]) {
    super(errors.map((error) => error.message).join(" "));
    this.name = "TeachingValidationFailure";
    this.errors = errors;
  }
}

export interface TeachingAPI {
  deriveKey(fields: KeyFields, signal?: AbortSignal): Promise<TeachingKey>;
}

const isErrorResponse = (data: unknown): data is TeachingErrorResponse =>
  typeof data === "object" && data !== null && Array.isArray((data as TeachingErrorResponse).errors);

const post = async <T>(url: string, body: unknown, signal?: AbortSignal): Promise<T> => {
  try {
    const response = await axios.post<T>(url, body, { signal });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400 && isErrorResponse(error.response.data)) {
      throw new TeachingValidationFailure(error.response.data.errors);
    }
    throw error;
  }
};

/** Production builds are served by Flask, so they call the same origin; dev calls the local Flask server. */
export const getApiBaseUrl = (): string =>
  import.meta.env.PROD ? "" : (import.meta.env.VITE_LOCAL_API_BASE_URL ?? "");

export const createTeachingAPI = (baseURL: string): TeachingAPI => ({
  deriveKey: (fields, signal) => post<TeachingKey>(`${baseURL}/teaching/keys`, fields, signal),
});
