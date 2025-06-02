'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { DollarSign, Car, AlertTriangle } from 'lucide-react'; // Assuming Lucide icons for visual enhancement

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

const getDailyRevenue = (platesLog: PlateLog[]) => {
  const revenueByDate = platesLog
    .filter(log => log.payment_status === 1)
    .reduce((acc, log) => {
      const date = format(new Date(log.entry_time), 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + log.amount_due;
      return acc;
    }, {} as Record<string, number>);

  return Object.entries(revenueByDate)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7); // Last 7 days
};

// Colors for PieChart
const COLORS = ['#4ade80', '#f87171'];

export default function Dashboard({ initialData }: { initialData: DashboardData }) {
  const [platesLog, setPlatesLog] = useState<PlateLog[]>(initialData.platesLog);
  const [unpaidAttempts, setUnpaidAttempts] = useState<UnpaidAttempt[]>(initialData.unpaidAttempts);

  // Calculate statistics
  const totalRevenue = platesLog
    .filter(log => log.payment_status === 1)
    .reduce((sum, log) => sum + log.amount_due, 0);

  const activeParked = platesLog.filter(log => !log.exit_time).length;

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8 tracking-tight">
        Parking Management Dashboard
      </h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl">
          <CardHeader className="flex items-center space-x-2">
            <DollarSign className="h-6 w-6" />
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl">
          <CardHeader className="flex items-center space-x-2">
            <Car className="h-6 w-6" />
            <CardTitle>Active Parked Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeParked}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl">
          <CardHeader className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6" />
            <CardTitle>Unpaid Exit Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{unpaidAttempts.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-700">Payment Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getPaymentStatusData(platesLog)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {getPaymentStatusData(platesLog).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-700">Daily Entries (Last 7 Days)</CardTitle>
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
        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-700">Daily Revenue (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getDailyRevenue(platesLog)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#4ade80" dot={true} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Plates Log Table */}
      <Card className="mb-8 bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-700">Parking Log</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-600">Plate Number</TableHead>
                <TableHead className="text-gray-600">Payment Status</TableHead>
                <TableHead className="text-gray-600">Entry Time</TableHead>
                <TableHead className="text-gray-600">Exit Time</TableHead>
                <TableHead className="text-gray-600">Duration</TableHead>
                <TableHead className="text-gray-600">Amount Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {platesLog.map((log, index) => (
                <TableRow key={index} className="hover:bg-gray-50 transition-colors">
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
      <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-700">Unpaid Exit Attempts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-600">Plate Number</TableHead>
                <TableHead className="text-gray-600">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unpaidAttempts.map((attempt, index) => (
                <TableRow key={index} className="hover:bg-gray-50 transition-colors">
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