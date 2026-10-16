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
  KeyboardAvoidingView,
  Animated,
} from "react-native";
import PrefixedMultilineInput from "./PrefixedMultilineInput";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { generatePdfFromHtml } from "../src/utils/documentGenerator";
import { createComplaintReportTemplate } from "../src/utils/complaintReportTemplate";
import { rmacomplaintReportTemplate } from "../src/utils/RMA/rmacomplaintReportTemplate";
import uploadPDFToCloudinary from "../src/utils/cloudinaryUpload";
import Svg, { Path, G } from "react-native-svg";
import ViewShot from "react-native-view-shot";
import * as ScreenOrientation from "expo-screen-orientation";
import { Ionicons } from "@expo/vector-icons";
import { submitComplaintUpdate } from "../src/utils/submitComplaintUpdate";
import { submitRMAcomplaintUpdate } from "../src/utils/RMA/submitRMAcomplaintUpdate";
import DropDownPicker from "react-native-dropdown-picker";
import { getEpbaxData, getEpbaxAndPowerSupplyData } from "./componenet/Epbax";
import { getAccessControlData } from "./componenet/AccessControl";
import { getVpdDdlData } from "./componenet/VpdDdl";
import SimplePreviewModal from "./componenet/SimplePreviewModal";
import SimplePreviewRmaModal from "./componenet/SimplePreviewRmaModal";
import ReadMoreText from "./componenet/ReadMoreText";
import { getHeaderImageDataUri } from "../src/utils/getHeaderImageDataUri";
import { getHeaderImageDataUri as getHeaderImageDataUriRma } from "../src/utils/RMA/getHeaderImageDataUri";
import { LinearGradient } from "expo-linear-gradient";

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

  // Debug: Log the problematic parameters immediately
  // console.log("🔍 IMMEDIATE DEBUG - SystemName:", getParam("SystemName"));
  // console.log("🔍 IMMEDIATE DEBUG - COMP_TYPE:", getParam("COMP_TYPE"));
  // console.log("🔍 IMMEDIATE DEBUG - All params:", params);

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
  const [showEngineerSignaturePad, setShowEngineerSignaturePad] =
    useState(false);
  const [currentSignatureType, setCurrentSignatureType] = useState<
    "customer" | "engineer"
  >("customer");
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
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [systemStatus, setSystemStatus] = useState("");
  const [showSystemStatusModal, setShowSystemStatusModal] = useState(false);
  const [showSystemName, setShowSystemName] = useState(false);
  const [showUpdateEngineerModal, setShowUpdateEngineerModal] = useState(false);
  const [attendingengineer, setAttendingengineer] = useState("");
  const [assignedengineer, setAssignedengineer] = useState("");
  const [engineerUpdateBy, setEngineerUpdateBy] = useState("");
  const [rnaForm, setRnaForm] = useState('');
  const [rnaOpen, setRnaOpen] = useState(false);
  const [showRmaModal, setShowRmaModal] = useState(false);
  const [rnaModalVisible, setRnaModalVisible] = useState(false);
  const [rnaFormSubmitted, setRnaFormSubmitted] = useState(false);
  const [showRmaErrorModal, setShowRmaErrorModal] = useState(false);

  // ── RMA Success Toast ──────────────────────────────────────────────────
  const [rmaToastMsg, setRmaToastMsg] = useState({
    submitted: "",
    written: "",
    duplicates: "",
    totalItems: "",
    reason: "",
  });
  const rmaToastAnim = useRef(new Animated.Value(100)).current; // starts off-screen (bottom)
  const rmaToastVisible = useRef(false);

  const showRmaToast = (
    submitted: string,
    written: string,
    duplicates: string = "",
    totalItems: string = "",
    reason: string = ""
  ) => {
    if (rmaToastVisible.current) return;
    rmaToastVisible.current = true;
    setRmaToastMsg({ submitted, written, duplicates, totalItems, reason });
    Animated.sequence([
      Animated.spring(rmaToastAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 8,
      }),
      Animated.delay(4000),
      Animated.timing(rmaToastAnim, {
        toValue: 120,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start(() => {
      rmaToastVisible.current = false;
    });
  };
  const [rnaRows, setRnarows] = useState([
    {
      Sr: '1',
      Model: '',
      Serial_No: '',
      Reason_for_RMA_Fault: '',
    }
  ])

  const normalizeRnaRows = (rows: Array<{ Sr?: string; Model: string; Serial_No: string; Reason_for_RMA_Fault: string }>) =>
    rows.map((row, index) => ({
      ...row,
      Sr: String(index + 1),
    }));

  //add the row
  const addRow = () => {
    setRnarows((prevRows) =>
      normalizeRnaRows([
        ...prevRows,
        {
          Sr: '',
          Model: '',
          Serial_No: '',
          Reason_for_RMA_Fault: '',
        },
      ])
    );
  }

  // update the Row;
  const updateRow = (
    index: number,
    field: 'Model' | 'Serial_No' | 'Reason_for_RMA_Fault',
    value: string
  ) => {
    const newRows = [...rnaRows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRnarows(normalizeRnaRows(newRows));
  }

  const isRnaRowComplete = (row: {
    Model: string;
    Reason_for_RMA_Fault: string;
  }) => {
    return [row.Model, row.Reason_for_RMA_Fault].every(
      (value) => value?.trim() !== ""
    );
  };

  const canSubmitRnaForm = () => {
    return rnaRows.length > 0 && rnaRows.every(isRnaRowComplete);
  };

  const handleRnaFormSave = () => {
    setRnaFormSubmitted(true);
    if (!canSubmitRnaForm()) {
      Alert.alert("Error", "Please complete all RMA fields before saving.");
      return;
    }
    setRnaModalVisible(false);
  };

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
    const paramSystemName = getParam("SystemName");
    console.log(' Debug, checking thesystem, ', paramSystemName)
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

  // assign engineer list

  const engineerlist = (S_assignedengg: string) =>
    S_assignedengg
      ? S_assignedengg.split(",")
        .map((e) => e.trim())
        .filter(Boolean)
      : [];

  // Clear signature
  const clearSignature = () => {
    setPaths([]);
    setCurrentPath("");
    if (currentSignatureType === "customer") {
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

          if (currentSignatureType === "customer") {
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
  const openSignaturePad = (type: "customer" | "engineer" = "customer") => {
    setCurrentSignatureType(type);

    // Always clear paths when opening signature pad
    setPaths([]);
    setCurrentPath("");

    if (type === "customer") {
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

  const handleFinalSubmit = async () => {
    console.log("🚩 CHECKPOINT 1: Starting form submission process");

    const headerImageDataUri = await getHeaderImageDataUri();
    const formData = {
      complaintNo: getParam("complaintNo"),
      clientName: getParam("clientName"),
      faultReported: getParam("S_SERVDT"),
      typeOfCall: getParam("S_TASK_TYPE"),
      systemName: getParam("SYSTEM_NAME"),
      SystemName: getParam("SystemName"),
      assignDate: getParam("S_assigndate"),
      location: getParam("location"),
      taskType: getParam("S_TASK_TYPE"),
      status: getParam("status"),
      S_SERVDT: getParam("S_SERVDT"),
      S_assignedengg: getParam("S_assignedengg"),
      COMP_TYPE: getParam("COMP_TYPE"),
      S_REMARK1: getParam("S_REMARK1"),
      S_REMARK2: getParam("S_REMARK2"),
      modelnumber: getParam("modelnumber"),
      S_UPDT: getParam("S_UPDT"),
      COMP_ADD2: getParam("COMP_ADD2"),
      COMP_ADD3: getParam("COMP_ADD3"),
      COMP_TEL: getParam("COMP_TEL"),
      COMP_ADD1: getParam("COMP_ADD1"),
      AMC_Status: getParam("AMC_Status"),
      workStatus,
      remark,
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
      mailaddcallrpt: getParam("mailaddcallrpt"),
      pendingReason: workStatus === "Pending" ? pendingReason : "",
      submittedAt: new Date().toISOString(),
      engineerComment,
      customerName,
      customerContact,
      assignedengineer: assignedengineer || "",
      engineerUpdateBy: engineerUpdateBy || "",
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
      attendingengineer: attendingengineer || "",
    };

    const formData1 = {
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
      SystemName: getParam("SystemName"),
      assignDate: getParam("S_assigndate"),
      location: getParam("location"),
      taskType: getParam("S_TASK_TYPE"),
      status: getParam("status"),
      S_SERVDT: getParam("S_SERVDT"),
      S_assignedengg: getParam("S_assignedengg"),
      COMP_TYPE: getParam("COMP_TYPE"),
      AMC_Status: getParam("AMC_Status"),
      pendingReason: workStatus === "Pending" ? pendingReason : "",
      submittedAt: new Date().toISOString(),
      engineerComment,
      material: getMaterialSummary(),
      customerName,
      customerContact,
      attendingengineer: attendingengineer || "",
      assignedengineer: assignedengineer || "",
      engineerUpdateBy: engineerUpdateBy || "",
      systemStatus,
      items: rnaRows.map((row, index) => ({
        modelNo: row.Model,
        serialNo: row.Serial_No || (index + 1).toString(),
        reason: row.Reason_for_RMA_Fault,
      })),
    };


    console.log("🚩 CHECKPOINT 2: Form data prepared, beginning PDF generation");

    // Generate document from form data with the specialized template
    try {
      const templateData = {
        ...formData,
        headerImageDataUri,
        SystemName: formData.SystemName || getParam("SystemName"),
        AMC_Status: formData.AMC_Status || getParam("AMC_Status"),
        COMP_TYPE: formData.COMP_TYPE || getParam("COMP_TYPE"),
      };

      const htmlContent1 = createComplaintReportTemplate(templateData);
      const fileName1 = `complaint_${getParam("complaintNo")}_report_${Date.now()}`;
      const shouldCreateRma = rnaForm === "Yes";

      const complaintPdfResult = await generatePdfFromHtml(htmlContent1, fileName1, { share: true });
      if (!complaintPdfResult.success || !complaintPdfResult.localUri) {
        throw new Error("Failed to generate complaint PDF");
      }

      let rmaSecureUrl: string | null = null;
      let complaintSecureUrl: string;

      try {
        console.log("🚩 CHECKPOINT 5: Starting Cloudinary upload for complaint PDF");
        const complaintUploadResult = (await uploadPDFToCloudinary(
          complaintPdfResult.localUri
        )) as UploadResult;
        complaintSecureUrl = complaintUploadResult.secure_url;
        console.log("Complaint upload result:", complaintUploadResult);
        console.log("Complaint Secure URL:", complaintSecureUrl.substring(0, 50) + "...");

        if (shouldCreateRma) {
          const headerImageDataUriRma = await getHeaderImageDataUriRma();
          const templateData1 = {
            ...formData1,
            headerImageDataUri: headerImageDataUriRma || headerImageDataUri,
          };
          const rmaHtmlContent = rmacomplaintReportTemplate(templateData1);
          const rmaFileName = `rma_${getParam("complaintNo")}_report_${Date.now()}`;

          const rmaPdfResult = await generatePdfFromHtml(rmaHtmlContent, rmaFileName, { share: false });
          if (!rmaPdfResult.success || !rmaPdfResult.localUri) {
            throw new Error("Failed to generate RMA PDF");
          }

          const rmaUploadResult = (await uploadPDFToCloudinary(
            rmaPdfResult.localUri
          )) as UploadResult;
          rmaSecureUrl = rmaUploadResult.secure_url;
          console.log("RMA upload result:", rmaUploadResult);
          console.log("RMA Secure URL:", rmaSecureUrl.substring(0, 50) + "...");
        }

        console.log("🚩 CHECKPOINT 6: PDF upload complete");

        let rmaResponseJson1: any = null;
        if (shouldCreateRma) {
          console.log('🚩 CHECKPOINT 6.1: Preparing to submit RMA update with the following data:', getParam('SystemName'), getParam('customer'), getParam('complaintNo'), getRMAItems());

          try {
            // Call the submitRMAcomplaintUpdate function to submit RMA update
            rmaResponseJson1 = await submitRMAcomplaintUpdate({
              enggname: getParam("S_assignedengg"),
              secureUrl: rmaSecureUrl!,
              customer: getParam("customer"),
              complaintNo: getParam("complaintNo"),
              items: getRMAItems(),
              product: getParam("SystemName"),
            });
          } catch (rmaNetworkError) {
            console.error("RMA submission network/request failed:", rmaNetworkError);
            setShowRmaErrorModal(true);
            return; // ⛔ HALT: Stop entire handleFinalSubmit on RMA network error
          }

          console.log("RMA submission response:", rmaResponseJson1);

          // Verify RMA submission was strictly successful
          const statusStr = String(rmaResponseJson1?.status ?? "").toLowerCase().trim();

          let reasonFailed = false;
          if (rmaResponseJson1?.reason !== undefined && rmaResponseJson1?.reason !== null && rmaResponseJson1?.reason !== "") {
            const reasonrpart = String(rmaResponseJson1.reason).split(',');
            const reasonresponse = Number(reasonrpart[0]?.trim());
            if (!isNaN(reasonresponse) && reasonresponse === 0) {
              reasonFailed = true;
            }
          }

          // Whitelist check: If RMA did not return "success" or reason failed or response is empty, HALT EVERYTHING
          if (!rmaResponseJson1 || statusStr !== "success" || reasonFailed) {
            console.warn("RMA submission failed. Halting entire submission process:", rmaResponseJson1);
            setShowRmaErrorModal(true);
            return; // ⛔ HALT: Stop handleFinalSubmit completely! Second API will NOT be called.
          }

          // ✅ RMA non-blocking toast: Use direct API fields when available;
          // fall back to splitting reason string for backward compatibility.
          const reasonParts = String(rmaResponseJson1.reason ?? "").split(",");
          const toastSubmitted =
            rmaResponseJson1.totalSubmitted !== undefined
              ? String(rmaResponseJson1.totalSubmitted)
              : reasonParts[0]?.trim() ?? "?";
          const toastWritten =
            rmaResponseJson1.inserted !== undefined
              ? String(rmaResponseJson1.inserted)
              : reasonParts[1]?.trim() ?? "?";
          const toastDuplicates =
            rmaResponseJson1.duplicates !== undefined
              ? String(rmaResponseJson1.duplicates)
              : "";
          const toastTotalItems =
            rmaResponseJson1.totalItemsInDatabase !== undefined
              ? String(rmaResponseJson1.totalItemsInDatabase)
              : "";
          const toastReason = String(rmaResponseJson1.reason ?? "");
          showRmaToast(toastSubmitted, toastWritten, toastDuplicates, toastTotalItems, toastReason);
        }

        // Call the submitComplaintUpdate function to update the complaint status
        console.log(
          "🚩 CHECKPOINT 7: Starting server API call with form data"
        );

        const responseJson = await submitComplaintUpdate({
          enggname: getParam("S_assignedengg"),
          remark: `D-${diagnosis} E-${engineerComment}`,
          report: complaintSecureUrl,
          status: workStatus === "Completed" ? "1" : "0",
          pendingreason: workStatus === "Completed" ? "NULL" : pendingReason,
          complaintNo: getParam("complaintNo"),
          material: getMaterialSummary(),
        });

        const checkresponse = JSON.stringify(responseJson)

        console.log(
          "🚩 CHECKPOINT 8: Server response received:", checkresponse
        );

        if (responseJson.status === "success") {
          console.log("🚩 CHECKPOINT 9: Server update SUCCESSFUL");

          // Check if email should be sent
          const mailAddress = getParam("mailaddcallrpt");
          if (mailAddress && mailAddress.trim() !== "") {
            console.log("🚩 CHECKPOINT 9.1: Sending email with PDF attachment");
            try {
              const { downloadPdfFromUrl, sendEmailWithAttachment } =
                await import("../engineer/componenet/EmailSender");

              // Step 1: Download PDF
              const localUri = await downloadPdfFromUrl({
                secureUrl: complaintSecureUrl,
                complaintNo: getParam("complaintNo"),
              });

              if (localUri) {
                // Step 2: Send email with attachment
                const emailSent = await sendEmailWithAttachment({
                  localUri,
                  complaintNo: getParam("complaintNo"),
                  clientName: getParam("clientName"),
                  mailaddcallrpt: mailAddress,
                });

                if (emailSent) {
                  console.log("✅ Email sent successfully");
                } else {
                  console.log("⚠️ Email sending failed");
                }
              } else {
                console.log("⚠️ PDF download failed");
              }
            } catch (emailError) {
              console.error("❌ Email error:", emailError);
            }
          }

          Alert.alert("Success", "Data sent successfully! Redirecting...", [
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
            responseJson.reason || "Main API failed. Please try again."
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
      console.log("🔍 Setting selectedSystemName to:", system);
      setSelectedSystemName(system);
    }
  }, [selectedSystemName, params]);

  useEffect(() => {
    if (workStatus === "Pending") {
      fetchPendingReasons();
    } else {
      setShowPendingReason(false);
    }
  }, [workStatus]);



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
    // console.log("Material Summary coming from getMaterialSummary:", summary);
    return summary;
  };

  const getRMAItems = () =>
    rnaRows.map((row, index) => ({
      srNo: row.Sr || String(index + 1),
      jobNo: getParam("complaintNo") || "",
      modelNo: row.Model || "",
      serialNo: row.Serial_No && row.Serial_No.trim() !== "" ? row.Serial_No : String(index + 1),
      reason: row.Reason_for_RMA_Fault || "",
    }));

  // Where you load params, after initializing useState:
  useEffect(() => {
    const engStr = getParam("S_assignedengg");
    setAssignedengineer(engStr);
  }, []);

  return (
    <LinearGradient colors={["#0f2952", "#1a4a8a", "#2d6cc0"]} style={styles.gradient}>
      {/* Header bar — sits on the gradient */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.pageTitle}>Complaint Details</Text>
        <View style={styles.complaintChip}>
          <Text style={styles.complaintChipText} numberOfLines={1}>
            {getParam("complaintNo")}
          </Text>
        </View>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.sheet}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ overflow: 'visible' }}
            contentContainerStyle={{ paddingBottom: insets.bottom + 32, overflow: 'visible' }}
          >
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
                <Text style={styles.label}>Customer Name:</Text>
                <ReadMoreText
                  fieldName="Customer Name"
                  text={getParam("clientName")}
                  sliceLength={10}
                  textStyle={styles.value}
                />
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
                <ReadMoreText
                  fieldName="System Name"
                  text={Array.from(new Set([getParam("SystemName"), getParam("SYSTEM_NAME")].filter(Boolean))).join(" , ")}
                  sliceLength={10}
                  textStyle={styles.value}
                />
              </View>
              <View style={styles.infoRow}>
                <Ionicons
                  name="briefcase-outline"
                  size={18}
                  color="#1976D2"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.label}>Complaint type:</Text>
                <ReadMoreText
                  fieldName="Complaint Type"
                  text={getParam("COMP_TYPE")}
                  sliceLength={10}
                  textStyle={styles.value}
                />
              </View>
              <View style={styles.infoRow}>
                <Ionicons
                  name="briefcase-outline"
                  size={18}
                  color="#1976D2"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.label}>System Status:</Text>
                <ReadMoreText
                  fieldName="System Status"
                  text={getParam("AMC_Status")}
                  sliceLength={10}
                  textStyle={styles.value}
                />
              </View>
              <View style={styles.infoRow}>
                <Ionicons
                  name="location-outline"
                  size={18}
                  color="#1976D2"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.label}>Address:</Text>
                <ReadMoreText
                  fieldName="Address"
                  text={getParam("location")}
                  sliceLength={10}
                  textStyle={styles.value}
                />
              </View>
              <View style={styles.infoRow}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={18}
                  color="#1976D2"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.label}>Remark1:</Text>
                <ReadMoreText
                  fieldName="Remark 1"
                  text={getParam("S_REMARK1")}
                  sliceLength={10}
                  textStyle={styles.value}
                />
              </View>
            </View>
            {/* Form Section */}
            <View style={styles.formSectionBox}>
              <Text style={styles.sectionTitle}>Update Status</Text>

              {/* Fault Reported */}
              <Text style={styles.formLabel}>Fault Reported:</Text>
              <View style={[styles.dateTimeInput]}>
                <Ionicons name="time-outline" size={18} color="#666" />
                <ReadMoreText
                  fieldName="Fault Reported"
                  text={getParam("S_SERVDT")}
                  sliceLength={10}
                  emptyText="Not available"
                  textStyle={[styles.dateTimeText, { color: "#666" }]}
                />
              </View>

              {/* Type of Call Dropdown */}
              <Text style={styles.formLabel}>Type of Call:</Text>
              <View style={[styles.dropdownButton]}>
                <ReadMoreText
                  fieldName="Type of Call"
                  text={getParam("S_TASK_TYPE")}
                  sliceLength={10}
                  emptyText="Not available"
                  textStyle={[styles.dropdownButtonText, { color: "#666" }]}
                />
              </View>

              {/* Call Attended Date and Time */}
              <View style={styles.dateTimeGroup}>
                <Text style={styles.formLabel}>Call Attended On:</Text>
                <View style={[styles.dateTimeInput]}>
                  <Ionicons name="time-outline" size={18} color="#666" />
                  <ReadMoreText
                    fieldName="Call Attended On"
                    text={getParam("S_assigndate")}
                    sliceLength={10}
                    emptyText="Not available"
                    textStyle={[styles.dateTimeText, { color: "#666" }]}
                  />
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
                <ReadMoreText
                  fieldName="Cause of Problem"
                  text={getParam("S_REMARK2")}
                  sliceLength={10}
                  emptyText="Not available"
                  textStyle={[styles.dropdownButtonText, { color: "#666" }]}
                />
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

              {/* ═══════════════════════════════════════════════════════ */}
              {/* RNA FORM — Premium Card Section                       */}
              {/* ═══════════════════════════════════════════════════════ */}
              <View style={styles.rnaFormContainer}>

                {/* Header badge + label */}
                <View style={styles.rnaHeaderRow}>
                  <View style={styles.rnaBadge}>
                    <Ionicons name="document-text-outline" size={14} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rnaHeaderTitle}>RMA Form</Text>
                    <Text style={styles.rnaHeaderSubtitle}>Return / Non-Acceptable Material</Text>
                  </View>

                  {/* Active button */}
                  {rnaForm === "Yes" && (
                    <View style={styles.rnaActivePill}>
                      <View style={styles.rnaActiveDot} />
                      <Text style={styles.rnaActivePillText}>Active</Text>
                    </View>
                  )}
                </View>

                {/* Divider */}
                <View style={styles.rnaDivider} />

                <Text style={styles.formLabel}>Do You Want to Add RMA Form?</Text>

                <View style={[styles.dropdownWrapper, Platform.OS === 'ios' ? { zIndex: 9999 } : { zIndex: 9999, elevation: 30 }]}>
                  <DropDownPicker
                    listMode="SCROLLVIEW"
                    open={rnaOpen}
                    value={rnaForm}
                    items={[
                      { label: 'Yes', value: 'Yes' },
                      { label: 'No', value: 'No' }
                    ]}
                    setValue={(callback) => {
                      const value = callback(rnaForm);
                      setRnaForm(value);
                      if (value == "Yes") {
                        setRnaModalVisible(true);
                      } else {
                        setRnaModalVisible(false);
                        setShowRmaModal(false);
                      }
                    }}
                    setOpen={setRnaOpen}
                    placeholder="Select an option"
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                    textStyle={styles.dropdownButtonText1}
                    placeholderStyle={styles.placeholderText}
                    zIndex={9999}
                    zIndexInverse={1000}
                  />
                </View>

                {/* Info banner when Yes is selected */}
                {rnaForm === "Yes" && (
                  <View style={styles.rnaInfoBanner}>
                    <Ionicons name="checkmark-circle" size={16} color="#16a34a" style={{ marginRight: 8 }} />
                    <Text style={styles.rnaInfoBannerText}>
                      RMA form activated. Tap <Text style={{ fontWeight: "800" }}>Edit Details</Text> to manage entries.
                    </Text>
                  </View>
                )}

                {/* Action row when Yes is selected */}
                {rnaForm === "Yes" && (
                  <View style={styles.rnaActionRow}>
                    {/* Edit / Re-open modal */}
                    <Pressable
                      style={({ pressed }) => [
                        styles.rnaEditBtn,
                        pressed && { opacity: 0.82, transform: [{ scale: 0.97 }] },
                      ]}
                      onPress={() => setRnaModalVisible(true)}
                    >
                      <Ionicons name="create-outline" size={16} color="#1a4a8a" style={{ marginRight: 6 }} />
                      <Text style={styles.rnaEditBtnText}>Edit Details</Text>
                    </Pressable>

                    {/* Preview button */}
                    <Pressable
                      style={({ pressed }) => [
                        styles.rnaPreviewBtn,
                        pressed && { opacity: 0.82, transform: [{ scale: 0.97 }] },
                      ]}
                      onPress={() => setShowRmaModal(true)}
                      disabled={isSubmitting}
                    >
                      <Ionicons name="eye-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                      <Text style={styles.rnaPreviewBtnText}>Preview</Text>
                    </Pressable>
                  </View>
                )}

                {/* ───  RNA MODAL ─────────────────────────────────────────── */}
                <Modal
                  animationType="slide"
                  transparent
                  visible={rnaModalVisible}
                  onRequestClose={() => setRnaModalVisible(false)}
                >
                  <View style={styles.rnaModalOverlay}>
                    <View style={styles.rnaModalSheet}>

                      {/* Modal header */}
                      <View style={styles.rnaModalHeader}>
                        <View style={styles.rnaModalHeaderLeft}>
                          <View style={styles.rnaModalIconBox}>
                            <Ionicons name="document-text" size={18} color="#fff" />
                          </View>
                          <View>
                            <Text style={styles.rnaModalTitle}>RMA Form Details</Text>
                            <Text style={styles.rnaModalSubtitle}>Fill in material return entries</Text>
                          </View>
                        </View>
                        <Pressable
                          onPress={() => setRnaModalVisible(false)}
                          style={styles.rnaModalCloseIcon}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons name="close" size={20} color="#64748b" />
                        </Pressable>
                      </View>

                      {/* Progress pill */}
                      <View style={styles.rnaProgressRow}>
                        <Ionicons name="layers-outline" size={13} color="#1a4a8a" style={{ marginRight: 4 }} />
                        <Text style={styles.rnaProgressText}>
                          {rnaRows.length} {rnaRows.length === 1 ? "entry" : "entries"} added
                        </Text>
                      </View>

                      {/* Scrollable rows */}
                      <ScrollView
                        style={{ maxHeight: 420 }}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 12 }}
                      >
                        {rnaRows.map((item, index) => (
                          <View key={index} style={styles.rnaRowCard}>

                            {/* Row header */}
                            <View style={styles.rnaRowCardHeader}>
                              <View style={styles.rnaRowBadge}>
                                <Text style={styles.rnaRowBadgeText}>{index + 1}</Text>
                              </View>
                              <Text style={styles.rnaRowCardTitle}>Material Entry #{index + 1}</Text>
                            </View>

                            {/* Fields grid */}


                            <View style={styles.rnaFieldGrid}>
                              <View style={styles.rnaFieldHalf}>
                                <Text style={styles.rnaFieldLabel}>
                                  <Ionicons name="cube-outline" size={10} /> MODEL NO
                                </Text>
                                <TextInput
                                  placeholder="e.g. MX-500"
                                  placeholderTextColor="#b0bec5"
                                  value={item.Model}
                                  onChangeText={(text) => updateRow(index, "Model", text)}
                                  style={styles.rnaTextInput}
                                />
                              </View>

                              <View style={styles.rnaFieldHalf}>
                                <Text style={styles.rnaFieldLabel}>
                                  <Ionicons name="barcode-outline" size={10} /> SERIAL NO
                                </Text>
                                <TextInput
                                  placeholder="e.g. SN-XXXX"
                                  placeholderTextColor="#b0bec5"
                                  value={item.Serial_No}
                                  onChangeText={(text) => updateRow(index, "Serial_No", text)}
                                  style={styles.rnaTextInput}
                                />
                              </View>


                            </View>
                            <View style={styles.rnaFieldHalf}>
                              <Text style={styles.rnaFieldLabel}>
                                <Ionicons name="list-outline" size={10} /> Reason for RMA Fault
                              </Text>
                              <TextInput
                                placeholder="e.g. Defective"
                                placeholderTextColor="#b0bec5"
                                value={item.Reason_for_RMA_Fault}
                                onChangeText={(text) => updateRow(index, "Reason_for_RMA_Fault", text)}
                                style={styles.rnaTextInput}
                              />
                            </View>

                            {/* Add row button — only show on last card */}
                            {index === rnaRows.length - 1 && (
                              <Pressable
                                onPress={addRow}
                                style={({ pressed }) => [
                                  styles.rnaAddRowBtn,
                                  pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
                                ]}
                              >
                                <Ionicons name="add-circle-outline" size={16} color="#1a4a8a" style={{ marginRight: 6 }} />
                                <Text style={styles.rnaAddRowBtnText}>Add Another Entry</Text>
                              </Pressable>
                            )}
                          </View>
                        ))}
                      </ScrollView>

                      {/* ── Footer: Cancel | Preview | Submit ── */}
                      <View style={styles.rnaModalFooter}>

                        {/* Cancel */}
                        <Pressable
                          onPress={() => setRnaModalVisible(false)}
                          style={({ pressed }) => [
                            styles.rnaFooterCancelBtn,
                            pressed && { opacity: 0.8 },
                          ]}
                        >
                          <Ionicons name="close-circle-outline" size={16} color="#64748b" style={{ marginRight: 4 }} />
                          <Text style={styles.rnaFooterCancelText}>Cancel</Text>
                        </Pressable>

                        {/* Preview */}
                        <Pressable
                          onPress={() => setShowRmaModal(true)}
                          disabled={isSubmitting}
                          style={({ pressed }) => [
                            styles.rnaFooterPreviewBtn,
                            pressed && { opacity: 0.82, transform: [{ scale: 0.97 }] },
                          ]}
                        >
                          <Ionicons name="eye-outline" size={16} color="#1a4a8a" style={{ marginRight: 4 }} />
                          <Text style={styles.rnaFooterPreviewText}>Preview</Text>
                        </Pressable>

                        {/* Submit */}
                        <Pressable
                          onPress={handleRnaFormSave}
                          disabled={!canSubmitRnaForm() || isSubmitting}
                          style={({ pressed }) => [
                            styles.rnaFooterSubmitBtn,
                            (pressed || !canSubmitRnaForm() || isSubmitting) && { opacity: 0.75, transform: pressed ? [{ scale: 0.97 }] : [] },
                          ]}
                        >
                          <LinearGradient
                            colors={
                              !canSubmitRnaForm() || isSubmitting
                                ? ["#94a3b8", "#94a3b8"]
                                : ["#1e40af", "#1a4a8a"]
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.rnaFooterSubmitGradient}
                          >
                            <Ionicons name="checkmark-circle-outline" size={16} color="#fff" style={{ marginRight: 4 }} />
                            <Text style={styles.rnaFooterSubmitText}>Save</Text>
                          </LinearGradient>
                        </Pressable>

                      </View>
                    </View>
                  </View>
                </Modal>

              </View>

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
                    getParam("SystemName") && getParam("SystemName").trim() !== ""
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
              <View style={styles.customersectioncontainer}>
                {/* New fields for customer name and contact */}
                <View style={{ marginBottom: 10 }}>
                  <Text style={styles.formLabel}>Customer Name</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter customer name"
                    value={customerName}
                    onChangeText={setCustomerName}
                  />
                  <Text style={styles.formLabel}>Customer Contact No.</Text>

                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter contact number"
                    value={customerContact}
                    onChangeText={setCustomerContact}
                    keyboardType="phone-pad"
                  />
                  <Text style={styles.formLabel}>Customer Signature:</Text>
                </View>
                <Pressable
                  style={styles.signatureBox}
                  onPress={() => openSignaturePad("customer")}
                >
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
              </View>

              {/* Engineer Signature */}
              <View style={styles.customersectioncontainer}>
                {/* New Engineer Signature fields */}
                <View style={{ marginBottom: 10 }}>
                  <Text style={styles.formLabel}>Update date by</Text>
                  <Pressable
                    style={styles.dropdownButton}
                    onPress={() => setShowUpdateEngineerModal(true)}
                  >
                    <Text style={styles.dropdownButtonText}>
                      {attendingengineer || "Select Engineer "}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={"#666"} />
                  </Pressable>

                  <Text style={styles.formLabel}>Engineer Signature:</Text>

                  {/* Complain attending engineer model */}

                  <Modal
                    visible={showUpdateEngineerModal}
                    transparent={true}
                    animationType={"slide"}
                    onRequestClose={() => setShowUpdateEngineerModal(false)}
                  >
                    <View style={styles.modalContainer}>
                      <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Site Engineer</Text>
                        {engineerlist(assignedengineer).map((Key) => (
                          <Pressable
                            key={Key}
                            style={[
                              styles.modalItem,
                              {
                                backgroundColor: "#f2f2f2",
                                marginVertical: 5,
                                borderRadius: 6,
                              },
                            ]}
                            onPress={() => {
                              setAttendingengineer(Key);
                              setEngineerUpdateBy(Key);
                              setShowUpdateEngineerModal(false);
                            }}
                          >
                            <Text
                              style={[
                                styles.modalItemText,
                                { padding: 8, fontSize: 16 },
                              ]}
                            >
                              {Key}
                            </Text>
                          </Pressable>
                        ))}
                        <Pressable
                          style={styles.modalCloseButton}
                          onPress={() => setShowUpdateEngineerModal(false)}
                        >
                          <Text style={styles.modalCloseText}>Close</Text>
                        </Pressable>
                      </View>
                    </View>
                  </Modal>

                  {/* system status model  */}
                  <Modal
                    visible={showSystemStatusModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowSystemStatusModal(false)}
                  >
                    <View style={styles.modalContainer}>
                      <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>System Status</Text>
                        {["AMC", "Call Basis"].map((option) => (
                          <Pressable
                            key={option}
                            style={styles.modalItem}
                            onPress={() => {
                              setSystemStatus(option);
                              setShowSystemStatusModal(false);
                            }}
                          >
                            <Text style={styles.modalItemText}>{option}</Text>
                          </Pressable>
                        ))}
                        <Pressable
                          style={styles.modalCloseButton}
                          onPress={() => setShowSystemStatusModal(false)}
                        >
                          <Text style={styles.modalCloseText}>Close</Text>
                        </Pressable>
                      </View>
                    </View>
                  </Modal>
                </View>
                <Pressable
                  style={styles.signatureBox}
                  onPress={() => openSignaturePad("engineer")}
                >
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
              </View>
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
                    color="#084088ff"
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
                  <View style={styles.closebuttoncontainer}>
                    <Text style={styles.modalTitle}>Customer Signature</Text>
                    <Pressable onPress={() => setShowSignaturePad(false)}>
                      <Ionicons name="close" size={30} color={"#1a4a8a"} />
                    </Pressable>

                  </View>
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
                  <View style={styles.closebuttoncontainer}>
                    <Text style={styles.modalTitle}>Engineer Signature</Text>
                    <Pressable onPress={() => setShowEngineerSignaturePad(false)}>
                      <Ionicons name="close" size={30} color={"#1a4a8a"} />
                    </Pressable>

                  </View>
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
                SystemName: getParam("SystemName"),
                assignDate: getParam("S_assigndate"),
                location: getParam("location"),
                taskType: getParam("S_TASK_TYPE"),
                status: getParam("status"),
                S_SERVDT: getParam("S_SERVDT"),
                S_assignedengg: getParam("S_assignedengg"),
                COMP_TYPE: getParam("COMP_TYPE"),
                AMC_Status: getParam("AMC_Status"),
                pendingReason: workStatus === "Pending" ? pendingReason : "",
                submittedAt: new Date().toISOString(),
                engineerComment,
                engineerSignature,
                material: getMaterialSummary(),
                customerName,
                customerContact,
                showUpdateEngineerModal,
                systemStatus,
                attendingengineer,
                assignedengineer,
                engineerUpdateBy,
              }}
            />

            {/* RMA FORM MODAL */}

            <SimplePreviewRmaModal
              visible={showRmaModal}
              onClose={() => setShowRmaModal(false)}
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
                SystemName: getParam("SystemName"),
                assignDate: getParam("S_assigndate"),
                location: getParam("location"),
                taskType: getParam("S_TASK_TYPE"),
                status: getParam("status"),
                S_SERVDT: getParam("S_SERVDT"),
                S_assignedengg: getParam("S_assignedengg"),
                COMP_TYPE: getParam("COMP_TYPE"),
                AMC_Status: getParam("AMC_Status"),
                pendingReason: workStatus === "Pending" ? pendingReason : "",
                submittedAt: new Date().toISOString(),
                engineerComment,
                engineerSignature,
                material: getMaterialSummary(),
                customerName,
                customerContact,
                showUpdateEngineerModal,
                systemStatus,
                attendingengineer,
                assignedengineer,
                engineerUpdateBy,
                items: rnaRows.map((row, index) => ({
                  Sr: row.Sr || String(index + 1),
                  Model: row.Model || "",
                  Serial_No: row.Serial_No && row.Serial_No.trim() !== "" ? row.Serial_No : String(index + 1),
                  Reason: row.Reason_for_RMA_Fault || "",
                })),
              }}
            />


          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* ── RMA Error Modal ─────────────────────────────────────────── */}
      <Modal
        visible={showRmaErrorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRmaErrorModal(false)}
        statusBarTranslucent
      >
        <View style={styles.rmaErrorOverlay}>
          <View style={styles.rmaErrorCard}>
            {/* Top accent bar */}
            <View style={styles.rmaErrorAccentBar} />

            {/* Icon circle */}
            <View style={styles.rmaErrorIconCircle}>
              <Ionicons name="alert-circle" size={48} color="#FF4D4F" />
            </View>

            {/* Title */}
            <Text style={styles.rmaErrorTitle}>RMA Submission Failed</Text>

            {/* Body */}
            <Text style={styles.rmaErrorBody}>
              Unable to submit the RMA request. The server did not return a
              successful response.
            </Text>

            {/* Divider */}
            <View style={styles.rmaErrorDivider} />

            {/* Support hint */}
            <View style={styles.rmaErrorHintRow}>
              <Ionicons name="headset-outline" size={18} color="#1a4a8a" />
              <Text style={styles.rmaErrorHint}>
                Please contact the developer / support team for assistance.
              </Text>
            </View>

            {/* Complaint ref */}
            <View style={styles.rmaErrorRefBox}>
              <Text style={styles.rmaErrorRefLabel}>Complaint No.</Text>
              <Text style={styles.rmaErrorRefValue}>{getParam("complaintNo")}</Text>
            </View>

            {/* Dismiss button */}
            <TouchableOpacity
              style={styles.rmaErrorDismissBtn}
              onPress={() => setShowRmaErrorModal(false)}
              activeOpacity={0.82}
            >
              <Ionicons name="close-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.rmaErrorDismissBtnText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── RMA Success Toast ─────────────────────────────────────────── */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.rmaToast,
          { transform: [{ translateY: rmaToastAnim }] },
        ]}
      >
        <View style={styles.rmaToastIconWrap}>
          <Ionicons name="checkmark-circle" size={26} color="#fff" />
        </View>
        <View style={styles.rmaToastTextWrap}>
          <Text style={styles.rmaToastTitle}>RMA Submitted Successfully</Text>
          <Text style={styles.rmaToastRow}>
            Items Submitted:{" "}
            <Text style={styles.rmaToastVal}>{rmaToastMsg.submitted}</Text>
          </Text>
          <Text style={styles.rmaToastRow}>
            Written to DB:{" "}
            <Text style={styles.rmaToastVal}>{rmaToastMsg.written}</Text>
          </Text>
          {rmaToastMsg.duplicates !== "" && (
            <Text style={styles.rmaToastRow}>
              Duplicates:{" "}
              <Text style={styles.rmaToastVal}>{rmaToastMsg.duplicates}</Text>
            </Text>
          )}
          {rmaToastMsg.totalItems !== "" && (
            <Text style={styles.rmaToastRow}>
              Total in DB:{" "}
              <Text style={styles.rmaToastVal}>{rmaToastMsg.totalItems}</Text>
            </Text>
          )}
          {rmaToastMsg.reason !== "" && (
            <Text style={[styles.rmaToastRow, { marginTop: 3, fontStyle: "italic" }]}>
              {rmaToastMsg.reason}
            </Text>
          )}
        </View>
      </Animated.View>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },

  // ── Header bar on gradient ───────────────────────────────────────
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  pageTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
  complaintChip: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    maxWidth: 140,
  },
  complaintChipText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },

  // ── White rounded sheet ──────────────────────────────────────────
  sheet: {
    flex: 1,
    backgroundColor: "#f0f4f8",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "visible",
    zIndex: 0,
  },

  container: {
    flex: 1,
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
    fontSize: 14,
    fontWeight: "700",
    color: "#1a4a8a",
    backgroundColor: "rgba(26,74,138,0.08)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 14,
    alignSelf: "flex-start",
  },
  closeButton: {
    position: 'relative',
    backgroundColor: 'grey',
    right: 5,
    top: 5,
    padding: 5,
    borderRadius: 50,
  },
  closeButtonText: {

    color: 'white',

    borderRadius: 50,
  },

  footer: {

  },
  infoSectionBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 14,
    color: "#1a4a8a",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  systemNameInfoRow: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 10,


  },
  systemNameInfoRowExpanded: {
    backgroundColor: "#F7FAFF",
    borderWidth: 1,
    borderColor: "#dee2e8",
    height: 300,

  },
  systemNameInfoRowPressed: {
    backgroundColor: "#EEF5FF",

  },
  systemNameHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 28,
    width: "100%",

  },
  systemNameChevron: {
    marginLeft: "auto",
  },
  systemNameExpandedScroll: {
    minHeight: 140,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#DCE7F5",
  },
  systemNameExpandedScrollContent: {
    paddingHorizontal: 0,
    paddingTop: 8,
    paddingBottom: 4,
  },
  systemNameExpandedValue: {
    width: "100%",
    color: "#1a1a2e",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 19,
  },
  label: {
    width: "42%",
    fontWeight: "600",
    color: "#888",
    fontSize: 13,
  },
  value: {
    flex: 1,
    color: "#1a1a2e",
    fontSize: 13,
    fontWeight: "500",
  },
  formSectionBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },

  customersectioncontainer: {
    borderWidth: 1.5,
    borderColor: "#E8EEF8",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#FAFBFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 6,
    marginTop: 6,
    color: "#1a4a8a",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },

  formLabel1: {
    fontSize: 15,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: "#E0E8F5",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FAFCFF",
    color: "#222",
    fontSize: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  rnaFormContainer: {
    gap: 12,
    borderWidth: 1.5,
    borderColor: "#D3E0FF",
    borderRadius: 20,
    padding: 18,
    backgroundColor: "#FFFFFF",
    shadowColor: "#0d47a1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 16,
    elevation: 4,
    zIndex: 1000,
  },

  /* ── RNA Card Header ─────────────────────────── */
  rnaHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rnaBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
  rnaHeaderTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1f2937",
    letterSpacing: 0.35,
  },
  rnaHeaderSubtitle: {
    fontSize: 11,
    color: "#475569",
    marginTop: 2,
  },
  rnaActivePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dbeafe",
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 6,
  },
  rnaActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2563eb",
  },
  rnaActivePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563eb",
  },
  rnaDivider: {
    height: 1,
    backgroundColor: "#E6EEFF",
    marginVertical: 8,
  },

  /* ── Info Banner ──────────────────────────────── */
  rnaInfoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  rnaInfoBannerText: {
    flex: 1,
    fontSize: 12,
    color: "#1d4ed8",
    lineHeight: 18,
  },

  /* ── Action Row (Edit + Preview) ─────────────── */
  rnaActionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  rnaEditBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#3B82F6",
    borderRadius: 14,
    paddingVertical: 12,
    backgroundColor: "#eff6ff",
  },
  rnaEditBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  rnaPreviewBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 12,
    backgroundColor: "#2563eb",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  rnaPreviewBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },

  /* ── Modal Sheet ──────────────────────────────── */
  rnaModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.42)",
  },
  rnaModalSheet: {
    backgroundColor: "#F8FAFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: "92%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 22,
  },
  rnaModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  rnaModalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  rnaModalIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  rnaModalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 0.35,
  },
  rnaModalSubtitle: {
    fontSize: 12,
    color: "#475569",
    marginTop: 2,
  },
  rnaModalCloseIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },

  /* ── Progress pill ───────────────────────────── */
  rnaProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0E7FF",
    borderRadius: 22,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 14,
  },
  rnaProgressText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1e3a8a",
  },

  /* ── Row Card ────────────────────────────────── */
  rnaRowCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#dde7ff",
    padding: 16,
    marginBottom: 12,
    shadowColor: "#1d4ed8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  rnaRowCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 12,
  },
  rnaRowBadge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  rnaRowBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#fff",
  },
  rnaRowCardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1e3a8a",
  },

  /* ── Field Grid (2-column) ───────────────────── */
  rnaFieldGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  rnaFieldHalf: {
    flex: 1,
  },
  rnaFieldLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  rnaTextInput: {
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    fontSize: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },

  /* ── Add Row Button ──────────────────────────── */
  rnaAddRowBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#3b82f6",
    borderStyle: "dashed",
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 6,
    backgroundColor: "#eff6ff",
  },
  rnaAddRowBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1d4ed8",
  },

  /* ── Modal Footer (Cancel | Preview | Submit) ── */
  rnaModalFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  rnaFooterCancelBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 14,
    paddingVertical: 12,
    backgroundColor: "#f8fafc",
  },
  rnaFooterCancelText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  rnaFooterPreviewBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#2563eb",
    borderRadius: 14,
    paddingVertical: 12,
    backgroundColor: "#eff6ff",
  },
  rnaFooterPreviewText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2563eb",
  },
  rnaFooterSubmitBtn: {
    flex: 1.2,
    borderRadius: 14,
    overflow: "hidden",
  },
  rnaFooterSubmitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
  },
  rnaFooterSubmitText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.35,
  },

  textInput2: {
    borderWidth: 1.5,
    borderColor: "#E0E8F5",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#FAFCFF",
    color: "#222",
    fontSize: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
    textAlignVertical: "top",
  },
  textInputFocused: {
    borderColor: "#1a4a8a",
    borderWidth: 2,
    shadowColor: "#1a4a8a",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  helperText: {
    fontSize: 11,
    color: "#aaa",
    marginTop: -8,
    marginBottom: 10,
  },
  dropdownButton: {
    borderWidth: 1.5,
    borderColor: "#E0E8F5",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#FAFCFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dropdown: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#D9E2EC',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 14,

    zIndex: 11000,
  },
  dropdownButtonText: {
    color: "#444",
    fontSize: 14,
    flex: 1,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#D9E2EC',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginTop: 4,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 24,

    zIndex: 9999,
  },
  dropdownWrapper: {
    position: 'relative',
    zIndex: 9999,
    elevation: 30,
    overflow: 'visible',
  },
  dropdownButtonText1: {
    borderRadius: 10,
    zIndex: 11000,
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF'
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "88%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 22,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 16,
    color: "#1a4a8a",
    letterSpacing: 0.4,
    textTransform: "uppercase",
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
    marginTop: 14,
    padding: 13,
    backgroundColor: "#1a4a8a",
    borderRadius: 12,
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  previewButton: {
    borderWidth: 2,
    borderColor: "#1a4a8a",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "transparent",
    marginRight: 10,
  },
  previewButtonText: {
    color: "#1a4a8a",
    fontSize: 15,
    fontWeight: "700",
  },
  submitButton: {
    backgroundColor: "#1a4a8a",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#1a4a8a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    flex: 1,
    marginLeft: 0,
  },
  submitButtonDisabled: {
    backgroundColor: "#1a4a8aaa",
    opacity: 0.7,
    elevation: 0,
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
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dateTimeInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E0E8F5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#FAFCFF",
    flex: 1,
    marginBottom: 12,
  },
  inputError: {
    borderColor: "#E53935",
    borderWidth: 1.5,
  },
  errorText: {
    color: "#E53935",
    fontSize: 12,
    fontWeight: "600",
    marginTop: -8,
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
    borderWidth: 1.5,
    borderColor: "#C8D9F0",
    borderStyle: "dashed",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#F5F9FF",
    height: 210,
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
    color: "#aaa",
    fontSize: 13,
    textAlign: "center",
  },
  signatureModalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
  },
  closebuttoncontainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',

  },

  signaturePad: {
    height: 200,
    width: "100%",
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#E0E8F5",
    borderRadius: 14,
    marginVertical: 16,
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
    backgroundColor: "#1a4a8a",
    borderColor: "#1a4a8a",
  },
  signatureButtonTextSmall: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  signaturePreviewContainer: {
    width: "100%",
    height: 200, // fixed preview height
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  signaturePreviewImage: {
    width: "100%",
    height: 170, // fixed image height
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
    height: 1,
    backgroundColor: "#EEF2F8",
    marginVertical: 8,
    marginHorizontal: 16,
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

  // ── RMA Error Modal styles ────────────────────────────────────────
  rmaErrorOverlay: {
    flex: 1,
    backgroundColor: "rgba(5, 15, 40, 0.78)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  rmaErrorCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    width: "100%",
    maxWidth: 380,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 18,
    alignItems: "center",
    paddingBottom: 28,
  },
  rmaErrorAccentBar: {
    width: "100%",
    height: 6,
    backgroundColor: "#FF4D4F",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  rmaErrorIconCircle: {
    marginTop: 28,
    marginBottom: 12,
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#FFF1F0",
    borderWidth: 2.5,
    borderColor: "#FFB3B3",
    justifyContent: "center",
    alignItems: "center",
  },
  rmaErrorTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 10,
    letterSpacing: 0.2,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  rmaErrorBody: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 24,
    marginBottom: 18,
  },
  rmaErrorDivider: {
    width: "85%",
    height: 1,
    backgroundColor: "#EEF0F6",
    marginBottom: 16,
  },
  rmaErrorHintRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 18,
  },
  rmaErrorHint: {
    flex: 1,
    fontSize: 13,
    color: "#1a4a8a",
    lineHeight: 20,
    fontWeight: "500",
  },
  rmaErrorRefBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F6FC",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 22,
    gap: 10,
    borderWidth: 1,
    borderColor: "#D8E4F5",
  },
  rmaErrorRefLabel: {
    fontSize: 12,
    color: "#888",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  rmaErrorRefValue: {
    fontSize: 14,
    color: "#1a4a8a",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  rmaErrorDismissBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a4a8a",
    borderRadius: 50,
    paddingVertical: 13,
    paddingHorizontal: 32,
    shadowColor: "#1a4a8a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  rmaErrorDismissBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  // ── RMA Success Toast styles ──────────────────────────────────────────
  rmaToast: {
    position: "absolute",
    bottom: 28,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0d6b3a",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 12,
    zIndex: 9999,
  },
  rmaToastIconWrap: {
    marginRight: 12,
  },
  rmaToastTextWrap: {
    flex: 1,
  },
  rmaToastTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  rmaToastRow: {
    color: "#d0f0e0",
    fontSize: 12.5,
    fontWeight: "400",
  },
  rmaToastVal: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
