import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleHardRefresh = (): void => {
    const reload = () => window.location.reload();

    // Clear service worker caches then reload to get a completely fresh start
    if ('caches' in window) {
      caches.keys()
        .then((names) => Promise.all(names.map((name) => caches.delete(name))))
        .then(reload);
    } else {
      reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <span className="error-boundary-icon">⚠️</span>
            <h1>Something went wrong</h1>
            <p>The app ran into a problem and couldn't recover. This can happen after an update.</p>
            <button
              className="error-boundary-button"
              onClick={this.handleHardRefresh}
            >
              Refresh and try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
