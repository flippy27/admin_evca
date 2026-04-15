import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  Chart,
  Checkbox,
  Drawer,
  ErrorBoundary,
  Input,
  LoadingOverlayComponent,
  Modal,
  Pagination,
  SearchBar,
  Select,
  Separator,
  Switch,
  Table,
  Tabs,
  Text,
  ToastContainer,
  useToast
} from "@/components/ui";
import { getThemeColors, spacing } from "@/theme";
import React, { useState } from "react";
import {
  Switch as RNSwitch,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

export default function ComponentShowcase() {
  const [isDark, setIsDark] = useState(false);
  const colors = getThemeColors(isDark ? "dark" : "light");

  // Component states
  const [switchValue, setSwitchValue] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [selectValue, setSelectValue] = useState("option1");
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { showToast } = useToast();

  const mockTableData = [
    { id: "1", name: "Charger-001", status: "charging", power: 22.5 },
    { id: "2", name: "Charger-002", status: "available", power: 0 },
    { id: "3", name: "Charger-003", status: "faulted", power: 0 },
  ];

  const chartData = [
    { label: "Mon", value: 45 },
    { label: "Tue", value: 52 },
    { label: "Wed", value: 48 },
    { label: "Thu", value: 61 },
    { label: "Fri", value: 55 },
  ];

  const selectOptions = [
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3" },
  ];

  const tabsData = [
    {
      label: "Tab 1",
      key: "tab1",
      content: (
        <View style={{ padding: spacing.lg }}>
          <Text>Content for tab 1</Text>
        </View>
      ),
    },
    {
      label: "Tab 2",
      key: "tab2",
      content: (
        <View style={{ padding: spacing.lg }}>
          <Text>Content for tab 2</Text>
        </View>
      ),
    },
    {
      label: "Tab 3",
      key: "tab3",
      content: (
        <View style={{ padding: spacing.lg }}>
          <Text>Content for tab 3</Text>
        </View>
      ),
    },
  ];

  return (
    <ErrorBoundary>
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.muted,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <Text variant="h2" weight="bold">
            Component Showcase
          </Text>
          <Text
            variant="caption"
            style={{ color: colors.mutedForeground, marginTop: spacing.sm }}
          >
            EVCA Admin - React Native Components
          </Text>
        </View>

        {/* Theme Toggle */}
        <View
          style={[
            styles.themeToggle,
            {
              backgroundColor: colors.muted,
              borderColor: colors.border,
            },
          ]}
        >
          <Text>Dark Mode:</Text>
          <RNSwitch value={isDark} onValueChange={setIsDark} />
        </View>

        <ToastContainer />
        <LoadingOverlayComponent />

        {/* ScrollView */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          showsVerticalScrollIndicator={false}
        >
          {/* Buttons */}
          <View style={styles.section}>
            <Text variant="h3" weight="bold" style={styles.sectionTitle}>
              Buttons
            </Text>
            <Card>
              <CardContent style={{ gap: spacing.md }}>
                <Button
                  label="Primary"
                  variant="default"
                  onPress={() => showToast("Clicked!")}
                />
                <Button
                  label="Secondary"
                  variant="secondary"
                  onPress={() => {}}
                />
                <Button label="Outline" variant="outline" onPress={() => {}} />
                <Button
                  label="Disabled"
                  variant="default"
                  disabled
                  onPress={() => {}}
                />
              </CardContent>
            </Card>
          </View>

          {/* Text & Typography */}
          <View style={styles.section}>
            <Text variant="h3" weight="bold" style={styles.sectionTitle}>
              Typography
            </Text>
            <Card>
              <CardContent style={{ gap: spacing.md }}>
                <Text variant="h1">Heading 1</Text>
                <Text variant="h2">Heading 2</Text>
                <Text variant="h3">Heading 3</Text>
                <Text variant="h4">Heading 4</Text>
                <Text variant="body">Body text</Text>
                <Text variant="caption">Caption text</Text>
              </CardContent>
            </Card>
          </View>

          {/* Badges */}
          <View style={styles.section}>
            <Text variant="h3" weight="bold" style={styles.sectionTitle}>
              Badges
            </Text>
            <Card>
              <CardContent
                style={{
                  flexDirection: "row",
                  gap: spacing.md,
                  flexWrap: "wrap",
                }}
              >
                <Badge label="Default" variant="default" />
                <Badge label="Secondary" variant="secondary" />
                <Badge label="Outline" variant="outline" />
                <Badge label="Charging" variant="default" />
              </CardContent>
            </Card>
          </View>

          {/* Inputs */}
          <View style={styles.section}>
            <Text variant="h3" weight="bold" style={styles.sectionTitle}>
              Inputs & Forms
            </Text>
            <Card>
              <CardContent style={{ gap: spacing.md }}>
                <Input
                  placeholder="Enter text"
                  value={inputValue}
                  onChangeText={setInputValue}
                  label="Text Input"
                />
                <Switch
                  value={switchValue}
                  onValueChange={setSwitchValue}
                  label="Toggle Switch"
                />
                <Checkbox
                  checked={checkboxValue}
                  onChange={setCheckboxValue}
                  label="Checkbox"
                />
                <Select
                  label="Select Option"
                  options={selectOptions}
                  value={selectValue}
                  onChange={setSelectValue}
                />
              </CardContent>
            </Card>
          </View>

          {/* Search Bar */}
          <View style={styles.section}>
            <Text variant="h3" weight="bold" style={styles.sectionTitle}>
              Search Bar
            </Text>
            <Card>
              <CardContent>
                <SearchBar
                  onSearch={setSearchText}
                  placeholder="Search chargers..."
                />
                {searchText && (
                  <Text style={{ marginTop: spacing.md }}>
                    Searching for: {searchText}
                  </Text>
                )}
              </CardContent>
            </Card>
          </View>

          {/* Table */}
          <View style={styles.section}>
            <Text variant="h3" weight="bold" style={styles.sectionTitle}>
              Table
            </Text>
            <Card>
              <CardContent>
                <Table
                  columns={[
                    { key: "name", label: "Name", width: "40%" },
                    { key: "status", label: "Status", width: "30%" },
                    { key: "power", label: "Power (kW)", width: "30%" },
                  ]}
                  data={mockTableData}
                  keyExtractor={(item) => item.id}
                  onRowPress={(row) => showToast(`Selected: ${row.name}`)}
                />
              </CardContent>
            </Card>
          </View>

          {/* Tabs */}
          <View style={styles.section}>
            <Text variant="h3" weight="bold" style={styles.sectionTitle}>
              Tabs
            </Text>
            <Card>
              <CardContent style={{ height: 250 }}>
                <Tabs tabs={tabsData} />
              </CardContent>
            </Card>
          </View>

          {/* Modal */}
          <View style={styles.section}>
            <Text variant="h3" weight="bold" style={styles.sectionTitle}>
              Modal
            </Text>
            <Card>
              <CardContent>
                <Button
                  label="Open Modal"
                  variant="default"
                  onPress={() => setModalVisible(true)}
                />
                <Modal
                  visible={modalVisible}
                  onClose={() => setModalVisible(false)}
                  title="Modal Dialog"
                  actions={[
                    {
                      label: "Cancel",
                      onPress: () => {},
                      variant: "secondary",
                    },
                    {
                      label: "Confirm",
                      onPress: () => showToast("Confirmed!"),
                      variant: "default",
                    },
                  ]}
                >
                  <Text>
                    This is a modal dialog. You can place any content here.
                  </Text>
                </Modal>
              </CardContent>
            </Card>
          </View>

          {/* Drawer */}
          <View style={styles.section}>
            <Text variant="h3" weight="bold" style={styles.sectionTitle}>
              Drawer
            </Text>
            <Card>
              <CardContent>
                <Button
                  label="Open Drawer"
                  variant="default"
                  onPress={() => setDrawerVisible(true)}
                />
                <Drawer
                  visible={drawerVisible}
                  onClose={() => setDrawerVisible(false)}
                >
                  <View style={{ padding: spacing.lg }}>
                    <Text variant="h3" weight="bold">
                      Drawer Menu
                    </Text>
                    <Text style={{ marginTop: spacing.lg }}>Dashboard</Text>
                    <Text style={{ marginTop: spacing.md }}>Chargers</Text>
                    <Text style={{ marginTop: spacing.md }}>Sites</Text>
                    <Text style={{ marginTop: spacing.md }}>Settings</Text>
                  </View>
                </Drawer>
              </CardContent>
            </Card>
          </View>

          {/* Chart */}
          <View style={styles.section}>
            <Text variant="h3" weight="bold" style={styles.sectionTitle}>
              Chart
            </Text>
            <Card>
              <CardContent>
                <Chart
                  type="bar"
                  data={chartData}
                  title="Weekly Energy Usage"
                />
              </CardContent>
            </Card>
          </View>

          {/* Pagination */}
          <View style={styles.section}>
            <Text variant="h3" weight="bold" style={styles.sectionTitle}>
              Pagination
            </Text>
            <Card>
              <CardContent>
                <Pagination
                  currentPage={currentPage}
                  totalPages={5}
                  onPageChange={setCurrentPage}
                />
              </CardContent>
            </Card>
          </View>

          {/* Alerts */}
          <View style={styles.section}>
            <Text variant="h3" weight="bold" style={styles.sectionTitle}>
              Alerts
            </Text>
            <Card>
              <CardContent style={{ gap: spacing.md }}>
                <Alert
                  variant="default"
                  title="Info"
                  message="This is an info alert"
                />
                <Alert
                  variant="warning"
                  title="Warning"
                  message="This is a warning alert"
                />
                <Alert
                  variant="destructive"
                  title="Error"
                  message="This is an error alert"
                />
                <Alert
                  variant="success"
                  title="Success"
                  message="This is a success alert"
                />
              </CardContent>
            </Card>
          </View>

          {/* Separator */}
          <View style={styles.section}>
            <Text variant="h3" weight="bold" style={styles.sectionTitle}>
              Separator
            </Text>
            <Card>
              <CardContent style={{ gap: spacing.md }}>
                <Text>Above separator</Text>
                <Separator />
                <Text>Below separator</Text>
              </CardContent>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  themeToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
});
