/**
 * Orange Money authentication handler - Complete implementation
 */

import axios, { AxiosInstance } from "axios";
import NodeRSA from "node-rsa";
import {
  OrangeConfig,
  OrangeAuthResponse,
  OrangePublicKeyResponse,
  ORANGE_ENDPOINTS,
} from "./types.js";
import { DeggoError, ERROR_CODES } from "../../core/errors.js";

export class OrangeAuth {
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private publicKey: string | null = null;
  private readonly httpClient: AxiosInstance;

  constructor(private readonly config: OrangeConfig) {
    const baseURL = config.baseUrl || ORANGE_ENDPOINTS[config.environment].base;

    this.httpClient = axios.create({
      baseURL,
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

  async getPublicKey(): Promise<string> {
    if (this.publicKey) {
      return this.publicKey;
    }

    await this.fetchPublicKey();
    return this.publicKey!;
  }

  async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getAccessToken();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getAccessToken();
      return true;
    } catch {
      return false;
    }
  }

  async encryptPinCode(pinCode: string): Promise<string> {
    try {
      const publicKey = await this.getPublicKey();

      // Create RSA key instance
      const key = new NodeRSA();
      key.importKey(publicKey, "public");

      // Set encryption options
      key.setOptions({
        encryptionScheme: "pkcs1", // PKCS#1 v1.5 padding
      });

      // Encrypt the PIN code
      const encrypted = key.encrypt(pinCode, "base64");
      return encrypted;
    } catch (error: any) {
      throw new DeggoError(
        ERROR_CODES.NETWORK_ERROR,
        "Failed to encrypt PIN code",
        error,
        "orange"
      );
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
    const authEndpoint = ORANGE_ENDPOINTS[this.config.environment].auth;

    try {
      const response = await this.httpClient.post<OrangeAuthResponse>(
        authEndpoint,
        new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          grant_type: "client_credentials",
        }).toString()
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

  private async fetchPublicKey(): Promise<void> {
    const headers = await this.getAuthHeaders();
    const publicKeyEndpoint =
      ORANGE_ENDPOINTS[this.config.environment].publicKey;

    try {
      const response = await this.httpClient.get<OrangePublicKeyResponse>(
        publicKeyEndpoint,
        { headers }
      );

      this.publicKey = response.data.publicKey;
    } catch (error: any) {
      throw new DeggoError(
        ERROR_CODES.NETWORK_ERROR,
        "Failed to fetch Orange Money public key",
        error.response?.data,
        "orange"
      );
    }
  }
}
