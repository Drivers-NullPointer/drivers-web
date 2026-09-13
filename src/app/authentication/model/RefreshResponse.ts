/** Token rotation does not include user identity; /admin/session supplies the role. */
export interface RefreshResponse {
  token: string;
  refreshToken: string | null;
}
