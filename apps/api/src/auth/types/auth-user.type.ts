/** Verified Clerk session JWT payload attached to `req.user` by ClerkAuthGuard. */
export interface AuthUser {
  /** Aliased from the JWT `sub` claim. */
  id: string;
  sub: string;
  sid?: string;
  iss?: string;
  azp?: string;
  exp?: number;
  iat?: number;
  nbf?: number;
  [claim: string]: unknown;
}
