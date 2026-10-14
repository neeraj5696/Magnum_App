import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  TextStyle,
  ViewStyle,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export interface ReadMoreTextProps {
  /** The full text content to display */
  text?: string | null;
  /** The field name / label to show in the popup title (e.g. "Customer Name", "Address", "Remark 1") */
  fieldName: string;
  /** The maximum number of words or characters before truncation (defaults to 10) */
  sliceLength?: number;
  /** Truncation mode: 'words' (default) or 'characters' */
  sliceMode?: "words" | "characters";
  /** Custom style for the inline text */
  textStyle?: StyleProp<TextStyle>;
  /** Custom style for the wrapper container */
  containerStyle?: StyleProp<ViewStyle>;
  /** Fallback string when text is empty */
  emptyText?: string;
}

export default function ReadMoreText({
  text = "",
  fieldName,
  sliceLength = 10,
  sliceMode = "words",
  textStyle,
  containerStyle,
  emptyText = "-",
}: ReadMoreTextProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const cleanText = text !== undefined && text !== null ? String(text).trim() : "";

  // Extract layout styles from textStyle so we don't pass flex/width directly to <Text> (which can collapse text to 0 height in React Native)
  const flattenedTextStyle = (StyleSheet.flatten(textStyle) || {}) as TextStyle & ViewStyle;
  const {
    flex,
    flexGrow,
    flexShrink,
    alignSelf,
    width,
    minWidth,
    maxWidth,
    ...pureTextStyle
  } = flattenedTextStyle as any;

  const mergedContainerStyle: StyleProp<ViewStyle> = [
    styles.container,
    flex !== undefined && { flex },
    flexGrow !== undefined && { flexGrow },
    flexShrink !== undefined && { flexShrink },
    width !== undefined && { width },
    minWidth !== undefined && { minWidth },
    maxWidth !== undefined && { maxWidth },
    containerStyle,
  ];

  if (!cleanText) {
    return (
      <View style={mergedContainerStyle}>
        <Text style={[styles.defaultText, styles.emptyText, pureTextStyle]}>
          {emptyText}
        </Text>
      </View>
    );
  }

  let isTruncated = false;
  let displayedText = cleanText;

  if (sliceMode === "characters") {
    if (cleanText.length > sliceLength) {
      isTruncated = true;
      displayedText = `${cleanText.slice(0, sliceLength).trimEnd()}...`;
    }
  } else {
    // Word mode
    const words = cleanText.split(/\s+/);
    if (words.length > sliceLength) {
      isTruncated = true;
      displayedText = `${words.slice(0, sliceLength).join(" ")}...`;
    } else if (cleanText.length > Math.max(sliceLength * 12, 60)) {
      // Handle very long strings without spaces (e.g. unbroken text)
      isTruncated = true;
      displayedText = `${cleanText.slice(0, Math.max(sliceLength * 12, 60)).trimEnd()}...`;
    }
  }

  return (
    <View style={mergedContainerStyle}>
      <Text style={[styles.defaultText, pureTextStyle]}>
        {displayedText}
        {isTruncated && (
          <Text
            onPress={() => setModalVisible(true)}
            suppressHighlighting={false}
            style={styles.readMoreInline}
          >
            {" "}
            <Text style={styles.readMoreText}>Read more</Text>
          </Text>
        )}
      </Text>

      {/* Full details popup modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.iconCircle}>
                  <Ionicons name="document-text-outline" size={18} color="#1a4a8a" />
                </View>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {fieldName}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeIconButton}
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalDivider} />

            {/* Scrollable Full Content */}
            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={styles.modalBodyContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled
            >
              <Text style={styles.fullText} selectable>
                {cleanText}
              </Text>
            </ScrollView>

            {/* Modal Footer with Close Button */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={["#1e40af", "#1a4a8a"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.closeButtonGradient}
                >
                  <Ionicons name="checkmark-circle-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.closeButtonText}>Close</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexShrink: 1,
  },
  defaultText: {
    color: "#1a1a2e",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  emptyText: {
    color: "#94a3b8",
  },
  readMoreInline: {
    paddingLeft: 4,
  },
  readMoreText: {
    color: "#1976D2",
    fontWeight: "700",
    fontSize: 12,
    textDecorationLine: "underline",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 420,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 10,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
  },
  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(26, 74, 138, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f2952",
    flex: 1,
  },
  closeIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  modalBody: {
    maxHeight: 360,
  },
  modalBodyContent: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  fullText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#334155",
    fontWeight: "400",
  },
  modalFooter: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    backgroundColor: "#f8fafc",
  },
  closeButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  closeButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  closeButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});
