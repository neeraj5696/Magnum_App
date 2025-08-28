import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert,
  Pressable,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import LogoHeader from "../components/LogoHeader";
import { useFocusEffect } from "@react-navigation/native";
import Footer from "../components/footer";

export default function AreaManagerLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const shimmerAnimation = useRef(new Animated.Value(0)).current;
  const shimmerLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [inputFocus, setInputFocus] = useState({
    username: false,
    password: false,
  });

  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const savedUsername = await SecureStore.getItemAsync("ar_username");
        const savedPassword = await SecureStore.getItemAsync("ar_password");
        const savedRememberMe = await SecureStore.getItemAsync("ar_rememberMe");

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
    // Reset loginSuccess state when component mounts
    setLoginSuccess(false);
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

      // Cleanup function
      return () => {
        if (shimmerLoopRef.current) {
          shimmerLoopRef.current.stop();
          shimmerLoopRef.current = null;
        }
      };
    }
  }, [loginSuccess]);

  // Add cleanup effect for component unmount
  useEffect(() => {
    return () => {
      if (shimmerLoopRef.current) {
        shimmerLoopRef.current.stop();
        shimmerLoopRef.current = null;
      }
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setLoginSuccess(false);
    }, [])
  );

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
      formData.append("role", "area_manager");

      const response = await fetch("https://hma.magnum.org.in/appARlogin.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error("Failed to parse response:", jsonError);
        setErrorMessage("Invalid server response. Please try again.");
        return;
      }

      if (data?.status === "success") {
        if (rememberMe) {
          await SecureStore.setItemAsync("ar_username", username);
          await SecureStore.setItemAsync("ar_password", password);
          await SecureStore.setItemAsync("ar_rememberMe", "true");
        } else {
          await SecureStore.deleteItemAsync("ar_username");
          await SecureStore.deleteItemAsync("ar_password");
          await SecureStore.deleteItemAsync("ar_rememberMe");
        }

        setLoginSuccess(true);
        // Navigate to list page after a short delay to show success animation
        setTimeout(() => {
          if (shimmerLoopRef.current) {
            shimmerLoopRef.current.stop();
            shimmerLoopRef.current = null;
          }
          router.push({
            pathname: "/areamanager/alist",
            params: {
              username: username,
              password: password,
              role: "area_manager",
            },
          });
        }, 1500);
      } else {
        setErrorMessage(
          data?.message || "Login failed. Please check your credentials."
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const shimmerStyle = {
    transform: [
      {
        translateX: shimmerAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [-200, 200],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <View style={styles.innercontainer}>
        <LogoHeader />
        <View style={styles.formContainer}>
          <Text style={styles.title}>AREA MANAGER LOGIN</Text>

          <View style={styles.inputContainer}>
            <MaterialIcons
              name="person"
              size={20}
              color="#666"
              style={styles.inputIcon}
            />
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
            <MaterialIcons
              name="lock"
              size={20}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
              editable={!isLoading}
              onBlur={() => {
                setInputFocus((f) => ({ ...f, password: false }));
                setIsPasswordVisible(false);
              }}
            />
            <Text>
              <Pressable 
              style= {styles.eyebutton}
              onPress={() => setIsPasswordVisible((prev) => !prev)}>
                <MaterialIcons
                  name={isPasswordVisible ? "visibility" : "visibility-off"}
                  size={22}
                  color={inputFocus.password ? "#0066CC" : "#666"}
                  
                />
              </Pressable>
            </Text>
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
                style={[
                  styles.loginButton,
                  isLoading && styles.loginButtonDisabled,
                ]}
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
        <Footer />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(226, 234, 243)",
    paddingHorizontal: 8,
    paddingVertical: 16,
    justifyContent: "space-between",
  },
  innercontainer: {
    flex: 1,
    height: "auto",
    justifyContent: "space-between",
    borderWidth: 0,
    borderRadius: 18,
    marginTop: 20,
    backgroundColor: "white",
    elevation: 2,
  },

  formContainer: {
    marginTop: 20,
    marginBottom: "auto",
    backgroundColor: "white",
    padding: 20,
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

  eyebutton:{
    paddingRight: 10,
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
    height: "auto",
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
