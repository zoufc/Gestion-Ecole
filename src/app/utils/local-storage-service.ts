export function getLocalData(key: string) {
  return localStorage.getItem(key);
}

export function setLocalData(key: string, data: any) {
  localStorage.setItem(key, data);
}

export function clearLocalStorage() {
  localStorage.clear();
}
