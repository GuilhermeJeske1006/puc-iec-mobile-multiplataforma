// src/components/AnimatedPoster.tsx
//
// BÔNUS — TASK 8, Opção C (poster "cresce" ao abrir o detalhe, estilo Apple Music).
//
// Ao montar a tela de detalhe, o poster parte pequeno (escala 0.6, levemente acima)
// e cresce até o tamanho final com withSpring. Tudo dirigido por shared values
// na UI thread — a navegação/render do React não interfere na fluidez.

import { useEffect } from 'react';
import { StyleSheet, type ImageStyle, type StyleProp } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  uri: string;
  style?: StyleProp<ImageStyle>;
};

export default function AnimatedPoster({ uri, style }: Props) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(reduceMotion ? 1 : 0);
  const opacity = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    progress.value = withSpring(1, { damping: 12, stiffness: 120 });
    opacity.value = withTiming(1, { duration: 200 });
  }, [progress, opacity, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      // 0 → 1  ⇒  escala 0.6 → 1 e sobe 40px → 0
      { translateY: (1 - progress.value) * -40 },
      { scale: 0.6 + progress.value * 0.4 },
    ],
  }));

  return (
    <Animated.Image
      source={{ uri }}
      style={[styles.poster, style, animatedStyle]}
      accessibilityIgnoresInvertColors
    />
  );
}

const styles = StyleSheet.create({
  poster: { borderRadius: 8 },
});
