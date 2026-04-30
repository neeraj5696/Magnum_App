import { Text, StyleSheet, View, FlatList, TextInput, Platform, TouchableOpacity, Alert, ScrollView, RefreshControl, Animated, ActivityIndicator, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { useState, useEffect } from 'react';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import * as Application from 'expo-application';
import { add } from 'date-fns';

interface DeviceInfo {
  deviceName: string,
  deviceId: string,
  UniqueID: string,
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



function Attendance() {
  const submitScale = new Animated.Value(1);
  const viewScale = new Animated.Value(1);

  const pressIn = (anim: Animated.Value) => Animated.spring(anim, { toValue: 0.95, useNativeDriver: true }).start();
  const pressOut = (anim: Animated.Value) => Animated.spring(anim, { toValue: 1, useNativeDriver: true }).start();
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

      const data = listresult.data?.data;
      setList(data || []);
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

    try {
      const result = await axios.post('https://hma.magnum.org.in/appAttendance.php', formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (result.data?.status === "success") {
        Alert.alert('Success', result.data.reason);
        setSelectedEmployee('');
        setSearchQuery('');
      }
      else {
        Alert.alert('Error', result.data.reason);
      }

    } catch (err) {
      Alert.alert('Error', 'Failed to submit attendance');
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
    const formData = new URLSearchParams();
    formData.append('EMPCODE', selectedEmployee);
    try {
      const result = await axios.post('https://hma.magnum.org.in/appAttendanceview.php', formData.toString(), {
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
      Alert.alert('Error', 'Failed to fetch attendance');
    } finally {
      setLoadingView(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >

      {location ? (
        <View style={styles.locationCard}>
          <Text style={styles.locationLabel}>📍 Current Location</Text>
          <Text style={styles.locationText}>{location}</Text>
        </View>
      ) : (
        <View style={[styles.locationCard, styles.locationCardEmpty]}>
          <Text style={styles.locationLabel}>📍 Fetching Location...</Text>
          <Text style={styles.locationTextEmpty}>Please wait</Text>
        </View>
      )}
      {/* 🔹 Collapsible Device Info */}
      <TouchableOpacity
        style={styles.deviceInfoToggle}
        onPress={() => setShowDeviceInfo(!showDeviceInfo)}
      >
        <Text style={styles.toggleText}>Device Info</Text>
        <Text style={styles.toggleIcon}>{showDeviceInfo ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {showDeviceInfo && (
        <View style={styles.card}>

          <View style={styles.row}>
            <Text style={styles.label}>Brand</Text>
            <Text style={styles.value}>{deviceInfo.brand}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Device Name</Text>
            <Text style={styles.value}>{deviceInfo.deviceName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Model</Text>
            <Text style={styles.value}>{deviceInfo.model}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>OS</Text>
            <Text style={styles.value}>{deviceInfo.systemName} {deviceInfo.systemVersion}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Device ID</Text>
            <Text style={styles.value}>{deviceInfo.deviceId}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Operating System</Text>
            <Text style={styles.value}>
              {deviceInfo.systemName} {deviceInfo.systemVersion}
            </Text>
          </View>
        </View>
      )}


      {/* 🔹 Employee Section */}


      <TextInput
        placeholder="Search employee name"
        style={styles.input}
        placeholderTextColor="#888"
        onChangeText={setSearchQuery}
        value={searchQuery}
      />



      {loadingList ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading employees...</Text>
        </View>
      ) : filteredList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No employees found</Text>
        </View>
      ) : (
        filteredList.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.listItem, selectedEmployee === item.EMPCODE && styles.selectedItem]}
            onPress={() => {
              setSelectedEmployee(item.EMPCODE);
              setSearchQuery(item.ENG_NAME);
            }}
          >
            <View style={styles.listItemContent}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.ENG_NAME.charAt(0)}</Text>
              </View>
              <View style={styles.listItemDetails}>
                <Text style={styles.itemName}>{item.ENG_NAME}</Text>
                <Text style={styles.itemCode}>Code: {item.EMPCODE}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}

      <View style={styles.buttonContainer}>

        {/* ✅ Submit Attendance Button */}
        <Animated.View style={[styles.btnWrapper, { transform: [{ scale: submitScale }] }]}>
          <TouchableOpacity
            style={[styles.premiumBtn, (!location || loading) && styles.btnDisabled]}
            onPress={handleSubmit}
            onPressIn={() => pressIn(submitScale)}
            onPressOut={() => pressOut(submitScale)}
            disabled={!location || loading}
            activeOpacity={1}
          >
            <LinearGradient colors={(!location || loading) ? ['#B0BEC5', '#90A4AE'] : ['#1E88E5', '#1565C0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btnGradient}>
              <View style={styles.btnInner}>
                {loading
                  ? <ActivityIndicator color="#fff" size={24} />
                  : <MaterialCommunityIcons name="check-circle" size={28} color="#fff" />}
                <View>
                  <Text style={styles.btnLabel}>{loading ? 'Submitting...' : 'Submit'}</Text>
                  <Text style={styles.btnSub}>Mark Attendance</Text>
                </View>
              </View>
              <View style={styles.btnShine} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* 📋 View Attendance Button */}
        <Animated.View style={[styles.btnWrapper, { transform: [{ scale: viewScale }] }]}>
          <TouchableOpacity
            style={[styles.premiumBtn, (!location || loadingView) && styles.btnDisabled]}
            onPress={handleViewAttendance}
            onPressIn={() => pressIn(viewScale)}
            onPressOut={() => pressOut(viewScale)}
           
            activeOpacity={1}
          >
            <LinearGradient colors={( loadingView) ? ['#B0BEC5', '#90A4AE'] : ['#21b3a4', '#0b8b7d']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btnGradient}>
              <View style={styles.btnInner}>
                {loadingView
                  ? <ActivityIndicator color="#fff" size={24} />
                  : <MaterialCommunityIcons name="clipboard-text" size={28} color="#fff" />}
                <View>
                  <Text style={styles.btnLabel}>{loadingView ? 'Loading...' : 'View'}</Text>
                  <Text style={styles.btnSub}>Attendance Log</Text>
                </View>
              </View>
              <View style={styles.btnShine} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

      </View>

      {/* Attendance Records Modal */}
      <Modal visible={showAttendanceModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            {/* Handle bar */}
            <View style={styles.modalHandle} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <LinearGradient colors={['#1E88E5','#1565C0']} style={styles.modalIconBadge}>
                  <MaterialCommunityIcons name="clipboard-text" size={20} color="#fff" />
                </LinearGradient>
                <View>
                  <Text style={styles.modalTitle}>Attendance Log</Text>
                  <Text style={styles.modalSub}>{attendanceRecords[0]?.EMPNAME ?? ''}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowAttendanceModal(false)} style={styles.modalCloseBtn}>
                <MaterialCommunityIcons name="close" size={20} color="#555" />
              </TouchableOpacity>
            </View>

            {/* Count badge */}
            <View style={styles.countBadge}>
              <MaterialCommunityIcons name="calendar-check" size={14} color="#1976D2" />
              <Text style={styles.countText}>{attendanceRecords.length} records found</Text>
            </View>

            <FlatList
              data={attendanceRecords}
              keyExtractor={(_, i) => i.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
              renderItem={({ item, index }) => (
                <View style={styles.recordCard}>
                  {/* Left accent + index */}
                  <LinearGradient colors={['#1E88E5','#1565C0']} style={styles.recordAccent}>
                    <Text style={styles.recordIndex}>{index + 1}</Text>
                  </LinearGradient>

                  <View style={styles.recordBody}>
                    <View style={styles.recordTopRow}>
                      <MaterialCommunityIcons name="clock-outline" size={14} color="#1976D2" />
                      <Text style={styles.recordDate}>{item.ATT_DATE}</Text>
                    </View>
                    <View style={styles.recordBottomRow}>
                      <MaterialCommunityIcons name="map-marker-outline" size={14} color="#43A047" />
                      <Text style={styles.recordLocation}>{item.LOCATION}</Text>
                    </View>
                  </View>

                  {index === 0 && (
                    <View style={styles.latestBadge}>
                      <Text style={styles.latestText}>Latest</Text>
                    </View>
                  )}
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="calendar-remove" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>No records found</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

    </ScrollView>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 20,
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
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },

  label: {
    fontSize: 12,
    color: '#666',
  },

  value: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111',
    maxWidth: '60%',
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
  },

  loadingText: {
    color: '#666',
    fontSize: 14,
  },

  emptyContainer: {
    padding: 40,
    alignItems: 'center',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
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
  },

  locationTextEmpty: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
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
    borderColor: 'rgba(255,255,255,0.25)',
  },

  btnGradient: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    overflow: 'hidden',
  },

  btnDisabled: {
    shadowOpacity: 0,
    elevation: 0,
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
