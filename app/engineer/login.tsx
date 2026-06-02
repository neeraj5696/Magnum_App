import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import LogoHeader from "../components/LogoHeader";
import Footer from "../components/footer";
import { LinearGradient } from "expo-linear-gradient";

export default function EngineerLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [inputFocus, setInputFocus] = useState({
    username: false,
    password: false,
  });
  const shimmerAnimation = useRef(new Animated.Value(0)).current;
  const shimmerLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Reset states when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setLoginSuccess(false);
      setErrorMessage("");
    }, [])
  );

  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const savedUsername = await SecureStore.getItemAsync("engg_username");
        const savedPassword = await SecureStore.getItemAsync("engg_password");
        const savedRememberMe = await SecureStore.getItemAsync(
          "engg_rememberMe"
        );

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

      // Cleanup function
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

  // Add cleanup effect for component unmount
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
      console.log("que be", response);

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
          if (
            shimmerLoopRef.current &&
            typeof shimmerLoopRef.current.stop === "function"
          ) {
            shimmerLoopRef.current.stop();
            shimmerLoopRef.current = null;
          }
          router.push({
            pathname: "/engineer/list",
            params: {
              username: username,
              password: password,
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
    <LinearGradient colors={["#0f2952", "#1a4a8a", "#2d6cc0"]} style={styles.gradient}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <View style={styles.innercontainer}>
            <LogoHeader />
            <View style={styles.formContainer}>
              <View style={styles.titleRow}>
                <View style={styles.titleAccent} />
                <Text style={styles.title}>Employee Login</Text>
              </View>
              <Text style={styles.subtitle} >Enter your credentials to continue</Text>
              <View
                style={[
                  styles.inputContainer,
                  inputFocus.username && styles.inputContainerFocused,
                ]}
              >
                <MaterialIcons
                  name="person"
                  size={22}
                  color={inputFocus.username ? "#0066CC" : "#666"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  editable={!isLoading}
                  onFocus={() =>
                    setInputFocus((f) => ({ ...f, username: true }))
                  }
                  onBlur={() =>
                    setInputFocus((f) => ({ ...f, username: false }))
                  }
                  placeholderTextColor="#aaa"
                />
              </View>

              <View
                style={[
                  styles.inputContainer,
                  inputFocus.password && styles.inputContainerFocused,
                ]}
              >
                <MaterialIcons
                  name="lock"
                  size={22}
                  color={inputFocus.password ? "#0066CC" : "#666"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  editable={!isLoading}
                  onFocus={() =>
                    setInputFocus((f) => ({ ...f, password: true }))
                  }
                  onBlur={() => {
                    setInputFocus((f) => ({ ...f, password: false }));
                    setIsPasswordVisible(false);
                  }}
                  placeholderTextColor="#aaa"
                />
                <Text>
                  <Pressable
                    onPress={() => setIsPasswordVisible((prev) => !prev)}
                    style={styles.eyecontainer}
                  >
                    <MaterialIcons
                      name={isPasswordVisible ? "visibility" : "visibility-off"}
                      size={22}
                      color={inputFocus.password ? "#0066CC" : "#666"}
                      style={styles.inputIcon}
                    />
                  </Pressable>
                </Text>
              </View>

              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={rememberMe ? "check-box" : "check-box-outline-blank"}
                  size={24}
                  color="#0066CC"
                />
                <Text style={styles.rememberMeText}>Remember Me</Text>
              </TouchableOpacity>



              {errorMessage ? (
                <View style={styles.errorBox}>
                  <MaterialIcons
                    name="error-outline"
                    size={18}
                    color="#FF3B30"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              <View style={styles.buttonContainer}>
                {loginSuccess ? (
                  <View style={styles.successContainer}>
                    <Animated.View style={[styles.shimmer, shimmerStyle]} />
                    <MaterialIcons
                      name="check-circle"
                      size={26}
                      color="#4CAF50"
                    />
                    <Text style={styles.successText}>Login Successful!</Text>
                  </View>
                ) : (
                  <Pressable
                    style={({ pressed }) => [
                      styles.loginButton,
                      isLoading && styles.loginButtonDisabled,
                      pressed && styles.loginButtonPressed,
                    ]}
                    onPress={handleLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.loginButtonText}>Login</Text>
                    )}
                  </Pressable>
                )}
              </View>
            </View>
            <Footer />
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: "2%",
  },

  innercontainer: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "transparent",
    justifyContent: "center",
  },
  formContainer: {
    width: "100%",
    backgroundColor: "white",
    padding: 28,
    shadowColor: "#000",
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8.0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,

  },
  titleAccent: {
    width: 4,
    height: 22,
    borderRadius: 2,
    backgroundColor: "#1a4a8a",
    marginRight: 10,

  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    letterSpacing: 1.2,
  },
  subtitle: {
    fontSize: 13,
    color: "#7a8a9a",
    marginBottom: 28,
    marginLeft: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f7fb",
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  inputContainerFocused: {
    borderColor: "#0066CC",
    backgroundColor: "#eaf4fb",
  },
  inputIcon: {
    padding: 14,
    width: 50,
    textAlign: "center",
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 17,
    color: "#222",
    fontWeight: "500",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fdecea",
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FF3B30",
    alignSelf: "stretch",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 15,
    flex: 1,
  },

  eyecontainer: {},
  loginButton: {
    backgroundColor: "#005bb5",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 16,
    elevation: 5,
    shadowColor: "#004a8c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  loginButtonPressed: {
    backgroundColor: "#005bb5",
  },
  loginButtonDisabled: {
    backgroundColor: "#b3c6e0",
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 1.2,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 2,
  },
  rememberMeText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#444",
    fontWeight: "500",
  },

  buttonContainer: {
    height: "auto",
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgb(232, 244, 253)",
    padding: 16,
    borderRadius: 10,
    overflow: "hidden",
  },
  successText: {
    color: "#2E7D32",
    fontSize: 17,
    fontWeight: "600",
    marginLeft: 10,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 172, 237, 0.18)",
    width: 200,
  },
});
