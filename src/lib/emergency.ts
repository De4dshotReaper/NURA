export const EMERGENCY_LOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 8000,
  maximumAge: 30000,
};

export const normalizeSmsPhone = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed || !/^\+?[\d\s()-]+$/.test(trimmed)) return null;
  const hasLeadingPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return null;
  return `${hasLeadingPlus ? '+' : ''}${digits}`;
};

export const buildMapsUrl = (latitude: number, longitude: number): string =>
  `https://maps.google.com/?q=${latitude},${longitude}`;

export const buildSmsUri = (phone: string, message: string, userAgent = navigator.userAgent): string => {
  const encodedBody = encodeURIComponent(message);
  const isIOS = /iPad|iPhone|iPod/.test(userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  // iOS uses '&body=' after a recipient; Android and other common handlers use '?body='.
  return `sms:${phone}${isIOS ? '&' : '?'}body=${encodedBody}`;
};

export const getCurrentLocation = (): Promise<GeolocationPosition | null> =>
  new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), EMERGENCY_LOCATION_OPTIONS);
  });
