import { Component, type ReactNode } from "react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center text-center px-6"
          style={{ backgroundColor: "#0D0D0D" }}
        >
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "80px",
              color: "rgba(201,168,76,0.15)",
              lineHeight: 1,
            }}
          >
            Oops
          </span>
          <h1
            className="mt-4 mb-3"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "28px",
              color: "#F8F5F0",
            }}
          >
            Something went wrong
          </h1>
          <p
            className="mb-8 text-sm max-w-sm"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "#6B6560" }}
          >
            We're sorry for the inconvenience. Please refresh the page or return home.
          </p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-3 text-xs tracking-[0.2em] uppercase border transition-opacity hover:opacity-70"
              style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, borderColor: "rgba(201,168,76,0.4)", color: "#C9A84C" }}
            >
              Refresh
            </button>
            <a
              href="/"
              className="px-6 py-3 text-xs tracking-[0.2em] uppercase"
              style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, backgroundColor: "#C9A84C", color: "#0D0D0D" }}
            >
              Return Home
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
