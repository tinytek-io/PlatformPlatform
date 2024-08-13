export declare global {
  /**
   * Custom build environment variables
   */
  interface CustomBuildEnv {}
  /**
   * Build Environment Variables
   */
  interface BuildEnv extends CustomBuildEnv {
    /**
     * Application ID e.g. "account-management/webapp"
     **/
    APPLICATION_ID: string;
    /**
     * Build type e.g. "development" | "production"
     */
    BUILD_TYPE: "development" | "production";
  }

  /**
   * Runtime Environment Variables
   */
  export interface RuntimeEnv {
    /**
     * Public url / base url
     **/
    PUBLIC_URL: string;
    /**
     * CDN url / location of client bundle files
     **/
    CDN_URL: string;
    /**
     * Application version
     **/
    APPLICATION_VERSION: string;
    /**
     * Culture locale
     **/
    LOCALE: string;
    /**
     * System name
     */
    SYSTEM_NAME: string;
  }

  export type UserInfoEnv =
    | {
        /**
         * Identifier
         */
        id: string;
        /**
         * Is user authenticated
         **/
        isAuthenticated: true;
        /**
         * User locale
         **/
        locale: string;
        /**
         * User email
         **/
        email?: string;
        /**
         * First name
         **/
        firstName?: string;
        /**
         * Last name
         **/
        lastName?: string;
        /**
         * Job title
         */
        title?: string;
        /**
         * User role
         **/
        role?: "Owner" | "Admin" | "Member";
        /**
         * Tenant id
         **/
        tenantId?: string;
        /**
         * Avatar url
         **/
        avatarUrl?: string;
        /**
         * Initials
         **/
        initials: string;
      }
    | {
        /**
         * User is not authenticated
         **/
        isAuthenticated: false;
        /**
         * Default locale
         **/
        locale: string;
      };

  export type TenantInfoEnv =
    | {
        /**
         * Tenant id
         **/
        id: string;
        /**
         * Tenant name
         **/
        name: string;
        /**
         * Tenant domain
         **/
        domain: string;
        /**
         * Tenant name
         **/
        name?: string;
        /**
         * Tenant status
         **/
        status: "ACTIVE" | "TRIAL" | "INACTIVE";
        /**
         * Tenant logo square
         **/
        logoSquareUrl?: string;
        /**
         * Tenant logo wide
         **/
        logoWideUrl?: string;
        /**
         * Tenant theme
         **/
        theme?: string;
        /**
         * Tenant brand color
         **/
        brandColor?: string;
        /**
         * Tenant mobile hero
         **/
        mobileHeroUrl?: string;
        /**
         * Tenant desktop hero
         **/
        desktopHeroUrl?: string;
        /**
         * Default locale
         **/
        defaultLocale?: string;
      }
    | {
        /**
         * Tenant is not set
         **/
        id: null;
      };

  /**
   * Both Build and Runtime Environment variables
   */
  type Environment = BuildEnv & RuntimeEnv;

  declare interface ImportMeta {
    env: Environment;
    build_env: BuildEnv;
    runtime_env: RuntimeEnv;
    user_info_env: UserInfoEnv;
    tenant_info_env: TenantInfoEnv;
  }
}
