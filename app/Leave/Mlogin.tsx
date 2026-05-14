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
    ScrollView,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import LogoHeader from "../components/LogoHeader";
import Footer from "../components/footer";

export default function EngineerLogin() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [inputFocus, setInputFocus] = useState({ username: false, password: false });
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const shimmerAnimation = useRef(new Animated.Value(0)).current;
    const shimmerLoopRef = useRef<Animated.CompositeAnimation | null>(null);

    useFocusEffect(
        React.useCallback(() => {
            setLoginSuccess(false);
            setErrorMessage("");
        }, [])
    );

    useEffect(() => {
        const loadCredentials = async () => {
            try {
                const savedRememberMe = await SecureStore.getItemAsync("engg_rememberMe");
                if (savedRememberMe === "true") {
                    setUsername((await SecureStore.getItemAsync("engg_username")) || "");
                    setPassword((await SecureStore.getItemAsync("engg_password")) || "");
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
                    Animated.timing(shimmerAnimation, { toValue: 1, duration: 150, useNativeDriver: true }),
                    Animated.timing(shimmerAnimation, { toValue: 0, duration: 1500, useNativeDriver: true }),
                ])
            );
            shimmerLoopRef.current.start();
        }
        return () => {
            shimmerLoopRef.current?.stop();
            shimmerLoopRef.current = null;
        };
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

            const response = await fetch("https://hma.magnum.org.in/appLeaveview.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: formData.toString(),
            });

            const data = await response.json();

            if (response.status === 200) {
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

                setTimeout(() => {
                    shimmerLoopRef.current?.stop();
                    shimmerLoopRef.current = null;
                    router.push("/Leave/Approveleave");


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
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Card */}
                    <View style={styles.card}>
                        <LogoHeader />

                        <View style={styles.formBody}>
                            {/* Header */}
                            <View style={styles.titleRow}>
                                <View style={styles.titleAccent} />
                                <Text style={styles.title}>Manager Sign In</Text>
                            </View>
                            <Text style={styles.subtitle}>Enter your credentials to continue</Text>

                            {/* Username */}
                            <Text style={styles.label}>Username</Text>
                            <View style={[styles.inputContainer, inputFocus.username && styles.inputContainerFocused]}>
                                <MaterialIcons
                                    name="person-outline"
                                    size={20}
                                    color={inputFocus.username ? "#1a4a8a" : "#9aa5b4"}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your username"
                                    value={username}
                                    onChangeText={setUsername}
                                    autoCapitalize="none"
                                    editable={!isLoading}
                                    onFocus={() => setInputFocus((f) => ({ ...f, username: true }))}
                                    onBlur={() => setInputFocus((f) => ({ ...f, username: false }))}
                                    placeholderTextColor="#b0bac6"
                                />
                            </View>

                            {/* Password */}
                            <Text style={styles.label}>Password</Text>
                            <View style={[styles.inputContainer, inputFocus.password && styles.inputContainerFocused]}>
                                <MaterialIcons
                                    name="lock-outline"
                                    size={20}
                                    color={inputFocus.password ? "#1a4a8a" : "#9aa5b4"}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!isPasswordVisible}
                                    editable={!isLoading}
                                    onFocus={() => setInputFocus((f) => ({ ...f, password: true }))}
                                    onBlur={() => {
                                        setInputFocus((f) => ({ ...f, password: false }));
                                        setIsPasswordVisible(false);
                                    }}
                                    placeholderTextColor="#b0bac6"
                                />
                                <Pressable
                                    onPress={() => setIsPasswordVisible((prev) => !prev)}
                                    hitSlop={8}
                                    style={styles.eyeButton}
                                >
                                    <MaterialIcons
                                        name={isPasswordVisible ? "visibility" : "visibility-off"}
                                        size={20}
                                        color={inputFocus.password ? "#1a4a8a" : "#9aa5b4"}
                                    />
                                </Pressable>
                            </View>

                            {/* Remember Me + Forgot Password */}
                            <View style={styles.optionsRow}>
                                <TouchableOpacity
                                    style={styles.rememberMeContainer}
                                    onPress={() => setRememberMe((prev) => !prev)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                                        {rememberMe && <MaterialIcons name="check" size={13} color="#fff" />}
                                    </View>
                                    <Text style={styles.rememberMeText}>Remember me</Text>
                                </TouchableOpacity>

                                <TouchableOpacity activeOpacity={0.7}>
                                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Error */}
                            {errorMessage ? (
                                <View style={styles.errorBox}>
                                    <MaterialIcons name="error-outline" size={16} color="#c0392b" style={{ marginRight: 6 }} />
                                    <Text style={styles.errorText}>{errorMessage}</Text>
                                </View>
                            ) : null}

                            {/* Button / Success */}
                            {loginSuccess ? (
                                <View style={styles.successContainer}>
                                    <Animated.View style={[styles.shimmer, shimmerStyle]} />
                                    <MaterialIcons name="check-circle" size={24} color="#27ae60" />
                                    <Text style={styles.successText}>Login Successful!</Text>
                                </View>
                            ) : (
                                <Pressable
                                    onPress={handleLogin}
                                    disabled={isLoading}
                                    style={({ pressed }) => [
                                        styles.loginButtonWrapper,
                                        pressed && { opacity: 0.88 },
                                    ]}
                                >
                                    <LinearGradient
                                        colors={isLoading ? ["#b3c6e0", "#b3c6e0"] : ["#1a4a8a", "#2d6cc0"]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.loginButton}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator color="white" size="small" />
                                        ) : (
                                            <Text style={styles.loginButtonText}>Sign In</Text>
                                        )}
                                    </LinearGradient>
                                </Pressable>
                            )}
                        </View>

                        <Footer />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 16,
        paddingVertical: 32,
    },

    // Card
    card: {
        backgroundColor: "#fff",
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
        elevation: 10,
    },

    // Form body
    formBody: {
        paddingHorizontal: 28,
        paddingTop: 28,
        paddingBottom: 20,
    },

    // Title
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
        fontWeight: "700",
        color: "#0f2952",
        letterSpacing: 0.3,
    },
    subtitle: {
        fontSize: 13,
        color: "#7a8a9a",
        marginBottom: 28,
        marginLeft: 14,
    },

    // Labels
    label: {
        fontSize: 13,
        fontWeight: "600",
        color: "#3d4f63",
        marginBottom: 6,
        letterSpacing: 0.2,
    },

    // Inputs
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f5f8fc",
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: "#dde4ee",
        marginBottom: 20,
        height: 52,
    },
    inputContainerFocused: {
        borderColor: "#1a4a8a",
        backgroundColor: "#f0f5ff",
    },
    inputIcon: {
        paddingHorizontal: 14,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: "#1a2535",
        fontWeight: "400",
    },
    eyeButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
    },

    // Options row
    optionsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    rememberMeContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: "#9aa5b4",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
        backgroundColor: "#fff",
    },
    checkboxChecked: {
        backgroundColor: "#1a4a8a",
        borderColor: "#1a4a8a",
    },
    rememberMeText: {
        fontSize: 13,
        color: "#4a5568",
        fontWeight: "500",
    },
    forgotPasswordText: {
        fontSize: 13,
        color: "#1a4a8a",
        fontWeight: "600",
    },

    // Error
    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fdf2f2",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#f5c6c6",
    },
    errorText: {
        color: "#c0392b",
        fontSize: 13,
        flex: 1,
        lineHeight: 18,
    },

    // Login button
    loginButtonWrapper: {
        borderRadius: 10,
        overflow: "hidden",
        marginTop: 4,
    },
    loginButton: {
        height: 52,
        alignItems: "center",
        justifyContent: "center",
    },
    loginButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 0.8,
    },

    // Success
    successContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f0faf4",
        padding: 16,
        borderRadius: 10,
        marginTop: 4,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#a8ddb8",
    },
    successText: {
        color: "#1e7e34",
        fontSize: 15,
        fontWeight: "600",
        marginLeft: 10,
    },
    shimmer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(39, 174, 96, 0.12)",
        width: 200,
    },
});
