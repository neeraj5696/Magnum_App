import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
    StatusBar,
    Animated,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import LogoHeader from "../components/LogoHeader";
import Footer from "../components/footer";

interface LeaveItem {
    LAID: number;
    EmpID: string;
    EMPNAME: string;
    LTypeID: string;
    StartDate: string;
    EndDate: string;
    DurationStart: string;
    DurationEnd: string;
    Remarks: string;
    Status: string;
    Statusremarks: string | null;
    ReportingmanagerID: string;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: "check-circle" | "cancel" | "schedule" }> = {
    Approved: { color: "#1e7e34", bg: "#f0faf4", icon: "check-circle" },
    Rejected: { color: "#c0392b", bg: "#fdf2f2", icon: "cancel" },
    Pending: { color: "#b45309", bg: "#fffbeb", icon: "schedule" },
};

function formatDate(dateStr: string) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function isSameDay(start: string, end: string) {
    return start === end;
}

export default function Viewleave() {
    const router = useRouter();
    const [leaveData, setLeaveData] = useState<LeaveItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [credentials, setCredentials] = useState({ username: "", password: "" });
    const [credentialsLoaded, setCredentialsLoaded] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);

    // Toast
    type ToastType = "success" | "error" | "info";
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const toastAnim = useRef(new Animated.Value(0)).current;
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = (message: string, type: ToastType = "info") => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ message, type });
        Animated.spring(toastAnim, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
        toastTimer.current = setTimeout(() => {
            Animated.timing(toastAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() =>
                setToast(null)
            );
        }, 3000);
    };

    useEffect(() => {
        const loadCredentials = async () => {
            try {
                const username = (await SecureStore.getItemAsync("leave_mgr_username")) || "";
                const password = (await SecureStore.getItemAsync("leave_mgr_password")) || "";
                console.log('credential loaded, ', username, password)
                setCredentials({ username, password });
                setCredentialsLoaded(true);
            } catch (error) {
                console.error("Error loading credentials:", error);
                setErrorMessage("Failed to load credentials.");
                setCredentialsLoaded(true);
                setIsLoading(false);
            }
        };
        loadCredentials();
    }, []);

    useEffect(() => {
        if (!credentialsLoaded) return;
        if (credentials.username && credentials.password) {
            fetchLeaves();
        } else {
            setIsLoading(false);
            setErrorMessage("Session expired. Please log in again.");
        }
    }, [credentialsLoaded]);

    const fetchLeaves = async (isRefresh = false) => {
        if (isRefresh) setIsRefreshing(true);
        else setIsLoading(true);
        setErrorMessage("");

        try {
            const formData = new URLSearchParams();
            formData.append("username", credentials.username);
            formData.append("password", credentials.password);

            const response = await axios.post(
                "https://hma.magnum.org.in/appLeaveview.php",
                formData.toString(),
                { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
            );

            setLeaveData(response.data.data || []);

            console.log('hello baby', response.data.status)
        } catch (err) {
            console.error("Error fetching leaves:", err);
            setErrorMessage("Failed to load leave requests. Pull down to retry.");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleApprove = async (item: LeaveItem) => {
        setProcessingId(item.LAID);
        try {
            const formData = new URLSearchParams();
            formData.append("LAID", item.LAID.toString());
            formData.append("ReportingmanagerID", item.ReportingmanagerID);
            formData.append("Statusremarks", "ok");
            formData.append("Status", "Approved");
            formData.append("EmpID", item.EmpID);

            const response = await axios.post(
                "https://hma.magnum.org.in/appLeaveapproved.php",
                formData.toString(),
                { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
            );

            console.log('ye response', response.data?.reason)
            showToast(response.data?.reason || "Leave approved successfully.", "success");
            fetchLeaves()
        } catch (err) {
            console.error("Error approving leave:", err);
            showToast("Error while approving. Please contact the developer.", "error");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (item: LeaveItem) => {
        setProcessingId(item.LAID);
        try {
            const formData = new URLSearchParams();
            formData.append("LAID", item.LAID.toString());
            formData.append("ReportingmanagerID", item.ReportingmanagerID);
            formData.append("Statusremarks", "ok");
            formData.append("Status", "Rejected");
            formData.append("EmpID", item.EmpID);

            const response = await axios.post(
                "https://hma.magnum.org.in/appLeaveapproved.php",
                formData.toString(),
                { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
            );

            console.log('ye response', response.data?.reason)
            showToast(response.data?.reason || "Leave rejected.", "error");
            fetchLeaves()
        } catch (err) {
            console.error("Error rejecting leave:", err);
            showToast("Error while rejecting. Please contact the developer.", "error");
        } finally {
            setProcessingId(null);
        }
    };


    const renderLeaveCard = ({ item }: { item: LeaveItem }) => {
        const status = STATUS_CONFIG[item.Status] ?? STATUS_CONFIG.Pending;
        const sameDay = isSameDay(item.StartDate, item.EndDate);
        const isProcessing = processingId === item.LAID;

        return (
            <View style={styles.card}>
                {/* Card top strip by status */}
                <View style={[styles.cardStrip, { backgroundColor: status.color }]} />

                <View style={styles.cardContent}>
                    {/* Header row */}
                    <View style={styles.cardHeader}>
                        <View style={styles.empInfo}>
                            <View style={styles.avatarCircle}>
                                <Text style={styles.avatarText}>
                                    {item.EMPNAME && item.EMPNAME !== "unknown"
                                        ? item.EMPNAME.charAt(0).toUpperCase()
                                        : item.EmpID.charAt(0)}
                                </Text>
                            </View>
                            <View>
                                <Text style={styles.empName}>
                                    {item.EMPNAME && item.EMPNAME !== "unknown" ? item.EMPNAME : "Employee"}
                                </Text>
                                <Text style={styles.empId}>ID: {item.EmpID}</Text>
                            </View>
                        </View>

                        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                            <MaterialIcons name={status.icon} size={13} color={status.color} />
                            <Text style={[styles.statusText, { color: status.color }]}>{item.Status}</Text>
                        </View>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Date range */}
                    <View style={styles.dateRow}>
                        <View style={styles.dateBlock}>
                            <Text style={styles.dateLabel}>From</Text>
                            <Text style={styles.dateValue}>{formatDate(item.StartDate)}</Text>
                            <View style={styles.durationTag}>
                                <Text style={styles.durationText}>{item.DurationStart}</Text>
                            </View>
                        </View>

                        <View style={styles.dateArrow}>
                            {sameDay ? (
                                <MaterialIcons name="today" size={20} color="#9aa5b4" />
                            ) : (
                                <MaterialIcons name="arrow-forward" size={18} color="#9aa5b4" />
                            )}
                        </View>

                        <View style={[styles.dateBlock, styles.dateBlockRight]}>
                            <Text style={styles.dateLabel}>To</Text>
                            <Text style={styles.dateValue}>{formatDate(item.EndDate)}</Text>
                            <View style={styles.durationTag}>
                                <Text style={styles.durationText}>{item.DurationEnd}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Remarks */}
                    {item.Remarks ? (
                        <View style={styles.remarksRow}>
                            <MaterialIcons name="notes" size={14} color="#9aa5b4" style={{ marginRight: 5 }} />
                            <Text style={styles.remarksText}>{item.Remarks}</Text>
                        </View>
                    ) : null}

                    {/* Action buttons */}
                    {item.Status === "Pending" && (
                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                onPress={() => handleReject(item)}
                                style={[styles.rejectButton, isProcessing && styles.buttonDisabled]}
                                activeOpacity={0.8}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <ActivityIndicator size="small" color="#c0392b" />
                                ) : (
                                    <>
                                        <MaterialIcons name="close" size={16} color="#c0392b" />
                                        <Text style={styles.rejectButtonText}>Reject</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => handleApprove(item)}
                                style={[styles.approveButton, isProcessing && styles.buttonDisabled]}
                                activeOpacity={0.8}
                                disabled={isProcessing}
                            >
                                <LinearGradient
                                    colors={["#1a7a3c", "#27ae60"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.approveGradient}
                                >
                                    {isProcessing ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <>
                                            <MaterialIcons name="check" size={16} color="#fff" />
                                            <Text style={styles.approveButtonText}>Approve</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <MaterialIcons name="event-available" size={56} color="#c8d6e5" />
            <Text style={styles.emptyTitle}>No Leave Requests</Text>
            <Text style={styles.emptySubtitle}>There are no pending leave requests at the moment.</Text>
        </View>
    );

    const renderError = () => (
        <View style={styles.emptyContainer}>
            <MaterialIcons name="wifi-off" size={56} color="#e0b0b0" />
            <Text style={[styles.emptyTitle, { color: "#c0392b" }]}>Something went wrong</Text>
            <Text style={styles.emptySubtitle}>{errorMessage}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchLeaves()} activeOpacity={0.8}>
                <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <LinearGradient colors={["#0f2952", "#1a4a8a", "#2d6cc0"]} style={styles.gradient}>
            <StatusBar barStyle="light-content" />
            <View style={styles.card_outer}>
                <LogoHeader />

                {/* Page title bar */}
                <View style={styles.pageTitleBar}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
                        <MaterialIcons name="arrow-back-ios" size={18} color="#1a4a8a" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.pageTitle}>Leave Requests</Text>
                        <Text style={styles.pageSubtitle}>Review and manage team leaves</Text>
                    </View>
                    <TouchableOpacity onPress={() => fetchLeaves(true)} style={styles.refreshButton} hitSlop={8}>
                        <MaterialIcons name="refresh" size={22} color="#1a4a8a" />
                    </TouchableOpacity>
                </View>

                {/* Summary chips */}
                {leaveData.length > 0 && (
                    <View style={styles.summaryRow}>
                        {(["Pending", "Approved", "Rejected"] as const).map((s) => {
                            const count = leaveData.filter((l) => l.Status === s).length;
                            const cfg = STATUS_CONFIG[s];
                            return (
                                <View key={s} style={[styles.summaryChip, { backgroundColor: cfg.bg, borderColor: cfg.color + "40" }]}>
                                    <Text style={[styles.summaryCount, { color: cfg.color }]}>{count}</Text>
                                    <Text style={[styles.summaryLabel, { color: cfg.color }]}>{s}</Text>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* List */}
                {isLoading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="#1a4a8a" />
                        <Text style={styles.loadingText}>Loading leave requests…</Text>
                    </View>
                ) : errorMessage ? (
                    renderError()
                ) : (
                    <FlatList
                        data={leaveData}
                        keyExtractor={(item) => item.LAID.toString()}
                        renderItem={renderLeaveCard}
                        contentContainerStyle={[
                            styles.listContent,
                            leaveData.length === 0 && { flex: 1 },
                        ]}
                        ListEmptyComponent={renderEmpty}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={() => fetchLeaves(true)}
                                colors={["#1a4a8a"]}
                                tintColor="#1a4a8a"
                            />
                        }
                    />
                )}

                <Footer />

                {/* Toast notification */}
                {toast && (
                    <Animated.View
                        style={[
                            styles.toast,
                            toast.type === "success" && styles.toastSuccess,
                            toast.type === "error" && styles.toastError,
                            toast.type === "info" && styles.toastInfo,
                            {
                                transform: [
                                    {
                                        translateY: toastAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [80, 0],
                                        }),
                                    },
                                ],
                                opacity: toastAnim,
                            },
                        ]}
                    >
                        <MaterialIcons
                            name={
                                toast.type === "success"
                                    ? "check-circle"
                                    : toast.type === "error"
                                        ? "cancel"
                                        : "info"
                            }
                            size={20}
                            color="#fff"
                        />
                        <Text style={styles.toastText}>{toast.message}</Text>
                    </Animated.View>
                )}
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    card_outer: {
        flex: 1,
        margin: 16,
        marginTop: 40,
        backgroundColor: "#f4f7fb",
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
        elevation: 10,
    },

    // Page title bar
    pageTitleBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#e8edf5",
    },
    backButton: {
        padding: 4,
    },
    refreshButton: {
        padding: 4,
    },
    pageTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#0f2952",
        textAlign: "center",
    },
    pageSubtitle: {
        fontSize: 12,
        color: "#7a8a9a",
        textAlign: "center",
        marginTop: 1,
    },

    // Summary chips
    summaryRow: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e8edf5",
    },
    summaryChip: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
    },
    summaryCount: {
        fontSize: 20,
        fontWeight: "700",
    },
    summaryLabel: {
        fontSize: 11,
        fontWeight: "600",
        marginTop: 1,
    },

    // List
    listContent: {
        padding: 16,
        gap: 14,
    },

    // Card
    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        overflow: "hidden",
        shadowColor: "#1a4a8a",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 3,
    },
    cardStrip: {
        height: 4,
        width: "100%",
    },
    cardContent: {
        padding: 16,
    },

    // Card header
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    empInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    avatarCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#e8f0fe",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1a4a8a",
    },
    empName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#0f2952",
    },
    empId: {
        fontSize: 12,
        color: "#7a8a9a",
        marginTop: 1,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
    },

    divider: {
        height: 1,
        backgroundColor: "#f0f4f8",
        marginBottom: 14,
    },

    // Date row
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    dateBlock: {
        flex: 1,
    },
    dateBlockRight: {
        alignItems: "flex-end",
    },
    dateArrow: {
        paddingHorizontal: 12,
        alignItems: "center",
    },
    dateLabel: {
        fontSize: 11,
        color: "#9aa5b4",
        fontWeight: "500",
        marginBottom: 3,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    dateValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1a2535",
        marginBottom: 5,
    },
    durationTag: {
        backgroundColor: "#f0f4f8",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        alignSelf: "flex-start",
    },
    durationText: {
        fontSize: 11,
        color: "#4a5568",
        fontWeight: "500",
    },

    // Remarks
    remarksRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#f8fafc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
    },
    remarksText: {
        fontSize: 13,
        color: "#4a5568",
        flex: 1,
        lineHeight: 18,
    },

    // Action buttons
    actionRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 4,
    },
    rejectButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 11,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: "#e8b4b4",
        backgroundColor: "#fdf2f2",
    },
    rejectButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#c0392b",
    },
    approveButton: {
        flex: 1,
        borderRadius: 10,
        overflow: "hidden",
    },
    approveGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 11,
    },
    approveButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
    },
    buttonDisabled: {
        opacity: 0.5,
    },

    // Loader
    loaderContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: "#7a8a9a",
    },

    // Empty / Error
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
        gap: 10,
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#3d4f63",
        marginTop: 8,
    },
    emptySubtitle: {
        fontSize: 13,
        color: "#9aa5b4",
        textAlign: "center",
        lineHeight: 20,
    },
    retryButton: {
        marginTop: 8,
        paddingHorizontal: 28,
        paddingVertical: 10,
        backgroundColor: "#1a4a8a",
        borderRadius: 8,
    },
    retryButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },

    // Toast
    toast: {
        position: "absolute",
        bottom: 70,
        left: 16,
        right: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 13,
        paddingHorizontal: 16,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 8,
    },
    toastSuccess: {
        backgroundColor: "#1e7e34",
    },
    toastError: {
        backgroundColor: "#c0392b",
    },
    toastInfo: {
        backgroundColor: "#1a4a8a",
    },
    toastText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "500",
        flex: 1,
        lineHeight: 20,
    },
});
