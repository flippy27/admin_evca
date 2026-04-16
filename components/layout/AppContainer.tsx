/**
 * App Container — wraps tabs + sidebar
 * Manages sidebar open/close state
 */

import React, { ReactNode, useState, createContext, useContext } from "react";
import { View, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname } from "expo-router";
import { Sidebar } from "./Sidebar";
import { getThemeColors } from "@/theme";

// Sidebar context
const SidebarContext = createContext<{
  openSidebar: () => void;
} | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within AppContainer");
  }
  return context;
}

interface AppContainerProps {
  children: ReactNode;
}

export function AppContainer({ children }: AppContainerProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const colors = getThemeColors("light");
  const insets = useSafeAreaInsets();

  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  // Hide menu button in detail screens (they have their own back button)
  const pathname = usePathname();
  const isDetailScreen = pathname?.includes("[id]") || pathname?.includes("energy");

  return (
    <SidebarContext.Provider value={{ openSidebar }}>
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
          {/* Children (Tabs) */}
          {children}
        </SafeAreaView>
      </View>
    </SidebarContext.Provider>
  );
}
