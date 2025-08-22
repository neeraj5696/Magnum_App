import { Alert } from 'react-native';
import { generatePdfForPreview } from './documentGenerator';
import { createComplaintReportTemplate } from './complaintReportTemplate';

interface ComplaintFormData {
  complaintNo: string;
  clientName: string;
  workStatus: string;
  remark: string;
  faultReported: string;
  typeOfCall: string;
  callAttendedDate: string;
  callAttendedTime: string;
  callCompletedDate: string;
  callCompletedTime: string;
  partReplaced: string;
  causeProblem: string;
  diagnosis: string;
  materialTakenOut: string;
  customerComment: string;
  customerSignature: string | null;
  systemName: string;
  assignDate: string;
  location: string;
  taskType: string;
  status: string;
  S_SERVDT: string;
  S_assignedengg: string;
  pendingReason: string;
  submittedAt: string;
  engineerComment: string;
}

/**
 * Handle PDF preview generation for complaint reports
 * @param formData - The complaint form data
 * @returns Promise with success status, PDF URI, and base64 data
 */
export const handleComplaintPreview = async (formData: ComplaintFormData): Promise<{ success: boolean; uri?: string; base64?: string }> => {
  try {
    // Validate required fields
    if (!formData.customerSignature) {
      Alert.alert("Error", "Please provide customer signature first");
      return { success: false };
    }
    
    if (!formData.workStatus) {
      Alert.alert("Error", "Please select a work status first");
      return { success: false };
    }
    
    if (formData.workStatus === "Pending" && !formData.pendingReason) {
      Alert.alert("Error", "Please select a pending reason first");
      return { success: false };
    }

    console.log("Generating PDF preview for complaint:", formData.complaintNo);
    
    // Generate HTML content from form data
    const htmlContent = createComplaintReportTemplate(formData);
    console.log("HTML content generated successfully");
    
    // Generate PDF for preview
    const result = await generatePdfForPreview(htmlContent);
    console.log("PDF preview generation result:", result);
    
    if (result.success && result.uri) {
      console.log("PDF preview generated successfully at:", result.uri);
      return { 
        success: true, 
        uri: result.uri,
        base64: result.base64 
      };
    } else {
      console.error("PDF preview generation failed");
      Alert.alert("Error", "Failed to generate PDF preview");
      return { success: false };
    }
  } catch (error) {
    console.error("Error in handleComplaintPreview:", error);
    Alert.alert("Error", "Failed to generate PDF preview. Please try again.");
    return { success: false };
  }
};

export default handleComplaintPreview;
