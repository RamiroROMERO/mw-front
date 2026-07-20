import React from 'react';
import PropTypes from 'prop-types';

// Error boundaries can only be implemented as class components (React has no
// hook equivalent). Kept intentionally free of Redux/Router/Intl context,
// since it wraps the whole app and must still render if any of those crash.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled render error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="d-flex align-items-center justify-content-center text-center"
          style={{ minHeight: '100vh', padding: '2rem' }}
        >
          <div>
            <p className="display-1 fw-bold mb-3">Oops!</p>
            <p className="mb-4">
              Ocurrió un error inesperado. Probá recargar la página; si el problema persiste, contactá a soporte.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={this.handleReload}
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
};

export default ErrorBoundary;
