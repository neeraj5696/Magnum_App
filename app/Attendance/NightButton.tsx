import React, { useRef, useState, useEffect } from "react";
import { TouchableOpacity, Animated, StyleSheet, View } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const WIDTH = 84;
const HEIGHT = 40;
const KNOB = 32;
const PADDING = 4;

interface DayNightButtonProps {
    value?: boolean;
    onChange?: (isNight: boolean) => void;
}

export default function DayNightButton({ value = false, onChange }: DayNightButtonProps) {
    const [isNight, setIsNight] = useState(value);
    const slide = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        if (value !== isNight) {
            setIsNight(value);
            Animated.timing(slide, {
                toValue: value ? 1 : 0,
                duration: 250,
                useNativeDriver: false,
            }).start();
        }
    }, [value]);

    const toggle = () => {
        const next = !isNight;
        setIsNight(next);

        Animated.timing(slide, {
            toValue: next ? 1 : 0,
            duration: 250,
            useNativeDriver: false,
        }).start();

        if (onChange) {
            onChange(next);
        }
    };

    const translateX = slide.interpolate({
        inputRange: [0, 1],
        outputRange: [0, WIDTH - KNOB - PADDING * 2],
        extrapolate: "clamp",
    });

    const trackColor = slide.interpolate({
        inputRange: [0, 1],
        outputRange: ["#F9A825", "#1E293B"],
    });

    return (
        <TouchableOpacity activeOpacity={0.85} onPress={toggle}>
            <Animated.View style={[styles.track, { backgroundColor: trackColor }]}>
                <MaterialCommunityIcons
                    name="white-balance-sunny"
                    size={18}
                    color="#FFF9C4"
                    style={styles.sun}
                />
                <MaterialCommunityIcons
                    name="weather-night"
                    size={18}
                    color="#E2E8F0"
                    style={styles.moon}
                />
                <Animated.View style={[styles.knob, { transform: [{ translateX }] }]}>
                    <MaterialCommunityIcons
                        name={isNight ? "moon-waning-crescent" : "weather-sunny"}
                        size={18}
                        color={isNight ? "#6366F1" : "#F57F17"}
                    />
                </Animated.View>
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    track: {
        width: WIDTH,
        height: HEIGHT,
        borderRadius: HEIGHT / 2,
        justifyContent: "center",
        alignItems: "flex-start",
        padding: PADDING,
        position: "relative",
    },
    knob: {
        width: KNOB,
        height: KNOB,
        borderRadius: KNOB / 2,
        backgroundColor: "#FFFFFF",
        position: "absolute",
        left: PADDING,
        top: PADDING,
        justifyContent: "center",
        alignItems: "center",
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
    },
    sun: {
        position: "absolute",
        left: PADDING + 6,
    },
    moon: {
        position: "absolute",
        right: PADDING + 6,
    },
});