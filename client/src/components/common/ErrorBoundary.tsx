import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props { children: ReactNode }
interface State { hasError: boolean }

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center grad-navy px-6 text-center">
          <div>
            <h1 className="font-display font-bold text-2xl text-white">Something went wrong</h1>
            <p className="text-[#C6CEEF] mt-3">Please refresh the page. If the problem continues, call us at 9927444970.</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary mt-8">
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

