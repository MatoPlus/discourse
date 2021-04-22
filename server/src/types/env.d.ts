declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    PORT: string;
    ACCESS_JWT_SECRET: string;
    REFRESH_JWT_SECRET: string;
    RECOVER_JWT_SECRET: string;
    CORS_ORIGIN: string;
  }
}
