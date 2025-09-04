import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  Platform,
  StatusBar,
  TouchableOpacity,
  PanResponder,
  Dimensions,
  Image,
  ActivityIndicator,
} from "react-native";
import PrefixedMultilineInput from "./PrefixedMultilineInput";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { generatePdfFromHtml } from "../src/utils/documentGenerator";
import { createComplaintReportTemplate } from "../src/utils/complaintReportTemplate";
import uploadPDFToCloudinary from "../src/utils/cloudinaryUpload";
import Svg, { Path, G } from "react-native-svg";
import ViewShot from "react-native-view-shot";
import * as ScreenOrientation from "expo-screen-orientation";
import { Ionicons } from "@expo/vector-icons";
import { submitComplaintUpdate } from "../src/utils/submitComplaintUpdate";
import { Picker } from "@react-native-picker/picker";
import { getEpbaxData, getEpbaxAndPowerSupplyData } from "./componenet/Epbax";
import { getAccessControlData } from "./componenet/AccessControl";
import { getVpdDdlData } from "./componenet/VpdDdl";
import SimplePreviewModal from "./componenet/SimplePreviewModal";
import { getHeaderImageDataUri } from "../src/utils/getHeaderImageDataUri";

interface UploadResult {
  secure_url: string;
  // include other properties as needed
}

interface MaterialItem {
  SystemName: string;
  Parts: string;
}

