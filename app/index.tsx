import React from "react";
import { Image, StyleSheet, TouchableOpacity, Text, View, Linking } from "react-native";
import { SafeAreaView } from "react-native";
import LogoHeader from "./components/LogoHeader";
import Footer from "./components/footer";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.background}>
        <View style={styles.outercontainer} >
          <View style={styles.innercontainer}>
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
                <TouchableOpacity
                  onPress={() =>
                    router.push("/Attendance/Attendance")
                  }
                  style={styles.buttonSmall}>
                  <Image
                    source={require("../assets/images/admin.png")}
                    style={styles.buttonImageSmall}
                  />
                  <Text style={styles.buttonTextSmall}>Attendance</Text>
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

              {/* Leave  */}
              <View style={styles.buttonGrid}>
                {/* Apply for Leave */}
                <TouchableOpacity
                  onPress={() =>
                    router.push("/Leave/login")
                  }
                  style={styles.buttonSmall}>
                  <Image
                    source={require("../assets/images/leave.png")}
                    style={styles.buttonImageSmall}
                  />
                  <Text style={styles.buttonTextSmall}>Leave</Text>
                </TouchableOpacity>


              </View>
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

  },
  outercontainer: {
    borderRadius: 10,
    backgroundColor: "#c1d3d8",
    flex: 1,
    elevation: 4,
   
  },
  innercontainer: {
    flex: 1,
    position: "relative",

  },
  headingContainer: {
    alignItems: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  container: {
    marginTop: 10,
  },
  buttonGrid: {
    flexDirection: "row",
    margin: 4,
    gap: 16,
    justifyContent: "center",

  },
  buttonSmall: {
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 3,
    paddingHorizontal: 3,
    borderRadius: 10,
    width: "45%",

    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonImageSmall: {
    width: 120,
    height: 120,



  },


  buttonTextSmall: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },

  circle: {
    position: "absolute",
    top: +130,
    alignSelf: "center",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgb(72, 118, 167)",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    zIndex: 10,
  },
});
