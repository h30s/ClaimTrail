export const NOW = new Date();

export const minutesAgo = (mins: number) => new Date(NOW.getTime() - mins * 60_000);
export const hoursAgo = (hours: number) => new Date(NOW.getTime() - hours * 3_600_000);
export const daysAgo = (days: number) => new Date(NOW.getTime() - days * 86_400_000);
export const hoursFromNow = (hours: number) => new Date(NOW.getTime() + hours * 3_600_000);
