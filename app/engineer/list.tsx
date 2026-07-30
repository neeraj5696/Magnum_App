import React, { FC, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Image,
  ScrollView,
  RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import LogoHeader from "../components/LogoHeader";
import Footer from "../components/footer";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Complaint {
  S_SERVNO: string;
  COMP_NAME: string;
  S_jobstatus: string;
  S_SERVDT: string;
  S_assignedengg: string;
  SYSTEM_NAME?: string;
  S_assigndate?: string;
  COMP_ADD1?: string;
  S_TASK_TYPE?: string;
  S_REMARK1?: string;
  S_REMARK2?: string;
  SystemName?: string;
  Modelnumber?: string;
  COMP_TYPE?: string;
  S_UPDT?: string;
  COMP_ADD2?: string;
  COMP_ADD3?: string;
  COMP_TEL?: string;
  AMC_Status?: string;
  mailaddcallrpt?: string;
}

const EngineerList: FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("All");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchComplaints = async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true)
    else setIsLoading(true)
    try {
      const formData = new URLSearchParams();
      formData.append("username", params.username as string);
      formData.append("password", params.password as string);

      const response = await fetch(
        "https://hma.magnum.org.in/appMEngglogin.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        }
      );

      const responseText = await response.text();

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error("Failed to parse response:", jsonError);
        return;
      }

      if (data?.status === "success" && data?.data) {

        setComplaints(data.data);
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false)
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Stats
  const total = complaints.length;
  const pending = complaints.filter((c) => c.S_jobstatus === "Pending").length;
  const completed = complaints.filter(
    (c) => c.S_jobstatus === "Completed"
  ).length;

  // Filtered complaints
  const filteredComplaints =
    filter === "All"
      ? complaints
      : complaints.filter((c) => c.S_jobstatus === filter);

  // Header with stats and filter — rendered as FlatList ListHeaderComponent
  const renderHeader = () => (
    <View style={styles.headerCard}>
      <View style={styles.statsRow}>
        <View style={styles.statsBox}>
          <Text style={styles.statsNumber}>{total}</Text>
          <Text style={styles.statsLabel}>Total</Text>
        </View>
        <View style={[styles.statsBox, styles.statsBoxMiddle]}>
          <Text style={[styles.statsNumber, { color: "#FFA000" }]}>{pending}</Text>
          <Text style={styles.statsLabel}>Pending</Text>
        </View>
        <View style={styles.statsBox}>
          <Text style={[styles.statsNumber, { color: "#4CAF50" }]}>{completed}</Text>
          <Text style={styles.statsLabel}>Completed</Text>
        </View>
      </View>
      <View style={styles.filterRow}>
        {["All", "Assigned", "Pending", "New"].map((status) => (
          <Pressable
            key={status}
            style={[
              styles.filterBtn,
              filter === status && styles.filterBtnActive,
            ]}
            onPress={() => setFilter(status)}
          >
            <Text
              style={
                filter === status ? styles.filterTextActive : styles.filterText
              }
            >
              {status}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  // Helper for status badge color
  function getStatusStyle(status: string) {
    switch (status) {
      case "Completed":
        return { backgroundColor: "#4CAF50" };
      case "Pending":
        return { backgroundColor: "#FFA000" };
      default:
        return { backgroundColor: "#888" };
    }
  }

  // Enhanced card with expandable section
  const renderItem = ({ item, index }: { item: Complaint; index: number }) => {
    const isExpanded = expandedIndex === index;
    return (
      <Pressable
        style={styles.card}
        onPress={() => setExpandedIndex(isExpanded ? null : index)}
      >
        <View style={styles.cardHeaderRow}>
          {/* Avatar/Icon */}
          <Image
            source={require("../../assets/images/engineer.png")}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.clientName}>{item.COMP_NAME}</Text>
            <Text style={styles.engineerName}>{item.S_assignedengg}</Text>
          </View>
          {/* Status badge */}
          <View style={[styles.statusBadge, getStatusStyle(item.S_jobstatus)]}>
            <Text style={styles.statusText}>{item.S_jobstatus}</Text>
          </View>
        </View>
        <Text style={styles.complaintNo}>Complaint No: {item.S_SERVNO}</Text>
        <Text style={styles.date}>Reported: {item.S_SERVDT}</Text>
        {/* Expandable section */}
        {isExpanded && (
          <View style={styles.expandedSection}>
            <Text style={styles.expandedLabel}>Address: {item.COMP_ADD1}</Text>
            <Text style={styles.expandedLabel}>Remarks: {item.S_REMARK1}</Text>
            <Text style={styles.expandedLabel}>
              Task Type: {item.S_TASK_TYPE}
            </Text>
            <Text style={styles.expandedLabel}>System: {item.SYSTEM_NAME}</Text>
            <Text style={styles.expandedLabel}>
              Assigned Date: {item.S_assigndate}
            </Text>
            <Text style={styles.expandedLabel}>Model: {item.Modelnumber}</Text>
            <Text style={styles.expandedLabel}>Remark 2: {item.S_REMARK2}</Text>
            <Pressable
              style={styles.detailsBtn}
              onPress={() => {
                // Prevent card collapse on navigation
                setTimeout(() => setExpandedIndex(null), 300);
                router.push({
                  pathname: "/engineer/details",
                  params: {
                    complaintNo: item.S_SERVNO,
                    S_SERVDT: item.S_SERVDT || "",
                    S_TASK_TYPE: item.S_TASK_TYPE || "",
                    SYSTEM_NAME: item.SYSTEM_NAME || "",
                    clientName: item.COMP_NAME,
                    location: item.COMP_ADD1 || "",
                    S_REMARK1: item.S_REMARK1 || "",
                    S_REMARK2: item.S_REMARK2 || "",
                    S_assignedengg: item.S_assignedengg || "",
                    S_assigndate: item.S_assigndate || "",
                    username: params.username as string,
                    password: params.password as string,
                    status: item.S_jobstatus || "",
                    SystemName: item.SystemName || "",
                    AMC_Status: item.AMC_Status || "",
                    modelnumber: item.Modelnumber || "",
                    COMP_TYPE: item.COMP_TYPE || "",
                    S_UPDT: item.S_UPDT || "",
                    COMP_ADD2: item.COMP_ADD2 || "",
                    COMP_ADD3: item.COMP_ADD3 || "",
                    COMP_TEL: item.COMP_TEL || "",
                    mailaddcallrpt: item.mailaddcallrpt,

                  },
                });
              }}
            >
              <Text style={styles.detailsBtnText}>View Details</Text>
            </Pressable>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <LinearGradient colors={["#0f2952", "#1a4a8a", "#2d6cc0"]} style={styles.gradient}>

      {/* Title Header — sits on the blue gradient */}
      <View style={[styles.titleBar, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.titleText}>Engineer Dashboard</Text>
        <Text style={styles.titleSub}>Your assigned complaints</Text>
      </View>

      {/* White sheet slides up from below the title */}
      <View style={styles.sheet}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1a4a8a" />
          </View>
        ) : (
          <FlatList
            data={filteredComplaints}
            renderItem={renderItem}
            keyExtractor={(item) => item.S_SERVNO}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="info-outline" size={48} color="#aaa" />
                <Text style={styles.emptyText}>No complaints found</Text>
              </View>
            }
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: insets.bottom + 24,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => fetchComplaints(true)}
                colors={["#1a4a8a"]}
                tintColor="#1a4a8a"
              />
            }
          />
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },

  // ── Title bar on gradient ───────────────────────────────────────
  titleBar: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.3,
  },
  titleSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    marginTop: 2,
  },

  // ── White rounded sheet ─────────────────────────────────────────
  sheet: {
    flex: 1,
    backgroundColor: "#f0f4f8",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },

  // ── Stats + Filter header card ──────────────────────────────────
  headerCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statsBox: {
    alignItems: "center",
    flex: 1,
  },
  statsBoxMiddle: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#eee",
  },
  statsNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0066CC",
  },
  statsLabel: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 3,
    alignItems: "center",
  },
  filterBtnActive: {
    backgroundColor: "#1a4a8a",
  },
  filterText: {
    color: "#555",
    fontSize: 13,
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  // ── Complaint card ──────────────────────────────────────────────
  card: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "#e0e0e0",
  },
  clientName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  engineerName: {
    fontSize: 12,
    color: "#999",
    marginTop: 1,
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: "center",
    marginLeft: 8,
  },
  statusText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 11,
  },
  complaintNo: {
    fontSize: 13,
    color: "#1a4a8a",
    fontWeight: "600",
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: "#bbb",
    marginBottom: 4,
  },
  expandedSection: {
    marginTop: 10,
    backgroundColor: "#f6f8fa",
    borderRadius: 10,
    padding: 10,
  },
  expandedLabel: {
    fontSize: 13,
    color: "#555",
    marginBottom: 4,
    lineHeight: 18,
  },
  detailsBtn: {
    marginTop: 10,
    backgroundColor: "#1a4a8a",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  detailsBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.3,
  },

  // ── States ──────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    minHeight: 300,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
  },
});

export default EngineerList;
