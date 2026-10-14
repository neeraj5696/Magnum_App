import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { rmacomplaintReportTemplate } from '../../src/utils/RMA/rmacomplaintReportTemplate';
import { getHeaderImageDataUri } from '../../src/utils/RMA/getHeaderImageDataUri';

interface SimplePreviewRmaModalProps {
    visible: boolean;
    onClose: () => void;
    formData: any;
}

export default function SimplePreviewRmaModal({ visible, onClose, formData }: SimplePreviewRmaModalProps) {
    const [htmlContent, setHtmlContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (visible && formData) {
            generatePDFPreview();
        }
    }, [visible, formData]);

    const generatePDFPreview = async () => {
        setIsLoading(true);
        try {
            const headerImageDataUri = await getHeaderImageDataUri();
            const html = rmacomplaintReportTemplate({ ...formData, headerImageDataUri });
            setHtmlContent(html);
        } catch (err) {
            console.error('Error creating PDF preview:', err);
            setHtmlContent('<p>Error generating preview</p>');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setHtmlContent('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <StatusBar barStyle="light-content" backgroundColor="#1565C0" />
            <View style={styles.container}>

                {/* ── Gradient Header ── */}
                <LinearGradient
                    colors={['#1565C0', '#1E88E5', '#42A5F5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    {/* Left icon + title */}
                    <View style={styles.headerLeft}>
                        <View style={styles.headerIconBox}>
                            <Ionicons name="document-text" size={20} color="#fff" />
                        </View>
                        <View style={{ marginLeft: 12 }}>
                            <Text style={styles.headerTitle}>RMA Preview</Text>
                            <Text style={styles.headerSubtitle}>Return Material Authorization</Text>
                        </View>
                    </View>

                    {/* Close icon */}
                    <TouchableOpacity
                        onPress={handleClose}
                        style={styles.closeIconBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="close" size={22} color="#fff" />
                    </TouchableOpacity>
                </LinearGradient>

                {/* ── Status pill ── */}
                <View style={styles.statusBar}>
                    <View style={styles.statusPill}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>
                            {isLoading ? 'Generating…' : htmlContent ? 'Preview Ready' : 'Waiting'}
                        </Text>
                    </View>
                    <Text style={styles.statusHint}>Scroll to view full document</Text>
                </View>

                {/* ── Content ── */}
                <View style={styles.content}>
                    {isLoading && (
                        <View style={styles.loadingContainer}>
                            <View style={styles.loadingCard}>
                                <ActivityIndicator size="large" color="#1976D2" />
                                <Text style={styles.loadingTitle}>Generating PDF Preview</Text>
                                <Text style={styles.loadingSubtitle}>Please wait a moment…</Text>
                            </View>
                        </View>
                    )}

                    {htmlContent && !isLoading && (
                        <WebView
                            source={{ html: htmlContent }}
                            style={styles.webview}
                            startInLoadingState={true}
                            renderLoading={() => (
                                <View style={styles.webviewLoading}>
                                    <ActivityIndicator size="small" color="#1976D2" />
                                    <Text style={styles.webviewLoadingText}>Loading Preview…</Text>
                                </View>
                            )}
                            onError={(syntheticEvent) => {
                                const { nativeEvent } = syntheticEvent;
                                console.warn('WebView error: ', nativeEvent);
                            }}
                        />
                    )}
                </View>

                {/* ── Footer ── */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.closeButtonLarge}
                        onPress={handleClose}
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={['#1565C0', '#1976D2']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.closeButtonGradient}
                        >
                            <Ionicons name="close-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.closeButtonLargeText}>Close RMA Preview</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F4F8',
    },

    /* ── Header ── */
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 16 : 18,
        paddingBottom: 18,
        paddingHorizontal: 20,
        elevation: 6,
        shadowColor: '#1565C0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerIconBox: {
        width: 42,
        height: 42,
        borderRadius: 13,
        backgroundColor: 'rgba(255,255,255,0.22)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 0.3,
    },
    headerSubtitle: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.82)',
        marginTop: 2,
        letterSpacing: 0.2,
    },
    closeIconBtn: {
        width: 38,
        height: 38,
        borderRadius: 11,
        backgroundColor: 'rgba(255,255,255,0.18)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.28)',
        marginLeft: 12,
    },

    /* ── Status bar ── */
    statusBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E8EEF4',
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 5,
        gap: 6,
    },
    statusDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#43A047',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#2E7D32',
    },
    statusHint: {
        fontSize: 11,
        color: '#94A3B8',
        fontStyle: 'italic',
    },

    /* ── Content ── */
    content: {
        flex: 1,
        backgroundColor: '#F0F4F8',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    loadingCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        paddingVertical: 40,
        paddingHorizontal: 48,
        alignItems: 'center',
        shadowColor: '#1565C0',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 8,
        gap: 12,
    },
    loadingTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginTop: 8,
    },
    loadingSubtitle: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
    },
    webview: {
        flex: 1,
        backgroundColor: '#F0F4F8',
    },
    webviewLoading: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -50 }, { translateY: -50 }],
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 16,
        padding: 20,
    },
    webviewLoadingText: {
        marginTop: 10,
        fontSize: 13,
        color: '#475569',
        fontWeight: '600',
    },

    /* ── Footer ── */
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingBottom: Platform.OS === 'ios' ? 28 : 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E8EEF4',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 6,
    },
    closeButtonLarge: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#1565C0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 10,
        elevation: 5,
    },
    closeButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 17,
        borderRadius: 16,
    },
    closeButtonLargeText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
});
