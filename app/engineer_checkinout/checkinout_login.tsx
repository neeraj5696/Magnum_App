import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Animated,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import LogoHeader from "../components/LogoHeader";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Footer from "../components/footer";
import { LinearGradient } from "expo-linear-gradient";
import { Line } from "react-native-svg";

export default function CheckInOut() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
        const savedUsername = await AsyncStorage.getItem("username");
        const savedPassword = await AsyncStorage.getItem("password");
        const savedRememberMe = await AsyncStorage.getItem("rememberMe");

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
      return () => {
        if (
          shimmerLoopRef.current &&
          typeof shimmerLoopRef.current.stop === "function"
        ) {
          shimmerLoopRef.current.stop();
          shimmerLoopRef.current = null;
        }
      };
    }
  }, [loginSuccess]);

  useEffect(() => {
    return () => {
      if (
        shimmerLoopRef.current &&
        typeof shimmerLoopRef.current.stop === "function"
      ) {
        shimmerLoopRef.current.stop();
        shimmerLoopRef.current = null;
      }
    };
  }, []);

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
        "https://hma.magnum.org.in/appEngglogin.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        }
      );
      console.log("staRT", response);
      const responseText = await response.text();

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error("Failed to parse response:", jsonError);
        setErrorMessage("Invalid server response format");
        return;
      }

      if (data?.status === "success") {
        if (rememberMe) {
          await AsyncStorage.setItem("username", username);
          await AsyncStorage.setItem("password", password);
          await AsyncStorage.setItem("rememberMe", "true");
        } else {
          //clear the credential if rememberme is not selected

          await AsyncStorage.removeItem("username");
          await AsyncStorage.removeItem("password");
          await AsyncStorage.removeItem("rememberMe");
        }
        setLoginSuccess(true);
        setTimeout(() => {
          setLoginSuccess(false);
          router.push(
            `/engineer_checkinout/check_in_out?username=${encodeURIComponent(
              username
            )}&password=${encodeURIComponent(password)}`
          );
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
    <LinearGradient colors={["#0f2952", "#1a4a8a", "#2d6cc0"]} style={styles.gradient}>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS == 'ios' ? 'padding' : undefined}>

        <View style={styles.innercontainer}>
          <LogoHeader />
          <View style={styles.formContainer}>
            <View style={styles.titlecontainer}>
              <Text style={styles.title}>EMPLOYEE LOGIN</Text>
              <Text style={styles.subtitle}>
                Please enter your credentials to check in or out
              </Text>
            </View>

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
                onFocus={() => setInputFocus((f) => ({ ...f, password: true }))}
                onBlur={() => {
                  setInputFocus((f) => ({ ...f, password: false }));
                  setIsPasswordVisible(false);
                }}
              />

              <Text>
                <Pressable onPress={() => setIsPasswordVisible((prev) => !prev)}>
                  <MaterialIcons
                    name={isPasswordVisible ? "visibility" : "visibility-off"}
                    size={22}
                    color={inputFocus.password ? "#0066CC" : "#666"}
                    style={styles.inputIcon}
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


      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  innercontainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },

  logoContainer: {
    alignItems: "center",
  },

  formContainer: {
    backgroundColor: "white",
    padding: 28,
   
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  titlecontainer: {
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0f2952",
    textAlign: "left",
    borderLeftWidth: 4,
    borderLeftColor: "#0066CC",
    paddingLeft: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    textAlign: "left",
    paddingLeft: 16,
    marginTop: 8,
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#e0e5eb",
    paddingHorizontal: 12,
  },
  inputIcon: {
    padding: 10,
    marginRight: 4,
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: "#0f2952",
  },
  errorText: {
    color: "#E63946",
    fontSize: 13,
    marginBottom: 16,
    marginTop: -8,
    textAlign: "left",
    paddingLeft: 4,
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "#0066CC",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
    elevation: 3,
    shadowColor: "#0066CC",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4.65,
  },
  loginButtonDisabled: {
    backgroundColor: "#B0B0B0",
  },
  loginButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
    marginTop: 8,
  },
  rememberMeText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  buttonContainer: {
    height: "auto",
    marginTop: 4,
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E9",
    padding: 16,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  successText: {
    color: "#2E7D32",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 10,
    letterSpacing: 0.3,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    width: 200,
  },
});
