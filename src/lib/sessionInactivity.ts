export const INACTIVITY_LIMIT_MS = 2 * 60 * 60 * 1000;

const LAST_ACTIVITY_STORAGE_PREFIX = "callback-clinic:last-activity:";
const EXPIRED_SESSION_STORAGE_PREFIX = "callback-clinic:expired-session:";

export function getLastActivityStorageKey(userId: string) {
  return `${LAST_ACTIVITY_STORAGE_PREFIX}${userId}`;
}

export function readLastActivity(userId: string) {
  const value = window.localStorage.getItem(getLastActivityStorageKey(userId));
  if (value === null) return null;

  const timestamp = Number(value);
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : null;
}

export function writeLastActivity(userId: string, timestamp = Date.now()) {
  window.localStorage.setItem(getLastActivityStorageKey(userId), String(timestamp));
}

export function getExpiredSessionStorageKey(userId: string) {
  return `${EXPIRED_SESSION_STORAGE_PREFIX}${userId}`;
}

export function readExpiredSessionToken(userId: string) {
  return window.localStorage.getItem(getExpiredSessionStorageKey(userId));
}

export function writeExpiredSessionToken(userId: string, accessToken: string) {
  window.localStorage.setItem(getExpiredSessionStorageKey(userId), accessToken);
}

export function clearExpiredSessionToken(userId: string) {
  window.localStorage.removeItem(getExpiredSessionStorageKey(userId));
}
