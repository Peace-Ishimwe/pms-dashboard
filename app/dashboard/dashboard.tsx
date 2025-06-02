'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

// Types
interface PlateLog {
  plate_number: string;
  payment_status: number;
  entry_time: string;
  exit_time: string | null;
  amount_due: number;
}

interface UnpaidAttempt {
  plate_number: string;
  timestamp: string;
}

interface DashboardData {
  platesLog: PlateLog[];
  unpaidAttempts: UnpaidAttempt[];
}

// Helper function to format dates
const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'PPpp');
};

// Helper function to calculate duration
const calculateDuration = (entry: string, exit: string | null) => {
  if (!exit) return 'Still Parked';
  const entryTime = new Date(entry);
  const exitTime = new Date(exit);
  const diffMs = exitTime.getTime() - entryTime.getTime();
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
};

// Chart data processing
const getPaymentStatusData = (platesLog: PlateLog[]) => {
  const paid = platesLog.filter(log => log.payment_status === 1).length;
  const unpaid = platesLog.filter(log => log.payment_status === 0).length;
  return [
    { name: 'Paid', value: paid },
    { name: 'Unpaid', value: unpaid },
  ];
};

const getDailyEntries = (platesLog: PlateLog[]) => {
  const entriesByDate = platesLog.reduce((acc, log) => {
    const date = format(new Date(log.entry_time), 'yyyy-MM-dd');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(entriesByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7); // Last 7 days
};

export default function Dashboard({ initialData }: { initialData: DashboardData }) {
  const [platesLog, setPlatesLog] = useState<PlateLog[]>(initialData.platesLog);
  const [unpaidAttempts, setUnpaidAttempts] = useState<UnpaidAttempt[]>(initialData.unpaidAttempts);

  // Calculate statistics
  const totalRevenue = platesLog
    .filter(log => log.payment_status === 1)
    .reduce((sum, log) => sum + log.amount_due, 0);

  const activeParked = platesLog.filter(log => !log.exit_time).length;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Parking Management Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Parked Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeParked}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Unpaid Exit Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{unpaidAttempts.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Payment Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getPaymentStatusData(platesLog)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Daily Entries (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getDailyEntries(platesLog)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Plates Log Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Parking Log</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plate Number</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Entry Time</TableHead>
                <TableHead>Exit Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Amount Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {platesLog.map((log, index) => (
                <TableRow key={index}>
                  <TableCell>{log.plate_number}</TableCell>
                  <TableCell>
                    <Badge variant={log.payment_status === 1 ? 'default' : 'destructive'}>
                      {log.payment_status === 1 ? 'Paid' : 'Unpaid'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(log.entry_time)}</TableCell>
                  <TableCell>{log.exit_time ? formatDate(log.exit_time) : 'Still Parked'}</TableCell>
                  <TableCell>{calculateDuration(log.entry_time, log.exit_time)}</TableCell>
                  <TableCell>${log.amount_due}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Unpaid Exit Attempts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Unpaid Exit Attempts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plate Number</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unpaidAttempts.map((attempt, index) => (
                <TableRow key={index}>
                  <TableCell>{attempt.plate_number}</TableCell>
                  <TableCell>{formatDate(attempt.timestamp)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}