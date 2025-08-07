import React from 'react';
import { View, Text } from 'react-native';

export type AccessControlItem = {
    SystemName: string;
    Parts: string;
};

export type AccessControlGrouped = Record<string, string[]>;

export async function getAccessControlData(): Promise<AccessControlGrouped> {
    try {
        const response = await fetch('https://hma.magnum.org.in/appAccessControl.php');
        if (response.ok) {
            const json = await response.json();
            const actual_data = json.data as AccessControlItem[];
            const grouped: AccessControlGrouped = {};
            actual_data.forEach(item => {
                if (!grouped[item.SystemName]) {
                    grouped[item.SystemName] = [];
                }
                grouped[item.SystemName].push(item.Parts);
            });
            return grouped;
        } else {
            console.error(`http err: ${response.status}`);
        }
    } catch (error) {
        console.error('failed to fetch the data:', error);
    }
    return {};
}

const AccessControl = () => (
    <View>
        <Text>Access Control Data Provider</Text>
    </View>
);

export default AccessControl;
