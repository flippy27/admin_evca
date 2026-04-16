/**
 * Login Screen - Dhemax Design
 * Gradient background (dark blue→cyan→yellow-green) with logo and animated particles
 */

import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import i18n from "../../lib/i18n";

import { DhemaxLogo } from "@/components/DhemaxLogo";
import { Text } from "@/components/ui/Text";
import { useToast } from "@/components/ui/Toast";
import { useAppStore } from "@/lib/stores/app.store";
import { useAuthStore } from "@/lib/stores/auth.store";
import { spacing } from "@/theme";

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Animated particle component - more visible blurred circles
function AnimatedParticle({
  delay,
  duration,
  position,
}: {
  delay: number;
  duration: number;
  position: { top: number; left: number; size: number };
}) {
  const opacity = useRef(new Animated.Value(0.4)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 0.8,
              duration: duration / 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1.15,
              duration: duration / 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 0.4,
              duration: duration / 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: duration / 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ]),
      ).start();
    };

    startAnimation();
  }, [delay, duration, opacity, scale]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        width: position.size,
        height: position.size,
        borderRadius: position.size / 2,
        opacity,
        transform: [{ scale }],
        backgroundColor: "rgba(70, 163, 181, 0.5)",
        shadowColor: "rgba(70, 163, 181, 0.6)",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
      }}
    />
  );
}

