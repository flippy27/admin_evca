/**
 * App Container — wraps tabs + sidebar
 * Manages sidebar open/close state
 */

import React, { ReactNode, useState } from "react";
import { View, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sidebar } from "./Sidebar";
import { getThemeColors } from "@/theme";

interface AppContainerProps {
  children: ReactNode;
}

export function AppContainer({ children }: AppContainerProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const colors = getThemeColors("light");
  const insets = useSafeAreaInsets();

  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Backdrop */}
      {sidebarOpen && (
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={closeSidebar}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
        />
      )}

      {/* Content with SafeAreaView for notch */}
      <SafeAreaView style={{ flex: 1, position: "relative" }}>
        {/* Menu Toggle Button */}
        {!sidebarOpen && (
          <TouchableOpacity
            onPress={openSidebar}
            style={{
              position: "absolute",
              top: insets.top + 12,
              left: 12,
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: colors.card,
              justifyContent: "center",
              alignItems: "center",
              zIndex: 100,
              elevation: 5,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }}
          >
            <View style={{ gap: 4 }}>
              <View
                style={{
                  width: 20,
                  height: 2,
                  backgroundColor: colors.foreground,
                  borderRadius: 1,
                }}
              />
              <View
                style={{
                  width: 20,
                  height: 2,
                  backgroundColor: colors.foreground,
                  borderRadius: 1,
                }}
              />
              <View
                style={{
                  width: 20,
                  height: 2,
                  backgroundColor: colors.foreground,
                  borderRadius: 1,
                }}
              />
            </View>
          </TouchableOpacity>
        )}

        {/* Children (Tabs) */}
        {children}
      </SafeAreaView>
    </View>
  );
}
