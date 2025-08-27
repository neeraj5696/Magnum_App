import React from "react";
import { Image, StyleSheet, TouchableOpacity, Text, View } from "react-native";
import { SafeAreaView } from "react-native";
import LogoHeader from "./components/LogoHeader";
import Footer from "./components/footer";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.background}>
      <View style= {styles.innercontainer}>
      <LogoHeader />
        <View style={styles.container}>
          {/* Manager and Area Manager Section */}
          <View style={styles.buttonGrid}>
            {/* Manager Image */}
            <TouchableOpacity
              style={styles.buttonSmall}
              onPress={() => router.push("/manager/login")}
            >
              <Image
                source={require("../assets/images/manager.png")}
                style={styles.buttonImageSmall}
              />
              <Text style={styles.buttonTextSmall}>Manager</Text>
            </TouchableOpacity>

            {/* Area Manager Image */}
            <TouchableOpacity
              style={styles.buttonSmall}
              onPress={() => router.push("/areamanager/alogin")}
            >
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
            <TouchableOpacity
              style={styles.buttonSmall}
              onPress={() => router.push("/partner/login")}
            >
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
            <TouchableOpacity
              style={styles.buttonSmall}
              onPress={() =>
                router.push("/engineer_checkinout/checkinout_login")
              }
            >
              <Image
                source={require("../assets/images/checkinout.png")}
                style={styles.buttonImageSmall}
              />
              <Text style={styles.buttonTextSmall}>Check In/Out</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Footer />
      </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "rgb(226, 234, 243)",
  },
  background: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
    marginTop: 20,
  },
  innercontainer: {
    justifyContent: "space-between",
    flex: 1,
  },
  headingContainer: {
    alignItems: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  container: {},
  buttonGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  buttonSmall: {
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    width: "48%",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonImageSmall: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },

  buttonTextSmall: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});
