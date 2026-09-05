export const featureFlags = {
  visitPacket: import.meta.env.DEV || import.meta.env.VITE_ENABLE_VISIT_PACKET === 'true',
} as const;
