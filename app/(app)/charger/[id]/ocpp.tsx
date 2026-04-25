import { AppHeader } from "@/components/layout/AppHeader";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { ocppMessagesApi } from "@/lib/api/ocpp-messages.api";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useGroupStore } from "@/lib/stores/group.store";
import { OcppMessage } from "@/lib/types/ocpp-messages.types";
import { getThemeColors, spacing } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, ScrollView, TouchableOpacity, View } from "react-native";

/** Returns YYYY-MM-DD for a given Date in local time */
function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

/** Parse rawData JSON string safely */
function parseRaw(raw: string): Record<string, any> | null {
  try {
    const parsed = JSON.parse(raw);
    // OCPP frames are arrays: [type, msgId, action?, payload?]
    if (Array.isArray(parsed)) {
      const [type, , third, fourth] = parsed;
      if (typeof third === "object" && !Array.isArray(third)) return third; // CallResult payload
      if (typeof fourth === "object") return fourth; // Call payload
      return { raw };
    }
    return parsed;
  } catch {
    return null;
  }
}

function getCallTypeColor(callType: string, colors: ReturnType<typeof getThemeColors>) {
  switch (callType) {
    case "CallResult":
      return "#22c55e";
    case "CallError":
      return colors.destructive ?? "#ef4444";
    default:
      return "#3b82f6"; // Call
  }
}

function getCallTypeLabel(callType: string) {
  switch (callType) {
    case "CallResult":
      return "Respuesta";
    case "CallError":
      return "Error";
    default:
      return "Llamada";
  }
}

function getOriginIcon(origin: string): "phone-portrait" | "server" {
  return origin === "Cargador" ? "phone-portrait" : "server";
}

