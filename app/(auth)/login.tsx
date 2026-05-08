/**
 * Login Screen - Dhemax Design (visual only — logic unchanged)
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Animated, Dimensions, Easing, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DhemaxLogo } from "@/components/DhemaxLogo";
import { Text } from "@/components/ui/Text";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/lib/stores/auth.store";
import { spacing } from "@/theme";

const BIOMETRIC_CREDS_KEY = "biometric_creds";

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

function AnimatedParticle({
  delay,
  duration,
  position,
}: {
  delay: number;
  duration: number;
  position: { top: number; left: number; size: number };
}) {
  const opacity = useRef(new Animated.Value(0.15)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0.3, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1.15, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0.15, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ]),
    );
    anim.start();
    return () => anim.stop();
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
        backgroundColor: "rgba(70, 163, 181, 0.45)",
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
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const biometricInProgress = useRef(false);
  const isMounted = useRef(true);
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width;

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: {
      // email: "",
      // password: "",
      email: "fcarrasco@dhemax.com",
      password: "123hola!",
      rememberMe: false,
    },
  });

  useEffect(() => {
    isMounted.current = true;

    const checkBiometrics = async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        const savedCreds = await SecureStore.getItemAsync(BIOMETRIC_CREDS_KEY);
        if (isMounted.current) {
          setBiometricAvailable(hasHardware && isEnrolled && !!savedCreds);
        }
      } catch {
        if (isMounted.current) {
          setBiometricAvailable(false);
        }
      }
    };
    checkBiometrics();

    return () => {
      isMounted.current = false;
      // Cancelar autenticación biométrica si está en progreso
      // Usar setTimeout para dar tiempo a que termine naturalmente primero
      if (biometricInProgress.current) {
        setTimeout(() => {
          if (biometricInProgress.current) {
            console.log("[Biometric] Cancelling authentication on unmount");
            LocalAuthentication.cancelAuthenticate().catch(() => {
              // Ignorar errores de cancelación
            });
          }
        }, 500);
      }
    };
  }, []);

  const emailField = watch("email");

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const success = await login(data.email, data.password, data.rememberMe);
      if (success) {
        // Save credentials for future biometric login
        try {
          const hasHardware = await LocalAuthentication.hasHardwareAsync();
          const isEnrolled = await LocalAuthentication.isEnrolledAsync();
          if (hasHardware && isEnrolled) {
            await SecureStore.setItemAsync(BIOMETRIC_CREDS_KEY, JSON.stringify({ email: data.email, password: data.password }));
            setBiometricAvailable(true);
          }
        } catch {
          // Don't fail login if credential save fails
        }
      } else {
        toast.show(t("auth.login.invalidCredentials"), "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.show(t("common.ui.messages.error"), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const onBiometricLogin = async () => {
    if (biometricInProgress.current) {
      console.log("[Biometric] Authentication already in progress, ignoring");
      return;
    }

    const safetyTimeout = setTimeout(() => {
      console.log("[Biometric] Safety timeout triggered, resetting state");
      biometricInProgress.current = false;
      if (isMounted.current) {
        setIsBiometricLoading(false);
      }
    }, 30000);

    biometricInProgress.current = true;
    if (isMounted.current) {
      setIsBiometricLoading(true);
    }

    try {
      // Cancelar cualquier sesión biométrica nativa previa antes de iniciar
      // Esto limpia el LAContext de iOS y previene el crash en el 2do intento
      try {
        await LocalAuthentication.cancelAuthenticate();
      } catch {
        // Ignorar — si no había nada en progreso, esto falla silenciosamente
      }
      // Dar tiempo al sistema para limpiar el estado nativo
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Paso 1: Verificar credenciales guardadas
      let savedCreds: string | null = null;
      try {
        savedCreds = await SecureStore.getItemAsync(BIOMETRIC_CREDS_KEY);
      } catch (storeError) {
        console.error("[Biometric] Error reading credentials:", storeError);
        if (isMounted.current) {
          toast.show(t("auth.login.biometricFailed"), "error");
        }
        return;
      }

      if (!savedCreds) {
        console.log("[Biometric] No saved credentials");
        if (isMounted.current) {
          toast.show(t("auth.login.biometricNoCredentials"), "error");
          setBiometricAvailable(false);
        }
        return;
      }

      // Paso 2: Verificar hardware
      let hasHardware = false;
      let isEnrolled = false;
      try {
        hasHardware = await LocalAuthentication.hasHardwareAsync();
        isEnrolled = await LocalAuthentication.isEnrolledAsync();
      } catch (hwError) {
        console.error("[Biometric] Error checking hardware:", hwError);
        if (isMounted.current) {
          toast.show(t("auth.login.biometricFailed"), "error");
        }
        return;
      }

      if (!hasHardware || !isEnrolled) {
        console.log("[Biometric] Hardware not available or not enrolled");
        if (isMounted.current) {
          toast.show(t("auth.login.biometricFailed"), "error");
          setBiometricAvailable(false);
        }
        return;
      }

      if (!biometricInProgress.current) {
        console.log("[Biometric] Cancelled before starting");
        return;
      }

      // Paso 3: Autenticación biométrica
      let result: LocalAuthentication.LocalAuthenticationResult;
      try {
        console.log("[Biometric] Starting authentication...");
        result = await LocalAuthentication.authenticateAsync({
          promptMessage: t("auth.login.biometricLogin"),
          cancelLabel: t("common.ui.actions.cancel"),
          disableDeviceFallback: false,
        });
        console.log("[Biometric] Authentication result:", result.success ? "success" : "failed");
      } catch (authError: any) {
        console.error("[Biometric] Authentication error:", authError);
        if (authError?.message?.includes("already") || authError?.code === "ERR_ALREADY_AUTHENTICATING") {
          console.log("[Biometric] Already authenticating, ignoring");
          return;
        }
        if (isMounted.current) {
          toast.show(t("auth.login.biometricFailed"), "error");
        }
        return;
      }

      // Paso 4: Manejar resultado
      if (!result.success) {
        const errorCode = (result as any).error;
        console.log("[Biometric] Error code:", errorCode);
        if (errorCode !== "user_cancel" && errorCode !== "system_cancel" && errorCode !== "app_cancel") {
          if (isMounted.current) {
            toast.show(t("auth.login.biometricFailed"), "error");
          }
        }
        return;
      }

      // Paso 5: Parsear credenciales
      let email: string, password: string;
      try {
        const parsed = JSON.parse(savedCreds);
        email = parsed.email;
        password = parsed.password;
        if (!email || !password) {
          throw new Error("Invalid credentials format");
        }
      } catch (parseError) {
        console.error("[Biometric] Error parsing credentials:", parseError);
        if (isMounted.current) {
          toast.show(t("auth.login.biometricFailed"), "error");
          setBiometricAvailable(false);
        }
        return;
      }

      // Esperar que el modal de Face ID se dimisse completamente antes de navegar
      // Sin este delay, la transición de navegación choca con el dismiss del modal en iOS
      await new Promise((resolve) => setTimeout(resolve, 350));

      if (!isMounted.current) return;

      console.log("[Biometric] Attempting login with saved credentials...");
      const success = await login(email, password, false);
      if (!success && isMounted.current) {
        toast.show(t("auth.login.invalidCredentials"), "error");
      }
    } catch (error) {
      console.error("[Biometric] Unexpected error:", error);
      if (isMounted.current) {
        toast.show(t("auth.login.biometricFailed"), "error");
      }
    } finally {
      clearTimeout(safetyTimeout);
      biometricInProgress.current = false;
      if (isMounted.current) {
        setIsBiometricLoading(false);
      }
      console.log("[Biometric] Cleanup completed");
    }
  };

  const isForgotPasswordEnabled = !!emailField && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField);

  return (
    <LinearGradient colors={["#0B1829", "#0F2140", "#162B52"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ flex: 1 }}>
      {/* Subtle animated particles */}
      <AnimatedParticle delay={0} duration={8000} position={{ top: 80, left: -40, size: 220 }} />
      <AnimatedParticle delay={2000} duration={10000} position={{ top: screenWidth * 0.2, left: screenWidth * 0.6, size: 180 }} />
      <AnimatedParticle delay={4000} duration={12000} position={{ top: screenWidth * 0.7, left: -20, size: 160 }} />

      <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "space-between",
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.xxl,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo section */}
          {/* <View style={{ alignSelf: "stretch", alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
              <DhemaxLogo width={60} height={60} />
              <View style={{ justifyContent: "center" }}>
                <Text style={{ color: "#ffffff", fontSize: 28, fontWeight: "800", letterSpacing: 1 }}>DHEMAX</Text>
                <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, marginTop: 2 }}>The Smart Inside Mobility</Text>
              </View>
            </View>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: spacing.sm }}>Workforce App · PoC v1</Text>
          </View> */}
          {/* Logo section */}
          <View
            style={{
              alignSelf: "stretch",
              alignItems: "center",
              marginTop: spacing.xxl + spacing.lg,
              marginBottom: spacing.sm,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: spacing.md,
                minHeight: 76,
              }}
            >
              <DhemaxLogo width={68} height={68} />

              <View
                style={{
                  justifyContent: "center",
                  alignItems: "flex-start",
                  paddingTop: 2,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    color: "#ffffff",
                    fontSize: 30,
                    lineHeight: 36,
                    fontWeight: "800",
                    letterSpacing: 1.4,
                    includeFontPadding: false,
                  }}
                >
                  DHEMAX
                </Text>

                <Text
                  numberOfLines={1}
                  style={{
                    color: "rgba(255,255,255,0.68)",
                    fontSize: 13,
                    lineHeight: 17,
                    marginTop: 2,
                    includeFontPadding: false,
                  }}
                >
                  The Smart Inside Mobility
                </Text>
              </View>
            </View>

            <Text
              style={{
                color: "rgba(255,255,255,0.52)",
                fontSize: 14,
                lineHeight: 18,
                marginTop: spacing.md,
                textAlign: "center",
                includeFontPadding: false,
              }}
            >
              Workforce App · PoC v1
            </Text>
          </View>

          {/* White card */}
          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: spacing.lg + spacing.xs,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            {/* Email */}
            <View style={{ marginBottom: spacing.md }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: "#1f2937",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  marginBottom: spacing.xs,
                }}
              >
                {t("auth.login.username")}
              </Text>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: t("common.ui.validation.errors.required"),
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t("common.ui.validation.errors.strictEmail") },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: errors.email ? "#ef4444" : "#d1d5db",
                        borderRadius: 10,
                        backgroundColor: "#fff",
                        paddingHorizontal: spacing.md,
                      }}
                    >
                      <Ionicons name="person-outline" size={16} color="#9ca3af" style={{ marginRight: spacing.xs }} />
                      <TextInput
                        style={{ flex: 1, fontSize: 15, color: "#111827", paddingVertical: spacing.md }}
                        placeholder={t("auth.login.emailPlaceholder")}
                        placeholderTextColor="#9ca3af"
                        onChangeText={onChange}
                        onBlur={onBlur}
                        value={value}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        editable={!isLoading}
                      />
                    </View>
                    {errors.email && <Text style={{ color: "#ef4444", fontSize: 11, marginTop: spacing.xs }}>{errors.email.message}</Text>}
                  </>
                )}
              />
            </View>

            {/* Password */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: "#1f2937",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  marginBottom: spacing.xs,
                }}
              >
                {t("auth.login.password")}
              </Text>
              <Controller
                control={control}
                name="password"
                rules={{ required: t("common.ui.validation.errors.required") }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: errors.password ? "#ef4444" : "#d1d5db",
                        borderRadius: 10,
                        backgroundColor: "#fff",
                        paddingHorizontal: spacing.md,
                      }}
                    >
                      <Ionicons name="lock-closed-outline" size={16} color="#9ca3af" style={{ marginRight: spacing.xs }} />
                      <TextInput
                        style={{ flex: 1, fontSize: 15, color: "#111827", paddingVertical: spacing.md }}
                        placeholder={t("auth.login.passwordPlaceholder")}
                        placeholderTextColor="#9ca3af"
                        onChangeText={onChange}
                        onBlur={onBlur}
                        value={value}
                        secureTextEntry={!showPassword}
                        editable={!isLoading}
                      />
                      <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#9ca3af" />
                      </TouchableOpacity>
                    </View>
                    {errors.password && (
                      <Text style={{ color: "#ef4444", fontSize: 11, marginTop: spacing.xs }}>{errors.password.message}</Text>
                    )}
                  </>
                )}
              />
            </View>

            {/* Gradient login button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              style={{ borderRadius: 10, overflow: "hidden", marginBottom: spacing.md }}
            >
              <LinearGradient
                colors={["#0ACDA9", "#1477FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingVertical: spacing.md + 2, alignItems: "center", justifyContent: "center", flexDirection: "row" }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "700" }}>{t("auth.login.signIn")}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Face ID button */}
            {biometricAvailable && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  // Debounce extra para prevenir doble-click
                  if (biometricInProgress.current) {
                    console.log("[Biometric] Button pressed while in progress");
                    return;
                  }
                  // Delay mínimo para asegurar que el estado se actualizó
                  requestAnimationFrame(() => {
                    onBiometricLogin();
                  });
                }}
                disabled={isBiometricLoading || isLoading}
                style={{
                  borderRadius: 10,
                  borderWidth: 1.5,
                  borderColor: "#d1d5db",
                  paddingVertical: spacing.md + 2,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: spacing.sm,
                  marginBottom: spacing.md,
                  opacity: isBiometricLoading || isLoading ? 0.5 : 1,
                }}
              >
                {isBiometricLoading ? (
                  <ActivityIndicator color="#1477FF" size="small" />
                ) : (
                  <>
                    <Ionicons name="scan-outline" size={20} color="#1477FF" />
                    <Text style={{ color: "#1477FF", fontSize: 15, fontWeight: "600" }}>{t("auth.login.biometricLogin")}</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* Remember me + forgot password row */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Controller
                control={control}
                name="rememberMe"
                render={({ field: { onChange, value } }) => (
                  <TouchableOpacity
                    onPress={() => onChange(!value)}
                    disabled={isLoading}
                    style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}
                  >
                    <View
                      style={{
                        width: 18,
                        height: 18,
                        borderWidth: 2,
                        borderColor: value ? "#1477FF" : "#9ca3af",
                        borderRadius: 3,
                        backgroundColor: value ? "#1477FF" : "#fff",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {value && <Ionicons name="checkmark" size={12} color="#fff" />}
                    </View>
                    <Text style={{ fontSize: 13, color: "#374151" }}>{t("auth.login.rememberMe")}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity disabled={!isForgotPasswordEnabled || isLoading}>
                <Text style={{ fontSize: 13, color: isForgotPasswordEnabled ? "#1477FF" : "#9ca3af" }}>
                  {t("auth.login.forgotPassword")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, textAlign: "center", marginTop: spacing.xxl }}>
            © 2026 Dhemax · Centro de Carga &amp; WorkFoce
          </Text>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}
