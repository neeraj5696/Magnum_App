import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import LogoHeader from '../components/LogoHeader';

interface FormData {
    partnerclientname: string;
    partnerclientadd1: string;
    partnerclientadd2: string;
    partnerclientstate: string;
    partnerclientcity: string;
    partnerclientproduct: string;
    partnerclientproductno: string;
    partnerclientid: string;
    areahd: string;
    phoneno: string;
    remarks: string;
}

export default function PartnerRegister() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const partner = typeof params.partner === 'string' ? JSON.parse(params.partner) : {};
    const [form, setForm] = useState<FormData>({
        partnerclientname: '',
        partnerclientadd1: '',
        partnerclientadd2: '',
        partnerclientstate: '',
        partnerclientcity: '',
        partnerclientproduct: '',
        partnerclientproductno: '',
        partnerclientid: partner.P_ID || '',
        areahd: partner.AreaHD || '',
        phoneno: '',
        remarks: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (key: keyof typeof form, value: string) => {
        setForm({ ...form, [key]: value });
    };

    const handleSubmit = async () => {
        // Validate required fields
        const requiredFields: (keyof FormData)[] = [
            'partnerclientname',
            'partnerclientadd1',
            'partnerclientstate',
            'partnerclientcity',
            'partnerclientproduct',
            'partnerclientproductno',
            'phoneno'
        ];

        const missingFields = requiredFields.filter(field => !form[field]);
        
        if (missingFields.length > 0) {
            setErrorMessage(`Please fill in all required fields: ${missingFields.join(', ')}`);
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            const formData = new URLSearchParams();
            
            // Add all required POST parameters
            formData.append('partnerclientname', form.partnerclientname);
            formData.append('partnerclientadd1', form.partnerclientadd1);
            formData.append('partnerclientadd2', form.partnerclientadd2 || '');
            formData.append('partnerclientstate', form.partnerclientstate);
            formData.append('partnerclientcity', form.partnerclientcity);
            formData.append('partnerclientproduct', form.partnerclientproduct);
            formData.append('partnerclientproductno', form.partnerclientproductno);
            formData.append('partnerclientid', form.partnerclientid);
            formData.append('areahd', form.areahd);
            formData.append('phoneno', form.phoneno);
            formData.append('remarks', form.remarks || '');

            const response = await fetch('https://hma.magnum.org.in/appPartnercomplaint.php', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: formData.toString(),
            });

            const data = await response.json();
            console.log(data);
            
            if (data?.status === 'success') {
                setSuccess(true);
                Alert.alert(
                    'Success',
                    'Registration submitted successfully!',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.replace('/partner/login')
                        }
                    ]
                );
            } else {
                setErrorMessage(data?.message || 'Submission failed. Please try again.');
            }
        } catch (error) {
            setErrorMessage('Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <LogoHeader />
            <Text style={styles.title}>{partner.P_SHOWROOM || ''}</Text>
            <Text style={styles.subtitle}>{partner.P_SHOWROOM_AREA || ''}</Text>
            <View style={{ height: 10 }} />
            <View style={styles.formContainer}>
                <Text style={styles.label}>Client Name</Text>
                <TextInput
                    style={styles.input}
                    value={form.partnerclientname}
                    onChangeText={v => handleChange('partnerclientname', v)}
                />

                <Text style={styles.label}>Address1</Text>
                <TextInput
                    style={styles.input}
                    value={form.partnerclientadd1}
                    onChangeText={v => handleChange('partnerclientadd1', v)}
                />

                <Text style={styles.label}>Address2</Text>
                <TextInput
                    style={styles.input}
                    value={form.partnerclientadd2}
                    onChangeText={v => handleChange('partnerclientadd2', v)}
                />

                <Text style={styles.label}>State</Text>
                <TextInput
                    style={styles.input}
                    value={form.partnerclientstate}
                    onChangeText={v => handleChange('partnerclientstate', v)}
                />

                <Text style={styles.label}>City</Text>
                <TextInput
                    style={styles.input}
                    value={form.partnerclientcity}
                    onChangeText={v => handleChange('partnerclientcity', v)}
                />

                <Text style={styles.label}>Product Name</Text>
                <TextInput
                    style={styles.input}
                    value={form.partnerclientproduct}
                    onChangeText={v => handleChange('partnerclientproduct', v)}
                />

                <Text style={styles.label}>Product Number</Text>
                <TextInput
                    style={styles.input}
                    value={form.partnerclientproductno}
                    onChangeText={v => handleChange('partnerclientproductno', v)}
                />

                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                    style={styles.input}
                    value={form.phoneno}
                    onChangeText={v => handleChange('phoneno', v)}
                    keyboardType="phone-pad"
                />

                <Text style={styles.label}>Remarks</Text>
                <TextInput
                    style={[styles.input, styles.multilineInput]}
                    value={form.remarks}
                    onChangeText={v => handleChange('remarks', v)}
                    multiline={true}
                    numberOfLines={4}
                />

                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                
                <TouchableOpacity 
                    style={[
                        styles.submitButton,
                        isLoading && styles.submitButtonDisabled
                    ]} 
                    onPress={handleSubmit} 
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator color="white" size="small" />
                            <Text style={styles.submitButtonText}>Submitting...</Text>
                        </View>
                    ) : (
                        <Text style={styles.submitButtonText}>Submit Registration</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#F5F5F5',
        padding: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        color: '#1A237E',
        textAlign: 'center',
        marginTop: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#455A64',
        textAlign: 'center',
        marginBottom: 8,
    },
    formContainer: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1A237E',
        marginBottom: 4,

    },
    input: {
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        fontSize: 15,
        backgroundColor: '#FFFFFF',
        padding: 10,
        color: '#212121',
        marginBottom: 6,
    },
    multilineInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#1A237E',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    submitButtonDisabled: {
        backgroundColor: '#9FA8DA',
        opacity: 0.8,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    errorText: {
        color: '#D32F2F',
        fontSize: 13,
        marginTop: 6,
        marginBottom: 8,
        textAlign: 'center',
        backgroundColor: '#FFEBEE',
        padding: 8,
        borderRadius: 4,
    },
});
