import { Text, StyleSheet, View, TextInput, Platform, TouchableOpacity, Alert, ScrollView, RefreshControl, Animated, ActivityIndicator, Modal, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { useState, useEffect } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';


interface AttendanceRecord {
    ENG_NAME: string;
    EMPCODE: string;
    username: string;
}





function Applyleave() {
    const insets = useSafeAreaInsets();
    const submitScale = new Animated.Value(1);
    const pressIn = (anim: Animated.Value) => Animated.spring(anim, { toValue: 0.95, useNativeDriver: true }).start();
    const pressOut = (anim: Animated.Value) => Animated.spring(anim, { toValue: 1, useNativeDriver: true }).start();
    const [list, setList] = useState<AttendanceRecord[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingList, setLoadingList] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [leaveType, setLeaveType] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startDuration, setStartDuration] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endDuration, setEndDuration] = useState('');
    const isFormValid = leaveType.trim() && startDate.trim() && startDuration && endDate.trim() && endDuration;

    const filledFields = [leaveType.trim(), startDate.trim(), startDuration, endDate.trim(), endDuration].filter(Boolean).length;
    const totalFields = [leaveType.trim(), startDate.trim(), startDuration, endDate.trim(), endDuration].length;
    const progress = (filledFields / totalFields) * 100;
    const [remark, setRemark] = useState('');
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [currentDateField, setCurrentDateField] = useState<'start' | 'end'>('start');
    const [tempDate, setTempDate] = useState(new Date());

    // Dropdown states
    const [employeeOpen, setEmployeeOpen] = useState(false);
    const [startDurationOpen, setStartDurationOpen] = useState(false);
    const [endDurationOpen, setEndDurationOpen] = useState(false);
    const [leaveTypeOpen, setLeaveTypeOpen] = useState(false);

    const params = useLocalSearchParams();

    const username = Array.isArray(params.username) ? params.username[0] ?? '' : params.username ?? '';

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    };

    const openDatePicker = (field: 'start' | 'end') => {
        setCurrentDateField(field);
        const currentDate = field === 'start' ? (startDate ? new Date(startDate) : new Date()) : (endDate ? new Date(endDate) : new Date());
        setTempDate(currentDate);
        setDatePickerVisible(true);
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setDatePickerVisible(false);
        }
        if (selectedDate) {
            const formattedDate = formatDate(selectedDate);
            if (currentDateField === 'start') {
                setStartDate(formattedDate);
                if (errors.startDate) setErrors({ ...errors, startDate: '' });
            } else {
                setEndDate(formattedDate);
                if (errors.endDate) setErrors({ ...errors, endDate: '' });
            }
            setTempDate(selectedDate);
        }
    };

    const confirmDateSelection = () => {
        const formattedDate = formatDate(tempDate);
        if (currentDateField === 'start') {
            setStartDate(formattedDate);
            if (errors.startDate) setErrors({ ...errors, startDate: '' });
        } else {
            setEndDate(formattedDate);
            if (errors.endDate) setErrors({ ...errors, endDate: '' });
        }
        setDatePickerVisible(false);
    };




    const onRefresh = async () => {
        setRefreshing(true);

        setRefreshing(false);
    };

    const [errors, setErrors] = useState<{ [key: string]: string }>({});


    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!leaveType.trim()) newErrors.leaveType = 'Leave type is required';
        if (!startDate.trim()) newErrors.startDate = 'Start date is required';
        if (!startDuration) newErrors.startDuration = 'Start duration is required';
        if (!endDate.trim()) newErrors.endDate = 'End date is required';
        if (!endDuration) newErrors.endDuration = 'End duration is required';

        // Date validation
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (end < start) {
                newErrors.endDate = 'End date must be after start date';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (validateForm()) {
            setLoading(true);
            try {
                const formData = new URLSearchParams();
                formData.append('EMPCODE', username);
                formData.append('Leavetype', leaveType);
                formData.append('Leavedate', startDate);
                formData.append('remarks', remark);
                formData.append('Leavestartdate', startDate);
                formData.append('Fulldayhalfday1', startDuration === 'full' ? 'FULL DAY' : 'HALF DAY');
                formData.append('Leaveenddate', endDate);
                formData.append('Fulldayhalfday2', endDuration === 'full' ? 'FULL DAY' : 'HALF DAY');

                const response = await axios.post(
                    'https://hma.magnum.org.in/appleaveapply.php',
                    formData.toString(),
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    }
                );

                const data = response.data;
                console.log(data);
                if (data?.status === 'success') {
                    Alert.alert(
                        'Success',
                        data?.reason || data?.message || 'Leave applied successfully.'
                    );
                    setSuccessModalVisible(true);
                    setLeaveType('');
                    setStartDate('');
                    setStartDuration('');
                    setEndDate('');
                    setEndDuration('');
                    setRemark('');
                    setErrors({});
                } else {
                    Alert.alert(
                        'Submission failed',
                        data?.reason || data?.message || 'Unable to submit leave. Please try again.'
                    );
                }
            } catch (error: any) {
                console.error('Leave submission error:', error);
                Alert.alert(
                    'Network error',
                    'Unable to submit leave request. Please check your connection and try again.'
                );
            } finally {
                setLoading(false);
            }
        }
    };



    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom  }]}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >

                {/* Header */}
                <View style={styles.header}>
                    <LinearGradient colors={['#1E88E5', '#1565C0']} style={styles.headerGradient}>
                        <MaterialCommunityIcons name="calendar-plus" size={32} color="#fff" />
                        <Text style={styles.headerTitle}>Apply for Leave</Text>
                        <Text style={styles.headerSub}>Submit your leave request</Text>
                    </LinearGradient>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <Animated.View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${progress}%`,
                                    backgroundColor: progress === 100 ? '#4CAF50' : '#2196F3'
                                }
                            ]}
                        />
                    </View>
                    <Text style={styles.progressText}>{filledFields}/{totalFields} fields completed</Text>
                </View>

                {/* Employee and Leave Type */}
                <View style={[styles.sectionCard, Platform.OS === 'ios' ? { zIndex: 3000 } : { elevation: 3, zIndex: 3000 }]}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="account-cog" size={20} color="#2196F3" />
                        <Text style={styles.sectionTitle}>Employee & Leave Details</Text>
                    </View>

                    {/* Employee Selection */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Select Employee *</Text>
                        <TextInput
                            style={[styles.input]}

                            value={username}

                            editable={false}


                        />

                    </View>

                    {/* Leave Type */}
                    <View style={[styles.fieldContainer, Platform.OS === 'ios' ? { zIndex: 3000 } : {}]}>
                        <Text style={styles.fieldLabel}>Leave Type *</Text>
                        <DropDownPicker
                            open={leaveTypeOpen}
                            value={leaveType}
                            items={[
                                { label: "Leave", value: "leave" },
                                { label: "Work from Home", value: "work_from_home" },
                                { label: "Due to Meeting", value: "due_to_meeting" },
                                { label: "Extra Work", value: "extra_work" },
                            ]}
                            setOpen={setLeaveTypeOpen}
                            setValue={setLeaveType}
                            placeholder="Select Leave Type"
                            style={[styles.dropdown, errors.leaveType && styles.inputError]}
                            dropDownContainerStyle={styles.dropdownContainer}
                            textStyle={styles.dropdownText}
                            placeholderStyle={styles.placeholderText}
                            zIndex={1000}
                            zIndexInverse={3000}
                            listMode="SCROLLVIEW"
                        />

                        {errors.leaveType && <Text style={styles.errorText}>{errors.leaveType}</Text>}
                    </View>
                </View>

                {/* Leave Period */}
                <View style={[styles.sectionCard, Platform.OS === 'ios' ? { zIndex: 2000 } : { elevation: 2, zIndex: 2000 }]}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="calendar-range" size={20} color="#2196F3" />
                        <Text style={styles.sectionTitle}>Leave Period *</Text>
                    </View>
                    <View style={[styles.dateRow, Platform.OS === 'ios' ? { zIndex: 2000 } : {}]}>
                        {/* Start Date */}
                        <View style={styles.dateColumn}>
                            <Text style={styles.dateLabel}>Start Date</Text>
                            <TouchableOpacity
                                style={[styles.dateInput, errors.startDate && styles.inputError]}
                                onPress={() => openDatePicker('start')}
                            >
                                <Text style={[styles.dateText, !startDate && styles.placeholderText]}>
                                    {startDate || 'Select date'}
                                </Text>
                                <MaterialCommunityIcons name="calendar" size={20} color="#666" />
                            </TouchableOpacity>
                            {errors.startDate && <Text style={styles.errorText}>{errors.startDate}</Text>}
                        </View>

                        {/* Start Duration */}
                        <View style={styles.dateColumn}>
                            <Text style={styles.dateLabel}>Duration</Text>
                            <DropDownPicker
                                open={startDurationOpen}
                                value={startDuration}
                                items={[
                                    { label: "Full Day", value: "full" },
                                    { label: "Half Day", value: "half" },
                                ]}
                                setOpen={setStartDurationOpen}
                                setValue={setStartDuration}
                                placeholder="Select"
                                style={[styles.dropdown, errors.startDuration && styles.inputError]}
                                dropDownContainerStyle={styles.dropdownContainer}
                                textStyle={styles.dropdownText}
                                placeholderStyle={styles.placeholderText}
                                zIndex={2000}
                                zIndexInverse={2000}
                                listMode="SCROLLVIEW"
                            />
                            {errors.startDuration && <Text style={styles.errorText}>{errors.startDuration}</Text>}
                        </View>
                    </View>

                    <View style={[styles.dateRow, Platform.OS === 'ios' ? { zIndex: 1000 } : {}]}>
                        {/* End Date */}
                        <View style={styles.dateColumn}>
                            <Text style={styles.dateLabel}>End Date</Text>
                            <TouchableOpacity
                                style={[styles.dateInput, errors.endDate && styles.inputError]}
                                onPress={() => openDatePicker('end')}
                            >
                                <Text style={[styles.dateText, !endDate && styles.placeholderText]}>
                                    {endDate || 'Select date'}
                                </Text>
                                <MaterialCommunityIcons name="calendar" size={20} color="#666" />
                            </TouchableOpacity>
                            {errors.endDate && <Text style={styles.errorText}>{errors.endDate}</Text>}
                        </View>

                        {/* End Duration */}
                        <View style={styles.dateColumn}>
                            <Text style={styles.dateLabel}>Duration</Text>
                            <DropDownPicker
                                open={endDurationOpen}
                                value={endDuration}
                                items={[
                                    { label: "Full Day", value: "full" },
                                    { label: "Half Day", value: "half" },
                                ]}
                                setOpen={setEndDurationOpen}
                                setValue={setEndDuration}
                                placeholder="Select"
                                style={[styles.dropdown, errors.endDuration && styles.inputError]}
                                dropDownContainerStyle={styles.dropdownContainer}
                                textStyle={styles.dropdownText}
                                placeholderStyle={styles.placeholderText}
                                zIndex={1000}
                                zIndexInverse={3000}
                                listMode="SCROLLVIEW"
                            />
                            {errors.endDuration && <Text style={styles.errorText}>{errors.endDuration}</Text>}
                        </View>
                    </View>
                </View>

                {/* Additional Information */}
                <View style={[styles.sectionCard, Platform.OS === 'ios' ? { zIndex: 1000 } : { elevation: 1, zIndex: 1000 }]}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="information-outline" size={20} color="#2196F3" />
                        <Text style={styles.sectionTitle}>Additional Information</Text>
                    </View>

                    {/* Remark */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Remark (Optional)</Text>
                        <TextInput
                            style={[styles.input, { height: 80 }]}
                            placeholder="Enter any additional remarks"
                            value={remark}
                            onChangeText={setRemark}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Balance Leave */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Available Leave Balance</Text>
                        <View style={styles.balanceContainer}>
                            <MaterialCommunityIcons name="calendar-check" size={20} color="#4CAF50" />
                            <Text style={styles.balanceText}>0 days remaining</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <Animated.View style={[styles.btnWrapper, { transform: [{ scale: submitScale }] }]}>
                        <TouchableOpacity
                            style={[styles.premiumBtn, !isFormValid && styles.btnDisabled]}
                            onPress={handleSubmit}
                            onPressIn={() => pressIn(submitScale)}
                            onPressOut={() => pressOut(submitScale)}
                            disabled={!isFormValid}
                            activeOpacity={1}
                        >
                            <LinearGradient colors={!isFormValid ? ['#B0BEC5', '#90A4AE'] : loading ? ['#FF9800', '#F57C00'] : ['#1E88E5', '#1565C0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btnGradient}>
                                <View style={styles.btnInner}>
                                    {loading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <MaterialCommunityIcons name="check-circle" size={28} color="#fff" />
                                    )}
                                    <View>
                                        <Text style={styles.btnLabel}>
                                            {loading ? 'Submitting...' : 'Submit Leave Request'}
                                        </Text>
                                        <Text style={styles.btnSub}>
                                            {loading ? 'Please wait' : isFormValid ? 'Tap to apply' : 'Complete all fields'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.btnShine} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                {/* Date Picker Modal for iOS */}
                {Platform.OS === 'ios' && datePickerVisible && (
                    <Modal
                        visible={datePickerVisible}
                        transparent={true}
                        animationType="slide"
                        onRequestClose={() => setDatePickerVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.datePickerModal}>
                                <View style={styles.datePickerHeader}>
                                    <TouchableOpacity onPress={() => setDatePickerVisible(false)}>
                                        <Text style={styles.cancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.datePickerTitle}>
                                        Select {currentDateField === 'start' ? 'Start' : 'End'} Date
                                    </Text>
                                    <TouchableOpacity onPress={confirmDateSelection}>
                                        <Text style={styles.confirmText}>Done</Text>
                                    </TouchableOpacity>
                                </View>
                                <DateTimePicker
                                    value={tempDate}
                                    mode="date"
                                    display="spinner"
                                    onChange={(event, date) => {
                                        if (date) setTempDate(date);
                                    }}
                                    minimumDate={new Date()}
                                />
                            </View>
                        </View>
                    </Modal>
                )}

                {/* Date Picker for Android */}
                {Platform.OS === 'android' && datePickerVisible && (
                    <DateTimePicker
                        value={tempDate}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                        minimumDate={new Date()}
                    />
                )}

            </ScrollView>
        </KeyboardAvoidingView>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F6F8',
    },

    scrollContent: {
        padding: 16,
        paddingTop: 50,
    },

    header: {
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
    },

    headerGradient: {
        paddingVertical: 20,
        paddingHorizontal: 16,
        alignItems: 'center',
    },

    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
        marginTop: 8,
    },

    headerSub: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },

    progressContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },

    progressBar: {
        width: '90%',
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },

    progressFill: {
        height: '100%',
        borderRadius: 4,
    },

    progressText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },

    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginTop: 20,
    },

    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
    },

    sectionCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },

    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },

    dateColumn: {
        flex: 1,
        marginHorizontal: 4,

    },

    dateLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,

    },

    fieldContainer: {
        marginBottom: 16,
    },

    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },

    balanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E8',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },

    balanceText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2E7D32',
    },

    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,

        padding: 8,
        borderRadius: 6,
        backgroundColor: '#b2def181',


    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
    },

    input: {
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 15,
    },

    dateInput: {
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    dateText: {
        fontSize: 15,
        color: '#333',
        flex: 1,
    },

    placeholderText: {
        color: '#999',
    },

    dropdown: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        minHeight: 40,
    },

    dropdownContainer: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        zIndex: 11000,

    },

    dropdownText: {
        fontSize: 15,
        color: '#333',
    },

    inputError: {
        borderColor: '#f44336',
    },

    errorText: {
        color: '#f44336',
        fontSize: 12,
        marginTop: 4,
    },

    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },

    loadingText: {
        color: '#666',
        fontSize: 14,
    },

    btnWrapper: {
        flex: 1,
        borderRadius: 20,
        shadowColor: '#1565C0',
        shadowOpacity: 0.45,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 10,
    },

    premiumBtn: {
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)',
    },

    btnDisabled: {
        opacity: 0.6,
    },

    btnGradient: {
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 12,
        overflow: 'hidden',
    },

    btnInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    btnLabel: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.4,
    },

    btnSub: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 10,
        fontWeight: '500',
        marginTop: 1,
    },

    btnShine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        margin: 20,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },

    successIcon: {
        marginBottom: 16,
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },

    modalMessage: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },

    modalButton: {
        backgroundColor: '#2196F3',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },

    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },

    datePickerModal: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },

    datePickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },

    datePickerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },

    cancelText: {
        fontSize: 16,
        color: '#666',
    },

    confirmText: {
        fontSize: 16,
        color: '#2196F3',
        fontWeight: '600',
    },
});

export default Applyleave;