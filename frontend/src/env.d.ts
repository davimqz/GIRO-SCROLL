interface ImportMetaEnv {
  readonly VITE_PINATA_API_KEY: string;
  readonly VITE_PINATA_SECRET_KEY: string;
  readonly VITE_GIRO_TOKEN_ADDRESS?: string;
  readonly VITE_GIRO_MARKETPLACE_ADDRESS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
