import { Navigate } from "react-router-dom";

export const INTAKE_COMPATIBILITY_TARGET = "/";

export function IntakePage() {
  return <Navigate to={INTAKE_COMPATIBILITY_TARGET} replace />;
}
