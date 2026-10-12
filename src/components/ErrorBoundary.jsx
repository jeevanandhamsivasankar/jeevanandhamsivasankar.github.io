import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info?.componentStack);
    try {
      this.props.onError?.(error, info);
    } catch {
      /* a failing onError must not prevent the fallback */
    }
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (error) {
      const { fallback } = this.props;
      if (typeof fallback === "function") return fallback(error, this.reset);
      return fallback ?? <div role="alert">Something went wrong.</div>;
    }
    return this.props.children;
  }
}
