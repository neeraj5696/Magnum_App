import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface LogoHeaderProps {
  containerStyle?: object;
}

const LogoHeader: React.FC<LogoHeaderProps> = ({ containerStyle }) => {
  return (
    <View style={[styles.logoContainer, containerStyle]}>
      <Image
        source={require('../../assets/images/samsung_logo.png')}
        style={styles.samsungLogo}
        resizeMode="contain"
      />
      <Image
        source={require('../../assets/images/magnum_logo.png')}
        style={styles.magnumLogo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 5,
    marginTop: 40,
  },
  samsungLogo: {
    width: 180,
    height: 110,
  },
  magnumLogo: {
    width: 120,
    height: 60,
  },
});

export default LogoHeader; 