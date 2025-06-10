import React, { FC, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
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
}

const EngineerList: FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const renderItem = ({ item }: { item: Complaint }) => {
    console.log('List item data:', JSON.stringify(item, null, 2));
    return (
      <Pressable
        style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#0066CC' }]}
        onPress={() => {
         
          router.push({
            pathname: '/engineer/details',
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
              username: params.username as string,
              password: params.password as string
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
            <MaterialIcons name="engineering" size={18} color="#0066CC" style={styles.labelIcon} />
            <Text style={styles.label}>Engineer : </Text>
          </View>
          <Text style={styles.grayText}>{item.S_assignedengg}</Text>
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

        <View style={styles.row}>
          <View style={styles.labelContainer}>
            <MaterialIcons name="schedule" size={18} color="#0066CC" style={styles.labelIcon} />
            <Text style={styles.label}>Fault Reported : </Text>
          </View>
          <Text style={styles.grayText}>{item.S_SERVDT}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <LogoHeader />
      

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
        </View>
      ) : complaints.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="info-outline" size={48} color="#666" />
          <Text style={styles.emptyText}>No complaints found</Text>
        </View>
      ) : (
        <FlatList
          data={complaints}
          renderItem={renderItem}
          keyExtractor={(item) => item.S_SERVNO}
          contentContainerStyle={styles.listContainer}
          
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
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
    marginBottom: 8,
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