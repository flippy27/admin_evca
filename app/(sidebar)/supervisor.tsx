import { BottomDrawer } from "@/components/ui/BottomDrawer";
import { Card, CardContent } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { getThemeColors, spacing } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { SafeAreaView, ScrollView, TouchableOpacity, View } from "react-native";

type RoleType = "operador" | "mantenedor" | "supervisor";

export default function SupervisorScreen() {
  const colors = getThemeColors("light");
  const [selectedRole, setSelectedRole] = useState<RoleType>("supervisor");
  const [selectedLocation, setSelectedLocation] = useState("Terminal Maipú");
  const [roleDrawerOpen, setRoleDrawerOpen] = useState(false);
  const [locationDrawerOpen, setLocationDrawerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const roles: RoleType[] = ["operador", "mantenedor", "supervisor"];
  const locations = ["Terminal Maipú", "Marquesina A", "Terminal B"];

  const roleColor = {
    operador: "#9C27B0",
    mantenedor: "#00BCD4",
    supervisor: "#4CAF50",
  };

  const roleDesc = {
    operador:
      "Gestión de conectores • Inicio/Parada de carga • Control en tiempo real",
    mantenedor:
      "Mantenimiento preventivo • Historial de servicios • Alertas técnicas",
    supervisor:
      "Estado general del patio • KPIs operacionales • Alertas y monitoreo",
  };

  const roleIcon = {
    operador: "hourglass",
    mantenedor: "hammer",
    supervisor: "eye",
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView>
        {/* Header */}
        <View
          style={{
            padding: spacing.lg,
            backgroundColor: colors.card,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text variant="h3" weight="bold">
              Workforce App
            </Text>
            <Text variant="caption" style={{ color: colors.mutedForeground }}>
              PoC v1
            </Text>
          </View>

          {/* Role Selector Button */}
          <TouchableOpacity
            onPress={() => setRoleDrawerOpen(true)}
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              backgroundColor: roleColor[selectedRole],
              borderRadius: 24,
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.sm,
            }}
          >
            <Text variant="body" weight="bold" style={{ color: "white" }}>
              {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
            </Text>
            <Ionicons name="chevron-down" size={16} color="white" />
          </TouchableOpacity>
        </View>

        {/* Location Dropdown */}
        <View
          style={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            gap: spacing.md,
          }}
        >
          <TouchableOpacity
            onPress={() => setLocationDrawerOpen(true)}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: spacing.md,
            }}
          >
            <Text variant="h4" weight="bold">
              {selectedLocation}
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>

          {/* Active Connectors */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.sm,
            }}
          >
            <Ionicons name="flash" size={20} color="#4CAF50" />
            <Text
              variant="body"
              style={{ color: "#4CAF50", fontWeight: "600" }}
            >
              3/10
            </Text>
            <Text variant="body" style={{ color: colors.mutedForeground }}>
              conectores activos
            </Text>
          </View>
        </View>

        {/* Role Description Box */}
        <View
          style={{
            marginHorizontal: spacing.lg,
            marginTop: spacing.lg,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.lg,
            backgroundColor: roleColor[selectedRole],
            borderRadius: 12,
            gap: spacing.sm,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.sm,
            }}
          >
            <Ionicons
              name={roleIcon[selectedRole] as any}
              size={24}
              color="white"
            />
            <Text
              variant="body"
              weight="bold"
              style={{ color: "white", textTransform: "capitalize" }}
            >
              {selectedRole === "operador"
                ? "Operador de Patio"
                : selectedRole === "mantenedor"
                  ? "Mantenedor"
                  : "Supervisor"}
            </Text>
          </View>
          <Text variant="body" style={{ color: "white", opacity: 0.9 }}>
            {roleDesc[selectedRole]}
          </Text>
        </View>

        {/* Content - Role Specific */}
        <View
          style={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            gap: spacing.lg,
          }}
        >
          {selectedRole === "operador" && (
            <OperadorContent colors={colors} spacing={spacing} />
          )}
          {selectedRole === "mantenedor" && (
            <MantenedorContent colors={colors} spacing={spacing} />
          )}
          {selectedRole === "supervisor" && (
            <SupervisorContent colors={colors} spacing={spacing} />
          )}
        </View>
      </ScrollView>

      {/* Sidebar Menu (Image #30) */}
      {sidebarOpen && (
        <TouchableOpacity
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
          onPress={() => setSidebarOpen(false)}
        />
      )}
      <View
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 200,
          backgroundColor: colors.card,
          transform: [{ translateX: sidebarOpen ? 0 : -200 }],
          zIndex: 1000,
        }}
      >
        <SafeAreaView style={{ flex: 1, padding: spacing.lg }}>
          <Text variant="h4" weight="bold" style={{ marginBottom: spacing.lg }}>
            Menu
          </Text>
          {/* Sidebar items */}
        </SafeAreaView>
      </View>

      {/* Hamburger Button */}
      <TouchableOpacity
        onPress={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: "absolute",
          left: spacing.lg,
          top: spacing.xl,
          zIndex: 1001,
        }}
      >
        <Ionicons name="menu" size={32} color={colors.foreground} />
      </TouchableOpacity>

      {/* Role Drawer */}
      <BottomDrawer
        visible={roleDrawerOpen}
        onClose={() => setRoleDrawerOpen(false)}
        title="Select Role"
        height={250}
      >
        <ScrollView
          style={{ paddingBottom: spacing.lg, paddingHorizontal: spacing.lg }}
        >
          <View style={{ gap: spacing.md }}>
            {roles.map((role) => (
              <TouchableOpacity
                key={role}
                onPress={() => {
                  setSelectedRole(role);
                  setRoleDrawerOpen(false);
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: spacing.md,
                  gap: spacing.md,
                }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor:
                      selectedRole === role ? roleColor[role] : colors.border,
                    backgroundColor:
                      selectedRole === role ? roleColor[role] : "transparent",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {selectedRole === role && (
                    <Ionicons name="checkmark" size={14} color="white" />
                  )}
                </View>
                <Text
                  variant="body"
                  weight={selectedRole === role ? "bold" : "normal"}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </BottomDrawer>

      {/* Location Drawer */}
      <BottomDrawer
        visible={locationDrawerOpen}
        onClose={() => setLocationDrawerOpen(false)}
        title="Select Location"
        height={250}
      >
        <ScrollView
          style={{ paddingBottom: spacing.lg, paddingHorizontal: spacing.lg }}
        >
          <View style={{ gap: spacing.md }}>
            {locations.map((location) => (
              <TouchableOpacity
                key={location}
                onPress={() => {
                  setSelectedLocation(location);
                  setLocationDrawerOpen(false);
                }}
                style={{
                  paddingVertical: spacing.md,
                }}
              >
                <Text
                  variant="body"
                  weight={selectedLocation === location ? "bold" : "normal"}
                  style={{
                    color:
                      selectedLocation === location
                        ? colors.primary
                        : colors.foreground,
                  }}
                >
                  {location}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </BottomDrawer>
    </SafeAreaView>
  );
}

function OperadorContent({ colors, spacing }: any) {
  return (
    <>
      {/* Connector Counts */}
      <Card>
        <CardContent>
          <Text
            variant="caption"
            style={{ color: colors.mutedForeground, marginBottom: spacing.md }}
          >
            CONECTORES DEL PATIO
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              gap: spacing.md,
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text variant="h2" weight="bold" style={{ color: "#2196F3" }}>
                3
              </Text>
              <Text variant="caption" style={{ color: colors.mutedForeground }}>
                Cargando
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text variant="h2" weight="bold" style={{ color: "#4CAF50" }}>
                3
              </Text>
              <Text variant="caption" style={{ color: colors.mutedForeground }}>
                Disponible
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text variant="h2" weight="bold" style={{ color: "#9C27B0" }}>
                2
              </Text>
              <Text variant="caption" style={{ color: colors.mutedForeground }}>
                Finalizando
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text variant="h2" weight="bold" style={{ color: "#F44336" }}>
                1
              </Text>
              <Text variant="caption" style={{ color: colors.mutedForeground }}>
                Falla
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: spacing.md,
          }}
        >
          <Text variant="body" weight="bold">
            Sesiones Activas (4)
          </Text>
          <Text variant="body" style={{ color: colors.primary }}>
            Ver todas →
          </Text>
        </View>
        {[
          {
            id: "CB-01 · C1",
            bus: "BUS 12345678",
            energy: "45.3 kWh",
            time: "2797 min",
          },
          {
            id: "CB-01 · C2",
            bus: "BUS 87654321",
            energy: "78.2 kWh",
            time: "2857 min",
          },
          {
            id: "CB-01-B · C1",
            bus: "BUS 55667788",
            energy: "32.1 kWh",
            time: "2782 min",
          },
        ].map((session, idx) => (
          <Card key={idx} style={{ marginBottom: spacing.md }}>
            <CardContent style={{ gap: spacing.sm }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View>
                  <Text variant="body" weight="bold">
                    {session.id}
                  </Text>
                  <Text
                    variant="caption"
                    style={{ color: colors.mutedForeground }}
                  >
                    {session.bus}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    variant="body"
                    weight="bold"
                    style={{ color: colors.primary }}
                  >
                    {session.energy}
                  </Text>
                  <Text
                    variant="caption"
                    style={{ color: colors.mutedForeground }}
                  >
                    {session.time}
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>
        ))}
      </View>
    </>
  );
}

function MantenedorContent({ colors, spacing }: any) {
  return (
    <>
      {/* Energy Summary */}
      <Card>
        <CardContent style={{ gap: spacing.md }}>
          <Text
            variant="caption"
            weight="bold"
            style={{ color: colors.mutedForeground }}
          >
            RESUMEN ENERGÉTICO DEL PATIO
          </Text>

          {/* Row 1 */}
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            {/* Voltaje Prom */}
            <View
              style={{
                flex: 1,
                padding: spacing.md,
                backgroundColor: "#E0F7FA",
                borderRadius: 8,
                gap: spacing.sm,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                <Ionicons name="water" size={16} color="#00838F" />
                <Text variant="caption" style={{ color: "#00838F" }}>
                  Voltaje Prom.
                </Text>
              </View>
              <Text variant="h3" weight="bold" style={{ color: "#00838F" }}>
                230.5 V
              </Text>
            </View>

            {/* Temp Máx */}
            <View
              style={{
                flex: 1,
                padding: spacing.md,
                backgroundColor: "#FFF3E0",
                borderRadius: 8,
                gap: spacing.sm,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                <Ionicons name="alert" size={16} color="#E65100" />
                <Text variant="caption" style={{ color: "#E65100" }}>
                  Temp. Máx.
                </Text>
              </View>
              <Text variant="h3" weight="bold" style={{ color: "#E65100" }}>
                42.5 °C
              </Text>
            </View>
          </View>

          {/* Row 2 */}
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            {/* Potencia Total */}
            <View
              style={{
                flex: 1,
                padding: spacing.md,
                backgroundColor: "#E8EAF6",
                borderRadius: 8,
                gap: spacing.sm,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                <Ionicons name="flash" size={16} color="#283593" />
                <Text variant="caption" style={{ color: "#283593" }}>
                  Potencia Total
                </Text>
              </View>
              <Text variant="h3" weight="bold" style={{ color: "#283593" }}>
                7.27 kW
              </Text>
            </View>

            {/* Temp Prom */}
            <View
              style={{
                flex: 1,
                padding: spacing.md,
                backgroundColor: "#E0F7FA",
                borderRadius: 8,
                gap: spacing.sm,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                <Ionicons name="thermometer" size={16} color="#00838F" />
                <Text variant="caption" style={{ color: "#00838F" }}>
                  Temp. Prom.
                </Text>
              </View>
              <Text variant="h3" weight="bold" style={{ color: "#00838F" }}>
                40.7 °C
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Status Counts - Salud de Conectores */}
      <Card>
        <CardContent style={{ gap: spacing.md }}>
          <Text
            variant="caption"
            weight="bold"
            style={{ color: colors.mutedForeground }}
          >
            SALUD DE CONECTORES
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              gap: spacing.md,
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text variant="h2" weight="bold" style={{ color: "#4CAF50" }}>
                8
              </Text>
              <Text variant="caption" style={{ color: colors.mutedForeground }}>
                Operativos
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text variant="h2" weight="bold" style={{ color: "#F44336" }}>
                1
              </Text>
              <Text variant="caption" style={{ color: colors.mutedForeground }}>
                Con Falla
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text variant="h2" weight="bold" style={{ color: "#FFC107" }}>
                1
              </Text>
              <Text variant="caption" style={{ color: colors.mutedForeground }}>
                Suspendidos
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Location Chargers */}
      <View style={{ gap: spacing.lg, paddingBottom: spacing.xl }}>
        {["Marquesina A", "Marquesina B"].map((location) => (
          <View key={location} style={{ gap: spacing.md }}>
            <Text variant="h4" weight="bold">
              {location}
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: spacing.md,
              }}
            >
              {[1, 2].map((charger) => (
                <Card
                  key={charger}
                  style={{
                    flex: 0.48,
                    borderLeftWidth: 4,
                    borderLeftColor: charger === 1 ? "#4CAF50" : "#F44336",
                  }}
                >
                  <CardContent style={{ gap: spacing.md }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: spacing.sm,
                      }}
                    >
                      <Ionicons
                        name="square"
                        size={20}
                        color={charger === 1 ? "#4CAF50" : "#F44336"}
                      />
                      <Text variant="body" weight="bold">
                        Cargador CB-0{charger}
                      </Text>
                    </View>
                    {[1, 2].map((connector) => (
                      <View
                        key={connector}
                        style={{ paddingVertical: spacing.sm, gap: spacing.xs }}
                      >
                        <Text variant="caption" weight="bold">
                          C{connector}
                        </Text>
                        <View style={{ flexDirection: "row", gap: spacing.md }}>
                          <Text variant="caption">V 230.5</Text>
                          <Text variant="caption">A 16.2</Text>
                          <Text variant="caption">kW 3.734</Text>
                          <Text variant="caption">°C 42.5</Text>
                        </View>
                      </View>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

function SupervisorContent({ colors, spacing }: any) {
  return (
    <>
      {/* Dashboard KPIs */}
      <View>
        <Text
          variant="caption"
          weight="bold"
          style={{ color: colors.mutedForeground, marginBottom: spacing.md }}
        >
          DASHBOARD DEL PATIO
        </Text>
        <View style={{ gap: spacing.md }}>
          {/* Utilización */}
          <Card>
            <CardContent
              style={{
                padding: spacing.md,
                backgroundColor: "#E8F5E9",
                borderRadius: 8,
                gap: spacing.sm,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.sm,
                }}
              >
                <Ionicons name="trending-up" size={20} color="#2E7D32" />
                <Text variant="caption" style={{ color: "#2E7D32" }}>
                  Utilización
                </Text>
              </View>
              <Text variant="h2" weight="bold" style={{ color: "#2E7D32" }}>
                30%
              </Text>
              <Text variant="caption" style={{ color: "#558B2F" }}>
                3 de 10 conectores
              </Text>
            </CardContent>
          </Card>

          {/* Energy & Chargers Row */}
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <Card style={{ flex: 1 }}>
              <CardContent
                style={{
                  padding: spacing.md,
                  backgroundColor: "#E3F2FD",
                  borderRadius: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.sm,
                    marginBottom: spacing.sm,
                  }}
                >
                  <Ionicons name="flash" size={20} color={colors.primary} />
                  <Text variant="caption" style={{ color: colors.primary }}>
                    Energía Total
                  </Text>
                </View>
                <Text
                  variant="h3"
                  weight="bold"
                  style={{ color: colors.primary }}
                >
                  245.0
                </Text>
                <Text variant="caption" style={{ color: "#1565C0" }}>
                  kWh entregados
                </Text>
              </CardContent>
            </Card>

            <Card style={{ flex: 1 }}>
              <CardContent
                style={{
                  padding: spacing.md,
                  backgroundColor: "#F3E5F5",
                  borderRadius: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.sm,
                    marginBottom: spacing.sm,
                  }}
                >
                  <Ionicons name="flash" size={20} color="#6A1B9A" />
                  <Text variant="caption" style={{ color: "#6A1B9A" }}>
                    Cargadores
                  </Text>
                </View>
                <Text variant="h3" weight="bold" style={{ color: "#6A1B9A" }}>
                  5/5
                </Text>
                <Text variant="caption" style={{ color: "#6A1B9A" }}>
                  online
                </Text>
              </CardContent>
            </Card>

            <Card style={{ flex: 1 }}>
              <CardContent
                style={{
                  padding: spacing.md,
                  backgroundColor: "#FFEBEE",
                  borderRadius: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.sm,
                    marginBottom: spacing.sm,
                  }}
                >
                  <Ionicons name="alert" size={20} color="#C62828" />
                  <Text variant="caption" style={{ color: "#C62828" }}>
                    Alertas
                  </Text>
                </View>
                <Text variant="h3" weight="bold" style={{ color: "#C62828" }}>
                  1
                </Text>
                <Text variant="caption" style={{ color: "#C62828" }}>
                  con falla
                </Text>
              </CardContent>
            </Card>
          </View>
        </View>
      </View>

      {/* Connector Distribution */}
      <Card>
        <CardContent style={{ gap: spacing.md }}>
          <Text
            variant="caption"
            weight="bold"
            style={{ color: colors.mutedForeground }}
          >
            DISTRIBUCIÓN DE CONECTORES
          </Text>
          <View
            style={{
              height: 12,
              borderRadius: 4,
              flexDirection: "row",
              overflow: "hidden",
              gap: 2,
            }}
          >
            <View style={{ flex: 3, backgroundColor: "#2196F3" }} />
            <View style={{ flex: 2, backgroundColor: "#9C27B0" }} />
            <View style={{ flex: 3, backgroundColor: "#00BCD4" }} />
            <View style={{ flex: 1, backgroundColor: "#F44336" }} />
            <View style={{ flex: 1, backgroundColor: "#FFC107" }} />
          </View>
          <View style={{ gap: spacing.sm }}>
            {[
              { color: "#2196F3", label: "Cargando (3)" },
              { color: "#9C27B0", label: "Finalizando (2)" },
              { color: "#00BCD4", label: "Disponible (3)" },
              { color: "#F44336", label: "Falla (1)" },
              { color: "#FFC107", label: "Suspendido (1)" },
            ].map((item, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.sm,
                }}
              >
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 2,
                    backgroundColor: item.color,
                  }}
                />
                <Text variant="caption">{item.label}</Text>
              </View>
            ))}
          </View>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <View style={{ gap: spacing.md }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          <Ionicons name="alert" size={24} color="#C62828" />
          <Text variant="h4" weight="bold" style={{ color: "#C62828" }}>
            Alertas Activas
          </Text>
        </View>
        <Card style={{}}>
          <CardContent style={{ gap: spacing.sm }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text variant="body" weight="bold">
                Cargador CB-02 · C2
              </Text>
              <Text
                variant="body"
                weight="bold"
                style={{ color: colors.primary }}
              >
                Ver →
              </Text>
            </View>
            <Text variant="caption" style={{ color: colors.mutedForeground }}>
              Conector con falla
            </Text>
          </CardContent>
        </Card>
      </View>

      {/* Locations with Chargers */}
      <View style={{ gap: spacing.lg, paddingBottom: spacing.xl }}>
        {["Marquesina A", "Marquesina J", "Marquesina B"].map((location) => (
          <View key={location} style={{ gap: spacing.md }}>
            <Text variant="h4" weight="bold">
              {location}
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: spacing.md,
              }}
            >
              {[1, 2].map((charger) => (
                <Card
                  key={charger}
                  style={{
                    flex: 1,
                  }}
                >
                  <CardContent style={{ gap: spacing.sm }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text variant="body" weight="bold">
                        Cargador CB-0{charger}
                      </Text>
                      <Text
                        variant="body"
                        weight="bold"
                        style={{ color: colors.primary }}
                      >
                        {charger === 1 ? "125 kW" : "110 kW"}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: spacing.xs,
                      }}
                    >
                      {charger === 1 && (
                        <>
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: "#2196F3",
                            }}
                          />
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: "#9C27B0",
                            }}
                          />
                        </>
                      )}
                      <Text
                        variant="caption"
                        style={{ color: colors.mutedForeground }}
                      >
                        {charger === 1 ? "1/2 activos" : "1/2 activos"}
                      </Text>
                    </View>
                  </CardContent>
                </Card>
              ))}
            </View>
          </View>
        ))}
      </View>
    </>
  );
}
