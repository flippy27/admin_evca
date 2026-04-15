import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { useAppStore } from "@/lib/stores/app.store";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useProfileStore } from "@/lib/stores/profile.store";
import { usePermissionGuard } from "@/lib/hooks/usePermissionGuard";
import { AuthPermissionsEnum } from "@/lib/types/auth.types";
import { getThemeColors, spacing } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView, ScrollView, View, RefreshControl } from "react-native";
import React, { useEffect, useState } from "react";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = getThemeColors("light");

  // Permission guard
  const hasEditPermission = usePermissionGuard({
    requiredPermissions: [AuthPermissionsEnum.PROFILE_EDIT],
  });

  // Stores
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const language = useAppStore((s) => s.language);
  const colorScheme = useAppStore((s) => s.colorScheme);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const setColorScheme = useAppStore((s) => s.setColorScheme);

  const {
    profile,
    profileLoading,
    profileError,
    updateLoading,
    updateError,
    passwordLoading,
    passwordError,
    fetchProfile,
    updateProfile,
    changePassword,
    clearError,
  } = useProfileStore();

  // Local form states
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [personalForm, setPersonalForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setPersonalForm({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
      });
    }
  }, [profile]);

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const handleSavePersonal = async () => {
    try {
      await updateProfile(personalForm);
      setIsEditingPersonal(false);
    } catch (error) {
      // Error handled by store
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      // TODO: show error
      return;
    }
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setIsChangingPassword(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      // Error handled by store
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          gap: spacing.lg,
          paddingBottom: spacing.xl,
        }}
        refreshControl={
          <RefreshControl
            refreshing={profileLoading}
            onRefresh={() => {
              clearError("profile");
              fetchProfile();
            }}
          />
        }
      >
        <View>
          <Text variant="h2" weight="bold">
            {t("common.ui.pageTitles.profile") || "Profile"}
          </Text>
          <Text
            variant="body"
            style={{ color: colors.mutedForeground, marginTop: spacing.sm }}
          >
            {t("common.ui.labels.manageAccount") || "Manage your account"}
          </Text>
        </View>

        {profileError && (
          <Alert variant="destructive" title="Error" message={profileError} />
        )}

        {profile && (
          <Card>
            <CardHeader>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.md,
                }}
              >
                <Ionicons
                  name="person-circle"
                  size={48}
                  color={colors.primary}
                />
                <View style={{ flex: 1 }}>
                  <Text variant="h4" weight="bold">
                    {profile.firstName} {profile.lastName}
                  </Text>
                  <Text
                    variant="body"
                    style={{ color: colors.mutedForeground }}
                  >
                    {profile.email}
                  </Text>
                </View>
              </View>
            </CardHeader>
            <CardContent style={{ gap: spacing.md }}>
              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  paddingTop: spacing.md,
                }}
              >
                <Text
                  variant="caption"
                  style={{
                    color: colors.mutedForeground,
                    marginBottom: spacing.sm,
                  }}
                >
                  {t("common.ui.labels.role") || "Role"}
                </Text>
                <Badge label={profile.role} variant="secondary" />
              </View>
              {profile.company && (
                <View
                  style={{
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    paddingTop: spacing.md,
                  }}
                >
                  <Text
                    variant="caption"
                    style={{
                      color: colors.mutedForeground,
                      marginBottom: spacing.sm,
                    }}
                  >
                    {t("common.ui.labels.company") || "Company"}
                  </Text>
                  <Text variant="body">{profile.company}</Text>
                </View>
              )}
            </CardContent>
          </Card>
        )}

        {/* Personal Information Section */}
        {profile && (
          <Card>
            <CardHeader>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text variant="h4" weight="bold">
                  {t("profile.personalInfo.title") || "Personal Information"}
                </Text>
                {hasEditPermission && !isEditingPersonal && (
                  <Button
                    label="Edit"
                    size="sm"
                    variant="outline"
                    onPress={() => setIsEditingPersonal(true)}
                  />
                )}
              </View>
            </CardHeader>
            <CardContent style={{ gap: spacing.md }}>
              {updateError && (
                <Alert
                  variant="destructive"
                  title="Error"
                  message={updateError}
                />
              )}

              {isEditingPersonal ? (
                <>
                  <Input
                    label="First Name"
                    value={personalForm.firstName}
                    onChangeText={(val) =>
                      setPersonalForm({ ...personalForm, firstName: val })
                    }
                  />
                  <Input
                    label="Last Name"
                    value={personalForm.lastName}
                    onChangeText={(val) =>
                      setPersonalForm({ ...personalForm, lastName: val })
                    }
                  />
                  <Input
                    label="Email"
                    value={personalForm.email}
                    onChangeText={(val) =>
                      setPersonalForm({ ...personalForm, email: val })
                    }
                    keyboardType="email-address"
                  />

                  <View style={{ gap: spacing.md, marginTop: spacing.md }}>
                    <Button
                      label={updateLoading ? "Saving..." : "Save"}
                      variant="default"
                      onPress={handleSavePersonal}
                      disabled={updateLoading}
                    />
                    <Button
                      label="Cancel"
                      variant="outline"
                      onPress={() => {
                        setIsEditingPersonal(false);
                        if (profile) {
                          setPersonalForm({
                            firstName: profile.firstName,
                            lastName: profile.lastName,
                            email: profile.email,
                          });
                        }
                      }}
                    />
                  </View>
                </>
              ) : (
                <View style={{ gap: spacing.md }}>
                  <View>
                    <Text
                      variant="caption"
                      style={{ color: colors.mutedForeground }}
                    >
                      First Name
                    </Text>
                    <Text variant="body">{profile.firstName}</Text>
                  </View>
                  <View>
                    <Text
                      variant="caption"
                      style={{ color: colors.mutedForeground }}
                    >
                      Last Name
                    </Text>
                    <Text variant="body">{profile.lastName}</Text>
                  </View>
                  <View>
                    <Text
                      variant="caption"
                      style={{ color: colors.mutedForeground }}
                    >
                      Email
                    </Text>
                    <Text variant="body">{profile.email}</Text>
                  </View>
                </View>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <Text variant="h4" weight="bold">
              {t("common.ui.labels.preferences") || "Preferences"}
            </Text>
          </CardHeader>
          <CardContent style={{ gap: spacing.md }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text variant="body" weight="bold">
                  {t("common.ui.labels.language") || "Language"}
                </Text>
                <Text
                  variant="caption"
                  style={{ color: colors.mutedForeground }}
                >
                  {language === "es" ? "Español" : "English"}
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: spacing.sm }}>
                <Button
                  label="ES"
                  size="sm"
                  variant={language === "es" ? "primary" : "outline"}
                  onPress={() => setLanguage("es")}
                />
                <Button
                  label="EN"
                  size="sm"
                  variant={language === "en" ? "primary" : "outline"}
                  onPress={() => setLanguage("en")}
                />
              </View>
            </View>

            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: colors.border,
                paddingTop: spacing.md,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text variant="body" weight="bold">
                    {t("common.ui.labels.theme") || "Theme"}
                  </Text>
                  <Text
                    variant="caption"
                    style={{ color: colors.mutedForeground }}
                  >
                    {colorScheme === "light"
                      ? "Light"
                      : colorScheme === "dark"
                        ? "Dark"
                        : "System"}
                  </Text>
                </View>
                <View style={{ gap: spacing.xs }}>
                  {["light", "dark", "system"].map((scheme) => (
                    <Button
                      key={scheme}
                      label={scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                      size="sm"
                      variant={colorScheme === scheme ? "primary" : "outline"}
                      onPress={() => setColorScheme(scheme as any)}
                    />
                  ))}
                </View>
              </View>
            </View>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Text variant="h4" weight="bold">
              {t("common.ui.labels.security") || "Security"}
            </Text>
          </CardHeader>
          <CardContent style={{ gap: spacing.md }}>
            {passwordError && (
              <Alert
                variant="destructive"
                title="Error"
                message={passwordError}
              />
            )}

            {isChangingPassword ? (
              <>
                <Input
                  label="Current Password"
                  value={passwordForm.currentPassword}
                  onChangeText={(val) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: val,
                    })
                  }
                  secureTextEntry
                />
                <Input
                  label="New Password"
                  value={passwordForm.newPassword}
                  onChangeText={(val) =>
                    setPasswordForm({ ...passwordForm, newPassword: val })
                  }
                  secureTextEntry
                />
                <Input
                  label="Confirm Password"
                  value={passwordForm.confirmPassword}
                  onChangeText={(val) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: val,
                    })
                  }
                  secureTextEntry
                />

                <View style={{ gap: spacing.md, marginTop: spacing.md }}>
                  <Button
                    label={passwordLoading ? "Changing..." : "Change Password"}
                    variant="default"
                    onPress={handleChangePassword}
                    disabled={passwordLoading}
                  />
                  <Button
                    label="Cancel"
                    variant="outline"
                    onPress={() => {
                      setIsChangingPassword(false);
                      setPasswordForm({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                  />
                </View>
              </>
            ) : (
              <Button
                label={t("common.ui.actions.changePassword") || "Change Password"}
                variant="outline"
                onPress={() => setIsChangingPassword(true)}
              />
            )}
          </CardContent>
        </Card>

        <Button
          label={t("common.ui.actions.logout") || "Logout"}
          variant="destructive"
          onPress={handleLogout}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
