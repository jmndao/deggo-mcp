/**
 * Orange Money authentication handler
 */

import axios, { AxiosInstance } from "axios";
import { OrangeConfig, OrangeAuthResponse, ORANGE_ENDPOINTS } from "./types";
import { DeggoError, ERROR_CODES } from "../../core/errors";

export class OrangeAuth {
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private readonly httpClient: AxiosInstance;

  constructor(private config: OrangeConfig) {
    this.httpClient = axios.create({
      timeout: config.timeout,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
    });
  }

  async getAccessToken(): Promise<string> {
    if (this.isTokenValid()) {
      return this.accessToken!;
    }

    await this.authenticate();
    return this.accessToken!;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getAccessToken();
      return true;
    } catch {
      return false;
    }
  }

  private isTokenValid(): boolean {
    return (
      this.accessToken !== null &&
      this.tokenExpiry !== null &&
      this.tokenExpiry > new Date()
    );
  }

  private async authenticate(): Promise<void> {
    const authUrl = ORANGE_ENDPOINTS[this.config.environment].auth;

    try {
      const response = await this.httpClient.post<OrangeAuthResponse>(
        authUrl,
        "grant_type=client_credentials",
        {
          auth: {
            username: this.config.clientId,
            password: this.config.clientSecret,
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + response.data.expires_in * 1000);
    } catch (error: any) {
      throw new DeggoError(
        ERROR_CODES.INVALID_CREDENTIALS,
        "Orange Money authentication failed",
        error.response?.data,
        "orange"
      );
    }
  }
}
