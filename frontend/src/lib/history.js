// Local scan history (PII-redacted text only). Cleared by "Delete My Data".
const KEY = 'ts_history';
export const getHistory = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
export function addHistory(item) {
  const list = [{ ...item, at: Date.now() }, ...getHistory()].slice(0, 12);
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event('ts-history'));
}
export const clearHistory = () => {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event('ts-history'));
};
export const clearLocalData = () => {
  ['ts_history', 'ts_report', 'ts_streak', 'ts_family', 'ts_apps', 'ts_cookie'].forEach((k) => localStorage.removeItem(k));
};
