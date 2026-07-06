import { Outlet } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { FileIntakeProvider } from "../features/intake/useFileIntake";

export function App() {
  return (
    <FileIntakeProvider>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </FileIntakeProvider>
  );
}
