import { Outlet } from "react-router-dom";
import { AppErrorBoundary } from "../components/errors/AppErrorBoundary";
import { AppLayout } from "../components/layout/AppLayout";
import { FileIntakeProvider } from "../features/intake/useFileIntake";

export function App() {
  return (
    <AppErrorBoundary>
      <FileIntakeProvider>
        <AppLayout>
          <Outlet />
        </AppLayout>
      </FileIntakeProvider>
    </AppErrorBoundary>
  );
}
