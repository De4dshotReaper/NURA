/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_VISIT_PACKET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
