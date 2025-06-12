import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams } from 'expo-router';
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "./types";
import { Picker } from "@react-native-picker/picker";
import { MaterialIcons } from '@expo/vector-icons';

type CheckScreenRouteProp = RouteProp<RootStackParamList, "Check">;

interface ComplaintItem {
  S_SERVNO: string;
  S_UPDT: string | null;
  S_SERVDT: string;
  S_TASK_TYPE: string;
  SYSTEM_NAME: string;
  COMP_NAME: string;
  COMP_ADD1: string;
  COMP_ADD2: string | null;
  COMP_ADD3: string | null;
  COMP_TEL: string | null;
  S_REMARK1: string;
  S_REMAKR6: string | null;
  S_assignedengg: string;
  S_assigndate: string;
  S_jobstatus: string;
}

export default function Check() {
  const params = useLocalSearchParams();
  const username = Array.isArray(params.username) ? params.username[0] : params.username || '';
  const password = Array.isArray(params.password) ? params.password[0] : params.password || '';

  const [complainlist, setComplainlist] = useState<ComplaintItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] =
    useState<ComplaintItem | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState("CHECK-IN");

  const fetchComplaints = async () => {
    try {
      setError(null);
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      console.log("Fetching complaints with:", { username, password });

      const response = await fetch(
        "https://hma.magnum.org.in/appEngglogin.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        }
      );

      const responseText = await response.text();
      console.log("Raw response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed data:", data);
      } catch (jsonError) {
        console.error("Failed to parse response:", jsonError);
        setError("Invalid server response format");
        return;
      }

      if (data?.status === "success" && Array.isArray(data.data)) {
        setComplainlist(data.data);
      } else {
        setError("No complaints data found in response");
      }
    } catch (error) {
      console.error("Error fetching complaints", error);
      setError("Failed to fetch complaints. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedComplaint) return;

    const formData = new URLSearchParams();
    formData.append("complainno", selectedComplaint.S_SERVNO);
    formData.append("enggname", username);
    formData.append("pendingreason", selectedAction);

    console.log("Submitting check-in/out with data:", {
      complaintNo: selectedComplaint.S_SERVNO,
      engineerName: username,
      action: selectedAction
    });

    try {
      const response = await fetch(
        "https://hma.magnum.org.in/appCheckINOUT.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        }
      );

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      const responseText = await response.text();
      console.log("Raw response text:", responseText);
      console.log("Response type:", typeof responseText);
      console.log("Response length:", responseText.length);

      // Check for specific error cases in the response text
      if (responseText.includes("NOBRIDGE")) {
        console.log("NOBRIDGE error detected in response");
        Alert.alert(
          "Connection Error",
          "Unable to connect to the server. Please check your internet connection and try again.",
          [
            {
              text: "OK",
              onPress: () => {
                setShowDialog(false);
                setSelectedComplaint(null);
              }
            }
          ]
        );
        return;
      }

      // Check if response contains the complaint number and engineer name
      if (responseText.includes(selectedComplaint.S_SERVNO) && 
          responseText.includes(username)) {
        // Check for "Already CheckIN or CheckOut" status
        if (responseText.includes('"status":"success-Already CheckIN or CheckOut"')) {
          console.log("Already processed status detected in response");
          Alert.alert(
            "Already Processed",
            "This complaint has already been checked in or checked out.",
            [
              {
                text: "OK",
                onPress: () => {
                  setShowDialog(false);
                  setSelectedComplaint(null);
                }
              }
            ]
          );
          return;
        }

        // Check for "Record or Row updated" status
        if (responseText.includes('"status":"success-Record or Row updated =\'1\'"')) {
          console.log(`Successfully ${selectedAction}`);
          Alert.alert(
            "Success",
            `${selectedAction} successful!`,
            [
              {
                text: "OK",
                onPress: () => {
                  setShowDialog(false);
                  setSelectedComplaint(null);
                }
              }
            ]
          );
          return;
        }

        console.log("Success response detected with complaint and engineer details");
        Alert.alert(
          "Success",
          `${selectedAction} successful!`,
          [
            {
              text: "OK",
              onPress: () => {
                setShowDialog(false);
                setSelectedComplaint(null);
              }
            }
          ]
        );
        return;
      }

      // If we get here, try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed JSON data:", data);
        if (data?.status === "success") {
          console.log("Success status in JSON response");
          Alert.alert(
            "Success",
            `${selectedAction} successful!`,
            [
              {
                text: "OK",
                onPress: () => {
                  setShowDialog(false);
                  setSelectedComplaint(null);
                }
              }
            ]
          );
        } else if (data?.status === "success-Already CheckIN or CheckOut") {
          console.log("Already processed status in JSON response");
          Alert.alert(
            "Already Processed",
            "This complaint has already been checked in or checked out.",
            [
              {
                text: "OK",
                onPress: () => {
                  setShowDialog(false);
                  setSelectedComplaint(null);
                }
              }
            ]
          );
        } else if (data?.status === "success-Record or Row updated ='1'") {
          console.log(`Successfully ${selectedAction}`);
          Alert.alert(
            "Success",
            `${selectedAction} successful!`,
            [
              {
                text: "OK",
                onPress: () => {
                  setShowDialog(false);
                  setSelectedComplaint(null);
                }
              }
            ]
          );
        } else {
          console.log("Error status in JSON response:", data);
          Alert.alert(
            "Error",
            data?.message || "Failed to process request. Please try again.",
            [
              {
                text: "OK",
                onPress: () => {
                  setShowDialog(false);
                  setSelectedComplaint(null);
                }
              }
            ]
          );
        }
      } catch (jsonError) {
        console.error("JSON Parse Error:", jsonError);
        console.error("Failed to parse response text:", responseText);
        Alert.alert(
          "Error",
          "Server returned an invalid response. Please try again later.",
          [
            {
              text: "OK",
              onPress: () => {
                setShowDialog(false);
                setSelectedComplaint(null);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error("Network Error:", error);
      Alert.alert(
        "Network Error",
        "Unable to connect to the server. Please check your internet connection and try again.",
        [
          {
            text: "OK",
            onPress: () => {
              setShowDialog(false);
              setSelectedComplaint(null);
            }
          }
        ]
      );
    }
  };

  useEffect(() => {
    if (username && password) {
      fetchComplaints();
    }
  }, [username, password]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Complaint List</Text>
      </View>
      <View
        style={[
          styles.mainContent,
          showDialog && {
            opacity: 0.3,
            transform: [{ scale: 0.95 }],
          },
        ]}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#3498db" />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : complainlist.length > 0 ? (
          <FlatList
            data={complainlist}
            keyExtractor={(item) => item.S_SERVNO}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.complaintCard}
                activeOpacity={0.85}
                onPress={() => {
                  setSelectedComplaint(item);
                  setShowDialog(true);
                }}
              >
                <View style={styles.cardAccent} />
                <View style={styles.cardContent}>
                  <View style={styles.cardRow}>
                    <MaterialIcons name="confirmation-number" size={20} color="#3498db" style={styles.cardIcon} />
                    <Text style={styles.cardLabel}>Complaint No:</Text>
                    <Text style={styles.cardValue}>{item.S_SERVNO}</Text>
                  </View>
                  <View style={styles.cardRow}>
                    <MaterialIcons name="business" size={20} color="#2c3e50" style={styles.cardIcon} />
                    <Text style={styles.cardLabel}>Company:</Text>
                    <Text style={styles.cardValue}>{item.COMP_NAME}</Text>
                  </View>
                  <View style={styles.cardRow}>
                    <MaterialIcons name="engineering" size={20} color="#2c3e50" style={styles.cardIcon} />
                    <Text style={styles.cardLabel}>Engineer:</Text>
                    <Text style={styles.cardValue}>{item.S_assignedengg}</Text>
                  </View>
                  <View style={styles.cardRow}>
                    <MaterialIcons name="assignment-turned-in" size={20} color="#27ae60" style={styles.cardIcon} />
                    <Text style={styles.cardLabel}>Status:</Text>
                    <Text style={styles.cardValue}>{item.S_jobstatus}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <Text style={styles.noDataText}>No complaints found</Text>
        )}
      </View>

      <Modal
        visible={showDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MaterialIcons name="info" size={40} color="#3498db" style={{ marginRight: 8 }} />
              <Text style={styles.modalTitle}>Select Action</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedAction}
                onValueChange={(itemValue) => setSelectedAction(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="CHECK-IN" value="CHECK-IN" />
                <Picker.Item label="CHECK-OUT" value="CHECK-OUT" />
              </Picker>
            </View>
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <MaterialIcons name="engineering" size={20} color="#2980b9" style={styles.detailIcon} />
                <Text style={styles.detailLabel}>Engineer:</Text>
                <Text style={styles.detailValue}>{selectedComplaint?.S_assignedengg}</Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialIcons name="confirmation-number" size={20} color="#2980b9" style={styles.detailIcon} />
                <Text style={styles.detailLabel}>Complaint No:</Text>
                <Text style={styles.detailValue}>{selectedComplaint?.S_SERVNO}</Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialIcons name="location-on" size={20} color="#2980b9" style={styles.detailIcon} />
                <Text style={styles.detailLabel}>Address:</Text>
                <Text style={styles.detailValue}>{selectedComplaint?.COMP_ADD1}{selectedComplaint?.COMP_ADD2 ? `, ${selectedComplaint?.COMP_ADD2}` : ''}</Text>
              </View>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowDialog(false);
                  setSelectedComplaint(null);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  header: {
    backgroundColor: "#3498db",
    padding: 20,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginTop: 35,
  },
  headerText: {
    color: "white",
    fontSize: 26,
    fontWeight: "600",
  },
  mainContent: {
    flex: 1,
    paddingVertical: 24,
  },
  complaintCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  cardAccent: {
    width: 6,
    backgroundColor: '#3498db',
    
  },
  cardContent: {
    flex: 1,
    paddingVertical: 10,
    paddingLeft: 15,
    
    
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    
  },
  cardIcon: {
    marginRight: 8,
  },
  cardLabel: {
    fontWeight: '600',
    color: '#34495e',
    fontSize: 15,
    marginRight: 4,
  },
  cardValue: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: "#ffebee",
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: "#c62828",
    fontSize: 16,
    textAlign: "center",
  },
  noDataText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    height: "80%",
    maxHeight: 600,
  },
  modalHeader: {
    
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#e1e4e8',
    marginVertical: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 30,
  },
  picker: {
    height: 60,
  },
  detailsCard: {
    backgroundColor: '#f4f8fb',
    borderRadius: 10,
    paddingVertical: 18,
    paddingLeft: 10,
    marginBottom: 20,
    shadowColor: '#2980b9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailIcon: {
    marginRight: 8,
  },
  detailLabel: {
    fontWeight: '600',
    color: '#2980b9',
    fontSize: 15,
    marginRight: 4,
  },
  detailValue: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  modalButton: {
    flex: 1,
    padding: 18,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#e74c3c",
  },
  submitButton: {
    backgroundColor: "#2ecc71",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#2c3e50",
  },
});