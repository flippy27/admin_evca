import React, { useState } from 'react';
import {
  ScrollView,
  View,
  SafeAreaView,
  StyleSheet,
  Switch as RNSwitch,
} from 'react-native';
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Input,
  Badge,
  Alert,
  Switch,
  Separator,
  Text,
  useToast,
  useLoadingOverlay,
} from '../../components/ui';
import { colors, spacing } from '../../theme';

export default function ComponentShowcase() {
  const [isDark, setIsDark] = useState(false);
  const [switchValue, setSwitchValue] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  const themeColors = isDark ? colors.dark : colors.light;

  const handleInputChange = (text: string) => {
    setInputValue(text);
    if (text.length < 3 && text.length > 0) {
      setInputError('Mínimo 3 caracteres');
    } else {
      setInputError('');
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: themeColors.background,
        },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: themeColors.card,
            borderBottomColor: themeColors.border,
          },
        ]}
      >
        <Text variant="h2" isDark={isDark}>
          Component Showcase
        </Text>
        <Text variant="caption" isDark={isDark} style={styles.subtitle}>
          EVCA Admin - React Native Components
        </Text>
      </View>

      {/* Theme Toggle */}
      <View
        style={[
          styles.themeToggle,
          {
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          },
        ]}
      >
        <Text isDark={isDark}>Dark Mode:</Text>
        <RNSwitch value={isDark} onValueChange={setIsDark} />
      </View>

      {/* ScrollView with Components */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Buttons Section */}
        <Text variant="h3" isDark={isDark} style={styles.sectionTitle}>
          Buttons
        </Text>
        <Card isDark={isDark} style={styles.componentCard}>
          <CardContent>
            <View style={styles.buttonGrid}>
              <Button
                label="Primary"
                variant="primary"
                onPress={() => {}}
                isDark={isDark}
              />
              <Button
                label="Secondary"
                variant="secondary"
                onPress={() => {}}
                isDark={isDark}
              />
            </View>
            <View style={styles.buttonGrid}>
              <Button
                label="Outline"
                variant="outline"
                onPress={() => {}}
                isDark={isDark}
              />
              <Button
                label="Destructive"
                variant="destructive"
                onPress={() => {}}
                isDark={isDark}
              />
            </View>
            <View style={styles.buttonGrid}>
              <Button
                label="Ghost"
                variant="ghost"
                onPress={() => {}}
                isDark={isDark}
              />
              <Button
                label="Large Button"
                variant="primary"
                size="lg"
                onPress={() => {}}
                isDark={isDark}
                fullWidth
              />
            </View>
            <View style={styles.buttonGrid}>
              <Button
                label="Small"
                variant="secondary"
                size="sm"
                onPress={() => {}}
                isDark={isDark}
              />
              <Button
                label="Disabled"
                variant="primary"
                onPress={() => {}}
                isDark={isDark}
                disabled
              />
            </View>
          </CardContent>
        </Card>

        <Separator isDark={isDark} />

        {/* Badges Section */}
        <Text variant="h3" isDark={isDark} style={styles.sectionTitle}>
          Badges
        </Text>
        <Card isDark={isDark} style={styles.componentCard}>
          <CardContent style={styles.badgeGrid}>
            <Badge label="Default" isDark={isDark} />
            <Badge label="Secondary" variant="secondary" isDark={isDark} />
            <Badge label="Destructive" variant="destructive" isDark={isDark} />
            <Badge label="Outline" variant="outline" isDark={isDark} />
            <Badge label="Operador" isDark={isDark} />
            <Badge label="Supervisor" variant="secondary" isDark={isDark} />
          </CardContent>
        </Card>

        <Separator isDark={isDark} />

        {/* Alerts Section */}
        <Text variant="h3" isDark={isDark} style={styles.sectionTitle}>
          Alerts
        </Text>
        <Card isDark={isDark} style={styles.componentCard}>
          <CardContent style={styles.alertContainer}>
            <Alert
              title="Información"
              message="Este es un mensaje de información para el usuario"
              variant="info"
              isDark={isDark}
            />
            <Alert
              title="Éxito"
              message="La operación se completó correctamente"
              variant="success"
              isDark={isDark}
            />
            <Alert
              title="Error"
              message="Ocurrió un error al procesar la solicitud"
              variant="destructive"
              isDark={isDark}
            />
            <Alert
              message="Alerta por defecto sin título"
              isDark={isDark}
            />
          </CardContent>
        </Card>

        <Separator isDark={isDark} />

        {/* Input Section */}
        <Text variant="h3" isDark={isDark} style={styles.sectionTitle}>
          Input Fields
        </Text>
        <Card isDark={isDark} style={styles.componentCard}>
          <CardContent style={styles.inputContainer}>
            <Input
              label="Basic Input"
              placeholder="Enter text..."
              value={inputValue}
              onChangeText={handleInputChange}
              isDark={isDark}
            />
            <Input
              label="Input with Error"
              placeholder="Minimum 3 characters"
              value={inputValue}
              onChangeText={handleInputChange}
              error={inputError}
              isDark={isDark}
            />
            <Input
              label="Disabled Input"
              placeholder="This field is disabled"
              disabled
              isDark={isDark}
            />
            <Input
              label="Multiline Input"
              placeholder="Write your message here..."
              multiline
              isDark={isDark}
            />
          </CardContent>
        </Card>

        <Separator isDark={isDark} />

        {/* Switch Section */}
        <Text variant="h3" isDark={isDark} style={styles.sectionTitle}>
          Switch
        </Text>
        <Card isDark={isDark} style={styles.componentCard}>
          <CardContent>
            <Switch
              label="Enable notifications"
              value={switchValue}
              onValueChange={setSwitchValue}
              isDark={isDark}
            />
            <Separator isDark={isDark} />
            <Switch
              label="Auto-sync data"
              value={!switchValue}
              onValueChange={() => {}}
              isDark={isDark}
            />
            <Separator isDark={isDark} />
            <Switch
              label="Disabled switch"
              value={false}
              onValueChange={() => {}}
              disabled
              isDark={isDark}
            />
          </CardContent>
        </Card>

        <Separator isDark={isDark} />

        {/* Card Section */}
        <Text variant="h3" isDark={isDark} style={styles.sectionTitle}>
          Cards
        </Text>
        <Card isDark={isDark} style={styles.componentCard}>
          <CardHeader>
            <Text variant="h4" isDark={isDark}>
              Card Title
            </Text>
            <Text variant="caption" isDark={isDark} style={styles.cardSubtitle}>
              Card subtitle or description
            </Text>
          </CardHeader>
          <CardContent>
            <Text isDark={isDark}>
              This is a card with header, content, and footer sections. Cards are reusable containers for grouping related information.
            </Text>
          </CardContent>
          <CardFooter>
            <Button
              label="Action"
              size="sm"
              variant="primary"
              onPress={() => {}}
              isDark={isDark}
            />
          </CardFooter>
        </Card>

        {/* Role-based Badges */}
        <Text variant="h3" isDark={isDark} style={styles.sectionTitle}>
          Role Badges
        </Text>
        <Card isDark={isDark} style={styles.componentCard}>
          <CardContent style={styles.roleGrid}>
            <View style={styles.roleItem}>
              <Badge label="Operador" isDark={isDark} />
              <Text variant="caption" isDark={isDark} style={styles.roleLabel}>
                Power Control
              </Text>
            </View>
            <View style={styles.roleItem}>
              <Badge label="Supervisor" variant="secondary" isDark={isDark} />
              <Text variant="caption" isDark={isDark} style={styles.roleLabel}>
                Monitoring
              </Text>
            </View>
            <View style={styles.roleItem}>
              <Badge label="Mantenedor" isDark={isDark} />
              <Text variant="caption" isDark={isDark} style={styles.roleLabel}>
                Maintenance
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* Typography Section */}
        <Text variant="h3" isDark={isDark} style={styles.sectionTitle}>
          Typography
        </Text>
        <Card isDark={isDark} style={styles.componentCard}>
          <CardContent style={styles.typographyContainer}>
            <Text variant="h1" isDark={isDark}>
              Heading 1
            </Text>
            <Text variant="h2" isDark={isDark}>
              Heading 2
            </Text>
            <Text variant="h3" isDark={isDark}>
              Heading 3
            </Text>
            <Text variant="h4" isDark={isDark}>
              Heading 4
            </Text>
            <Text variant="body" isDark={isDark}>
              Body text - This is regular paragraph text used for content
            </Text>
            <Text variant="caption" isDark={isDark}>
              Caption text - Used for small labels and metadata
            </Text>
          </CardContent>
        </Card>

        {/* Toast Section */}
        <Text variant="h3" isDark={isDark} style={styles.sectionTitle}>
          Toast Notifications
        </Text>
        <Card isDark={isDark} style={styles.componentCard}>
          <CardContent>
            <ToastShowcase isDark={isDark} />
          </CardContent>
        </Card>

        {/* Loading Overlay Section */}
        <Text variant="h3" isDark={isDark} style={styles.sectionTitle}>
          Loading Overlay
        </Text>
        <Card isDark={isDark} style={styles.componentCard}>
          <CardContent>
            <LoadingOverlayShowcase isDark={isDark} />
          </CardContent>
        </Card>

        {/* Spacing */}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ToastShowcase({ isDark }: { isDark: boolean }) {
  const toast = useToast();
  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <View style={{ gap: spacing.md }}>
      <Button
        label="Success Toast"
        variant="secondary"
        size="sm"
        onPress={() => toast.show('Operation completed successfully!', 'success')}
        isDark={isDark}
      />
      <Button
        label="Error Toast"
        variant="destructive"
        size="sm"
        onPress={() => toast.show('An error occurred!', 'error')}
        isDark={isDark}
      />
      <Button
        label="Info Toast"
        variant="primary"
        size="sm"
        onPress={() => toast.show('This is an informational message.', 'info')}
        isDark={isDark}
      />
      <Button
        label="Warning Toast"
        variant="outline"
        size="sm"
        onPress={() => toast.show('Please be careful!', 'warning')}
        isDark={isDark}
      />
    </View>
  );
}

function LoadingOverlayShowcase({ isDark }: { isDark: boolean }) {
  const { show, hide } = useLoadingOverlay();

  return (
    <View style={{ gap: spacing.md }}>
      <Button
        label="Show Loading"
        variant="primary"
        size="sm"
        onPress={() => {
          show();
          setTimeout(hide, 2000);
        }}
        isDark={isDark}
      />
      <Text variant="caption" isDark={isDark}>
        Click to show a 2-second loading overlay
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  subtitle: {
    marginTop: spacing.sm,
    opacity: 0.7,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  sectionTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  componentCard: {
    gap: spacing.md,
  },
  buttonGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  alertContainer: {
    gap: spacing.md,
  },
  inputContainer: {
    gap: spacing.lg,
  },
  cardSubtitle: {
    marginTop: spacing.xs,
    opacity: 0.7,
  },
  roleGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.md,
  },
  roleItem: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  roleLabel: {
    marginTop: spacing.xs,
  },
  typographyContainer: {
    gap: spacing.md,
  },
});
