import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import React, { useState } from "react";
import { SafeAreaView, ScrollView, Switch, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/Text";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Checkbox } from "@/components/ui/Checkbox";
import { SkeletonCard, SkeletonLine } from "@/components/ui/SkeletonLoader";
import { SearchBar } from "@/components/ui/SearchBar";
import { useAppStore } from "@/lib/stores/app.store";
import { getThemeColors, spacing } from "@/theme";

export default function ShowcaseScreen() {
  const resolvedScheme = useResolvedColorScheme();
  const colors = getThemeColors(resolvedScheme);
  const setColorScheme = useAppStore((s) => s.setColorScheme);
  const [searchText, setSearchText] = useState("");
  const [checkboxState, setCheckboxState] = useState({ unchecked: false, checked: true });

  const toggleTheme = (isDark: boolean) => {
    setColorScheme(isDark ? "dark" : "light");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          gap: spacing.lg,
          paddingBottom: spacing.xl,
        }}
      >
        {/* Header with Theme Toggle */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ gap: spacing.sm, flex: 1 }}>
            <Text variant="h2" weight="bold">
              Showcase
            </Text>
            <Text variant="body" style={{ color: colors.mutedForeground }}>
              Component & Feature Demo
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
            <Ionicons
              name={resolvedScheme === "dark" ? "moon" : "sunny"}
              size={20}
              color={colors.primary}
            />
            <Switch
              value={resolvedScheme === "dark"}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.muted, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>
        </View>

        {/* Colors */}
        <Card>
          <CardContent style={{ gap: spacing.md }}>
            <Text variant="h4" weight="bold">
              Colors
            </Text>
            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: "row", gap: spacing.sm }}>
                <View
                  style={{
                    flex: 1,
                    height: 40,
                    backgroundColor: colors.primary,
                    borderRadius: 8,
                  }}
                />
                <Text variant="caption" style={{ color: colors.mutedForeground }}>
                  Primary
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: spacing.sm }}>
                <View
                  style={{
                    flex: 1,
                    height: 40,
                    backgroundColor: colors.destructive,
                    borderRadius: 8,
                  }}
                />
                <Text variant="caption" style={{ color: colors.mutedForeground }}>
                  Destructive
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: spacing.sm }}>
                <View
                  style={{
                    flex: 1,
                    height: 40,
                    backgroundColor: colors.muted,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                />
                <Text variant="caption" style={{ color: colors.mutedForeground }}>
                  Muted
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: spacing.sm }}>
                <View
                  style={{
                    flex: 1,
                    height: 40,
                    backgroundColor: colors.foreground,
                    borderRadius: 8,
                  }}
                />
                <Text variant="caption" style={{ color: colors.mutedForeground }}>
                  Foreground
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: spacing.sm }}>
                <View
                  style={{
                    flex: 1,
                    height: 40,
                    backgroundColor: colors.card,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                />
                <Text variant="caption" style={{ color: colors.mutedForeground }}>
                  Card
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: spacing.sm }}>
                <View
                  style={{
                    flex: 1,
                    height: 40,
                    backgroundColor: colors.background,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                />
                <Text variant="caption" style={{ color: colors.mutedForeground }}>
                  Background
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>


        {/* Role Colors */}
        <Card>
          <CardContent style={{ gap: spacing.md }}>
            <Text variant="h4" weight="bold">
              Role Colors
            </Text>
            <View style={{ gap: spacing.md }}>
              <View style={{ flexDirection: "row", gap: spacing.md, alignItems: "center" }}>
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 8,
                    backgroundColor: "#9C27B0",
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text variant="body" weight="bold">
                    Operador
                  </Text>
                  <Text variant="caption" style={{ color: colors.mutedForeground }}>
                    #9C27B0
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: spacing.md, alignItems: "center" }}>
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 8,
                    backgroundColor: "#00BCD4",
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text variant="body" weight="bold">
                    Mantenedor
                  </Text>
                  <Text variant="caption" style={{ color: colors.mutedForeground }}>
                    #00BCD4
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: spacing.md, alignItems: "center" }}>
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 8,
                    backgroundColor: "#4CAF50",
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text variant="body" weight="bold">
                    Supervisor
                  </Text>
                  <Text variant="caption" style={{ color: colors.mutedForeground }}>
                    #4CAF50
                  </Text>
                </View>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Status Colors */}
        <Card>
          <CardContent style={{ gap: spacing.md }}>
            <Text variant="h4" weight="bold">
              Status & Alert Colors
            </Text>
            <View style={{ gap: spacing.md }}>
              <View style={{ flexDirection: "row", gap: spacing.md, alignItems: "center" }}>
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 8,
                    backgroundColor: "#4CAF50",
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text variant="body" weight="bold">
                    Success
                  </Text>
                  <Text variant="caption" style={{ color: colors.mutedForeground }}>
                    #4CAF50
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: spacing.md, alignItems: "center" }}>
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 8,
                    backgroundColor: "#FFC107",
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text variant="body" weight="bold">
                    Warning
                  </Text>
                  <Text variant="caption" style={{ color: colors.mutedForeground }}>
                    #FFC107
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: spacing.md, alignItems: "center" }}>
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 8,
                    backgroundColor: "#F44336",
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text variant="body" weight="bold">
                    Error
                  </Text>
                  <Text variant="caption" style={{ color: colors.mutedForeground }}>
                    #F44336
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: spacing.md, alignItems: "center" }}>
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 8,
                    backgroundColor: "#2196F3",
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text variant="body" weight="bold">
                    Info
                  </Text>
                  <Text variant="caption" style={{ color: colors.mutedForeground }}>
                    #2196F3
                  </Text>
                </View>
              </View>
            </View>
          </CardContent>
        </Card>
        {/* Typography */}
        <Card>
          <CardContent style={{ gap: spacing.md }}>
            <Text variant="h4" weight="bold">
              Typography
            </Text>
            <View style={{ gap: spacing.md }}>
              <Text variant="h1" weight="bold">
                Heading 1
              </Text>
              <Text variant="h2" weight="bold">
                Heading 2
              </Text>
              <Text variant="h3" weight="bold">
                Heading 3
              </Text>
              <Text variant="h4" weight="bold">
                Heading 4
              </Text>
              <Text variant="body" weight="bold">
                Body Bold
              </Text>
              <Text variant="body">Body Regular</Text>
              <Text variant="caption">Caption</Text>
            </View>
          </CardContent>
        </Card>

        {/* Icons */}
        <Card>
          <CardContent style={{ gap: spacing.md }}>
            <Text variant="h4" weight="bold">
              Icons
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                gap: spacing.md,
              }}
            >
              <View style={{ alignItems: "center", gap: spacing.sm }}>
                <Ionicons name="home" size={32} color={colors.primary} />
                <Text variant="caption">Home</Text>
              </View>
              <View style={{ alignItems: "center", gap: spacing.sm }}>
                <Ionicons name="flash" size={32} color={colors.primary} />
                <Text variant="caption">Charger</Text>
              </View>
              <View style={{ alignItems: "center", gap: spacing.sm }}>
                <Ionicons name="location" size={32} color={colors.primary} />
                <Text variant="caption">Location</Text>
              </View>
              <View style={{ alignItems: "center", gap: spacing.sm }}>
                <Ionicons name="alert-circle" size={32} color="#FFC107" />
                <Text variant="caption">Alert</Text>
              </View>
              <View style={{ alignItems: "center", gap: spacing.sm }}>
                <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
                <Text variant="caption">Success</Text>
              </View>
              <View style={{ alignItems: "center", gap: spacing.sm }}>
                <Ionicons name="eye" size={32} color={colors.primary} />
                <Text variant="caption">View</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card>
          <CardContent style={{ gap: spacing.md }}>
            <Text variant="h4" weight="bold">
              Buttons
            </Text>
            <View style={{ gap: spacing.md }}>
              <Button label="Primary" onPress={() => {}} />
              <Button label="Secondary" variant="secondary" onPress={() => {}} />
              <Button label="Outline" variant="outline" onPress={() => {}} />
              <Button label="Destructive" variant="destructive" onPress={() => {}} />
              <Button label="Small" size="sm" onPress={() => {}} />
              <Button label="Disabled" disabled onPress={() => {}} />
            </View>
          </CardContent>
        </Card>

        {/* Input Fields */}
        <Card>
          <CardContent style={{ gap: spacing.md }}>
            <Text variant="h4" weight="bold">
              Input Fields
            </Text>
            <View style={{ gap: spacing.md }}>
              <Input label="Text input" placeholder="Enter text..." />
              <Input
                label="Email input"
                placeholder="Enter email..."
                keyboardType="email-address"
              />
              <Input
                label="Number input"
                placeholder="Enter number..."
                keyboardType="numeric"
              />
              <Input label="Password input" placeholder="Enter password..." secureTextEntry />
            </View>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardContent style={{ gap: spacing.md }}>
            <Text variant="h4" weight="bold">
              Badges
            </Text>
            <View style={{ flexDirection: "row", gap: spacing.md, flexWrap: "wrap" }}>
              <Badge label="Default" variant="default" />
              <Badge label="Secondary" variant="secondary" />
              <Badge label="Destructive" variant="destructive" />
            </View>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardContent style={{ gap: spacing.md }}>
            <Text variant="h4" weight="bold">
              Alerts
            </Text>
            <View style={{ gap: spacing.md }}>
              <Alert variant="default" title="Info" message="This is an informational message" />
              <Alert variant="destructive" title="Error" message="This is an error message" />
            </View>
          </CardContent>
        </Card>

        {/* Checkbox */}
        <Card>
          <CardContent style={{ gap: spacing.md }}>
            <Text variant="h4" weight="bold">
              Checkbox
            </Text>
            <View style={{ gap: spacing.md }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                <Checkbox
                  checked={checkboxState.unchecked}
                  onChange={(val) =>
                    setCheckboxState((prev) => ({ ...prev, unchecked: val }))
                  }
                />
                <Text variant="body">Unchecked</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                <Checkbox
                  checked={checkboxState.checked}
                  onChange={(val) => setCheckboxState((prev) => ({ ...prev, checked: val }))}
                />
                <Text variant="body">Checked</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Search Bar */}
        <Card>
          <CardContent style={{ gap: spacing.md }}>
            <Text variant="h4" weight="bold">
              Search Bar
            </Text>
            <SearchBar placeholder="Search..." onSearch={setSearchText} />
            {searchText && (
              <Text variant="caption" style={{ color: colors.mutedForeground }}>
                Searching for: &quot;{searchText}&quot;
              </Text>
            )}
          </CardContent>
        </Card>

        {/* Skeleton Loaders */}
        <Card>
          <CardContent style={{ gap: spacing.md }}>
            <Text variant="h4" weight="bold">
              Skeleton Loaders
            </Text>
            <View style={{ gap: spacing.md }}>
              <SkeletonCard lines={2} />
              <View style={{ gap: spacing.sm }}>
                <SkeletonLine width="100%" height={12} />
                <SkeletonLine width="80%" height={12} />
                <SkeletonLine width="60%" height={12} />
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Spacing System */}
        <Card>
          <CardContent style={{ gap: spacing.md }}>
            <Text variant="h4" weight="bold">
              Spacing System
            </Text>
            <View style={{ gap: spacing.md }}>
              <View
                style={{
                  height: 20,
                  backgroundColor: colors.primary,
                  justifyContent: "center",
                  paddingLeft: spacing.sm,
                }}
              >
                <Text variant="caption" style={{ color: "white" }}>
                  sm
                </Text>
              </View>
              <View
                style={{
                  height: 24,
                  backgroundColor: colors.primary,
                  justifyContent: "center",
                  paddingLeft: spacing.md,
                }}
              >
                <Text variant="caption" style={{ color: "white" }}>
                  md
                </Text>
              </View>
              <View
                style={{
                  height: 32,
                  backgroundColor: colors.primary,
                  justifyContent: "center",
                  paddingLeft: spacing.lg,
                }}
              >
                <Text variant="caption" style={{ color: "white" }}>
                  lg
                </Text>
              </View>
              <View
                style={{
                  height: 40,
                  backgroundColor: colors.primary,
                  justifyContent: "center",
                  paddingLeft: spacing.xl,
                }}
              >
                <Text variant="caption" style={{ color: "white" }}>
                  xl
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Status Indicators */}
        <Card>
          <CardContent style={{ gap: spacing.md }}>
            <Text variant="h4" weight="bold">
              Status Indicators
            </Text>
            <View style={{ gap: spacing.sm }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.md,
                }}
              >
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "#4CAF50",
                  }}
                />
                <Text variant="body">Active</Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.md,
                }}
              >
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "#FFC107",
                  }}
                />
                <Text variant="body">Pending</Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.md,
                }}
              >
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "#F44336",
                  }}
                />
                <Text variant="body">Inactive</Text>
              </View>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
