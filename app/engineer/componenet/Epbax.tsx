import React from 'react';
import { View, Text } from 'react-native';

export type EpbaxItem = {
    SystemName: string;
    Parts: string;
};

export type PowerSupplyUnitItem = {
    Modelnumbers: string;
};

export type PowerSupplyUnitList = string[];

export type EpbaxGrouped = Record<string, string[]>;
export type PowerSupplyUnitGrouped = Record<string, string[]>;

export async function getEpbaxData(): Promise<EpbaxGrouped> {
    try {
        const response = await fetch('https://hma.magnum.org.in/appEPABX.php');
        if (response.ok) {
            const json = await response.json();
            const actual_data = json.data as EpbaxItem[];
            const grouped: EpbaxGrouped = {};
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

export async function getPowerSupplyUnitData(): Promise<PowerSupplyUnitList> {
    try {
        const response = await fetch('https://hma.magnum.org.in/appPowerSupplyunit.php');
        if (response.ok) {
            const json = await response.json();
            const actual_data = json.data as PowerSupplyUnitItem[];
            // Deduplicate model numbers
            const uniqueModels = Array.from(new Set(actual_data.map(item => item.Modelnumbers)));
            return uniqueModels;
        } else {
            console.error(`http err: ${response.status}`);
        }
    } catch (error) {
        console.error('failed to fetch the data:', error);
    }
    return [];
}

export async function getEpbaxAndPowerSupplyData(): Promise<{
  epbax: EpbaxGrouped;
  powerSupply: PowerSupplyUnitList;
}> {
  const [epbax, powerSupply] = await Promise.all([
    getEpbaxData(),
    getPowerSupplyUnitData(),
  ]);
  return { epbax, powerSupply };
}

const Epbax = () => (
    <View>
        <Text>EPABX Data Provider</Text>
    </View>
);

export default Epbax;
