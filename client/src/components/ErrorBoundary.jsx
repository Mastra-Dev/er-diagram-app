import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error: error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo: errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', background: '#2d2d2d', color: '#ff5555', height: '100vh', overflow: 'auto' }}>
                    <h1>⚠️ Something went wrong.</h1>
                    <details open style={{ whiteSpace: 'pre-wrap', padding: '10px', background: '#222' }}>
                        <summary style={{ marginBottom: '10px', cursor: 'pointer' }}>Client Error Details</summary>
                        <strong>{this.state.error?.toString()}</strong>
                        <br />
                        <br />
                        {this.state.errorInfo?.componentStack}
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
