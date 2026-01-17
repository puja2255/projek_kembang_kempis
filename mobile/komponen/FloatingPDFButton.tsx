import React, { useRef } from "react";
import { TouchableOpacity, Animated, PanResponder, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  onPress: () => void;
  color?: string;
}

const FloatingPDFButton: React.FC<Props> = ({ onPress, color = '#e74c3c' }) => {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          // @ts-ignore
          x: pan.x._value,
          // @ts-ignore
          y: pan.y._value
        });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.fab,
        { backgroundColor: color, transform: pan.getTranslateTransform() }
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.fabTouch}>
        <MaterialCommunityIcons name="file-pdf-box" size={28} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
};