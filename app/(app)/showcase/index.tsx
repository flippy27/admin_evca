import React from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/Text";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getThemeColors, spacing } from "@/theme";

export default function ShowcaseScreen() {
  const colors = getThemeColors("light");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          gap: spacing.lg,
          paddingBottom: spacing.xl,
        }}
      >
        {/* Header */}
        <View style={{ gap: spacing.sm }}>
          <Text variant="h2" weight="bold">
            Showcase
          </Text>
          <Text variant="body" style={{ color: colors.mutedForeground }}>
            Component & Feature Demo
          </Text>
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
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>
              <View style={{ alignItems: "center", gap: spacing.sm }}>
                <Ionicons name="home" size={32} color={colors.primary} />
                <Text variant="caption">Home</Text>
              </View>
              <View style={{ alignItems: "center", gap: spacing.sm }}>
                <Ionicons name="flash-sharp" size={32} color={colors.primary} />
                <Text variant="caption">Charger</Text>
              </View>
              <View style={{ alignItems: "center", gap: spacing.sm }}>
                <Ionicons name="location" size={32} color={colors.primary} />
                <Text variant="caption">Location</Text>
              </View>
              <View style={{ alignItems: "center", gap: spacing.sm }}>
                <Ionicons name="alert" size={32} color={colors.destructive} />
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
              <Button label="Destructive" variant="destructive" onPress={() => {}} />
              <Button label="Disabled" disabled onPress={() => {}} />
            </View>
          </CardContent>
        </Card>

        {/* Spacing */}
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