export default function EnggComplaintDetails() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Helper to safely get string param
  const getParam = (key: keyof typeof params) => {
    const value = params[key];
    if (Array.isArray(value)) return value[0] || "";
    return value || "";
  };

  // Debug log
  // console.log('S_SERVDT value:', getParam('S_SERVDT'));

  // Form field states
  const [remark, setRemark] = useState("");
  const [workStatus, setWorkStatus] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [hasSubmitAttempt, setHasSubmitAttempt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [callAttendedDate, setCallAttendedDate] = useState("");
  const [callAttendedTime, setCallAttendedTime] = useState("");
  const [callCompletedDate, setCallCompletedDate] = useState("");
  const [callCompletedTime, setCallCompletedTime] = useState("");
  const [partReplaced, setPartReplaced] = useState("");
  const [causeProblem, setCauseProblem] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [materialTakenOut, setMaterialTakenOut] = useState("");
  const [customerComment, setCustomerComment] = useState("");
  const [customerSignature, setCustomerSignature] = useState<string | null>(
    null
  );
  const [engineerSignature, setEngineerSignature] = useState<string | null>(
    null
  );
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showEngineerSignaturePad, setShowEngineerSignaturePad] = useState(false);
  const [currentSignatureType, setCurrentSignatureType] = useState<'customer' | 'engineer'>('customer');
  const [paths, setPaths] = useState<Array<string>>([]);
  const [currentPath, setCurrentPath] = useState<string>("");
  const signatureRef = useRef<any>(null);
  const currentPathRef = useRef("");
  const [padLayout, setPadLayout] = useState({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
  });
  const signatureBgRef = useRef(null);
  const [pendingReasons, setPendingReasons] = useState<string[]>([]);
  const [pendingReason, setPendingReason] = useState("");
  const [showPendingReason, setShowPendingReason] = useState(false);
  const [showPendingReasonModal, setShowPendingReasonModal] = useState(false);
  const [engineerComment, setEngineerComment] = useState("");
  const [inputHeight, setInputHeight] = useState(40);
  const [requiredMaterial, setRequiredMaterial] = useState("");
  const [selectedSystem, setSelectedSystem] = useState<string>("");
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [showSystemModal, setShowSystemModal] = useState(false);
  const [showPartsModal, setShowPartsModal] = useState(false);
  // Add new state for grouped data and system/parts selection
  const [groupedData, setGroupedData] = useState<Record<string, string[]>>({});
  const [systemNamesList, setSystemNamesList] = useState<string[]>([]);
  const [selectedSystemName, setSelectedSystemName] = useState<string>("");
  const [selectedPart, setSelectedPart] = useState<string>("");
  const [showSystemNameModal, setShowSystemNameModal] = useState(false);
  const [showPartsNoModal, setShowPartsNoModal] = useState(false);
  const [powerSupplyData, setPowerSupplyData] = useState<string[]>([]);
  const [selectedPowerSupplyModels, setSelectedPowerSupplyModels] = useState<
    string[]
  >([]);
  const [showPowerSupplyModal, setShowPowerSupplyModal] = useState(false);
  const [materialList, setMaterialList] = useState<MaterialItem[]>([]);
  // Track the true system type (e.g., 'EPABX', 'ACCESS CONTROL', etc.)
  const [systemType, setSystemType] = useState<string>("");
  const [diagnosisFocused, setDiagnosisFocused] = useState(false);
  const [materialTakenOutFocused, setMaterialTakenOutFocused] = useState(false);
  const [customerCommentFocused, setCustomerCommentFocused] = useState(false);
  const [engineerCommentFocused, setEngineerCommentFocused] = useState(false);
  const [partReplacedFocused, setPartReplacedFocused] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Fetch both EPABX and Power Supply data on mount
  useEffect(() => {
    const fetchAll = async () => {
      const { epbax, powerSupply } = await getEpbaxAndPowerSupplyData();
      setGroupedData(epbax);
      setPowerSupplyData(powerSupply);
      // console.log("Fetched Power Supply Data:", powerSupply);
    };
    fetchAll();
  }, []);

  // Initialize state variables from params on mount
  useEffect(() => {
    if (!callAttendedDate) setCallAttendedDate(getParam("S_assigndate"));
    if (!callAttendedTime) setCallAttendedTime(""); // Set from param if available
    if (!callCompletedDate)
      setCallCompletedDate(new Date().toISOString().slice(0, 10)); // Or from param
    if (!callCompletedTime)
      setCallCompletedTime(new Date().toISOString().slice(11, 16)); // Or from param
    if (!causeProblem) setCauseProblem(getParam("S_REMARK1"));
  }, []);

  useEffect(() => {
    currentPathRef.current = currentPath;
  }, [currentPath]);

  // Set selectedSystem from params.systemName if present and not already set
  useEffect(() => {
    const paramSystemName = getParam("systemName");
    if (!selectedSystem && paramSystemName && paramSystemName.trim() !== "") {
      setSelectedSystem(paramSystemName);
    }
  }, [selectedSystem, params]);

  // Get dimensions for signature pad
  const screenWidth = Dimensions.get("window").width;
  const padWidth = Math.min(screenWidth - 80, 500);
  const padHeight = 200;

  // PanResponder for signature drawing
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        // Save the previous stroke if it exists
        if (currentPathRef.current) {
          setPaths((prevPaths) => [...prevPaths, currentPathRef.current]);
          setCurrentPath("");
        }
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath(`M ${locationX} ${locationY}`);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath((prevPath) => `${prevPath} L ${locationX} ${locationY}`);
      },
      onPanResponderRelease: () => {
        // Save the last stroke
        if (currentPathRef.current) {
          setPaths((prevPaths) => [...prevPaths, currentPathRef.current]);
          setCurrentPath("");
        }
      },
    })
  ).current;

  // Clear signature
  const clearSignature = () => {
    setPaths([]);
    setCurrentPath("");
    if (currentSignatureType === 'customer') {
      setCustomerSignature(null);
    } else {
      setEngineerSignature(null);
    }
  };

  // Save signature
  const saveSignature = async () => {
    if (paths.length > 0 || currentPath) {
      try {
        if (signatureRef.current) {
          const options = {
            format: "jpg",
            quality: 0.9,
            result: "data-uri",
          };
          const capturedSignature = await signatureRef.current.capture(options);
          
          if (currentSignatureType === 'customer') {
            setCustomerSignature(capturedSignature);
            setShowSignaturePad(false);
          } else {
            setEngineerSignature(capturedSignature);
            setShowEngineerSignaturePad(false);
          }
        } else {
          Alert.alert("Error", "Failed to capture signature");
        }
      } catch (error) {
        console.error("Error capturing signature:", error);
        Alert.alert("Error", "Failed to capture signature");
      }
    } else {
      Alert.alert("Error", "Please provide a signature");
    }
  };

  // Open signature pad
  const openSignaturePad = (type: 'customer' | 'engineer' = 'customer') => {
    setCurrentSignatureType(type);
    
    // Always clear paths when opening signature pad
    setPaths([]);
    setCurrentPath("");

    if (type === 'customer') {
      setShowSignaturePad(true);
    } else {
      setShowEngineerSignaturePad(true);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setHasSubmitAttempt(true);

    if (!customerSignature) {
      Alert.alert("Error", "Please provide customer signature");
      return;
    }
    if (!engineerSignature) {
      Alert.alert("Error", "Please provide engineer signature");
      return;
    }
    if (!workStatus) {
      Alert.alert("Error", "Please select a work status");
      return;
    }
    if (workStatus === "Pending" && !pendingReason) {
      Alert.alert("Error", "Please select a pending reason");
      return;
    }

    setIsSubmitting(true);
    try {
      await handleFinalSubmit();
    } catch (error) {
      console.error("Error in submission:", error);
      Alert.alert("Error", "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle final submission with document generation
  const handleFinalSubmit = async () => {
    console.log("🚩 CHECKPOINT 1: Starting form submission process");

    const headerImageDataUri = await getHeaderImageDataUri();
    const formData = {
      // Basic complaint information
      complaintNo: getParam("complaintNo"),
      clientName: getParam("clientName"),
      workStatus,
      remark,
      faultReported: getParam("S_SERVDT"),
      typeOfCall: getParam("S_TASK_TYPE"),
      callAttendedDate,
      callAttendedTime,
      callCompletedDate,
      callCompletedTime,
      partReplaced,
      causeProblem,
      diagnosis,
      materialTakenOut,
      customerComment,
      customerSignature,
      engineerSignature,
      systemName: getParam("SYSTEM_NAME"),
      assignDate: getParam("S_assigndate"),
      location: getParam("location"),
      taskType: getParam("S_TASK_TYPE"),
      status: getParam("status"),
      S_SERVDT: getParam("S_SERVDT"),
      S_assignedengg: getParam("S_assignedengg"),
      pendingReason: workStatus === "Pending" ? pendingReason : "",
      submittedAt: new Date().toISOString(),
      engineerComment,

      debug: {
        workStatus,
        pendingReason,
        hasSignature: !!customerSignature,
        hasEngineerSignature: !!engineerSignature,
        formFields: {
          callAttended: !!callAttendedDate && !!callAttendedTime,
          callCompleted: !!callCompletedDate && !!callCompletedTime,
          hasPartReplaced: !!partReplaced,
          hasCauseProblem: !!causeProblem,
          hasDiagnosis: !!diagnosis,
          hasMaterialTakenOut: !!materialTakenOut,
          hasCustomerComment: !!customerComment,
        },
      },
    };

    console.log(
      "🚩 CHECKPOINT 2: Form data prepared, beginning PDF generation"
    );

    // Generate document from form data with the specialized template
    try {
      const htmlContent = createComplaintReportTemplate({ ...formData, headerImageDataUri });
      const fileName = `complaint_${getParam("complaintNo")}_report`;

      console.log("🚩 CHECKPOINT 3: HTML template created, generating PDF");
      const result = await generatePdfFromHtml(htmlContent, fileName);

      console.log(
        "🚩 CHECKPOINT 4: PDF generation result:",
        result.success ? "SUCCESS" : "FAILED"
      ); 3

      if (result.success && result.localUri) {
        try {
          console.log("🚩 CHECKPOINT 5: Starting Cloudinary upload");
          const uploadResult = (await uploadPDFToCloudinary(
            result.localUri
          )) as UploadResult;
          const secureUrl = uploadResult.secure_url;

          console.log(
            "🚩 CHECKPOINT 6: Cloudinary upload successful, secure URL obtained"
          );
          console.log("Secure URL:", secureUrl.substring(0, 50) + "...");

          // Call the submitComplaintUpdate function to update the complaint status
          console.log(
            "🚩 CHECKPOINT 7: Starting server API call with form data"
          );
          const responseJson = await submitComplaintUpdate({
            enggname: getParam("S_assignedengg"),
            remark: `D-${diagnosis} E-${engineerComment}`,
            report: secureUrl,
            status: workStatus === "Completed" ? "1" : "0",
            pendingreason: workStatus === "Completed" ? "NULL" : pendingReason,
            complaintNo: getParam("complaintNo"),
            material: getMaterialSummary(),
          });

          console.log(
            "🚩 CHECKPOINT 8: Server response received:",
            JSON.stringify(responseJson)
          );

          if (responseJson.status === "success") {
            console.log("🚩 CHECKPOINT 9: Server update SUCCESSFUL");
            Alert.alert("Success", "Data sent successfully!", [
              {
                text: "OK",
                onPress: () => {
                  console.log("🚩 CHECKPOINT 10: Navigating back to list");
                  router.push({
                    pathname: "/engineer/list",
                    params: {
                      username: getParam("username"),
                      password: getParam("password"),
                    },
                  });
                },
              },
            ]);
          } else {
            console.log(
              "🚩 CHECKPOINT 9: Server update FAILED:",
              responseJson.reason
            );
            Alert.alert(
              "Error",
              responseJson.reason || "Failed to send data. Please try again."
            );
          }
        } catch (uploadError) {
          console.log(
            "🚩 ERROR: Cloudinary upload or server communication failed",
            uploadError
          );
          console.error(
            "Error uploading to Cloudinary or posting to server:",
            uploadError
          );
          Alert.alert(
            "Warning",
            "PDF generated but failed to upload to Cloudinary or post to server. Please try again later."
          );
        }
      }
      else {
        console.log("🚩 ERROR: PDF generation failed");
        console.error("Failed to generate PDF");
        Alert.alert(
          "Error",
          "Failed to generate PDF document. Please try again."
        );
      }
    } catch (error) {
      console.log("🚩 ERROR: PDF template generation failed", error);
      console.error("Error in PDF generation:", error);
      Alert.alert("Error", "Failed to process document. Please try again.");
    }
  };

  // Lock orientation when signature pad opens, unlock when closes
  useEffect(() => {
    if (showSignaturePad || showEngineerSignaturePad) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    } else {
      ScreenOrientation.unlockAsync();
    }
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, [showSignaturePad, showEngineerSignaturePad]);

  // Update pad layout on every layout change
  const updatePadLayout = () => {
    if (signatureBgRef.current) {
      (signatureBgRef.current as any).measureInWindow(
        (x: number, y: number, width: number, height: number) => {
          setPadLayout({ x, y, width, height });
        }
      );
    }
  };

  // When modal opens, and on every layout change, update pad layout
  useEffect(() => {
    if (showSignaturePad || showEngineerSignaturePad) {
      setTimeout(updatePadLayout, 100);
    }
  }, [showSignaturePad, showEngineerSignaturePad]);

  // Fetch pending reasons when workStatus is 'Pending'
  const fetchPendingReasons = async () => {
    const formData = new URLSearchParams();
    formData.append("username", getParam("username"));
    formData.append("password", getParam("password"));

    try {
      const res = await fetch(
        "https://hma.magnum.org.in/appPendingstatus.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        }
      );
      const text = await res.text();

      // Remove prefix before parsing
      const jsonStart = text.indexOf("{");
      if (jsonStart === -1) {
        console.log("No JSON found in response");
        return;
      }
      const jsonString = text.slice(jsonStart);
      let data;
      try {
        data = JSON.parse(jsonString);
      } catch (e) {
        console.log("Failed to parse JSON:", e);
        return;
      }
      console.log(
        "Fetched pending reason, for more information check fetchPendingReason line 475 in engineer/details.tsx"
      );
      if (data.status === "success" && Array.isArray(data.data)) {
        setPendingReasons(
          data.data.map((item: { PCOMP_STATUS: string }) => item.PCOMP_STATUS)
        );
        setShowPendingReason(true);
        data.data.forEach((item: { PCOMP_STATUS: string }) => {
          //  console.log('Reason:', item.PCOMP_STATUS);
        });
      } else {
        setShowPendingReason(false);
      }
    } catch (error) {
      setShowPendingReason(false);
      console.log("error", error);
    }
  };

  // When system type changes, fetch data from the correct source and setting to system Name
  useEffect(() => {
    if (
      pendingReason === "Due to Material" &&
      selectedSystem &&
      selectedSystem !== "CCTV"
    ) {
      setGroupedData({});
      setSystemNamesList([]);
      setSelectedSystemName("");
      setSelectedParts([]);
      const fetchData = async () => {
        let data: Record<string, string[]> = {};
        if (selectedSystem === "EPABX") {
          data = await getEpbaxData();
        } else if (selectedSystem === "ACCESS CONTROL") {
          data = await getAccessControlData();
        } else if (selectedSystem === "VDP") {
          data = await getVpdDdlData();
        }
        setGroupedData(data);

        // Setting the systemName for system type
        setSystemNamesList(Object.keys(data));
      };
      fetchData();
    } else {
      setGroupedData({});
      setSystemNamesList([]);
      setSelectedSystemName("");
      setSelectedParts([]);
    }
  }, [pendingReason, selectedSystem]);

  // SET THE DATA FROM THE API WHEN PRESENT/ABSENT

  useEffect(() => {
    const model = getParam("modelnumber")?.trim();
    const system = getParam("systemName")?.trim();

    // console.log("🔍 Debug - modelnumber:", model);
    // console.log("🔍 Debug - systemName:", system);
    // console.log("🔍 Debug - selectedSystemName:", selectedSystemName);

    if (model && !selectedSystemName) {
      console.log("🔍 Setting selectedSystemName to:", model);
      setSelectedSystemName(model);
    }
  }, [selectedSystemName, params]);

  useEffect(() => {
    if (workStatus === "Pending") {
      fetchPendingReasons();
    } else {
      setShowPendingReason(false);
    }
  }, [workStatus]);

  // Debug: log keys and selected system name before rendering modal
  useEffect(() => {
    console.log(
      "PowerSupplyData  fetched, for more information got to details.tsx 556"
    ); // (powerSupplyData));
    console.log("selectedSystemName:", selectedSystemName);
  }, [powerSupplyData, selectedSystemName]);

  //to get the all data at one place , easier to send
  const getMaterialSummary = () => {
    if (selectedSystem === "CCTV") {
      return requiredMaterial;
    }
    let summary = `System: ${selectedSystem}`;
    if (selectedSystemName) summary += `, System Name: ${selectedSystemName}`;
    if (selectedParts.length > 0)
      summary += `, Parts: ${selectedParts.join(", ")}`;
    if (selectedSystem === "EPABX" && selectedPowerSupplyModels.length > 0) {
      summary += `, Power Supply Model(s): ${selectedPowerSupplyModels.join(
        ", "
      )}`;
    }
    console.log("Material Summary:", summary);
    return summary;
  };

  return (
    <SafeAreaView style={[styles.container]}>
      <StatusBar />
      <ScrollView>
        <View style={styles.divider} />
        {/* Info Section */}
        <View style={styles.infoSectionBox}>
          <Text style={styles.complaintNo}>
            Complaint No. - {getParam("complaintNo")}
          </Text>
          <View style={styles.infoRow}>
            <Ionicons
              name="person-outline"
              size={18}
              color="#1976D2"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.label}>Complaint Name:</Text>
            <Text style={styles.value}>{getParam("clientName")}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color="#1976D2"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.label}>Assigin Date:</Text>
            <Text style={styles.value}>{getParam("S_assigndate")}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="layers-outline"
              size={18}
              color="#1976D2"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.label}>System Name:</Text>
            <Text style={styles.value}>{getParam("SYSTEM_NAME")}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="briefcase-outline"
              size={18}
              color="#1976D2"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.label}>Task type:</Text>
            <Text style={styles.value}>{getParam("S_TASK_TYPE")}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="location-outline"
              size={18}
              color="#1976D2"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{getParam("location")}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={18}
              color="#1976D2"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.label}>Remark1:</Text>
            <Text style={styles.value}>{getParam("S_REMARK1")}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        {/* Form Section */}
        <View style={styles.formSectionBox}>
          <Text style={styles.sectionTitle}>Update Status</Text>

          {/* Fault Reported */}
          <Text style={styles.formLabel}>Fault Reported:</Text>
          <View style={[styles.dateTimeInput]}>
            <Ionicons name="time-outline" size={18} color="#666" />
            <Text style={[styles.dateTimeText, { color: "#666" }]}>
              {" "}
              {getParam("S_SERVDT") || "Not available"}
            </Text>
          </View>

          {/* Type of Call Dropdown */}
          <Text style={styles.formLabel}>Type of Call:</Text>
          <View style={[styles.dropdownButton]}>
            <Text style={[styles.dropdownButtonText, { color: "#666" }]}>
              {getParam("S_TASK_TYPE") || "Not available"}
            </Text>
          </View>

          {/* Call Attended Date and Time */}
          <View style={styles.dateTimeGroup}>
            <Text style={styles.formLabel}>Call Attended On:</Text>
            <View style={[styles.dateTimeInput]}>
              <Ionicons name="time-outline" size={18} color="#666" />
              <Text style={[styles.dateTimeText, { color: "#666" }]}>
                {getParam("S_assigndate") || "Not available"}
              </Text>
            </View>
          </View>

          {/* Call Completed Date and Time */}
          <View style={styles.dateTimeGroup}>
            <Text style={styles.formLabel}>Call Completed On:</Text>
            <View style={[styles.dateTimeInput]}>
              <Ionicons name="time-outline" size={18} color="#666" />
              <Text style={[styles.dateTimeText, { color: "#666" }]}>
                {new Date().toISOString().slice(0, 19).replace("T", " ")}
              </Text>
            </View>
          </View>

          {/* Cause of Problem */}
          <Text style={styles.formLabel}>Cause of Problem:</Text>
          <View style={[styles.dropdownButton]}>
            <Text style={[styles.dropdownButtonText, { color: "#666" }]}>
              {getParam("S_REMARK2")}
            </Text>
          </View>

          {/* Part Replaced */}
          <Text style={styles.formLabel}>Part Replaced/Stand by (if any):</Text>
          <TextInput
            style={[
              styles.textInput,
              partReplacedFocused ? styles.textInputFocused : null,
            ]}
            placeholder="Enter parts replaced..."
            value={partReplaced}
            onChangeText={setPartReplaced}
            multiline={false}
            onFocus={() => setPartReplacedFocused(true)}
            onBlur={() => setPartReplacedFocused(false)}
          />
          <Text style={styles.helperText}>
            List any parts replaced or stand-by provided to the client.
          </Text>
          {/* Diagnosis */}
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.formLabel}>Diagnosis</Text>
            <View style={{ position: "relative" }}>
              <Ionicons
                name="medkit-outline"
                size={18}
                color="#1a73e8"
                style={{ position: "absolute", left: 12, top: 12, zIndex: 1 }}
              />
              <TextInput
                style={[
                  styles.textInput,
                  { paddingLeft: 38 },
                  diagnosisFocused ? styles.textInputFocused : null,
                  hasSubmitAttempt && !diagnosis ? styles.inputError : null,
                ]}
                placeholder="Enter diagnosis..."
                value={diagnosis}
                onChangeText={setDiagnosis}
                multiline={false}
                onFocus={() => setDiagnosisFocused(true)}
                onBlur={() => setDiagnosisFocused(false)}
              />
            </View>
            <Text style={styles.helperText}>
              Describe the technical diagnosis of the issue.
            </Text>
            {hasSubmitAttempt && !diagnosis && (
              <Text style={styles.errorText}>Diagnosis is required</Text>
            )}
          </View>

          {/* Material Taken Out */}
          <Text style={styles.formLabel}>Material Taken Out (if any):</Text>
          <TextInput
            style={[
              styles.textInput,
              materialTakenOutFocused ? styles.textInputFocused : null,
            ]}
            placeholder="Enter materials taken out..."
            value={materialTakenOut}
            onChangeText={setMaterialTakenOut}
            multiline={false}
            onFocus={() => setMaterialTakenOutFocused(true)}
            onBlur={() => setMaterialTakenOutFocused(false)}
          />

          {/* Customer Comment */}
          <Text style={styles.formLabel}>Customer Comment:</Text>
          <ScrollView
            style={{ maxHeight: 120 }}
            nestedScrollEnabled
            showsVerticalScrollIndicator
            persistentScrollbar
            indicatorStyle="white"
          >
            <TextInput
              style={[
                styles.textInput,
                { minHeight: 60, textAlignVertical: "top" },
                customerCommentFocused ? styles.textInputFocused : null,
              ]}
              placeholder="Enter customer's comment here..."
              value={customerComment}
              onChangeText={setCustomerComment}
              scrollEnabled={true}
              multiline={true}
              onFocus={() => setCustomerCommentFocused(true)}
              onBlur={() => setCustomerCommentFocused(false)}
              onContentSizeChange={(event) =>
                setInputHeight(event.nativeEvent.contentSize.height)
              }
            />
          </ScrollView>

          {/* Engineer Comment */}
          <Text style={styles.formLabel}>Engineer Comment:</Text>
          <ScrollView
            style={{ maxHeight: 120 }}
            nestedScrollEnabled
            showsVerticalScrollIndicator
            persistentScrollbar
          >
            <TextInput
              style={[
                styles.textInput,
                { minHeight: 60, textAlignVertical: "top" },
                engineerCommentFocused ? styles.textInputFocused : null,
              ]}
              placeholder="Enter engineer's comment here..."
              value={engineerComment}
              onChangeText={setEngineerComment}
              multiline={true}
              onFocus={() => setEngineerCommentFocused(true)}
              onBlur={() => setEngineerCommentFocused(false)}
            />
          </ScrollView>

          {/* Required Material input only if 'Due to Material' is selected */}
          {pendingReason === "Due to Material" && (
            <View style={{ marginTop: 16 }}>
              {/* System Type Dropdown - only show if systemName is NOT present */}
              {!(
                getParam("systemName") && getParam("systemName").trim() !== ""
              ) && (
                  <>
                    <Text style={styles.formLabel}>System Type</Text>
                    <Pressable
                      style={styles.dropdownButton}
                      onPress={() => setShowSystemModal(true)}
                    >
                      <Text style={styles.dropdownButtonText}>
                        {selectedSystem || "Select System Type"}
                      </Text>
                      <Ionicons name="chevron-down" size={21} color="#666" />
                    </Pressable>
                    {/* System Type Modal list */}
                    <Modal
                      visible={showSystemModal}
                      transparent
                      animationType="slide"
                      onRequestClose={() => setShowSystemModal(false)}
                    >
                      <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                          <Text style={styles.modalTitle}>
                            Select System Type
                          </Text>
                          {["CCTV", "ACCESS CONTROL", "VDP", "EPABX"].map(
                            (name) => (
                              <Pressable
                                key={name}
                                style={styles.modalItem}
                                onPress={() => {
                                  setSelectedSystem(name);
                                  setShowSystemModal(false);
                                  setSelectedParts([]);
                                  setSelectedSystemName("");
                                }}
                              >
                                <Text style={styles.modalItemText}>{name}</Text>
                              </Pressable>
                            )
                          )}
                          <Pressable
                            style={styles.modalCloseButton}
                            onPress={() => setShowSystemModal(false)}
                          >
                            <Text style={styles.modalCloseText}>Close</Text>
                          </Pressable>
                        </View>
                      </View>
                    </Modal>
                  </>
                )}

              {/* If CCTV, show free-text input */}
              {selectedSystem === "CCTV" ? (
                <PrefixedMultilineInput
                  label="Required Material (CCTV)"
                  value={requiredMaterial}
                  onChange={setRequiredMaterial}
                />
              ) : selectedSystem ||
                (getParam("systemName") &&
                  getParam("systemName").trim() !== "") ? (
                <>
                  {/* System Name Dropdown - only show if modelnumber is NOT present */}
                  {!(
                    getParam("modelnumber") &&
                    getParam("modelnumber").trim() !== ""
                  ) && (
                      <>
                        <Text style={styles.formLabel}>System Name</Text>
                        <Pressable
                          style={styles.dropdownButton}
                          onPress={() => setShowSystemNameModal(true)}
                        >
                          <Text style={styles.dropdownButtonText}>
                            {selectedSystemName || "Select System Name"}
                          </Text>
                          <Ionicons name="chevron-down" size={20} color="#666" />
                        </Pressable>
                        <Modal
                          visible={showSystemNameModal}
                          transparent
                          animationType="slide"
                          onRequestClose={() => setShowSystemNameModal(false)}
                        >
                          <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                              <Text style={styles.modalTitle}>
                                Select System Name
                              </Text>
                              <ScrollView style={{ maxHeight: 500 }}>
                                {systemNamesList.map((name) => (
                                  <Pressable
                                    key={name}
                                    style={styles.modalItem}
                                    onPress={() => {
                                      setSelectedSystemName(name);
                                      setShowSystemNameModal(false);
                                      setSelectedParts([]);
                                    }}
                                  >
                                    <Text style={styles.modalItemText}>
                                      {name}
                                    </Text>
                                  </Pressable>
                                ))}
                              </ScrollView>
                              <Pressable
                                style={styles.modalCloseButton}
                                onPress={() => setShowSystemNameModal(false)}
                              >
                                <Text style={styles.modalCloseText}>Close</Text>
                              </Pressable>
                            </View>
                          </View>
                        </Modal>
                      </>
                    )}
                  {/* Parts No Dropdown (only if system name is selected) */}
                  {selectedSystemName && (
                    <>
                      <Text style={styles.formLabel}>Parts No</Text>
                      <Pressable
                        style={styles.dropdownButton}
                        onPress={() => setShowPartsNoModal(true)}
                      >
                        <Text style={styles.dropdownButtonText}>
                          {selectedParts.length > 0
                            ? selectedParts.join(", ")
                            : "Select Parts No"}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#666" />
                      </Pressable>

                      {/* Parts No Modal window */}
                      <Modal
                        visible={showPartsNoModal}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setShowPartsNoModal(false)}
                      >
                        <View style={styles.modalContainer}>
                          <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>
                              Select Parts No
                            </Text>
                            <ScrollView style={{ maxHeight: 500 }}>
                              {(groupedData[selectedSystemName] || []).map(
                                (part) => {
                                  const isSelected =
                                    selectedParts.includes(part);
                                  return (
                                    <Pressable
                                      key={part}
                                      style={styles.modalItem}
                                      onPress={() => {
                                        if (isSelected) {
                                          setSelectedParts(
                                            selectedParts.filter(
                                              (p) => p !== part
                                            )
                                          );
                                          console.log(
                                            "Part(s) selected:",
                                            selectedParts.filter(
                                              (p) => p !== part
                                            )
                                          );
                                        } else {
                                          setSelectedParts([
                                            ...selectedParts,
                                            part,
                                          ]);
                                          console.log("Part(s) selected:", [
                                            ...selectedParts,
                                            part,
                                          ]);
                                        }
                                      }}
                                    >
                                      <View
                                        style={{
                                          flexDirection: "row",
                                          alignItems: "center",
                                        }}
                                      >
                                        <Ionicons
                                          name={
                                            isSelected
                                              ? "checkbox"
                                              : "square-outline"
                                          }
                                          size={22}
                                          color={
                                            isSelected ? "#1a73e8" : "#666"
                                          }
                                          style={{ marginRight: 10 }}
                                        />
                                        <Text
                                          style={{
                                            fontSize: 16,
                                            color: "#333",
                                          }}
                                        >
                                          {part}
                                        </Text>
                                      </View>
                                    </Pressable>
                                  );
                                }
                              )}
                            </ScrollView>
                            <Pressable
                              style={styles.modalCloseButton}
                              onPress={() => {
                                setShowPartsNoModal(false);
                                setRequiredMaterial(selectedParts.join(", "));
                              }}
                            >
                              <Text style={styles.modalCloseText}>Done</Text>
                            </Pressable>
                          </View>
                        </View>
                      </Modal>
                      {/* Power Supply Model No Dropdown (only if system and part are selected) */}
                      {selectedParts.length >= 0 && (
                        <>
                          <Text style={styles.formLabel}>
                            Power Supply Model No
                          </Text>
                          <Pressable
                            style={styles.dropdownButton}
                            onPress={() => setShowPowerSupplyModal(true)}
                          >
                            <Text style={styles.dropdownButtonText}>
                              {selectedPowerSupplyModels.length > 0
                                ? selectedPowerSupplyModels.join(", ")
                                : "Select Power Supply "}
                            </Text>
                            <Ionicons
                              name="chevron-down"
                              size={20}
                              color="#666"
                            />
                          </Pressable>
                          <Modal
                            visible={showPowerSupplyModal}
                            transparent
                            animationType="slide"
                            onRequestClose={() =>
                              setShowPowerSupplyModal(false)
                            }
                          >
                            <View style={styles.modalContainer}>
                              <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>
                                  Power Supply Model No
                                </Text>
                                <ScrollView style={{ maxHeight: 500 }}>
                                  {powerSupplyData.map((model) => {
                                    const isSelected =
                                      selectedPowerSupplyModels.includes(model);
                                    return (
                                      <Pressable
                                        key={model}
                                        style={styles.modalItem}
                                        onPress={() => {
                                          if (isSelected) {
                                            setSelectedPowerSupplyModels(
                                              selectedPowerSupplyModels.filter(
                                                (m) => m !== model
                                              )
                                            );
                                            console.log(
                                              "Power Supply Model(s) selected:",
                                              selectedPowerSupplyModels.filter(
                                                (m) => m !== model
                                              )
                                            );
                                          } else {
                                            setSelectedPowerSupplyModels([
                                              ...selectedPowerSupplyModels,
                                              model,
                                            ]);
                                            console.log(
                                              "Power Supply Model(s) selected:",
                                              [
                                                ...selectedPowerSupplyModels,
                                                model,
                                              ]
                                            );
                                          }
                                        }}
                                      >
                                        <View
                                          style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                          }}
                                        >
                                          <Ionicons
                                            name={
                                              isSelected
                                                ? "checkbox"
                                                : "square-outline"
                                            }
                                            size={22}
                                            color={
                                              isSelected ? "#1a73e8" : "#666"
                                            }
                                            style={{ marginRight: 10 }}
                                          />
                                          <Text
                                            style={{
                                              fontSize: 16,
                                              color: "#333",
                                            }}
                                          >
                                            {model}
                                          </Text>
                                        </View>
                                      </Pressable>
                                    );
                                  })}
                                </ScrollView>
                                <Pressable
                                  style={styles.modalCloseButton}
                                  onPress={() => setShowPowerSupplyModal(false)}
                                >
                                  <Text style={styles.modalCloseText}>
                                    Done
                                  </Text>
                                </Pressable>
                              </View>
                            </View>
                          </Modal>
                        </>
                      )}
                    </>
                  )}
                </>
              ) : null}
            </View>
          )}

          {/* Customer Signature */}
          <Text style={styles.formLabel}>Customer Signature:</Text>
          <Pressable style={styles.signatureBox} onPress={() => openSignaturePad('customer')}>
            {customerSignature ? (
              <View style={styles.signaturePreviewContainer}>
                <Image
                  source={{ uri: customerSignature }}
                  style={styles.signaturePreviewImage}
                  resizeMode="contain"
                />
                <Text style={styles.signatureText}>Signature Saved ✓</Text>
              </View>
            ) : (
              <Text style={styles.signaturePlaceholder}>
                Tap to add signature
              </Text>
            )}
          </Pressable>

          {/* Engineer Signature */}
          <Text style={styles.formLabel}>Engineer Signature:</Text>
          <Pressable style={styles.signatureBox} onPress={() => openSignaturePad('engineer')}>
            {engineerSignature ? (
              <View style={styles.signaturePreviewContainer}>
                <Image
                  source={{ uri: engineerSignature }}
                  style={styles.signaturePreviewImage}
                  resizeMode="contain"
                />
                <Text style={styles.signatureText}>Signature Saved ✓</Text>
              </View>
            ) : (
              <Text style={styles.signaturePlaceholder}>
                Tap to add signature
              </Text>
            )}
          </Pressable>

          {/* Status Dropdown */}
          <Text style={styles.formLabel}>Status:</Text>
          <Pressable
            style={[
              styles.dropdownButton,
              hasSubmitAttempt && !workStatus ? styles.inputError : null,
            ]}
            onPress={() => setShowStatusModal(true)}
          >
            <Text style={styles.dropdownButtonText}>
              {workStatus === "Pending"
                ? pendingReason
                  ? `Pending: ${pendingReason}`
                  : "Pending: Select Reason"
                : workStatus || "Select Work Status"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </Pressable>
          {hasSubmitAttempt && !workStatus && (
            <Text style={styles.errorText}>Please select a work status</Text>
          )}
          {hasSubmitAttempt && workStatus === "Pending" && !pendingReason && (
            <Text style={styles.errorText}>Please select a pending reason</Text>
          )}

          {/* Combined Modal for Status and Pending Reason */}
          <Modal
            visible={showStatusModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowStatusModal(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                {!showPendingReasonModal ? (
                  <>
                    <Text style={styles.modalTitle}>Select Work Status</Text>
                    {["Completed", "Pending"].map((status) => (
                      <Pressable
                        key={status}
                        style={styles.modalItem}
                        onPress={() => {
                          setWorkStatus(status);
                          if (status === "Pending") {
                            fetchPendingReasons();
                            setShowPendingReasonModal(true);
                          } else {
                            setPendingReason("");
                            setShowStatusModal(false);
                          }
                        }}
                      >
                        <Text style={styles.modalItemText}>{status}</Text>
                      </Pressable>
                    ))}
                    <Pressable
                      style={styles.modalCloseButton}
                      onPress={() => setShowStatusModal(false)}
                    >
                      <Text style={styles.modalCloseText}>Close</Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Text style={styles.modalTitle}>Pending Reason</Text>
                    {pendingReasons.length > 0 ? (
                      pendingReasons.map((reason) => (
                        <Pressable
                          key={reason}
                          style={styles.modalItem}
                          onPress={() => {
                            setPendingReason(reason);
                            setShowPendingReasonModal(false);
                            setShowStatusModal(false);
                          }}
                        >
                          <Text style={styles.modalItemText}>{reason}</Text>
                        </Pressable>
                      ))
                    ) : (
                      <Text style={styles.modalNoDataText}>
                        Loading pending reasons...
                      </Text>
                    )}
                    <Pressable
                      style={styles.modalCloseButton}
                      onPress={() => {
                        setShowPendingReasonModal(false);
                        setShowStatusModal(false);
                      }}
                    >
                      <Text style={styles.modalCloseText}>Close</Text>
                    </Pressable>
                  </>
                )}
              </View>
            </View>
          </Modal>

          <View style={styles.buttonstyleforpreviewsubmit}>
            {/* Preview Button */}
            <Pressable
              style={[styles.previewButton]}
              onPress={() => setShowPreviewModal(true)}
              disabled={isSubmitting}
            >
              <Ionicons
                name="eye-outline"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.previewButtonText}>PDF</Text>
            </Pressable>

            <Pressable
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <View style={styles.submitButtonContent}>
                  <ActivityIndicator
                    color="#fff"
                    size="small"
                    style={styles.submitButtonSpinner}
                  />
                  <Text style={styles.submitButtonText}>Submitting...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* Customer Signature Pad Modal */}
        <Modal
          visible={showSignaturePad}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSignaturePad(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.signatureModalContent}>
              <Text style={styles.modalTitle}>Customer Signature</Text>
              <ViewShot
                ref={signatureRef}
                style={styles.signaturePad}
                options={{ format: "jpg", quality: 0.9, result: "data-uri" }}
              >
                <View
                  ref={signatureBgRef}
                  style={styles.signatureBackground}
                  onLayout={updatePadLayout}
                >
                  <Svg
                    height={padLayout.height}
                    width={padLayout.width}
                    viewBox={`0 0 ${padLayout.width} ${padLayout.height}`}
                  >
                    <G>
                      {/* Draw all saved paths */}
                      {paths.map((path, index) => (
                        <Path
                          key={`path-${index}`}
                          d={path}
                          stroke="black"
                          strokeWidth={2}
                          fill="none"
                        />
                      ))}

                      {/* Draw current path */}
                      {currentPath ? (
                        <Path
                          d={currentPath}
                          stroke="black"
                          strokeWidth={2}
                          fill="none"
                        />
                      ) : null}
                    </G>
                  </Svg>
                </View>
              </ViewShot>

              {/* Touch handler overlay for signature pad */}
              <View
                style={[styles.signatureOverlay]}
                {...panResponder.panHandlers}
              />

              <View style={styles.signatureButtonsSmall}>
                <TouchableOpacity
                  style={styles.signatureButtonSmall}
                  onPress={clearSignature}
                >
                  <Text style={styles.signatureButtonTextSmall}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.signatureButtonSmall,
                    styles.signatureButtonPrimarySmall,
                  ]}
                  onPress={saveSignature}
                >
                  <Text
                    style={[styles.signatureButtonTextSmall, { color: "#fff" }]}
                  >
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Engineer Signature Pad Modal */}
        <Modal
          visible={showEngineerSignaturePad}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowEngineerSignaturePad(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.signatureModalContent}>
              <Text style={styles.modalTitle}>Engineer Signature</Text>
              <ViewShot
                ref={signatureRef}
                style={styles.signaturePad}
                options={{ format: "jpg", quality: 0.9, result: "data-uri" }}
              >
                <View
                  ref={signatureBgRef}
                  style={styles.signatureBackground}
                  onLayout={updatePadLayout}
                >
                  <Svg
                    height={padLayout.height}
                    width={padLayout.width}
                    viewBox={`0 0 ${padLayout.width} ${padLayout.height}`}
                  >
                    <G>
                      {/* Draw all saved paths */}
                      {paths.map((path, index) => (
                        <Path
                          key={`path-${index}`}
                          d={path}
                          stroke="black"
                          strokeWidth={2}
                          fill="none"
                        />
                      ))}

                      {/* Draw current path */}
                      {currentPath ? (
                        <Path
                          d={currentPath}
                          stroke="black"
                          strokeWidth={2}
                          fill="none"
                        />
                      ) : null}
                    </G>
                  </Svg>
                </View>
              </ViewShot>

              {/* Touch handler overlay for signature pad */}
              <View
                style={[styles.signatureOverlay]}
                {...panResponder.panHandlers}
              />

              <View style={styles.signatureButtonsSmall}>
                <TouchableOpacity
                  style={styles.signatureButtonSmall}
                  onPress={clearSignature}
                >
                  <Text style={styles.signatureButtonTextSmall}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.signatureButtonSmall,
                    styles.signatureButtonPrimarySmall,
                  ]}
                  onPress={saveSignature}
                >
                  <Text
                    style={[styles.signatureButtonTextSmall, { color: "#fff" }]}
                  >
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        {/* Loading overlay */}
        {isSubmitting && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#1976D2" />
          </View>
        )}

        <SimplePreviewModal
          visible={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          formData={{
            complaintNo: getParam("complaintNo"),
            clientName: getParam("clientName"),
            workStatus,
            remark,
            faultReported: getParam("S_SERVDT"),
            typeOfCall: getParam("S_TASK_TYPE"),
            callAttendedDate,
            callAttendedTime,
            callCompletedDate,
            callCompletedTime,
            partReplaced,
            causeProblem,
            diagnosis,
            materialTakenOut,
            customerComment,
            customerSignature,
            systemName: getParam("SYSTEM_NAME"),
            assignDate: getParam("S_assigndate"),
            location: getParam("location"),
            taskType: getParam("S_TASK_TYPE"),
            status: getParam("status"),
            S_SERVDT: getParam("S_SERVDT"),
            S_assignedengg: getParam("S_assignedengg"),
            pendingReason: workStatus === "Pending" ? pendingReason : "",
            submittedAt: new Date().toISOString(),
            engineerComment,
            engineerSignature,
            material: getMaterialSummary(),
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FB",
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: "4%", // responsive horizontal padding
    marginTop: 0,
  },
  header: {
    backgroundColor: "#1a73e8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 5,
    borderRadius: 5,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  shareButton: {
    padding: 8,
  },
  content: {
    padding: 16,
  },
  complaintNoContainer: {
    backgroundColor: "#0066CC",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  complaintNo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "Roboto",
    borderWidth: 2,
    alignContent: "center",
    justifyContent: "center",
    borderColor: "#1976D2",
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
  },
  infoSectionBox: {
    backgroundColor: "#F0F6FF", // very light blue
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#1976D2",
    padding: 20,
    marginBottom: 0,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginHorizontal: "2%", // responsive card margin
  },
  sectionTitle: {
    fontSize: 18, // larger
    fontWeight: "bold",
    marginBottom: 12,
    color: "#1976D2",
    fontFamily: "Roboto",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    width: "40%",
    fontWeight: "600",
    color: "#555",
    fontFamily: "Roboto",
  },
  value: {
    flex: 1,
    color: "#333",
    fontFamily: "Roboto",
  },
  formSectionBox: {
    backgroundColor: "#F0F6FF",
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#1976D2",
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginHorizontal: "2%", // responsive card margin
  },
  formLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    color: "#1976D2",
    marginTop: 0, // ensure no extra top margin
    fontFamily: "Roboto",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingLeft: 10,
    backgroundColor: "#FAFAFA",
    color: "#333",
    fontSize: 15,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  textInput2: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingLeft: 10,
    backgroundColor: "#FAFAFA",
    color: "#333",
    fontSize: 15,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
    textAlignVertical: "top",
  },
  textInputFocused: {
    borderColor: "#1976D2",
    shadowColor: "#1976D2",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  helperText: {
    fontSize: 12,
    color: "#888",
    marginTop: -12,
    marginBottom: 12,
    fontFamily: "Roboto",
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16, // uniform margin for dropdowns
  },
  dropdownButtonText: {
    color: "#555",
    fontFamily: "Roboto",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
    fontFamily: "Roboto",
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalItemText: {
    fontSize: 16,
    color: "#333",
    fontFamily: "Roboto",
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
  },
  previewButton: {
    backgroundColor: "#1976D2",

    borderColor: "#1976D2",
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    flexDirection: "row",
    justifyContent: "center",

    marginRight: 8,
  },
  previewButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    fontFamily: "Roboto",
  },
  submitButton: {
    backgroundColor: "#1976D2",
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    flex: 1,
    marginLeft: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#1a73e8aa",
    opacity: 0.8,
  },
  submitButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonSpinner: {
    marginRight: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    fontFamily: "Roboto",
  },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dateTimeInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
    flex: 1,
    marginBottom: 16, // uniform margin for date/time fields
  },
  inputError: {
    borderColor: "#E53935",
    borderWidth: 1.5,
  },
  errorText: {
    color: "red",
    marginTop: -12,
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  formatModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: "80%",
    maxWidth: 400,
  },
  formatModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
  },
  formatOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    marginBottom: 10,
  },
  formatOptionSelected: {
    backgroundColor: "#e8eaf6",
    borderColor: "#3f51b5",
  },
  formatOptionText: {
    fontSize: 16,
    color: "#333",
  },
  formatOptionTextSelected: {
    fontWeight: "bold",
    color: "#1a237e",
  },
  formatButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  formatCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  formatCancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#616161",
  },
  formatSubmitButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#1a237e",
    borderRadius: 8,
    alignItems: "center",
  },
  formatSubmitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  signatureBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
    height: 110, // fixed height
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  signatureText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
  },
  signaturePlaceholder: {
    color: "#666",
    fontSize: 14,
  },
  signatureModalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
  },
  signaturePad: {
    height: 200,
    width: "100%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginVertical: 20,
    overflow: "hidden",
  },
  signatureBackground: {
    backgroundColor: "#fff",
    height: "100%",
    width: "100%",
  },
  signatureOverlay: {
    position: "absolute",
    top: 95,
    left: 10,
    right: 20,
    height: 200,
    backgroundColor: "transparent",
  },
  signatureButtonsSmall: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  signatureButtonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 8,
  },
  signatureButtonPrimarySmall: {
    backgroundColor: "#1a73e8",
    borderColor: "#1a73e8",
  },
  signatureButtonTextSmall: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  signaturePreviewContainer: {
    width: "100%",
    height: 80, // fixed preview height
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  signaturePreviewImage: {
    width: "100%",
    height: 80, // fixed image height
  },
  pickerContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: "70%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pickerHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "column",
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  pickerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerActionButton: {
    padding: 8,
  },
  pickerContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
  },
  picker: {
    flex: 1,
    height: 200,
  },
  pickerCancelText: {
    color: "#666",
    fontSize: 16,
  },
  pickerDoneText: {
    color: "#1a73e8",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalNoDataText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    padding: 15,
  },
  dateTimeGroup: {
    marginBottom: 16, // ensure even spacing between date/time groups
  },
  dateTimeInputGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateInput: {
    flex: 1,
    marginRight: 8,
  },
  timeInput: {
    flex: 0.7,
  },
  dateTimeText: {
    marginLeft: 10,
    color: "#333",
  },
  timePickerContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    height: 300,
  },
  timePickerColumn: {
    flex: 1,
    alignItems: "center",
  },
  timePickerLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  timePickerScroll: {
    width: "100%",
  },
  timePickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  timePickerItemSelected: {
    backgroundColor: "#e8eaf6",
    borderRadius: 8,
  },
  timePickerItemText: {
    fontSize: 16,
    color: "#333",
  },
  timePickerItemTextSelected: {
    color: "#1a73e8",
    fontWeight: "bold",
  },
  ampmContainer: {
    flexDirection: "column",
    justifyContent: "center",
    marginBottom: 10,
    padding: 10,
    gap: 10,
  },
  ampmButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: "#f5f5f5",
  },
  ampmButtonSelected: {
    backgroundColor: "#1a73e8",
  },
  ampmButtonText: {
    fontSize: 16,
    color: "#333",
  },
  ampmButtonTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  calendarContainer: {
    padding: 20,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  calendarArrow: {
    padding: 8,
  },
  calendarMonthYear: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  calendarWeekDays: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  calendarWeekDay: {
    width: 40,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  calendarDays: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  calendarDay: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    margin: 2,
  },
  calendarDaySelected: {
    backgroundColor: "rgba(26, 115, 232, 0.5)",
    borderRadius: 20,
  },
  calendarDayToday: {
    borderWidth: 1,
    borderColor: "#1a73e8",
    borderRadius: 20,
  },
  calendarDayEmpty: {
    width: 40,
    height: 40,
    margin: 2,
  },
  calendarDayText: {
    fontSize: 16,
    color: "#333",
  },
  calendarDayTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  calendarDayTextToday: {
    color: "#1a73e8",
    fontWeight: "bold",
  },
  divider: {
    height: 2,
    backgroundColor: "#E0E7EF",
    marginVertical: 10,
    borderRadius: 1,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.15)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },

  buttonstyleforpreviewsubmit: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
});
