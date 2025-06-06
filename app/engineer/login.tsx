import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import LogoHeader from '../components/LogoHeader';

export default function EngineerLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const shimmerAnimation = useRef(new Animated.Value(0)).current;
  const shimmerLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const savedUsername = await SecureStore.getItemAsync("engg_username");
        const savedPassword = await SecureStore.getItemAsync("engg_password");
        const savedRememberMe = await SecureStore.getItemAsync("engg_rememberMe");

        if (savedRememberMe === "true") {
          setUsername(savedUsername || "");
          setPassword(savedPassword || "");
          setRememberMe(true);
        }
      } catch (error) {
        console.error("Error loading saved credentials:", error);
      }
    };
    loadCredentials();
  }, []);

  useEffect(() => {
    if (loginSuccess) {
      shimmerLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnimation, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnimation, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      shimmerLoopRef.current.start();
    }
  }, [loginSuccess]);

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMessage("Please enter both username and password");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

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

      const data = await response.json();
      // console.log(data);

      if (data?.status === "success") {
        if (rememberMe) {
          await SecureStore.setItemAsync("engg_username", username);
          await SecureStore.setItemAsync("engg_password", password);
          await SecureStore.setItemAsync("engg_rememberMe", "true");
        } else {
          await SecureStore.deleteItemAsync("engg_username");
          await SecureStore.deleteItemAsync("engg_password");
          await SecureStore.deleteItemAsync("engg_rememberMe");
        }

        setLoginSuccess(true);
        // Navigate to list page after a short delay to show success animation
        setTimeout(() => {
          router.push({
            pathname: "/engineer/list",
            params: {
              username: username,
              password: password
            }
          });
        }, 1500);
      } else {
        setErrorMessage(data?.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const shimmerStyle = {
    transform: [{
      translateX: shimmerAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [-200, 200],
      }),
    }],
  };

  return (
    <View style={styles.container}>
      <LogoHeader />
      <View style={styles.formContainer}>
        <Text style={styles.title}>ENGINEER LOGIN</Text>

        <View style={styles.inputContainer}>
          <MaterialIcons name="person" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="lock" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />
        </View>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <TouchableOpacity
          style={styles.rememberMeContainer}
          onPress={() => setRememberMe(!rememberMe)}
        >
          <MaterialIcons
            name={rememberMe ? "check-box" : "check-box-outline-blank"}
            size={24}
            color="#0066CC"
          />
          <Text style={styles.rememberMeText}>Remember Me</Text>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          {loginSuccess ? (
            <View style={styles.successContainer}>
              <Animated.View style={[styles.shimmer, shimmerStyle]} />
              <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              <Text style={styles.successText}>Login Successful!</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
   
    padding: 16,
  },
  formContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0066CC',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: "#0066CC",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  loginButtonDisabled: {
    backgroundColor: "#999",
  },
  loginButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  rememberMeText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  buttonContainer: {
    height: 'auto',
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgb(232, 244, 253)",
    padding: 14,
    borderRadius: 8,
    overflow: "hidden",
  },
  successText: {
    color: "#2E7D32",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 172, 237, 0.25)",
    width: 200,
  },
}); 