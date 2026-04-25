/**
 * App Container — wraps tabs + sidebar
 * Manages sidebar open/close state
 */

import React, { ReactNode, useState, createContext, useContext, useRef, useEffect } from "react";
import { Animated, View, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname } from "expo-router";
import { Sidebar } from "./Sidebar";
import { getThemeColors } from "@/theme";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";

export type ActiveRole = "operator" | "supervisor" | "maintainer";

// Sidebar context
const SidebarContext = createContext<{
  openSidebar: () => void;
  activeRole: ActiveRole;
  setActiveRole: (role: ActiveRole) => void;
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
  const [activeRole, setActiveRole] = useState<ActiveRole>("operator");
  const resolvedScheme = useResolvedColorScheme();
  const colors = getThemeColors(resolvedScheme);
  const insets = useSafeAreaInsets();

  const backdropAnim = useRef(new Animated.Value(0)).current;

  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  useEffect(() => {
    Animated.timing(backdropAnim, {
      toValue: sidebarOpen ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [sidebarOpen]);

  // Hide menu button in detail screens (they have their own back button)
  const pathname = usePathname();
  const isDetailScreen = pathname?.includes("[id]") || pathname?.includes("energy");

  return (
    <SidebarContext.Provider value={{ openSidebar, activeRole, setActiveRole }}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        {/* Backdrop */}
        <Animated.View
          pointerEvents={sidebarOpen ? "auto" : "none"}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 999,
            opacity: backdropAnim,
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={closeSidebar}
          />
        </Animated.View>

        {/* Content with SafeAreaView for notch */}
        <SafeAreaView style={{ flex: 1, position: "relative" }}>
          {/* Children (Tabs) */}
          {children}
        </SafeAreaView>
      </View>
    </SidebarContext.Provider>
  );
}
