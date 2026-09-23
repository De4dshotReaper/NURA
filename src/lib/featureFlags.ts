const visitPacketEnabled =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_VISIT_PACKET === 'true';

export const featureFlags = {
  visitPacket: visitPacketEnabled,
} as const;
