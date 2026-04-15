import React, { ReactNode, ReactElement } from 'react';
import { View, ScrollView } from 'react-native';
import { getThemeColors, spacing } from '../../theme';
import { Text } from './Text';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactElement;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.retry);
      }

      const colors = getThemeColors('light');

      return (
        <ScrollView
          style={{
            flex: 1,
            backgroundColor: colors.background,
          }}
          contentContainerStyle={{
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing.lg,
            minHeight: '100%',
          }}
        >
          <View style={{ alignItems: 'center', gap: spacing.lg }}>
            <Text variant="h2" weight="bold">
              Something went wrong
            </Text>
            <Text
              variant="body"
              style={{
                color: colors.mutedForeground,
                textAlign: 'center',
              }}
            >
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>
            <Button label="Try Again" onPress={this.retry} />
          </View>
        </ScrollView>
      );
    }

    return this.props.children;
  }
}
