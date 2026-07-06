import { createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import { BoardOverviewPage } from "../pages/BoardOverviewPage";
import { BomPage } from "../pages/BomPage";
import { ComponentsPage } from "../pages/ComponentsPage";
import { DashboardPage } from "../pages/DashboardPage";
import { FirmwarePage } from "../pages/FirmwarePage";
import { IntakePage } from "../pages/IntakePage";
import { LandingPage } from "../pages/LandingPage";
import { NetsPage } from "../pages/NetsPage";
import { PowerPage } from "../pages/PowerPage";
import { ReportsPage } from "../pages/ReportsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "intake", element: <IntakePage /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "board", element: <BoardOverviewPage /> },
      { path: "components", element: <ComponentsPage /> },
      { path: "nets", element: <NetsPage /> },
      { path: "power", element: <PowerPage /> },
      { path: "bom", element: <BomPage /> },
      { path: "firmware", element: <FirmwarePage /> },
      { path: "reports", element: <ReportsPage /> }
    ]
  }
]);
