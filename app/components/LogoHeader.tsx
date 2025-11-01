import React from "react";
import { View, Image, StyleSheet } from "react-native";

interface LogoHeaderProps {
  containerStyle?: object;
}

const LogoHeader: React.FC<LogoHeaderProps> = ({ containerStyle }) => {
  return (
    <View style={[styles.logoContainer, containerStyle]}>
      <View style={styles.logoRow}>
        <View style={styles.logoWrapper}>
          <Image
            source={require("../../assets/images/samsung_logo.png")}
            style={styles.samsungLogo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.logoWrapper}>
          <Image
            source={require("../../assets/images/magnum_logo.png")}
            style={styles.magnumLogo}
            resizeMode="contain"
          />
        </View>
      </View>
      <View style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    width: "100%",
    backgroundColor: "#fff",
    paddingHorizontal: 0,
    paddingVertical: 8,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    alignItems: "center",
    // marginTop: 30,
  },
  logoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    gap: 5,
  },
  logoWrapper: {
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 16,
    marginHorizontal: 6,
    marginTop: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 0,
  },
  samsungLogo: {
    width: 170,
    height: 100,
    marginLeft: 5
  },
  magnumLogo: {
    width: 120,
    height: 65,
  },
  divider: {
    marginVertical: 4,
    height: 2,
    width: "80%",
    backgroundColor: "#e6eaf0",
    borderRadius: 1,
    alignSelf: "center",
  },
});

export default LogoHeader;
