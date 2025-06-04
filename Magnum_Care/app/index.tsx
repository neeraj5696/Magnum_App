import React from "react";
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native";
import LogoHeader from "./components/LogoHeader";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.background}>
        <LogoHeader />
        <View style={styles.headingContainer}>
          <Text style={styles.heading}>Magnum Care</Text>
        </View>

        <View style={styles.container}>
          {/* Manager and Area Manager Section */}
          <View style={styles.buttonGrid}>
            {/* Manager Image */}
            <TouchableOpacity style={styles.buttonSmall}>
              <Image 
                source={require("../assets/images/manager.png")} 
                style={styles.buttonImageSmall} 
              />
              <Text style={styles.buttonTextSmall}>Manager</Text>
            </TouchableOpacity>

            {/* Area Manager Image */}
            <TouchableOpacity style={styles.buttonSmall}>
              <Image 
                source={require("../assets/images/boss.png")} 
                style={styles.buttonImageSmall} 
              />
              <Text style={styles.buttonTextSmall}>Area Manager</Text>
            </TouchableOpacity>
          </View>

          {/* Engineer and Partner Section */}
          <View style={styles.buttonGrid}>
            {/* Engineer Image */}
            <TouchableOpacity 
              style={styles.buttonSmall}
              onPress={() => router.push("/engineer/login")}
            >
              <Image 
                source={require("../assets/images/engineer.png")} 
                style={styles.buttonImageSmall} 
              />
              <Text style={styles.buttonTextSmall}>Engineer</Text>
            </TouchableOpacity>

            {/* Partner Image */}
            <TouchableOpacity style={styles.buttonSmall}>
              <Image 
                source={require("../assets/images/collaboration.png")} 
                style={styles.buttonImageSmall} 
              />
              <Text style={styles.buttonTextSmall}>Partner</Text>
            </TouchableOpacity>
          </View>

          {/* Admin and Check In/Out Section */}
          <View style={styles.buttonGrid}>
            {/* Admin Image */}
            <TouchableOpacity style={styles.buttonSmall}>
              <Image 
                source={require("../assets/images/admin.png")} 
                style={styles.buttonImageSmall} 
              />
              <Text style={styles.buttonTextSmall}>Admin</Text>
            </TouchableOpacity>

            {/* Check In/Out Image */}
            <TouchableOpacity style={styles.buttonSmall}>
              <Image 
                source={require("../assets/images/checkinout.png")} 
                style={styles.buttonImageSmall} 
              />
              <Text style={styles.buttonTextSmall}>Check In/Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  background: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    alignItems: "center",
  },
  headingContainer: {
    width: "90%",
    marginVertical: 14,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: "#1a73e8",
    borderRadius: 14,
    alignItems: "center",
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a73e8",
    textAlign: "center",
  },
  container: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 16,
    width: "92%",
    marginTop: 14,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  buttonGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 10,
  },
  buttonSmall: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "48%",
    height: 120,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: "#e8eaed",
  },
  buttonImageSmall: {
    width: 48,
    height: 48,
    marginBottom: 12,
    resizeMode: "contain",
  },
  buttonTextSmall: {
    fontSize: 18,
    color: "#202124",
    fontWeight: "600",
    textAlign: "center",
  },
});
