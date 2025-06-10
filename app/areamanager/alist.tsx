import React, { FC, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import LogoHeader from '../components/LogoHeader';

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
  S_UPDT?: string;
  COMP_ADD2?: string;
  COMP_ADD3?: string;
  COMP_TEL?: string;
  S_REMAKR6?: string;
  S_REMARK3?: string;
  S_call_assigneddate?: string;
  S_call_assigned?: string;
  AreaHD?: string;
  S_FA_CODE?: string;
}

const AreaManagerList: FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaints = async () => {
    try {
      const formData = new URLSearchParams();
      formData.append("username", params.username as string);
      formData.append("password", params.password as string);
      formData.append("role", params.role as string);

      const response = await fetch(
        "https://hma.magnum.org.in/appARlogin.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        }
      );

      const responseText = await response.text();
      console.log('responseText yahi bhejna hai', responseText);
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error("Failed to parse response:", jsonError);
        setError("Invalid server response. Please try again.");
        return;
      }

      if (data?.status === "success" && data?.data) {
        setComplaints(data.data);
      } else {
        setError(data?.message || "Failed to fetch complaints");
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!params.username || !params.password || !params.role) {
      Alert.alert("Error", "Missing required parameters");
      router.replace("/areamanager/alogin");
      return;
    }
    fetchComplaints();
  }, []);

  const renderItem = ({ item }: { item: Complaint }) => (
    <Pressable
      style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#0066CC' }]}
      onPress={() => {
        router.push({
          pathname: "/areamanager/adetails",
          params: {
            complaintNo: item.S_SERVNO,
            clientName: item.COMP_NAME,
            SYSTEM_NAME: item.SYSTEM_NAME || '',
            S_assigndate: item.S_assigndate || '',
            location: item.COMP_ADD1 || '',
            S_TASK_TYPE: item.S_TASK_TYPE || '',
            status: item.S_jobstatus || '',
            S_SERVDT: item.S_SERVDT || '',
            S_assignedengg: item.S_assignedengg || '',
            S_REMARK1: item.S_REMARK1 || '',
            S_UPDT: item.S_UPDT || '',
            COMP_ADD2: item.COMP_ADD2 || '',
            COMP_ADD3: item.COMP_ADD3 || '',
            COMP_TEL: item.COMP_TEL || '',
            S_REMAKR6: item.S_REMAKR6 || '',
            S_REMARK3: item.S_REMARK3 || '',
            S_call_assigneddate: item.S_call_assigneddate || '',
            S_call_assigned: item.S_call_assigned || '',
            AreaHD: item.AreaHD || '',
            S_FA_CODE: item.S_FA_CODE || '',
            username: params.username as string,
            password: params.password as string,
            role: params.role as string
          }
        });
      }}
    >
      <View style={styles.row}>
        <View style={styles.labelContainer}>
          <MaterialIcons name="receipt" size={18} color="#0066CC" style={styles.labelIcon} />
          <Text style={styles.label}>Complaint No : </Text>
        </View>
        <Text style={styles.text}>{item.S_SERVNO}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.labelContainer}>
          <MaterialIcons name="person" size={18} color="#0066CC" style={styles.labelIcon} />
          <Text style={styles.label}>Client Name : </Text>
        </View>
        <Text style={styles.grayText}>{item.COMP_NAME}</Text>
      </View>

     

      <View style={styles.row}>
        <View style={styles.labelContainer}>
          <MaterialIcons name="info" size={18} color="#0066CC" style={styles.labelIcon} />
          <Text style={styles.label}>Status : </Text>
        </View>
        <Text style={[
          styles.grayText,
          { 
            color: item.S_jobstatus === 'Completed' ? '#4CAF50' : 
                   item.S_jobstatus === 'Pending' ? '#FFA000' : '#666'
          }
        ]}>{item.S_jobstatus}</Text>
      </View>

     
    </Pressable>
  );

  if (error) {
    return (
      <View style={styles.container}>
        <LogoHeader />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setIsLoading(true);
              fetchComplaints();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LogoHeader />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
        </View>
      ) : (
        <FlatList
          data={complaints}
          renderItem={renderItem}
          keyExtractor={(item) => item.S_SERVNO}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="inbox" size={48} color="#666" />
              <Text style={styles.emptyText}>No complaints found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 1,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 140,
  },
  labelIcon: {
    marginRight: 4,
  },
  label: {
    fontSize: 14,
    color: "#666",
  },
  text: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  grayText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#0066CC",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
    marginTop: 12,
  },
});

export default AreaManagerList; 