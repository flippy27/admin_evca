/**
 * Login Screen - Dhemax Design
 * Gradient background (dark blue→cyan→yellow-green) with logo and animated particles
 */

import { useEffect, useState, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { SvgXml } from "react-native-svg";
import i18n from "../../lib/i18n";

import { Text } from "@/components/ui/Text";
import { useToast } from "@/components/ui/Toast";
import { useAppStore } from "@/lib/stores/app.store";
import { useAuthStore } from "@/lib/stores/auth.store";
import { spacing } from "@/theme";

// Static SVG logo from web project (simplified, remove animate for RN compatibility)
const DHEMAX_LOGO_SVG = `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 87.1 32" style="enable-background:new 0 0 87.1 32;" xml:space="preserve">
<style type="text/css">
	.st0{fill:#FFFFFF;}
	.st1{fill:url(#SVGID_1_);}
	.st2{fill:#FFFFFF;font-family:'OpenSans-Regular', 'Open Sans', Arial, sans-serif;font-size:2.6px;font-weight:400;}
	.st3{fill:#FFFFFF;font-family:'OpenSans-SemiBold', 'Open Sans', Arial, sans-serif;font-size:2.6px;font-weight:600;}
</style>
<g>
	<g>
		<path class="st0" d="M38.6,12.4c-0.6-0.6-1.4-1-2.3-1H34c-0.4,0-0.7,0.3-0.7,0.7v4.8c0,0.4,0.3,0.7,0.7,0.7h2.2c1.6,0,3-1.2,3.1-2.8C39.4,13.9,39.1,13.1,38.6,12.4z M38.4,14.5c0,1.2-0.9,2.1-2.1,2.1h-2v-4.2h2C37.4,12.4,38.4,13.3,38.4,14.5z"/>
		<path class="st0" d="M45.6,11.4c-0.2,0-0.4,0.3-0.4,0.5v1.9c0,0.1-0.1,0.2-0.2,0.2h-3.6c-0.1,0-0.2-0.1-0.2-0.2v-1.9c0-0.2-0.2-0.5-0.4-0.5c-0.3,0-0.6,0.2-0.6,0.5v5.2c0,0.2,0.2,0.5,0.4,0.5c0.3,0,0.6-0.2,0.6-0.5v-2c0-0.1,0.1-0.2,0.2-0.2H45c0.1,0,0.2,0.1,0.2,0.2v1.9c0,0.2,0.2,0.5,0.4,0.5c0.3,0,0.6-0.2,0.6-0.5v-5.2C46.1,11.6,45.9,11.4,45.6,11.4z"/>
		<path class="st0" d="M69.5,16.9l-2.4-5.2c-0.1-0.2-0.3-0.3-0.5-0.3h-0.8c-0.2,0-0.4,0.1-0.5,0.3L63,16.9c-0.1,0.1-0.1,0.3,0,0.5c0.1,0.1,0.2,0.2,0.4,0.2c0.2,0,0.4-0.1,0.4-0.3l0.5-1.1c0-0.1,0.1-0.2,0.2-0.2h3.3c0.1,0,0.2,0.1,0.2,0.2l0.5,1.1c0.1,0.2,0.2,0.3,0.4,0.3c0.2,0,0.3-0.1,0.4-0.2C69.6,17.2,69.6,17.1,69.5,16.9z M67.5,15.1H65c-0.1,0-0.1-0.1-0.1-0.1l1.2-2.6h0.3l1.2,2.6C67.6,15,67.5,15.1,67.5,15.1z"/>
		<path class="st0" d="M61.1,11.4c-0.3,0-0.6,0.2-0.7,0.5l-1.8,3.8h-0.3l-1.8-3.7c-0.1-0.3-0.4-0.4-0.6-0.5c-0.2,0-0.5,0-0.7,0.2c-0.2,0.2-0.3,0.4-0.3,0.6v4.8c0,0.3,0.2,0.5,0.5,0.5c0.3,0,0.5-0.2,0.5-0.5v-4.3l1.7,3.5c0.1,0.2,0.3,0.3,0.5,0.3h0.9c0.2,0,0.4-0.1,0.5-0.3l1.7-3.5l0,4.3c0,0.3,0.2,0.5,0.5,0.5c0.3,0,0.5-0.2,0.5-0.5v-4.8C61.9,11.8,61.5,11.4,61.1,11.4z"/>
		<path class="st0" d="M75.9,16.8L74,14.5l1.9-2.3c0.1-0.1,0.1-0.3,0.1-0.5c-0.1-0.2-0.2-0.3-0.4-0.3c-0.1,0-0.3,0.1-0.4,0.2l-2,2.4H73l-2-2.4c-0.1-0.1-0.2-0.2-0.4-0.2c-0.2,0-0.4,0.1-0.4,0.3c-0.1,0.2-0.1,0.4,0.1,0.5l1.9,2.3l-2,2.3c-0.1,0.1-0.1,0.3-0.1,0.5c0.1,0.2,0.2,0.3,0.4,0.3c0.1,0,0.3-0.1,0.4-0.2L73,15h0.1l2,2.4c0.1,0.1,0.2,0.2,0.4,0.2c0.2,0,0.4-0.1,0.4-0.3C76.1,17.1,76.1,16.9,75.9,16.8z"/>
		<g>
			<path class="st0" d="M48.9,15.1L48.9,15.1c0.1-0.1,0.3-0.1,0.5-0.1H53c0.1,0,0.1,0,0.2,0c0.2-0.1,0.3-0.2,0.3-0.4c0-0.3-0.2-0.5-0.5-0.5h-3.7c-0.4,0-0.7,0.1-1,0.2c-0.3,0.2-0.5,0.4-0.6,0.6c-0.1,0.3-0.2,0.6-0.2,0.9l0,0c0,0.3,0.1,0.6,0.2,0.9c0.1,0.3,0.4,0.5,0.6,0.6c0.3,0.2,0.6,0.2,1,0.2H53c0.3,0,0.5-0.2,0.5-0.5c0-0.2-0.1-0.4-0.3-0.4c-0.1,0-0.1,0-0.2,0h-3.6c-0.2,0-0.4,0-0.5-0.1c-0.1-0.1-0.2-0.2-0.3-0.3c-0.1-0.1-0.1-0.3-0.1-0.4c0-0.1,0-0.3,0.1-0.4C48.7,15.3,48.8,15.2,48.9,15.1z"/>
			<path class="st0" d="M48,13.3L48,13.3c0.2,0,0.4-0.1,0.5-0.4c0,0,0-0.1,0.1-0.1c0.1-0.1,0.2-0.2,0.3-0.3c0.1-0.1,0.3-0.1,0.5-0.1H53c0.1,0,0.1,0,0.2,0c0.2-0.1,0.3-0.2,0.3-0.4c0-0.3-0.2-0.5-0.5-0.5h-3.7c-0.4,0-0.7,0.1-1,0.2c-0.3,0.2-0.5,0.4-0.6,0.6c0,0.1-0.1,0.2-0.1,0.3c-0.1,0.2,0,0.3,0.1,0.5C47.7,13.2,47.9,13.3,48,13.3z"/>
		</g>
	</g>
	<path class="st0" d="M14.7,6.8h-3.4c-0.2,0-0.2,0.2-0.2,0.3l5.4,7.3c0.1,0.1,0.1,0.2,0,0.2l-5.4,7.3c-0.1,0.1,0,0.3,0.2,0.3l3.4,0c0.2,0,0.4-0.1,0.5-0.3l5.3-7.1c0.1-0.2,0.1-0.4,0-0.6l-5.3-7.1C15.1,6.9,14.9,6.8,14.7,6.8z"/>
	<linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="30.5824" y1="28.2761" x2="23.3702" y2="-2.7916">
		<stop offset="0" style="stop-color:#38BAEC"/>
		<stop offset="7.386206e-02" style="stop-color:#40BBE1"/>
		<stop offset="0.2071" style="stop-color:#53BFC1"/>
		<stop offset="0.3844" style="stop-color:#73C58E"/>
		<stop offset="0.5965" style="stop-color:#9ECC48"/>
		<stop offset="0.7942" style="stop-color:#CAD400"/>
	</linearGradient>
	<path class="st1" d="M28.8,23.6c-0.4,0.8-1.1,1.2-2,1.2c-0.7,0-1.3-0.3-1.7-0.8l-2.3-2.8c-1.5-1.9-1.6-4.5-0.2-6.5l0.2-0.2l5.7,6.8C29,22,29.1,22.9,28.8,23.6z M30.9,1.9c-0.2-0.3-0.5-0.5-0.8-0.6c-0.9-0.3-1.9,0-2.4,0.7l-4.8,5.9c-1.5,1.9-1.6,4.4-0.3,6.4l0.2,0.3l8.2-9.9C31.6,3.8,31.6,2.7,30.9,1.9z"/>
	<text x="40" y="21" class="st2">The <tspan class="st3">Smart</tspan> Inside Mobility</text>
</g>
</svg>`;

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
      email: "",
      password: "",
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
        position={{ top: screenWidth * 0.25, left: screenWidth * 0.65, size: 180 }}
      />
      <AnimatedParticle
        delay={4000}
        duration={12000}
        position={{ top: screenWidth * 0.55, left: 10, size: 160 }}
      />

      <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.lg,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo - Dhemax with gradient X and text */}
          <View style={{ alignItems: "center", marginBottom: spacing.xxl }}>
            <View
              style={{
                marginBottom: spacing.lg,
                alignItems: "center",
                justifyContent: "center",
                width: 220,
                height: 90,
              }}
            >
              <SvgXml xml={DHEMAX_LOGO_SVG} width="100%" height="100%" />
            </View>
            <Text
              variant="h3"
              weight="bold"
              style={{
                color: "#ffffff",
                textAlign: "center",
                marginTop: spacing.lg,
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
                    gap: spacing.sm,
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderWidth: 1,
                      borderColor: "#ffffff",
                      borderRadius: 4,
                      backgroundColor: value ? "#ffffff" : "transparent",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {value && (
                      <Text
                        style={{
                          color: "#4CAF50",
                          fontSize: 14,
                          fontWeight: "bold",
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
                  language === "es"
                    ? "#ffffff"
                    : "rgba(255, 255, 255, 0.2)",
              }}
            >
              <Text
                variant="caption"
                weight="semibold"
                style={{
                  color:
                    language === "es"
                      ? "#4CAF50"
                      : "#ffffff",
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
                  language === "en"
                    ? "#ffffff"
                    : "rgba(255, 255, 255, 0.2)",
              }}
            >
              <Text
                variant="caption"
                weight="semibold"
                style={{
                  color:
                    language === "en"
                      ? "#4CAF50"
                      : "#ffffff",
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
