import React, { useRef } from "react";
import { TouchableOpacity, Animated, PanResponder, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  onPress: () => void;
  color?: string;
}