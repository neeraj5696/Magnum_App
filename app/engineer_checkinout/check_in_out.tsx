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
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "./types";
import { Picker } from "@react-native-picker/picker";
import { MaterialIcons } from "@expo/vector-icons";
import LogoHeader from "../components/LogoHeader";
import Footer from "../components/footer";

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
  const username = Array.isArray(params.username)
    ? params.username[0]
    : params.username || "";
  const password = Array.isArray(params.password)
    ? params.password[0]
    : params.password || "";

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
      action: selectedAction,
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
              },
            },
          ]
        );
        return;
      }

      // Check if response contains the complaint number and engineer name
      if (
        responseText.includes(selectedComplaint.S_SERVNO) &&
        responseText.includes(username)
      ) {
        // Check for "Already CheckIN or CheckOut" status
        if (
          responseText.includes(
            '"status":"success-Already CheckIN or CheckOut"'
          )
        ) {
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
                },
              },
            ]
          );
          return;
        }

        // Check for "Record or Row updated" status
        if (
          responseText.includes(
            '"status":"success-Record or Row updated =\'1\'"'
          )
        ) {
          console.log(`Successfully ${selectedAction}`);
          Alert.alert("Success", `${selectedAction} successful!`, [
            {
              text: "OK",
              onPress: () => {
                setShowDialog(false);
                setSelectedComplaint(null);
              },
            },
          ]);
          return;
        }

        console.log(
          "Success response detected with complaint and engineer details"
        );
        Alert.alert("Success", `${selectedAction} successful!`, [
          {
            text: "OK",
            onPress: () => {
              setShowDialog(false);
              setSelectedComplaint(null);
            },
          },
        ]);
        return;
      }

      // If we get here, try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed JSON data:", data);
        if (data?.status === "success") {
          console.log("Success status in JSON response");
          Alert.alert("Success", `${selectedAction} successful!`, [
            {
              text: "OK",
              onPress: () => {
                setShowDialog(false);
                setSelectedComplaint(null);
              },
            },
          ]);
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
                },
              },
            ]
          );
        } else if (data?.status === "success-Record or Row updated ='1'") {
          console.log(`Successfully ${selectedAction}`);
          Alert.alert("Success", `${selectedAction} successful!`, [
            {
              text: "OK",
              onPress: () => {
                setShowDialog(false);
                setSelectedComplaint(null);
              },
            },
          ]);
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
                },
              },
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
              },
            },
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
            },
          },
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
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <View style={styles.innercontainer}>
          <LogoHeader />
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
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.complaintCard}
                    activeOpacity={0.92}
                    onPress={() => {
                      setSelectedComplaint(item);
                      setShowDialog(true);
                    }}
                  >
                    <View style={styles.cardAccent} />
                    <View style={styles.cardContent}>
                      <View style={styles.cardRow}>
                        <MaterialIcons
                          name="confirmation-number"
                          size={22}
                          color="#3498db"
                          style={styles.cardIcon}
                        />
                        <Text style={styles.cardLabel}>Complaint No:</Text>
                        <Text style={styles.cardValue}>{item.S_SERVNO}</Text>
                      </View>
                      <View style={styles.cardRow}>
                        <MaterialIcons
                          name="business"
                          size={20}
                          color="#2c3e50"
                          style={styles.cardIcon}
                        />
                        <Text style={styles.cardLabel}>Company:</Text>
                        <Text style={styles.cardValue}>{item.COMP_NAME}</Text>
                      </View>
                      <View style={styles.cardRow}>
                        <MaterialIcons
                          name="engineering"
                          size={20}
                          color="#2c3e50"
                          style={styles.cardIcon}
                        />
                        <Text style={styles.cardLabel}>Engineer:</Text>
                        <Text style={styles.cardValue}>
                          {item.S_assignedengg}
                        </Text>
                      </View>
                      <View style={styles.cardRow}>
                        <MaterialIcons
                          name="assignment-turned-in"
                          size={20}
                          color="#27ae60"
                          style={styles.cardIcon}
                        />
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
          <Footer />
        </View>
      </View>

      {/* Modal remains unchanged */}
      <Modal
        visible={showDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MaterialIcons
                name="info"
                size={40}
                color="#3498db"
                style={{ marginRight: 8 }}
              />
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
                <MaterialIcons
                  name="engineering"
                  size={20}
                  color="#2980b9"
                  style={styles.detailIcon}
                />
                <Text style={styles.detailLabel}>Engineer:</Text>
                <Text style={styles.detailValue}>
                  {selectedComplaint?.S_assignedengg}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialIcons
                  name="confirmation-number"
                  size={20}
                  color="#2980b9"
                  style={styles.detailIcon}
                />
                <Text style={styles.detailLabel}>Complaint No:</Text>
                <Text style={styles.detailValue}>
                  {selectedComplaint?.S_SERVNO}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialIcons
                  name="location-on"
                  size={20}
                  color="#2980b9"
                  style={styles.detailIcon}
                />
                <Text style={styles.detailLabel}>Address:</Text>
                <Text style={styles.detailValue}>
                  {selectedComplaint?.COMP_ADD1}
                  {selectedComplaint?.COMP_ADD2
                    ? `, ${selectedComplaint?.COMP_ADD2}`
                    : ""}
                </Text>
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
  outerContainer: {
    flex: 1,
    backgroundColor: "#f6f8fa", // lighter, modern background
    justifyContent: "flex-start",
  },
  container: {
    flex: 1,
    marginHorizontal: 0,
    backgroundColor: "transparent",
    padding: 16,
  },
  innercontainer: {
    flex: 1,
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 4,
  },
  mainContent: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 40,
    paddingTop: 16,
  },
  complaintCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 8,
    marginVertical: 8,
    borderLeftWidth: 5,
    borderColor: "#3498db",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#3498db",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardAccent: {},
  cardContent: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  cardIcon: {
    marginRight: 6,
  },
  cardLabel: {
    fontWeight: "600",
    color: "#444",
    fontSize: 15,
    marginHorizontal: 4,
    width: 100,
    fontFamily: Platform.OS === 'ios' ? 'San Francisco' : 'Roboto',
  },
  cardValue: {
    fontSize: 16,
    color: "#222",
    fontWeight: "400",
    flexShrink: 1,
    fontFamily: Platform.OS === 'ios' ? 'San Francisco' : 'Roboto',
  },
  errorContainer: {
    padding: 18,
    backgroundColor: "#ffebee",
    margin: 18,
    borderRadius: 10,
  },
  errorText: {
    color: "#c62828",
    fontSize: 17,
    textAlign: "center",
    fontWeight: "600",
  },
  noDataText: {
    textAlign: "center",
    fontSize: 19,
    color: "#888",
    marginTop: 40,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    width: "92%",
    maxWidth: 420,
    minHeight: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 8,
    justifyContent: "center",
    flexDirection: "row",
  },
  divider: {
    height: 1,
    backgroundColor: "#e1e4e8",
    marginVertical: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e1e4e8",
    borderRadius: 10,
    marginBottom: 24,
    backgroundColor: "#f6f8fa",
  },
  picker: {
    height: 54,
    fontSize: 16,
  },
  detailsCard: {
    backgroundColor: "#f4f8fb",
    borderRadius: 12,
    paddingVertical: 16,
    paddingLeft: 12,
    marginBottom: 18,
    shadowColor: "#2980b9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailIcon: {
    marginRight: 8,
  },
  detailLabel: {
    fontWeight: "700",
    color: "#2980b9",
    fontSize: 15,
    marginRight: 4,
    fontFamily: Platform.OS === 'ios' ? 'San Francisco' : 'Roboto',
  },
  detailValue: {
    fontSize: 15,
    color: "#222",
    fontWeight: "500",
    fontFamily: Platform.OS === 'ios' ? 'San Francisco' : 'Roboto',
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 28,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    marginHorizontal: 6,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
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
    fontWeight: "700",
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'San Francisco' : 'Roboto',
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 18,
    textAlign: "center",
    color: "#2c3e50",
    fontFamily: Platform.OS === 'ios' ? 'San Francisco' : 'Roboto',
  },
});
