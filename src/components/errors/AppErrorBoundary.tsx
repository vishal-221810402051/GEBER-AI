import { Component, type ErrorInfo, type ReactNode } from "react";
import { GlassAlert } from "../ui";

type Props = Readonly<{
  children: ReactNode;
}>;

type State = Readonly<{
  error?: Error;
}>;

export class AppErrorBoundary extends Component<Props, State> {
  state: State = {};

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("GEBER AI application error", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="content">
          <GlassAlert
            variant="critical"
            title="Something could not be rendered"
            message="The app did not hide this error. Reload the page and retry with a smaller or supported project package if this happened during file parsing or export."
            evidence={[this.state.error.message]}
            action={(
              <button type="button" className="secondary-action" onClick={() => window.location.reload()}>
                Reload
              </button>
            )}
          />
        </main>
      );
    }

    return this.props.children;
  }
}