export default function LoginScreen() {
  const { t } = useTranslation();
  const toast = useToast();

  const login = useAuthStore((state) => state.login);
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);

  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width;

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: {
      email: "fcarrasco@dhemax.com",
      password: "123hola!",
      rememberMe: false,
    },
  });

  useEffect(() => {
    const loadRememberedEmail = async () => {
      try {
        await import("@react-native-async-storage/async-storage").then(
          (m) => m.default,
        );
        // Implementation for loading would go here
      } catch (error) {
        console.error("Failed to load remembered email:", error);
      }
    };

    loadRememberedEmail();
  }, []);

  const emailField = watch("email");

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);

    try {
      const success = await login(data.email, data.password, data.rememberMe);

      if (!success) {
        toast.show(t("auth.login.invalidCredentials"), "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.show(t("common.ui.messages.error"), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLanguage = async () => {
    const newLang = language === "es" ? "en" : "es";
    await setLanguage(newLang);
    await i18n.changeLanguage(newLang);
  };

  const isForgotPasswordEnabled =
    !!emailField && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField);

  return (
    <LinearGradient
      colors={["#22335a", "#46A3B5", "#A3B32B"]}
      start={{ x: 0.2, y: 0.2 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      {/* Animated particles background - larger and more visible */}
      <AnimatedParticle
        delay={0}
        duration={8000}
        position={{ top: 100, left: 20, size: 200 }}
      />
      <AnimatedParticle
        delay={2000}
        duration={10000}
        position={{
          top: screenWidth * 0.25,
          left: screenWidth * 0.65,
          size: 180,
        }}
      />
      <AnimatedParticle
        delay={4000}
        duration={12000}
        position={{ top: screenWidth * 0.55, left: 10, size: 160 }}
      />

      <View
        style={{
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.lg,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo - Icon with text */}
          <View style={{ alignItems: "center", marginBottom: spacing.xxl }}>
            {/* Icon + Text Row */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: spacing.md,
                marginBottom: spacing.lg,
              }}
            >
              <View style={{ width: 60, height: 60 }}>
                <DhemaxLogo width={60} height={60} />
              </View>
              <Text
                variant="h2"
                weight="bold"
                style={{
                  color: "#ffffff",
                  fontSize: 28,
                  marginTop: 8,
                }}
              >
                DHEMAX
              </Text>
            </View>
            {/* Subtitle */}
            <Text
              variant="caption"
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                textAlign: "center",
                marginBottom: spacing.md,
              }}
            >
              The Smart Inside Mobility
            </Text>
            <Text
              variant="h3"
              weight="bold"
              style={{
                color: "#ffffff",
                textAlign: "center",
              }}
            >
              {t("auth.login.loginTitle")}
            </Text>
          </View>

          {/* Form Container */}
          <View style={{ gap: spacing.lg }}>
            {/* Email field */}
            <View>
              <Text
                variant="body"
                weight="semibold"
                style={{
                  color: "#ffffff",
                  marginBottom: spacing.sm,
                }}
              >
                {t("auth.login.username")}
              </Text>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: t("common.ui.validation.errors.required"),
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: t("common.ui.validation.errors.strictEmail"),
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      style={{
                        borderWidth: 1,
                        borderColor: errors.email ? "#ef4444" : "#ffffff",
                        borderRadius: 8,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.md,
                        fontSize: 16,
                        color: "#ffffff",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      }}
                      placeholder={t("auth.login.emailPlaceholder")}
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      editable={!isLoading}
                    />
                    {errors.email && (
                      <Text
                        variant="caption"
                        style={{
                          color: "#ef4444",
                          marginTop: spacing.xs,
                        }}
                      >
                        {errors.email.message}
                      </Text>
                    )}
                  </>
                )}
              />
            </View>

            {/* Password field */}
            <View>
              <Text
                variant="body"
                weight="semibold"
                style={{
                  color: "#ffffff",
                  marginBottom: spacing.sm,
                }}
              >
                {t("auth.login.password")}
              </Text>
              <Controller
                control={control}
                name="password"
                rules={{
                  required: t("common.ui.validation.errors.required"),
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      style={{
                        borderWidth: 1,
                        borderColor: errors.password ? "#ef4444" : "#ffffff",
                        borderRadius: 8,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.md,
                        fontSize: 16,
                        color: "#ffffff",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      }}
                      placeholder={t("auth.login.passwordPlaceholder")}
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                      secureTextEntry
                      editable={!isLoading}
                    />
                    {errors.password && (
                      <Text
                        variant="caption"
                        style={{
                          color: "#ef4444",
                          marginTop: spacing.xs,
                        }}
                      >
                        {errors.password.message}
                      </Text>
                    )}
                  </>
                )}
              />
            </View>

            {/* Remember me checkbox */}
            <Controller
              control={control}
              name="rememberMe"
              render={({ field: { onChange, value } }) => (
                <TouchableOpacity
                  onPress={() => onChange(!value)}
                  disabled={isLoading}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.md,
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderWidth: 2,
                      borderColor: value
                        ? "#3B9BC8"
                        : "rgba(255, 255, 255, 0.3)",
                      borderRadius: 4,
                      backgroundColor: value ? "#3B9BC8" : "transparent",
                      justifyContent: "flex-start",
                      alignItems: "flex-start",
                    }}
                  >
                    {value && (
                      <Text
                        style={{
                          color: "#ffffff",
                          fontSize: 16,
                          fontWeight: "bold",
                          //lineHeight: 14,
                          marginTop: -2,
                          marginLeft: 3,
                        }}
                      >
                        ✓
                      </Text>
                    )}
                  </View>
                  <Text
                    variant="body"
                    style={{
                      color: "#ffffff",
                    }}
                  >
                    {t("auth.login.rememberMe")}
                  </Text>
                </TouchableOpacity>
              )}
            />

            {/* Login button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 8,
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.lg,
                marginTop: spacing.md,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="#4CAF50" size="small" />
              ) : (
                <Text
                  variant="body"
                  weight="bold"
                  style={{
                    color: "#4CAF50",
                  }}
                >
                  {t("auth.login.signIn")}
                </Text>
              )}
            </TouchableOpacity>

            {/* Forgot password link */}
            <TouchableOpacity
              disabled={!isForgotPasswordEnabled || isLoading}
              style={{ alignItems: "center" }}
            >
              <Text
                variant="caption"
                style={{
                  color: isForgotPasswordEnabled
                    ? "#ffffff"
                    : "rgba(255, 255, 255, 0.5)",
                  textAlign: "center",
                  textDecorationLine: isForgotPasswordEnabled
                    ? "underline"
                    : "none",
                }}
              >
                {t("auth.login.forgotPassword")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Language switcher - bottom */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: spacing.md,
              marginTop: spacing.xxl,
            }}
          >
            <TouchableOpacity
              onPress={toggleLanguage}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: 6,
                backgroundColor:
                  language === "es" ? "#ffffff" : "rgba(255, 255, 255, 0.2)",
              }}
            >
              <Text
                variant="caption"
                weight="semibold"
                style={{
                  color: language === "es" ? "#4CAF50" : "#ffffff",
                }}
              >
                ES
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleLanguage}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: 6,
                backgroundColor:
                  language === "en" ? "#ffffff" : "rgba(255, 255, 255, 0.2)",
              }}
            >
              <Text
                variant="caption"
                weight="semibold"
                style={{
                  color: language === "en" ? "#4CAF50" : "#ffffff",
                }}
              >
                EN
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}
