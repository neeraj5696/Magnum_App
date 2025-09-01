import { Alert } from 'react-native';
import documentGenerator from './documentGenerator';
import { createComplaintReportTemplate } from './complaintReportTemplate';
import { getHeaderImageDataUri } from './getHeaderImageDataUri';

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

    // Resolve local header image to base64 data URI via shared util
    let headerImageDataUri;
    try {
      headerImageDataUri = await getHeaderImageDataUri();
      if (!headerImageDataUri) {
        console.warn('Header image could not be loaded, will proceed without it');
      }
    } catch (error) {
      console.error('Error loading header image:', error);
      // Continue without header image
    }
    
    // Generate HTML content from form data with embedded local image
    const htmlContent = createComplaintReportTemplate({
      ...formData,
      headerImageDataUri: headerImageDataUri || '', // Pass empty string if undefined
    });
    console.log("HTML content generated successfully");
    
    // Generate PDF for preview using shared generator
    const result = await documentGenerator.generatePdfFromHtml(
      htmlContent,
      `preview_${formData.complaintNo || 'document'}`
    );
    console.log("PDF preview generation result:", result);
    
    if (result.success && result.localUri) {
      console.log("PDF preview generated successfully at:", result.localUri);
      return { 
        success: true, 
        uri: result.localUri
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
