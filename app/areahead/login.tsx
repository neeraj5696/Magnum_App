import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Animated, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import LogoHeader from '../components/LogoHeader';
import { Picker } from '@react-native-picker/picker';

// Special placeholder constant
const PLACEHOLDER_VALUE = '__placeholder__';

export default function AreaHeadLogin() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [areaHeads, setAreaHeads] = useState<string[]>([]);
    const [selectedAreaHead, setSelectedAreaHead] = useState(PLACEHOLDER_VALUE);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loginSuccess, setLoginSuccess] = useState(false);
    const shimmerAnimation = useRef(new Animated.Value(0)).current;
    const shimmerLoopRef = useRef<Animated.CompositeAnimation | null>(null);
    const [dropdownReady, setDropdownReady] = useState(false);

    useEffect(() => {
        const loadCredentials = async () => {
            try {
                const savedUsername = await SecureStore.getItemAsync("areahead_username");
                const savedPassword = await SecureStore.getItemAsync("areahead_password");
                const savedAreaHead = await SecureStore.getItemAsync("areahead_areahd");
                const savedRememberMe = await SecureStore.getItemAsync("areahead_rememberMe");
                
                if (savedRememberMe === "true" && savedUsername && savedPassword && savedAreaHead) {
                    setUsername(savedUsername);
                    setPassword(savedPassword);
                    setSelectedAreaHead(savedAreaHead);
                    setRememberMe(true);
                } else {
                    // Ensure placeholder is selected if no saved credentials
                    setSelectedAreaHead(PLACEHOLDER_VALUE);
                }
            } catch (error) {
                console.log("Error loading credentials:", error);
            }
        };
        
        loadCredentials();
    }, []);

    useEffect(() => {
        // Fetch area heads for dropdown
        const fetchAreaHeads = async () => {
            try {
                setSelectedAreaHead(PLACEHOLDER_VALUE); // Force placeholder before fetch
                
                const response = await fetch('https://hma.magnum.org.in/appAreaHeadnames.php');
                const data = await response.json();
                
                if (data?.status === 'success' && Array.isArray(data?.data)) {
                    const names = data.data.map((item: any) => item.Name);
                    setAreaHeads(names);
                } else {
                    setErrorMessage('Failed to load area heads data');
                }
                
                // Set dropdown ready after data is loaded
                setDropdownReady(true);
                // Make absolutely sure the placeholder is selected initially
                setTimeout(() => setSelectedAreaHead(PLACEHOLDER_VALUE), 100);
            } catch (error) {
                setErrorMessage('Network error while loading area heads');
            }
        };
        
        fetchAreaHeads();
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
                if (shimmerLoopRef.current && typeof shimmerLoopRef.current.stop === 'function') {
                    shimmerLoopRef.current.stop();
                }
            };
        }
    }, [loginSuccess]);

    useEffect(() => {
        return () => {
            if (shimmerLoopRef.current && typeof shimmerLoopRef.current.stop === 'function') {
                shimmerLoopRef.current.stop();
            }
        };
    }, []);

    // Add useFocusEffect for resetting states
    useFocusEffect(
        React.useCallback(() => {
            setLoginSuccess(false);
            setErrorMessage('');
        }, [])
    );

    const handleLogin = async () => {
        // Form validation
        if (!username.trim()) {
            setErrorMessage('Please enter username');
            return;
        }
        
        if (!password.trim()) {
            setErrorMessage('Please enter password');
            return;
        }
        
        if (selectedAreaHead === PLACEHOLDER_VALUE) {
            setErrorMessage('Please select an area');
            return;
        }

        setIsLoading(true);
        setErrorMessage('');
        
        try {
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);
            formData.append('areahd', selectedAreaHead);
            
            const response = await fetch('https://hma.magnum.org.in/appManagers.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
            });
            
            const responseText = await response.text();
            let data;
            
            try {
                data = JSON.parse(responseText);
            } catch (error) {
                setErrorMessage('Invalid server response');
                setIsLoading(false);
                return;
            }
            
            if (data?.status === 'success') {
                // Save credentials if remember me is checked
                if (rememberMe) {
                    await SecureStore.setItemAsync("areahead_username", username);
                    await SecureStore.setItemAsync("areahead_password", password);
                    await SecureStore.setItemAsync("areahead_areahd", selectedAreaHead);
                    await SecureStore.setItemAsync("areahead_rememberMe", "true");
                } else {
                    await SecureStore.deleteItemAsync("areahead_username");
                    await SecureStore.deleteItemAsync("areahead_password");
                    await SecureStore.deleteItemAsync("areahead_areahd");
                    await SecureStore.deleteItemAsync("areahead_rememberMe");
                }
                
                // Show success animation
                setLoginSuccess(true);
                
                // Navigate to list view after delay
                setTimeout(() => {
                    if (shimmerLoopRef.current && typeof shimmerLoopRef.current.stop === 'function') {
                        shimmerLoopRef.current.stop();
                    }
                    
                    router.push({
                        pathname: "/areahead/list",
                        params: {
                            username,
                            password,
                            areahd: selectedAreaHead,
                            data: JSON.stringify(data.data || [])
                        },
                    });
                }, 1500);
            } else {
                setErrorMessage(data?.message || 'Login failed');
            }
        } catch (error) {
            setErrorMessage('Network error');
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
                <Text style={styles.title}>MANAGER LOGIN</Text>

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
                <View style={styles.inputContainer}>
                    <MaterialIcons name="supervisor-account" size={20} color="#666" style={styles.inputIcon} />
                    <View style={styles.pickerWrapper}>
                        {dropdownReady ? (
                            <Picker
                                selectedValue={selectedAreaHead}
                                onValueChange={(value) => {
                                    // Only update if it's a valid value (not placeholder)
                                    if (value !== PLACEHOLDER_VALUE) {
                                        setSelectedAreaHead(value);
                                    }
                                }}
                                enabled={!isLoading}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select Area" value={PLACEHOLDER_VALUE} />
                                {areaHeads.map((item, index) => (
                                    <Picker.Item key={index} label={item} value={item} />
                                ))}
                            </Picker>
                        ) : (
                            <View style={styles.pickerPlaceholder}>
                                <Text style={styles.loadingText}>Loading areas...</Text>
                            </View>
                        )}
                    </View>
                </View>
                {errorMessage ? (
                    <Text style={styles.errorText}>{errorMessage}</Text>
                ) : null}
                <TouchableOpacity
                    style={styles.rememberMeContainer}
                    onPress={() => setRememberMe(!rememberMe)}
                    disabled={isLoading}
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
    pickerWrapper: {
        flex: 1,
    },
    picker: {
        height: 48,
    },
    pickerPlaceholder: {
        height: 48,
        justifyContent: "center",
        paddingHorizontal: 10,
    },
    errorText: {
        color: "#FF3B30",
        fontSize: 14,
        marginBottom: 15,
        textAlign: "center",
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
    loadingText: {
        color: "#666",
        fontSize: 16,
    },
});

