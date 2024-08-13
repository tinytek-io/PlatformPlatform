import { prisma } from "./database";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Lucia, type Session, TimeSpan, type User } from "lucia";
import { GitHub } from "arctic";
import { config } from "./config";
import type { $Enums } from "@prisma/client";
import type { Locale } from "./i18n";

const publicUrl = new URL(config.env.PUBLIC_URL);
const prismaAdapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(prismaAdapter, {
  sessionExpiresIn: new TimeSpan(30, "d"),
  getUserAttributes: mapDatabaseUserAttributes,
  getSessionAttributes: mapDatabaseSessionAttributes
});

export const luciaGlobal = new Lucia(prismaAdapter, {
  sessionExpiresIn: new TimeSpan(30, "s"),
  getUserAttributes: mapDatabaseUserAttributes,
  getSessionAttributes: mapDatabaseSessionAttributes
});

export const github = new GitHub(config.env.GITHUB_CLIENT_ID, config.env.GITHUB_CLIENT_SECRET);

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
  }
}

function mapDatabaseUserAttributes(attributes: DatabaseUserAttributes) {
  return {
    id: attributes.id,
    email: attributes.email,
    emailVerified: attributes.emailVerified,
    tenantId: attributes.tenantId,
    role: attributes.role,
    locale: attributes.locale,
    firstName: attributes.firstName,
    lastName: attributes.lastName,
    title: attributes.title,
    avatarUrl: attributes.avatarUrl
  };
}

function mapDatabaseSessionAttributes(attributes: DatabaseSessionAttributes) {
  return {
    type: attributes.type
  };
}

export function mapClientUserInfo(session: Session | null, user: User | null, defaultLocale: Locale): UserInfo {
  if (!session || !user) {
    return {
      isAuthenticated: false,
      locale: defaultLocale
    };
  }
  return {
    id: user.id,
    isAuthenticated: true,
    locale: user.locale ?? defaultLocale,
    email: user.email,
    name: user.email,
    role: user.role,
    tenantId: user.tenantId,
    firstName: user.firstName,
    lastName: user.lastName,
    title: user.title,
    avatarUrl: getAvatarImageUrl(user.tenantId, user.id, user.avatarUrl),
    initials: getUserInitials(user.firstName, user.lastName, user.email)
  };
}

export function mapClientTenantInfo(tenant: DatabaseTenantAttributes): TenantInfo {
  return {
    id: tenant.id,
    domain: `${tenant.id}.${publicUrl.hostname}`,
    name: tenant.name ?? tenant.id,
    status: tenant.status,
    logoSquareUrl: getBrandingImageUrl(tenant.id, "logo-square", tenant.logoSquareUrl),
    logoWideUrl: getBrandingImageUrl(tenant.id, "logo-wide", tenant.logoWideUrl),
    mobileHeroUrl: getBrandingImageUrl(tenant.id, "hero-mobile", tenant.mobileHeroUrl),
    desktopHeroUrl: getBrandingImageUrl(tenant.id, "hero-desktop", tenant.desktopHeroUrl),
    theme: tenant.theme ?? undefined,
    defaultLocale: tenant.defaultLocale ?? undefined
  };
}

interface DatabaseUserAttributes {
  id: string;
  email: string;
  emailVerified: boolean;
  tenantId: string;
  role: $Enums.UserRole;
  locale?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  avatarUrl?: string;
}

interface DatabaseSessionAttributes {
  type: $Enums.SessionType;
}

interface DatabaseTenantAttributes {
  id: string;
  name: string;
  status: $Enums.TenantStatus;

  logoSquareUrl?: string | null;
  logoWideUrl?: string | null;
  theme?: string | null;
  brandColor?: string | null;
  mobileHeroUrl?: string | null;
  desktopHeroUrl?: string | null;

  defaultLocale?: string | null;
}

/**
 * UserInfo is published to the client
 */
export type UserInfo =
  | {
      id: string;
      isAuthenticated: true;
      locale: string;
      email: string;
      name: string;
      role: string;
      tenantId: string;
      firstName?: string;
      lastName?: string;
      title?: string;
      avatarUrl?: string;
      initials: string;
    }
  | {
      isAuthenticated: false;
      locale: Locale;
    };

/**
 * TenantInfo is published to the client
 */
export type TenantInfo =
  | {
      id: string;
      domain: string;
      name?: string;
      status: "ACTIVE" | "TRIAL" | "INACTIVE";

      logoSquareUrl?: string;
      logoWideUrl?: string;
      theme?: string;
      brandColor?: string;
      mobileHeroUrl?: string;
      desktopHeroUrl?: string;

      defaultLocale?: string;
    }
  | {
      id: null;
    };

export function getBrandingImageUrl(
  tenantId: string,
  type: "logo-square" | "logo-wide" | "hero-mobile" | "hero-desktop",
  value?: string | null
) {
  if (value == null) {
    return undefined;
  }
  if (value.startsWith("http")) {
    return value;
  }
  return `/branding/${tenantId}/${type}/${value}`;
}

export function getAvatarImageUrl(tenantId: string, userId: string, value?: string | null) {
  if (value == null) {
    return undefined;
  }
  if (value.startsWith("http")) {
    return value;
  }
  return `/avatars/${tenantId}/${userId}/${value}`;
}

export function getUserInitials(firstName?: string | null, lastName?: string | null, email?: string | null) {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`;
  }
  return email?.slice(0, 2).toUpperCase() ?? "";
}
