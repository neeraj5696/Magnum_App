import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Footer = () => (
  <View style={styles.footerContainer}>
    <View style={styles.divider} />
    <Text style={styles.footerText}>
      © 2024 Magnum App. All rights reserved
    </Text>
  </View>
);

const styles = StyleSheet.create({
  footerContainer: {
    width: '100%',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  divider: {
    height: 2,
    width: '94%',
    backgroundColor: '#e6eaf0',
    borderRadius: 1,
    alignSelf: 'center',
    marginBottom: 10,
  },
  footerText: {
    color: '#222',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});

export default Footer;
