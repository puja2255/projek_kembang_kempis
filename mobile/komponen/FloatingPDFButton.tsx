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

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 9999, // Pastikan paling atas
  },
  fabTouch: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default FloatingPDFButton;