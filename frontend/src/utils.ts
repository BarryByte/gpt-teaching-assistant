export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getOrCreateUserId(): string {
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = generateUniqueId();
    localStorage.setItem("userId", userId);
  }
  return userId;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleDateString(undefined, options);
}

export function getInitialTheme(): boolean {
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedTheme = localStorage.getItem('darkMode');
    if (storedTheme === 'true') {
      return true;
    } else if (storedTheme === 'false') {
      return false;
    }
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function saveThemePreference(darkMode: boolean): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('darkMode', darkMode.toString());
  }
}