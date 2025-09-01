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
    //   console.log('Partner param coming in register screen:', partner);
    const [partnerclientname, setPartnerClientName] = useState('');
    const [partnerclientadd1, setPartnerClientAdd1] = useState('');
    const [partnerclientadd2, setPartnerClientAdd2] = useState('');
    const [partnerclientstate, setPartnerClientState] = useState('');
    const [partnerclientcity, setPartnerClientCity] = useState('');
    const [partnerclientproduct, setPartnerClientProduct] = useState('');
    const [partnerclientproductno, setPartnerClientProductNo] = useState('');
    const [partnerclientid, setPartnerClientId] = useState(partner.P_ID || '');
    const [areahd, setAreaHd] = useState(partner.AreaHD || '');
    const [phoneno, setPhoneNo] = useState('');
    const [remarks, setRemarks] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        // Check each parameter with an if block
        if (!partnerclientname) {
            setErrorMessage('Please enter Client Name.');
            return;
        }
        if (!partnerclientadd1) {
            setErrorMessage('Please enter Address 1.');
            return;
        }
        if (!partnerclientadd2) {
            setErrorMessage('Please enter Address 2.');
            return;
        }
        if (!partnerclientstate) {
            setErrorMessage('Please enter State.');
            return;
        }
        if (!partnerclientcity) {
            setErrorMessage('Please enter City.');
            return;
        }
        if (!partnerclientproduct) {
            setErrorMessage('Please enter Product.');
            return;
        }
        if (!partnerclientproductno) {
            setErrorMessage('Please enter Product Number.');
            return;
        }
        if (!partnerclientid) {
            setErrorMessage('Missing Partner Client ID.');
            return;
        }
        if (!areahd) {
            setErrorMessage('Missing Area Head.');
            return;
        }
        if (!phoneno) {
            setErrorMessage('Please enter Phone Number.');
            return;
        }
        if (!remarks) {
            setErrorMessage('Please enter Remarks.');
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            // Log the form data before sending
            const allFields = {
                partnerclientname,
                partnerclientadd1,
                partnerclientadd2,
                partnerclientstate,
                partnerclientcity,
                partnerclientproduct,
                partnerclientproductno,
                partnerclientid,
                areahd,
                phoneno,
                remarks
            };
            console.log('Form data to be sent:', allFields);

            const formData = new URLSearchParams();
            Object.entries(allFields).forEach(([key, value]) => {
                formData.append(key, value);
            });

            // Log the form data object and URL-encoded string
            console.log('Form Data Object:', JSON.stringify(allFields, null, 2));
            console.log('URL-encoded POST body:', formData.toString());

            const response = await fetch('https://hma.magnum.org.in/appPartnercomplaint.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: formData.toString(),
            });

            const data = await response.json();
            console.log('Server response:', data);
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
                setErrorMessage(data?.status || 'Submission failed. Please try again.');
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
                    value={partnerclientname}
                    onChangeText={setPartnerClientName}
                />

                <Text style={styles.label}>Address1</Text>
                <TextInput
                    style={styles.input}
                    value={partnerclientadd1}
                    onChangeText={setPartnerClientAdd1}
                />

                <Text style={styles.label}>Address2</Text>
                <TextInput
                    style={styles.input}
                    value={partnerclientadd2}
                    onChangeText={setPartnerClientAdd2}
                />

                <Text style={styles.label}>State</Text>
                <TextInput
                    style={styles.input}
                    value={partnerclientstate}
                    onChangeText={setPartnerClientState}
                />

                <Text style={styles.label}>City</Text>
                <TextInput
                    style={styles.input}
                    value={partnerclientcity}
                    onChangeText={setPartnerClientCity}
                />

                <Text style={styles.label}>Product Name</Text>
                <TextInput
                    style={styles.input}
                    value={partnerclientproduct}
                    onChangeText={setPartnerClientProduct}
                />

                <Text style={styles.label}>Product Number</Text>
                <TextInput
                    style={styles.input}
                    value={partnerclientproductno}
                    onChangeText={setPartnerClientProductNo}
                />

                <Text style={styles.label}>Partner Client ID</Text>
                <TextInput
                    style={styles.input}
                    value={partnerclientid}
                    onChangeText={setPartnerClientId}
                    editable={false}
                />

                <Text style={styles.label}>Area Head</Text>
                <TextInput
                    style={styles.input}
                    value={areahd}
                    onChangeText={setAreaHd}
                    editable={false}
                />

                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                    style={styles.input}
                    value={phoneno}
                    onChangeText={setPhoneNo}
                    keyboardType="phone-pad"
                />

                <Text style={styles.label}>Remarks</Text>
                <TextInput
                    style={[styles.input, styles.multilineInput]}
                    value={remarks}
                    onChangeText={setRemarks}
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
