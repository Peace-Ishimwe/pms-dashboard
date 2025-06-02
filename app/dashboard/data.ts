import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';

export interface PlateLog {
  plate_number: string;
  payment_status: number;
  entry_time: string;
  exit_time: string | null;
  amount_due: number;
}

export interface UnpaidAttempt {
  plate_number: string;
  timestamp: string;
}

export async function getDashboardData(): Promise<{
  platesLog: PlateLog[];
  unpaidAttempts: UnpaidAttempt[];
}> {
  const db = await open({
    filename: 'pms.db',
    driver: sqlite3.Database,
  });

  try {
    const platesLog = await db.all<PlateLog[]>('SELECT * FROM plates_log');
    const unpaidAttempts = await db.all<UnpaidAttempt[]>('SELECT * FROM unpaid_exit_attempts');

    return {
      platesLog,
      unpaidAttempts,
    };
  } finally {
    await db.close();
  }
}