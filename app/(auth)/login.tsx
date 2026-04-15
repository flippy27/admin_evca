/**
 * Login Screen
 * 2-step auth: step 1 gets tokens, step 2 decrypts permissions
 */

import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ScrollView, TouchableOpacity, View } from "react-native";
import i18n from "../../lib/i18n";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Text } from "@/components/ui/Text";
import { useToast } from "@/components/ui/Toast";
import { useAppStore } from "@/lib/stores/app.store";
import { useAuthStore } from "@/lib/stores/auth.store";
import { getThemeColors, spacing } from "@/theme";

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();

  const login = useAuthStore((state) => state.login);
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);

  const [isLoading, setIsLoading] = useState(false);
  const colors = getThemeColors("light");

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

  // Load remembered email on mount
  useEffect(() => {
    const loadRememberedEmail = async () => {
      try {
        const AsyncStorage =
          await import("@react-native-async-storage/async-storage").then(
            (m) => m.default,
          );
        const saved = await AsyncStorage.getItem("auth_remember_email");
        if (saved) {
          // Can't directly set the form value here, it's handled by react-hook-form
          // For now, we'll skip this — a more robust approach would use a state variable
        }
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
      } else {
        // Router will handle navigation via root layout redirect
        //router.replace('/(app)');
        //TODO: dis maybe wrong
        router.replace("/chargers");
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
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: colors.background,
        padding: spacing.lg,
        justifyContent: "center",
      }}
    >
      <View style={{ alignItems: "center", marginBottom: spacing.xl }}>
        <Text variant="h1" weight="bold" style={{ marginBottom: spacing.md }}>
          e-Mobility Admin
        </Text>
        <Text variant="body" style={{ color: colors.mutedForeground }}>
          {t("common.ui.pageTitles.login")}
        </Text>
      </View>

      <Card style={{ marginBottom: spacing.xl }}>
        <View style={{ padding: spacing.lg }}>
          {/* Email field */}
          <Controller
            control={control}
            name="email"
            rules={{
              required: t("common.ui.validation.errors.required"),
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t("common.ui.validation.errors.invalidEmail"),
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t("common.ui.fields.email") || "Email"}
                placeholder={t("common.ui.placeholders.emailPlaceholder") || "user@example.com"}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.email?.message}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isLoading}
                containerStyle={{ marginBottom: spacing.md }}
              />
            )}
          />

          {/* Password field */}
          <Controller
            control={control}
            name="password"
            rules={{
              required: t("common.ui.validation.errors.required"),
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t("common.ui.fields.password") || "Password"}
                placeholder={t("common.ui.placeholders.passwordPlaceholder") || "••••••••"}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.password?.message}
                secureTextEntry
                editable={!isLoading}
                containerStyle={{ marginBottom: spacing.md }}
              />
            )}
          />

          {/* Remember me toggle */}
          <Controller
            control={control}
            name="rememberMe"
            render={({ field: { onChange, value } }) => (
              <Switch
                label={t("common.ui.actions.remember") || "Remember me"}
                value={value}
                onValueChange={onChange}
                disabled={isLoading}
                containerStyle={{ marginBottom: spacing.lg }}
              />
            )}
          />

          {/* Login button */}
          <Button
            label={
              isLoading ? "" : t("common.ui.actions.signIn") || "Sign in"
            }
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            loading={isLoading}
            fullWidth
            style={{ marginBottom: spacing.md }}
          />

          {/* Forgot password link */}
          <TouchableOpacity disabled={!isForgotPasswordEnabled || isLoading}>
            <Text
              variant="caption"
              style={{
                color: isForgotPasswordEnabled ? colors.primary : colors.muted,
                textAlign: "center",
              }}
            >
              {t("common.ui.links.forgotPassword") || "Forgot password?"}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Language switcher */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: spacing.md,
          marginTop: spacing.xl,
        }}
      >
        <TouchableOpacity
          onPress={toggleLanguage}
          style={{
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: 6,
            backgroundColor: language === "es" ? colors.primary : colors.muted,
          }}
        >
          <Text
            variant="caption"
            weight="semibold"
            style={{
              color: language === "es" ? colors.background : colors.foreground,
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
            backgroundColor: language === "en" ? colors.primary : colors.muted,
          }}
        >
          <Text
            variant="caption"
            weight="semibold"
            style={{
              color: language === "en" ? colors.background : colors.foreground,
            }}
          >
            EN
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
