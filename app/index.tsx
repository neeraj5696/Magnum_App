import React from "react";
import { Image, StyleSheet, TouchableOpacity, Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import LogoHeader from "./components/LogoHeader";
import Footer from "./components/footer";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  const MODULES = [
    { name: "Manager", image: require("../assets/images/manager.png"), route: "/manager/login" },
    { name: "Area Manager", image: require("../assets/images/boss.png"), route: "/areamanager/alogin" },
    { name: "Engineer", image: require("../assets/images/engineer.png"), route: "/engineer/login" },
    { name: "Partner", image: require("../assets/images/collaboration.png"), route: "/partner/login" },
    { name: "Attendance", image: require("../assets/images/admin.png"), route: "/Attendance/Attendance" },
    { name: "Check In/Out", image: require("../assets/images/checkinout.png"), route: "/engineer_checkinout/checkinout_login" },
    { name: "Leave", image: require("../assets/images/leave.png"), route: "/Leave/login" },
     { name: "Approve Leave", image: require("../assets/images/leave.png"), route: "/Leave/Mlogin" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#E8F0F9", "#D4E0F0"]}
        style={styles.background}
      >
        <View style={styles.outercontainer}>
          <View style={styles.innercontainer}>
            <LogoHeader />

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.container}>
                {MODULES.map((module, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.buttonSmall}
                    onPress={() => router.push(module.route as any)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.imageContainer}>
                      <Image
                        source={module.image}
                        style={styles.buttonImageSmall}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={styles.buttonTextSmall}>{module.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

          </View>
          <Footer />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#E8F0F9",
  },
  background: {
    flex: 1,
    padding: 0,
    justifyContent: "space-between",
  },
  outercontainer: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    flex: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 2,
  },
  innercontainer: {
    flex: 1,
    position: "relative",
  },
  scrollContent: {
    paddingBottom: 24,
  },
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingTop: 16,
    justifyContent: "space-between",
    rowGap: 16,
  },
  buttonSmall: {
    alignItems: "center",
    backgroundColor: "#F4F7FC",
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 20,
    width: "47%",
    shadowColor: "#000000ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,

  },
  buttonImageSmall: {
    width: 100,
    height: 100,
  },
  buttonTextSmall: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2C3E50",
    textAlign: "center",
    letterSpacing: 0.3,
  },
});
