interface VerificationInfo {
  id: string;
  email: string;
  expireAt: Date;
  tenants?: TenantSelectionItem[];
  code?: string;
}

type TenantSelectionItem = {
  id: string;
  domain: string;
  name: string;
  logoSquareUrl?: string;
  members: number;
  /**
   * List of user avatar URLs
   */
  users: Array<{ avatarUrl?: string; initials: string }>;
};

let currentVerificationInfo: VerificationInfo | undefined;

export function setVerificationInfo(newVerificationInfo: VerificationInfo): void {
  currentVerificationInfo = newVerificationInfo;
}

export function getVerificationInfo() {
  if (currentVerificationInfo == null) throw new Error("Verification info is missing.");
  return currentVerificationInfo;
}