export default function OCPPMessages() {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const groupData = useGroupStore((s) => s.groupData);
  const user = useAuthStore((s) => s.user);

  const [messages, setMessages] = useState<OcppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Charger name from groupData
  const chargerName = (() => {
    if (!groupData) return id;
    const all = groupData.areas.length > 0 ? groupData.areas.flatMap((a) => a.lines.flatMap((l) => l.chargers)) : groupData.chargers;
    return all.find((c) => String(c.charger_ID) === id)?.charger_name ?? id;
  })();

  const siteId = groupData?.site.site_ID ?? "";
  const companyId = user?.companyExternalId ?? "";

  const fetchMessages = useCallback(
    async (p: number) => {
      if (!siteId || !companyId || !id) return;

      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      try {
        const res = await ocppMessagesApi.list({
          companyId,
          siteId,
          chargerId: id,
          dateFrom: toDateStr(yesterday),
          dateTo: toDateStr(now),
          page: p,
          pageSize: 10,
        });

        const data = res.data;
        setMessages((prev) => (p === 1 ? data.payload : [...prev, ...data.payload]));
        setTotalPages(data.pagination.totalPages);
        setPage(p);
      } catch (e: any) {
        setError(e?.message ?? "Error al cargar mensajes");
      }
    },
    [siteId, companyId, id],
  );

  useEffect(() => {
    setLoading(true);
    fetchMessages(1).finally(() => setLoading(false));
  }, [fetchMessages]);

  const loadMore = async () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    await fetchMessages(page + 1);
    setLoadingMore(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader />

      {/* Page header */}
      <View
        style={{
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.md,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>Mensajes OCPP</Text>
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{chargerName}</Text>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl }}>
          <Ionicons name="alert-circle" size={40} color={colors.mutedForeground} style={{ opacity: 0.4, marginBottom: spacing.md }} />
          <Text style={{ fontSize: 14, color: colors.mutedForeground, textAlign: "center" }}>{error}</Text>
          <TouchableOpacity
            onPress={() => {
              setError(null);
              setLoading(true);
              fetchMessages(1).finally(() => setLoading(false));
            }}
            style={{ marginTop: spacing.md, paddingVertical: 8, paddingHorizontal: 20, backgroundColor: colors.primary, borderRadius: 8 }}
          >
            <Text style={{ color: "white", fontWeight: "600", fontSize: 13 }}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : messages.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl }}>
          <Ionicons
            name="chatbubbles-outline"
            size={48}
            color={colors.mutedForeground}
            style={{ opacity: 0.3, marginBottom: spacing.md }}
          />
          <Text style={{ fontSize: 14, color: colors.mutedForeground }}>Sin mensajes en este período</Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}>
          {messages.map((msg) => {
            const isExpanded = expandedId === msg.id;
            const typeColor = getCallTypeColor(msg.callType, colors);
            const rawParsed = isExpanded ? parseRaw(msg.rawData) : null;

            // Format timestamp
            const ts = new Date(msg.timestamp.includes("T") ? msg.timestamp : msg.timestamp.replace(" ", "T"));
            const timeStr = isNaN(ts.getTime())
              ? msg.timestamp
              : ts.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
            const dateStr = isNaN(ts.getTime()) ? "" : ts.toLocaleDateString("es-CL", { day: "2-digit", month: "short" });

            return (
              <TouchableOpacity
                key={msg.id}
                onPress={() => setExpandedId(isExpanded ? null : msg.id)}
                activeOpacity={0.7}
                style={{ marginBottom: spacing.sm }}
              >
                <Card style={{ padding: spacing.md }}>
                  {/* Row: icon + message name + badges + chevron */}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                    <Ionicons name="chatbubbles" size={20} color={colors.foreground} />

                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>{msg.message}</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 }}>
                        <Ionicons name="time" size={10} color={colors.mutedForeground} />
                        <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
                          {dateStr} {timeStr}
                        </Text>
                      </View>
                    </View>

                    {/* callType badge */}
                    <View
                      style={{
                        backgroundColor: typeColor + "20",
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 20,
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: "600", color: typeColor }}>{getCallTypeLabel(msg.callType)}</Text>
                    </View>

                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color={colors.mutedForeground}
                      style={{ transform: [{ rotate: isExpanded ? "180deg" : "0deg" }] }}
                    />
                  </View>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <View
                      style={{
                        marginTop: spacing.md,
                        paddingTop: spacing.md,
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                        gap: spacing.xs,
                      }}
                    >
                      {/* Meta row */}
                      <View style={{ flexDirection: "row", gap: spacing.sm, marginBottom: spacing.xs }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                          <Ionicons name={getOriginIcon(msg.origin)} size={11} color={colors.mutedForeground} />
                          <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{msg.origin}</Text>
                        </View>
                        <Text style={{ fontSize: 11, color: colors.mutedForeground }}>·</Text>
                        <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{msg.callType}</Text>
                      </View>

                      {/* Payload fields */}
                      {rawParsed && Object.entries(rawParsed).length > 0 ? (
                        <>
                          <Text
                            style={{
                              fontSize: 10,
                              fontWeight: "700",
                              color: colors.mutedForeground,
                              textTransform: "uppercase",
                              letterSpacing: 0.6,
                              marginBottom: 2,
                            }}
                          >
                            Payload
                          </Text>
                          {Object.entries(rawParsed).map(([key, value]) => (
                            <View key={key} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 }}>
                              <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{key}</Text>
                              <Text
                                style={{ fontSize: 11, fontWeight: "500", color: colors.foreground, maxWidth: "60%", textAlign: "right" }}
                              >
                                {typeof value === "object" ? JSON.stringify(value) : String(value)}
                              </Text>
                            </View>
                          ))}
                        </>
                      ) : (
                        <Text style={{ fontSize: 11, color: colors.mutedForeground, fontStyle: "italic" }}>Sin payload</Text>
                      )}
                    </View>
                  )}
                </Card>
              </TouchableOpacity>
            );
          })}

          {/* Load more */}
          {page < totalPages && (
            <TouchableOpacity
              onPress={loadMore}
              disabled={loadingMore}
              style={{
                paddingVertical: 12,
                alignItems: "center",
                borderRadius: 10,
                backgroundColor: colors.muted,
                marginTop: spacing.xs,
              }}
            >
              {loadingMore ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground }}>Cargar más</Text>
              )}
            </TouchableOpacity>
          )}

          <View style={{ height: spacing.xl }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
