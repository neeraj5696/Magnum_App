import React from 'react';
import { View, Text } from 'react-native';

export type VpdDdlItem = {
    SystemName: string;
    Parts: string;
};

export type VpdDdlGrouped = Record<string, string[]>;

export async function getVpdDdlData(): Promise<VpdDdlGrouped> {
    try {
        const response = await fetch('https://hma.magnum.org.in/appVDPDDL.php');
        if (response.ok) {
            const json = await response.json();
            const actual_data = json.data as VpdDdlItem[];
            const grouped: VpdDdlGrouped = {};
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

const VpdDdl = () => (
    <View>
        <Text>VDPDDL Data Provider</Text>
    </View>
);

export default VpdDdl;
