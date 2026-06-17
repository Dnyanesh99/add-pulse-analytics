import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import styled from "@emotion/styled";

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 20px;
  text-align: center;
  background: #f8fafc;
  color: #0f172a;
`;

const ErrorTitle = styled.h1`
  font-size: 24px;
  margin-bottom: 10px;
`;

const ErrorMessage = styled.p`
  color: #64748b;
  margin-bottom: 20px;
`;

const RetryButton = styled.button`
  padding: 10px 20px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  &:hover {
    background: #1d4ed8;
  }
`;

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorWrapper>
          <ErrorTitle>Something went wrong.</ErrorTitle>
          <ErrorMessage>{this.state.error?.message || "An unexpected error occurred."}</ErrorMessage>
          <RetryButton onClick={() => window.location.reload()}>
            Refresh Page
          </RetryButton>
        </ErrorWrapper>
      );
    }

    return this.props.children;
  }
}
