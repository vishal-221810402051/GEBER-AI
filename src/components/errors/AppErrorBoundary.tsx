import { Component, type ErrorInfo, type ReactNode } from "react";

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
          <section className="empty-state">
            <span className="status-pill">Application error</span>
            <h1>Something could not be rendered</h1>
            <p>
              The app did not hide this error. Reload the page and retry with a
              smaller or supported project package if this happened during file
              parsing or export.
            </p>
            <small>{this.state.error.message}</small>
            <button type="button" className="secondary-action" onClick={() => window.location.reload()}>
              Reload
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
