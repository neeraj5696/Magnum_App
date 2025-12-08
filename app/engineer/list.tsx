import React, { FC, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import LogoHeader from "../components/LogoHeader";
import Footer from "../components/footer";

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
  mailaddcallrpt?:string;
}

const EngineerList: FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("All");

  const fetchComplaints = async () => {
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
      console.log("responseText yahi bhejna hai", responseText);
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error("Failed to parse response:", jsonError);
        return;
      }

      if (data?.status === "success" && data?.data) {
        // Debug: Check the first item to see what fields are available
        if (data.data.length > 0) {
          console.log("🔍 First complaint item:", JSON.stringify(data.data[0], null, 2));
          console.log("🔍 SystemName in first item:", data.data[0].SystemName);
          console.log("🔍 COMP_TYPE in first item:", data.data[0].COMP_TYPE);
        }
        setComplaints(data.data);
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setIsLoading(false);
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

  // Header with stats and filter
  const renderHeader = () => (
    <View style={styles.card}>
      <View style={styles.statsRow}>
        <View style={styles.statsBox}>
          <Text style={styles.statsNumber}>{total}</Text>
          <Text style={styles.statsLabel}>Total</Text>
        </View>
        <View style={styles.statsBox}>
          <Text style={styles.statsNumber}>{pending}</Text>
          <Text style={styles.statsLabel}>Pending</Text>
        </View>
        <View style={styles.statsBox}>
          <Text style={styles.statsNumber}>{completed}</Text>
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
                    mailaddcallrpt:item.mailaddcallrpt,
                    
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
    <View style={styles.container}>
      {/* <LogoHeader /> */}
      {renderHeader()}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
        </View>
      ) : filteredComplaints.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="info-outline" size={48} color="#666" />
          <Text style={styles.emptyText}>No complaints found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredComplaints}
          renderItem={renderItem}
          keyExtractor={(item) => item.S_SERVNO}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={true}
        />
      )}
      {/* <Footer /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 8,
    justifyContent: "space-between",
    marginTop: 40,
  },
  statsHeader: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    shadowColor: "#000",
    elevation: 6,
    marginVertical: 10,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statsBox: {
    alignItems: "center",
    flex: 1,
  },
  statsNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0066CC",
  },
  statsLabel: {
    fontSize: 12,
    color: "#888",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 4,
    paddingBottom: 10,
    backgroundColor: "white",
    borderRadius: 12,
    marginHorizontal: 4,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    alignItems: "center",
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#eee",
    marginHorizontal: 4,
  },
  filterBtnActive: {
    backgroundColor: "#0066CC",
  },
  filterText: {
    color: "#333",
  },
  filterTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  listContainer: {
    paddingBottom: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 4,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: "#e0e0e0",
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  engineerName: {
    fontSize: 13,
    color: "#888",
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: "center",
    marginLeft: 8,
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  complaintNo: {
    fontSize: 13,
    color: "#0066CC",
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: "#aaa",
    marginBottom: 4,
  },
  expandedSection: {
    marginTop: 8,
    backgroundColor: "#f6f8fa",
    borderRadius: 8,
    padding: 8,
  },
  expandedLabel: {
    fontSize: 13,
    color: "#444",
    marginBottom: 2,
  },
  detailsBtn: {
    marginTop: 8,
    backgroundColor: "#0066CC",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  detailsBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default EngineerList;
