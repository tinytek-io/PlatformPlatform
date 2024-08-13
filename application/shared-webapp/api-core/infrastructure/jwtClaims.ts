import Zod from "zod";

export const JWTClaimsSchema = Zod.object({
  /** Issuer [IESG] */
  iss: Zod.string().optional(),
  /** Subject [IESG] */
  sub: Zod.string().optional(),
  /** Audience [IESG] */
  aud: Zod.string().optional(),
  /** Expiration Time [IESG] */
  exp: Zod.number().optional(),
  /** Not Before [IESG] */
  nbf: Zod.number().optional(),
  /** Issued At [IESG] */
  iat: Zod.number().optional(),
  /** JWT ID [IESG] */
  jti: Zod.string().optional(),
  /** Full name [IESG] */
  name: Zod.string().optional(),

  /** Profile picture URL */
  picture: Zod.string().optional(),

  /** Email [OpenId Foundation] */
  email: Zod.string().optional(),
  /** Email verified [OpenId Foundation] */
  email_verified: Zod.boolean().optional(),

  /** Locale [OpenId Foundation] */
  locale: Zod.string().optional(),

  /** Roles [IESG] */
  roles: Zod.array(Zod.string()).optional(),

  /** Team ID [IESG] */
  team_id: Zod.string().optional(),
  /** Tenant ID [IESG] */
  tenant_id: Zod.string().optional(),

  /** Theme [] */
  theme: Zod.string().optional(),

  /** Session ID [OpenId Foundation] */
  session_id: Zod.string().optional(),

  /** Updated at [OpenId Foundation] */
  updated_at: Zod.string().optional(),
});

export type JWTClaims = Zod.infer<typeof JWTClaimsSchema>;
