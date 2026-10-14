import { Text, StyleSheet, View, FlatList, useWindowDimensions, TextInput, Platform, TouchableOpacity, Alert, ScrollView, RefreshControl, Animated, ActivityIndicator, Modal, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import * as Application from 'expo-application';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DayNightButton from './NightButton';

const QUICK_ATTENDANCE_EMPLOYEE_KEY = 'quickAttendanceEmployee';

// API Endpoints for Day and Night shifts
const DAY_ATTENDANCE_SUBMIT_API = 'https://hma.magnum.org.in/appAttendance.php';
const NIGHT_ATTENDANCE_SUBMIT_API = 'https://hma.magnum.org.in/appNightAttendance.php';

const DAY_ATTENDANCE_VIEW_API = 'https://hma.magnum.org.in/appAttendanceview.php';
const NIGHT_ATTENDANCE_VIEW_API = 'https://hma.magnum.org.in/appNightAttendanceview.php';

interface DeviceInfo {
  deviceName: string,
  deviceId: string,
  systemName: string,
  systemVersion: string,
  brand: string,
  model: string,
}

interface AttendanceRecord {
  ENG_NAME: string;
  EMPCODE: string;
}

interface AttendanceViewRecord {
  EMPNUM: string;
  EMPNAME: string;
  ATT_DATE: string;
  LOCATION: string;
}

// Light and Dark Theme Design Tokens
const lightTheme = {
  isDark: false,
  statusBarStyle: 'dark-content' as const,
  background: '#F4F6F8',
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  labelColor: '#64748B',
  valueColor: '#1E293B',
  rowBorder: '#F1F5F9',

  // Header
  headerTitle: '#1E293B',
  headerSubtitle: '#64748B',

  // Location Card
  locationBg: '#FFFFFF',
  locationLabel: '#4CAF50',
  locationText: '#111827',
  locationEmptyText: '#94A3B8',

  // Device Info
  deviceToggleBg: '#FFFFFF',
  deviceToggleBorder: '#E2E8F0',
  deviceToggleText: '#2563EB',

  // Search Input
  inputBg: '#FFFFFF',
  inputBorder: '#CBD5E1',
  inputText: '#0F172A',
  inputPlaceholder: '#94A3B8',

  // Employee List Item
  listItemBg: '#FFFFFF',
  listItemBorder: '#E2E8F0',
  itemName: '#0F172A',
  itemCode: '#64748B',
  itemSelectedBg: '#EFF6FF',
  itemSelectedBorder: '#3B82F6',
  avatarBg: '#2563EB',
  quickBadgeBg: '#E8F5E9',
  quickBadgeText: '#2E7D32',

  // Bottom Action Bar
  bottomBarBg: '#FFFFFF',
  bottomBarBorder: '#E2E8F0',

  // Modal
  modalOverlay: 'rgba(15, 23, 42, 0.6)',
  modalCardBg: '#F8FAFC',
  modalHandle: '#CBD5E1',
  modalTitle: '#0F172A',
  modalSub: '#64748B',
  modalCloseBg: '#F1F5F9',
  modalCloseIcon: '#475569',
  countBadgeBg: '#EFF6FF',
  countBadgeText: '#2563EB',
  recordCardBg: '#FFFFFF',
  recordCardBorder: '#E2E8F0',
  recordDate: '#0F172A',
  recordLocation: '#64748B',
  latestBadgeBg: '#E8F5E9',
  latestBadgeText: '#2E7D32',
};

const darkTheme = {
  isDark: true,
  statusBarStyle: 'light-content' as const,
  background: '#0B0F19', // Deep sleek midnight dark
  cardBg: '#131B2E',
  cardBorder: '#1E293B',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  labelColor: '#94A3B8',
  valueColor: '#F1F5F9',
  rowBorder: '#1E293B',

  // Header
  headerTitle: '#F8FAFC',
  headerSubtitle: '#A5B4FC',

  // Location Card
  locationBg: '#131B2E',
  locationLabel: '#4ADE80',
  locationText: '#F8FAFC',
  locationEmptyText: '#64748B',

  // Device Info
  deviceToggleBg: '#131B2E',
  deviceToggleBorder: '#1E293B',
  deviceToggleText: '#818CF8',

  // Search Input
  inputBg: '#131B2E',
  inputBorder: '#334155',
  inputText: '#F8FAFC',
  inputPlaceholder: '#64748B',

  // Employee List Item
  listItemBg: '#131B2E',
  listItemBorder: '#1E293B',
  itemName: '#F8FAFC',
  itemCode: '#94A3B8',
  itemSelectedBg: '#1E1B4B',
  itemSelectedBorder: '#818CF8',
  avatarBg: '#4F46E5',
  quickBadgeBg: 'rgba(34, 197, 94, 0.15)',
  quickBadgeText: '#4ADE80',

  // Bottom Action Bar
  bottomBarBg: '#0F172A',
  bottomBarBorder: '#1E293B',

  // Modal
  modalOverlay: 'rgba(0, 0, 0, 0.75)',
  modalCardBg: '#0F172A',
  modalHandle: '#334155',
  modalTitle: '#F8FAFC',
  modalSub: '#94A3B8',
  modalCloseBg: '#1E293B',
  modalCloseIcon: '#94A3B8',
  countBadgeBg: 'rgba(99, 102, 241, 0.2)',
  countBadgeText: '#A5B4FC',
  recordCardBg: '#131B2E',
  recordCardBorder: '#1E293B',
  recordDate: '#F8FAFC',
  recordLocation: '#94A3B8',
  latestBadgeBg: 'rgba(34, 197, 94, 0.15)',
  latestBadgeText: '#4ADE80',
};

function Attendance() {
  const insets = useSafeAreaInsets();
  const submitScale = new Animated.Value(1);
  const viewScale = new Animated.Value(1);

  const pressIn = (anim: Animated.Value) => Animated.spring(anim, { toValue: 0.95, useNativeDriver: true }).start();
  const pressOut = (anim: Animated.Value) => Animated.spring(anim, { toValue: 1, useNativeDriver: true }).start();
  const [isNightMode, setIsNightMode] = useState(false);
  const [list, setList] = useState<AttendanceRecord[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({} as DeviceInfo);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [locationData, setLocationData] = useState<{ latitude: number, longitude: number, locationName: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingView, setLoadingView] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [showDeviceInfo, setShowDeviceInfo] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceViewRecord[]>([]);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [quickEmployeeCode, setQuickEmployeeCode] = useState('');

  const { height: screenHeight, width: screenWidth } = useWindowDimensions();


  useEffect(() => {
    const loadDeviceInfo = async () => {
      const androidId = await Application.getAndroidId();
      const info = {
        deviceName: Device.deviceName ?? 'Unknown',
        deviceId: androidId ?? 'Unknown',

        systemName: Device.osName ?? Platform.OS,
        systemVersion: Device.osVersion ?? 'Unknown',
        brand: Device.brand ?? 'Unknown',
        model: Device.modelName ?? 'Unknown',
      };

      setDeviceInfo(info);
    };

    loadDeviceInfo();
  }, []);



  const listofemployee = async () => {
    try {


      setLoadingList(true);
      const listresult = await axios.get(
        'https://hma.magnum.org.in/appEngnameandcode.php'

      );

      const data: AttendanceRecord[] = listresult.data?.data || [];

      const savedEmployeeJson = await AsyncStorage.getItem(QUICK_ATTENDANCE_EMPLOYEE_KEY);
      let orderedList = data;

      if (savedEmployeeJson) {
        try {
          const savedEmployee: AttendanceRecord = JSON.parse(savedEmployeeJson);
          const matchingEmployee = data.find(
            item => item.EMPCODE === savedEmployee.EMPCODE && item.ENG_NAME === savedEmployee.ENG_NAME
          );

          if (matchingEmployee) {
            setQuickEmployeeCode(matchingEmployee.EMPCODE);
            orderedList = [
              matchingEmployee,
              ...data.filter(item => item.EMPCODE !== matchingEmployee.EMPCODE),
            ];
          } else {
            await AsyncStorage.removeItem(QUICK_ATTENDANCE_EMPLOYEE_KEY);
            setQuickEmployeeCode('');
          }
        } catch {
          await AsyncStorage.removeItem(QUICK_ATTENDANCE_EMPLOYEE_KEY);
          setQuickEmployeeCode('');
        }
      } else {
        setQuickEmployeeCode('');
      }

      setList(orderedList);
    } catch (err) {
      Alert.alert('Error', 'Failed to load employees');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    listofemployee();
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return null;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;


      // Reverse geocode to get address
      const address = await Location.reverseGeocodeAsync({ latitude, longitude });
      const locationName = address[0]
        ? `${address[0].name ?? ''},${address[0].streetNumber ?? ''},${address[0].district ?? ''},  ${address[0].street ?? ''}, ${address[0].city ?? ''}, ${address[0].region ?? ''}, ${address[0].country ?? ''}, ${address[0].postalCode ?? ''}`.replace(/^, |, $/g, '')
        : `${latitude}, ${longitude}`;

      const data = { latitude, longitude, locationName };
      setLocation(locationName);
      setLocationData(data);

      return data;
    } catch (err) {
      Alert.alert('Error', 'Failed to get location');
      return null;
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getLocation();
    setRefreshing(false);
  };



  const filteredList = list.filter(item =>
    item.ENG_NAME.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!selectedEmployee) {
      Alert.alert('Error', 'Please select an employee');
      return;
    }

    if (!locationData) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    setLoading(true);
    const submittedEmployee = selectedEmployee;

    const now = new Date();
    const formatted =
      now.getFullYear() + "-" +
      String(now.getMonth() + 1).padStart(2, "0") + "-" +
      String(now.getDate()).padStart(2, "0") + " " +
      String(now.getHours()).padStart(2, "0") + ":" +
      String(now.getMinutes()).padStart(2, "0") + ":" +
      String(now.getSeconds()).padStart(2, "0");

    const formData = new URLSearchParams();
    formData.append('EMPCODE', selectedEmployee);
    formData.append('Location', location);
    formData.append('DeviceName', deviceInfo.deviceName);
    formData.append('UniqueID', deviceInfo.deviceId);
    formData.append('OS', deviceInfo.systemName);
    formData.append('Aattdatetime', formatted);
    formData.append('Brand', deviceInfo.brand);
    formData.append('Shift', isNightMode ? 'Night' : 'Day');

    const submitUrl = isNightMode ? NIGHT_ATTENDANCE_SUBMIT_API : DAY_ATTENDANCE_SUBMIT_API;

    try {
      const result = await axios.post(submitUrl, formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (result.data?.status === "success") {
        Alert.alert('Success', result.data.reason);
        const submittedRecord = list.find(item => item.EMPCODE === submittedEmployee);

        if (submittedRecord) {
          await AsyncStorage.setItem(
            QUICK_ATTENDANCE_EMPLOYEE_KEY,
            JSON.stringify(submittedRecord)
          );
          setQuickEmployeeCode(submittedRecord.EMPCODE);
        }

        setList(currentList => {
          const currentEmployee = currentList.find(item => item.EMPCODE === submittedEmployee);
          if (!currentEmployee) {
            return currentList;
          }

          return [
            currentEmployee,
            ...currentList.filter(item => item.EMPCODE !== submittedEmployee),
          ];
        });
        setSelectedEmployee('');
        setSearchQuery('');
      }
      else {
        Alert.alert('Error', result.data.reason);
      }

    } catch (err) {
      Alert.alert('Error', `Failed to submit ${isNightMode ? 'night' : 'day'} attendance`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAttendance = async () => {
    if (!selectedEmployee) {
      Alert.alert('Error', 'Please select an employee');
      return;
    }
    setLoadingView(true);
    const viewUrl = isNightMode ? NIGHT_ATTENDANCE_VIEW_API : DAY_ATTENDANCE_VIEW_API;
    const formData = new URLSearchParams();
    formData.append('EMPCODE', selectedEmployee);
    formData.append('Shift', isNightMode ? 'Night' : 'Day');
    try {
      const result = await axios.post(viewUrl, formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      if (result.status === 200 && result.data.data) {

        const sorted = [...result.data.data].sort(
          (a, b) => new Date(b.ATT_DATE).getTime() - new Date(a.ATT_DATE).getTime()
        );
        setAttendanceRecords(sorted);
        setShowAttendanceModal(true);

      } else {
        Alert.alert('Error', 'No attendance records found');
      }
    } catch (err) {
      Alert.alert('Error', `Failed to fetch ${isNightMode ? 'night' : 'day'} attendance`);
    } finally {
      setLoadingView(false);
    }
  };

  const theme = isNightMode ? darkTheme : lightTheme;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={theme.statusBarStyle}
        backgroundColor={theme.background}
      />
      <ScrollView
        style={[styles.scrollArea, { backgroundColor: theme.background }]}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top, 16), paddingBottom: 24 }
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.isDark ? '#818CF8' : '#1E88E5'}
            colors={[theme.isDark ? '#818CF8' : '#1E88E5']}
          />
        }
      >

        {/* Toggle Button for night mode */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.headerTitle }]}>Attendance</Text>
            <Text style={[styles.headerSubtitle, { color: theme.headerSubtitle }]}>
              {isNightMode ? '🌙 Night Shift' : '☀️ Day Shift'}
            </Text>
          </View>
          <DayNightButton value={isNightMode} onChange={(night) => setIsNightMode(night)} />
        </View>

        {location ? (
          <View style={[
            styles.locationCard,
            {
              backgroundColor: theme.locationBg,
              borderColor: theme.cardBorder,
              borderWidth: theme.isDark ? 1 : 0,
            }
          ]}>
            <Text style={[styles.locationLabel, { color: theme.locationLabel }]}>📍 Current Location</Text>
            <Text style={[styles.locationText, { color: theme.locationText }]}>{location}</Text>
          </View>
        ) : (
          <View style={[
            styles.locationCard,
            styles.locationCardEmpty,
            {
              backgroundColor: theme.locationBg,
              borderColor: theme.cardBorder,
              borderWidth: theme.isDark ? 1 : 0,
            }
          ]}>
            <Text style={styles.locationLabel}>📍 Fetching Location...</Text>
            <Text style={[styles.locationTextEmpty, { color: theme.locationEmptyText }]}>Please wait</Text>
          </View>
        )}

        {/* 🔹 Collapsible Device Info */}
        <TouchableOpacity
          style={[
            styles.deviceInfoToggle,
            {
              backgroundColor: theme.deviceToggleBg,
              borderColor: theme.deviceToggleBorder,
              borderWidth: theme.isDark ? 1 : 0,
            }
          ]}
          onPress={() => setShowDeviceInfo(!showDeviceInfo)}
        >
          <Text style={[styles.toggleText, { color: theme.deviceToggleText }]}>Device Info</Text>
          <Text style={[styles.toggleIcon, { color: theme.deviceToggleText }]}>{showDeviceInfo ? '▼' : '▶'}</Text>
        </TouchableOpacity>

        {showDeviceInfo && (
          <View style={[
            styles.card,
            {
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
              borderWidth: theme.isDark ? 1 : 0,
            }
          ]}>
            <View style={[styles.row, { borderBottomColor: theme.rowBorder }]}>
              <Text style={[styles.label, { color: theme.labelColor }]}>Brand</Text>
              <Text style={[styles.value, { color: theme.valueColor }]}>{deviceInfo.brand}</Text>
            </View>
            <View style={[styles.row, { borderBottomColor: theme.rowBorder }]}>
              <Text style={[styles.label, { color: theme.labelColor }]}>Device Name</Text>
              <Text style={[styles.value, { color: theme.valueColor }]}>{deviceInfo.deviceName}</Text>
            </View>
            <View style={[styles.row, { borderBottomColor: theme.rowBorder }]}>
              <Text style={[styles.label, { color: theme.labelColor }]}>Model</Text>
              <Text style={[styles.value, { color: theme.valueColor }]}>{deviceInfo.model}</Text>
            </View>
            <View style={[styles.row, { borderBottomColor: theme.rowBorder }]}>
              <Text style={[styles.label, { color: theme.labelColor }]}>OS</Text>
              <Text style={[styles.value, { color: theme.valueColor }]}>{deviceInfo.systemName} {deviceInfo.systemVersion}</Text>
            </View>
            <View style={[styles.row, { borderBottomColor: theme.rowBorder }]}>
              <Text style={[styles.label, { color: theme.labelColor }]}>Device ID</Text>
              <Text style={[styles.value, { color: theme.valueColor }]}>{deviceInfo.deviceId}</Text>
            </View>
            <View style={[styles.row, { borderBottomColor: theme.rowBorder }]}>
              <Text style={[styles.label, { color: theme.labelColor }]}>Operating System</Text>
              <Text style={[styles.value, { color: theme.valueColor }]}>
                {deviceInfo.systemName} {deviceInfo.systemVersion}
              </Text>
            </View>
          </View>
        )}

        {/* 🔹 Employee Section */}
        <TextInput
          placeholder="Search employee name"
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBg,
              borderColor: theme.inputBorder,
              color: theme.inputText,
            }
          ]}
          placeholderTextColor={theme.inputPlaceholder}
          onChangeText={setSearchQuery}
          value={searchQuery}
        />

        {loadingList ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.isDark ? '#818CF8' : '#1E88E5'} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading employees...</Text>
          </View>
        ) : filteredList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>No employees found</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredList.map(item => {
              const isSelected = selectedEmployee === item.EMPCODE;
              return (
                <TouchableOpacity
                  key={item.EMPCODE}
                  style={[
                    styles.listItem,
                    {
                      backgroundColor: isSelected ? theme.itemSelectedBg : theme.listItemBg,
                      borderColor: isSelected ? theme.itemSelectedBorder : (theme.isDark ? theme.listItemBorder : 'transparent'),
                      borderWidth: isSelected ? 2 : (theme.isDark ? 1 : 0),
                    },
                  ]}
                  onPress={() => {
                    setSelectedEmployee(item.EMPCODE);
                    setSearchQuery(item.ENG_NAME);
                  }}
                >
                  <View style={styles.listItemContent}>
                    <View style={[styles.avatar, { backgroundColor: theme.avatarBg }]}>
                      <Text style={styles.avatarText}>{item.ENG_NAME.charAt(0)}</Text>
                    </View>
                    <View style={styles.listItemDetails}>
                      <View style={styles.itemNameRow}>
                        <Text style={[styles.itemName, { color: theme.itemName }]}>{item.ENG_NAME}</Text>
                        {item.EMPCODE === quickEmployeeCode && (
                          <View style={[styles.quickBadge, { backgroundColor: theme.quickBadgeBg }]}>
                            <MaterialCommunityIcons name="flash" size={12} color={theme.quickBadgeText} />
                            <Text style={[styles.quickBadgeText, { color: theme.quickBadgeText }]}>Mark attendance quickly</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.itemCode, { color: theme.itemCode }]}>Code: {item.EMPCODE}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* 🔹 Fixed Bottom Action Bar: Fits Every Screen Height Perfectly */}
      <View style={[
        styles.bottomActionBar,
        {
          backgroundColor: theme.bottomBarBg,
          borderTopColor: theme.bottomBarBorder,
          paddingBottom: Math.max(insets.bottom, 14),
        }
      ]}>
        {/* ✅ Submit Attendance Button */}
        <Animated.View style={[styles.btnWrapper, { transform: [{ scale: submitScale }] }]}>
          <TouchableOpacity
            style={[styles.premiumBtn, (!location || loading) && styles.btnDisabled]}
            onPress={handleSubmit}
            onPressIn={() => pressIn(submitScale)}
            onPressOut={() => pressOut(submitScale)}
            disabled={!location || loading}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={
                (!location || loading)
                  ? (isNightMode ? ['#334155', '#1E293B'] : ['#CBD5E1', '#94A3B8'])
                  : isNightMode
                    ? ['#7C3AED', '#5B21B6']
                    : ['#2563EB', '#1D4ED8']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.btnGradient}
            >
              <View style={styles.btnInner}>
                <View style={styles.btnIconBadge}>
                  {loading
                    ? <ActivityIndicator color="#fff" size={18} />
                    : <MaterialCommunityIcons name="check-decagram" size={20} color="#fff" />}
                </View>
                <View style={styles.btnTextWrapper}>
                  <Text style={styles.btnLabel} numberOfLines={1}>
                    {loading ? 'Submitting...' : 'Submit'}
                  </Text>
                  <Text style={styles.btnSub} numberOfLines={1}>
                    {isNightMode ? 'Night Shift' : 'Day Shift'}
                  </Text>
                </View>
              </View>
              <View style={styles.btnShine} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* 📋 View Attendance Button */}
        <Animated.View style={[styles.btnWrapper, { transform: [{ scale: viewScale }] }]}>
          <TouchableOpacity
            style={[styles.premiumBtn, loadingView && styles.btnDisabled]}
            onPress={handleViewAttendance}
            onPressIn={() => pressIn(viewScale)}
            onPressOut={() => pressOut(viewScale)}
            disabled={loadingView}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={
                loadingView
                  ? (isNightMode ? ['#334155', '#1E293B'] : ['#CBD5E1', '#94A3B8'])
                  : isNightMode
                    ? ['#0D9488', '#115E59']
                    : ['#059669', '#047857']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.btnGradient}
            >
              <View style={styles.btnInner}>
                <View style={styles.btnIconBadge}>
                  {loadingView
                    ? <ActivityIndicator color="#fff" size={18} />
                    : <MaterialCommunityIcons name="calendar-clock" size={20} color="#fff" />}
                </View>
                <View style={styles.btnTextWrapper}>
                  <Text style={styles.btnLabel} numberOfLines={1}>
                    {loadingView ? 'Loading...' : 'View Logs'}
                  </Text>
                  <Text style={styles.btnSub} numberOfLines={1}>
                    {isNightMode ? 'Night Shift' : 'Day Shift'}
                  </Text>
                </View>
              </View>
              <View style={styles.btnShine} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Attendance Records Modal */}
      <Modal visible={showAttendanceModal} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <View style={[styles.modalCard, { backgroundColor: theme.modalCardBg }]}>

            {/* Handle bar */}
            <View style={[styles.modalHandle, { backgroundColor: theme.modalHandle }]} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <LinearGradient
                  colors={isNightMode ? ['#6366F1', '#4338CA'] : ['#1E88E5', '#1565C0']}
                  style={styles.modalIconBadge}
                >
                  <MaterialCommunityIcons name="clipboard-text" size={20} color="#fff" />
                </LinearGradient>
                <View>
                  <Text style={[styles.modalTitle, { color: theme.modalTitle }]}>
                    Attendance Log ({isNightMode ? 'Night' : 'Day'})
                  </Text>
                  <Text style={[styles.modalSub, { color: theme.modalSub }]}>
                    {attendanceRecords[0]?.EMPNAME ?? ''}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowAttendanceModal(false)}
                style={[styles.modalCloseBtn, { backgroundColor: theme.modalCloseBg }]}
              >
                <MaterialCommunityIcons name="close" size={20} color={theme.modalCloseIcon} />
              </TouchableOpacity>
            </View>

            {/* Count badge */}
            <View style={[styles.countBadge, { backgroundColor: theme.countBadgeBg }]}>
              <MaterialCommunityIcons
                name="calendar-check"
                size={14}
                color={theme.countBadgeText}
              />
              <Text style={[styles.countText, { color: theme.countBadgeText }]}>
                {attendanceRecords.length} records found
              </Text>
            </View>

            <FlatList
              data={attendanceRecords}
              keyExtractor={(_, i) => i.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
              renderItem={({ item, index }) => (
                <View style={[
                  styles.recordCard,
                  {
                    backgroundColor: theme.recordCardBg,
                    borderColor: theme.recordCardBorder,
                    borderWidth: theme.isDark ? 1 : 0,
                  }
                ]}>
                  {/* Left accent + index */}
                  <LinearGradient
                    colors={isNightMode ? ['#6366F1', '#4338CA'] : ['#1E88E5', '#1565C0']}
                    style={styles.recordAccent}
                  >
                    <Text style={styles.recordIndex}>{index + 1}</Text>
                  </LinearGradient>

                  <View style={styles.recordBody}>
                    <View style={styles.recordTopRow}>
                      <MaterialCommunityIcons
                        name="clock-outline"
                        size={14}
                        color={isNightMode ? '#818CF8' : '#1976D2'}
                      />
                      <Text style={[styles.recordDate, { color: theme.recordDate }]}>
                        {item.ATT_DATE}
                      </Text>
                    </View>
                    <View style={styles.recordBottomRow}>
                      <MaterialCommunityIcons
                        name="map-marker-outline"
                        size={14}
                        color={isNightMode ? '#4ADE80' : '#43A047'}
                      />
                      <Text style={[styles.recordLocation, { color: theme.recordLocation }]}>
                        {item.LOCATION}
                      </Text>
                    </View>
                  </View>

                  {index === 0 && (
                    <View style={[styles.latestBadge, { backgroundColor: theme.latestBadgeBg }]}>
                      <Text style={[styles.latestText, { color: theme.latestBadgeText }]}>Latest</Text>
                    </View>
                  )}
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="calendar-remove" size={48} color={theme.textMuted} />
                  <Text style={[styles.emptyText, { color: theme.textMuted }]}>No records found</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
  },

  headerSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },

  scrollArea: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
  },

  listContainer: {
    paddingBottom: 12,
  },

  bottomActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -3 },
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 'auto',
  },

  buttonContainerCompact: {
    flexDirection: 'row',
  },



  deviceInfoToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },

  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },

  toggleIcon: {
    fontSize: 12,
    color: '#2196F3',
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

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },

  label: {
    fontSize: 12,
    color: '#666',
  },

  value: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#111',
    marginLeft: 12,
    textAlign: 'right',
  },

  /* ---------- Section ---------- */
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#222',
  },

  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 15,
  },

  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',


  },

  loadingText: {
    color: '#666',
    fontSize: 14,
  },

  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',

  },

  emptyText: {
    color: '#999',
    fontSize: 14,
  },

  /* ---------- List ---------- */
  listItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },

  listItemDetails: {
    flex: 1,
  },

  itemName: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },

  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },

  quickBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginBottom: 4,
  },

  quickBadgeText: {
    color: '#2E7D32',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 3,
  },

  itemCode: {
    fontSize: 13,
    color: '#666',
  },

  itemText: {
    fontSize: 16,
    color: '#333',
  },

  selectedItem: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    borderWidth: 2,
  },

  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  locationCardEmpty: {
    borderLeftColor: '#FFA000',
  },

  locationLabel: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
  },

  locationText: {
    fontSize: 14,
    color: '#111',
    fontWeight: '600',
    lineHeight: 20,
  },

  locationTextEmpty: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },

  btnWrapper: {
    flex: 1,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  premiumBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },

  btnGradient: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    overflow: 'hidden',
  },

  btnDisabled: {
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.85,
  },

  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 38,
  },

  btnIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  btnTextWrapper: {
    flex: 1,
    justifyContent: 'center',
  },

  btnLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  btnSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
    letterSpacing: 0.2,
  },

  btnShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  modalCard: {
    backgroundColor: '#F4F6F8',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 20,
  },

  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D0D0D0',
    alignSelf: 'center',
    marginBottom: 16,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  modalIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
  },

  modalSub: {
    fontSize: 11,
    color: '#888',
    marginTop: 1,
  },

  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ECECEC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E3F2FD',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 14,
  },

  countText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
  },

  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  recordAccent: {
    width: 44,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },

  recordIndex: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },

  recordBody: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 5,
  },

  recordTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  recordBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  recordDate: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  recordLocation: {
    fontSize: 12,
    color: '#555',
  },

  latestBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 10,
  },

  latestText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2E7D32',
  },
});


export default Attendance;
