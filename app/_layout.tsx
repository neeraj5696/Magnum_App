import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import {
  checkAppLicense,
  saveLicense,
  LicenseValidationResult,
} from "../utils/licenseValidator";

export default function RootLayout() {
  const [licenseState, setLicenseState] = useState<{
    loading: boolean;
    result: LicenseValidationResult | null;
  }>({
    loading: true,
    result: null,
  });

  const [inputKey, setInputKey] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const [activationError, setActivationError] = useState("");

  useEffect(() => {
    async function verify() {
      const result = await checkAppLicense();
      setLicenseState({ loading: false, result });
    }
    verify();
  }, []);

  const handleActivate = async () => {
    const trimmed = inputKey.trim();
    if (!trimmed) {
      setActivationError("Please paste your license key content first.");
      return;
    }

    setIsActivating(true);
    setActivationError("");

    try {
      const result = await saveLicense(trimmed);
      if (result.isValid) {
        Alert.alert(
          "Activation Successful",
          `License is active for ${result.data?.client} until ${result.data?.expiryDate}.`
        );
        setInputKey("");
        setLicenseState({ loading: false, result });
      } else {
        setActivationError(result.message);
      }
    } catch (err: any) {
      setActivationError(err?.message || "Invalid license format.");
    } finally {
      setIsActivating(false);
    }
  };

  if (licenseState.loading) {
    return (
      <SafeAreaProvider>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0D47A1" />
        </View>
      </SafeAreaProvider>
    );
  }

  if (licenseState.result && !licenseState.result.isValid) {
    return (
      <SafeAreaProvider>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.card}>
              <Text style={styles.warningIcon}>🔒</Text>
              <Text style={styles.title}>License Blocked</Text>
              <Text style={styles.subtitle}>
                {licenseState.result.status === "TAMPERED"
                  ? "License signature is invalid!\nThe license file has been altered or tampered with."
                  : licenseState.result.status === "EXPIRED"
                  ? `License expired on ${licenseState.result.data?.expiryDate}.`
                  : licenseState.result.message}
              </Text>

              <Text style={styles.inputLabel}>Activate New License Key:</Text>
              <TextInput
                style={styles.input}
                placeholder="Paste license key content here..."
                placeholderTextColor="#A0AEC0"
                value={inputKey}
                onChangeText={(text) => {
                  setInputKey(text);
                  if (activationError) setActivationError("");
                }}
                multiline
                numberOfLines={4}
                autoCapitalize="none"
                autoCorrect={false}
              />

              {activationError ? (
                <Text style={styles.errorText}>❌ {activationError}</Text>
              ) : null}

              <TouchableOpacity
                style={[styles.button, isActivating && styles.buttonDisabled]}
                onPress={handleActivate}
                activeOpacity={0.8}
                disabled={isActivating}
              >
                {isActivating ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Activate License</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.hint}>
                Generate a new license using your license-generator and paste the
                generated key above to unlock.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F7FC",
  },
  keyboardContainer: {
    flex: 1,
    backgroundColor: "#1A202C",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  warningIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#E53E3E",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#4A5568",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  inputLabel: {
    alignSelf: "flex-start",
    fontSize: 13,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    minHeight: 90,
    maxHeight: 140,
    borderWidth: 1,
    borderColor: "#CBD5E0",
    borderRadius: 10,
    padding: 12,
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    backgroundColor: "#F7FAFC",
    color: "#2D3748",
    textAlignVertical: "top",
    marginBottom: 10,
  },
  errorText: {
    color: "#E53E3E",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 10,
    textAlign: "center",
  },
  button: {
    width: "100%",
    backgroundColor: "#0D47A1",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  hint: {
    fontSize: 11,
    color: "#718096",
    textAlign: "center",
    lineHeight: 16,
  },
});


