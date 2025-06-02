import React, { Suspense } from "react";
import AppLayout from "@/components/layout/app-layout";
import LoadingScreen from "@/components/loading-screen";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AppLayout>{children}</AppLayout>
    </Suspense>
  );
};

export default DashboardLayout;
