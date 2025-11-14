import React from 'react';
import {ErrorScreen} from '../screens/ErrorScreen';
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError(error) {
    return {hasError: true};
  }

  componentDidCatch(error, errorInfo) {
    this.setState({hasError: true});
  }

  render() {
    if (this.state.hasError || this.props.throwTimeoutError) {
      return (
        <ErrorScreen
          modal={this.props.modal}
          refreshComponent={this.props.refreshComponent}
        />
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
