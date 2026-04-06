import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
          <div className="text-center max-w-[400px]">
            <span className="text-5xl block mb-4">⚠️</span>
            <h1 className="m-0 mb-3 text-2xl text-gray-900">Something went wrong</h1>
            <p className="m-0 mb-8 text-gray-500 text-base leading-[1.5]">The app ran into a problem and couldn't recover. This can happen after an update.</p>
            <button
              className="inline-block px-8 py-[0.85rem] min-h-[48px] border-0 rounded-lg bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white text-base font-semibold cursor-pointer transition-opacity duration-200 [-webkit-tap-highlight-color:transparent] active:opacity-80"
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
