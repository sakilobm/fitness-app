import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Utility for partitioning and caching daily logs in local storage.
 * Keys are structured as: `logs:{domain}:{YYYY-MM}`
 * Where domain is 'water', 'weight', 'steps', or 'nutrition'.
 */

const getYearMonthKey = (dateStr: string): string => {
  // dateStr is expected to be "YYYY-MM-DD" or similar ISO date
  return dateStr.substring(0, 7); // Returns "YYYY-MM"
};

/**
 * Saves a daily log entry into a monthly partitioned cache chunk.
 * 
 * @param domain The metric domain ('water', 'weight', 'steps', 'nutrition').
 * @param dateStr Date of the log in format "YYYY-MM-DD".
 * @param logEntry The entry object containing log details (must have an `id` or `time`).
 */
export async function savePartitionedLog(domain: string, dateStr: string, logEntry: any): Promise<void> {
  try {
    const yearMonth = getYearMonthKey(dateStr);
    const storageKey = `logs:${domain}:${yearMonth}`;
    
    // Retrieve existing logs for the month
    const existingDataStr = await AsyncStorage.getItem(storageKey);
    let monthlyLogs: Record<string, any[]> = existingDataStr ? JSON.parse(existingDataStr) : {};
    
    if (!monthlyLogs[dateStr]) {
      monthlyLogs[dateStr] = [];
    }
    
    // Check if entry already exists (by ID) to update or append
    const existingIndex = monthlyLogs[dateStr].findIndex(item => item.id === logEntry.id);
    if (existingIndex !== -1) {
      monthlyLogs[dateStr][existingIndex] = logEntry;
    } else {
      monthlyLogs[dateStr].push(logEntry);
    }
    
    await AsyncStorage.setItem(storageKey, JSON.stringify(monthlyLogs));
  } catch (error) {
    console.error(`[Storage] Failed to save partitioned log for ${domain}:`, error);
  }
}

/**
 * Loads logs for a given domain and year-month partition.
 * 
 * @param domain The metric domain.
 * @param yearMonth Format "YYYY-MM".
 * @returns Map of dateStr -> log arrays.
 */
export async function loadPartitionedLogs(domain: string, yearMonth: string): Promise<Record<string, any[]>> {
  try {
    const storageKey = `logs:${domain}:${yearMonth}`;
    const dataStr = await AsyncStorage.getItem(storageKey);
    return dataStr ? JSON.parse(dataStr) : {};
  } catch (error) {
    console.error(`[Storage] Failed to load partitioned logs for ${domain} (${yearMonth}):`, error);
    return {};
  }
}

/**
 * Deletes a partitioned log entry by its ID.
 */
export async function deletePartitionedLog(domain: string, dateStr: string, entryId: string): Promise<void> {
  try {
    const yearMonth = getYearMonthKey(dateStr);
    const storageKey = `logs:${domain}:${yearMonth}`;
    
    const existingDataStr = await AsyncStorage.getItem(storageKey);
    if (!existingDataStr) return;
    
    let monthlyLogs: Record<string, any[]> = JSON.parse(existingDataStr);
    if (monthlyLogs[dateStr]) {
      monthlyLogs[dateStr] = monthlyLogs[dateStr].filter(item => item.id !== entryId);
      await AsyncStorage.setItem(storageKey, JSON.stringify(monthlyLogs));
    }
  } catch (error) {
    console.error(`[Storage] Failed to delete partitioned log for ${domain}:`, error);
  }
}

/**
 * Hydrates only the last N months of logs into memory to prevent memory inflation.
 */
export async function hydrateRecentLogs(domain: string, monthsBack: number = 2): Promise<any[]> {
  try {
    const today = new Date();
    const loadedLogs: any[] = [];
    
    for (let i = 0; i < monthsBack; i++) {
      const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const yearMonth = `${year}-${month}`;
      
      const partition = await loadPartitionedLogs(domain, yearMonth);
      Object.values(partition).forEach(entries => {
        loadedLogs.push(...entries);
      });
    }
    
    return loadedLogs;
  } catch (error) {
    console.error(`[Storage] Failed to hydrate recent logs for ${domain}:`, error);
    return [];
  }
}
