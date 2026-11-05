// src/components/HeartButton.tsx
//
// ATIVIDADE 2 — TASK 8, Opção A (Heart pop) com Reanimated 4.
//
// Como roda na UI thread:
// - `scale`/`rotation` são shared values: vivem no runtime de UI, não no estado React.
// - withSequence/withTiming/withSpring só DESCREVEM a animação; o JS thread entrega a
//   descrição uma vez e o UI thread calcula cada frame sozinho.
// - O callback de useAnimatedStyle é um worklet (o plugin Babel marca automaticamente)
//   que roda no UI thread a cada frame, sem re-render React e sem passar pela bridge.
//   Se o JS thread travar, a animação continua a 60/120fps.
//
// Micro-interação:
// 1. pressIn  → antecipação: comprime pra 0.85 (feedback imediato, ~80ms)
// 2. favoritar → pop: 1.4 em 120ms (ease-out) e spring de volta pra 1 com overshoot,
//                rotação leve (-15° → 0) em arco
// 3. desfavoritar → só um encolhimento sutil (sem comemorar)
// 4. Reduce Motion do sistema ligado → sem animação (só a troca do ícone)

import { useRef } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  active: boolean;
  onPress: () => void;
  size?: number;
};

// ζ ≈ 0.37: 1 overshoot visível e assenta em ~0.5s (micro-interação não deve arrastar).
const SPRING = { damping: 10, stiffness: 300, mass: 0.6 };

// Função "solta" chamada DE DENTRO do useAnimatedStyle (UI thread) → precisa da
// diretiva 'worklet'. O plugin Babel só workletiza sozinho o callback dos hooks;
// sem a diretiva aqui, o app quebra com "Tried to synchronously call a non-worklet
// function on the UI thread".
const heartTransform = (scale: number, rotationDeg: number) => {
  'worklet';
  return [{ scale }, { rotateZ: `${rotationDeg}deg` }];
};

export default function HeartButton({ active, onPress, size = 24 }: Props) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: heartTransform(scale.value, rotation.value),
  }));

  // Armadilha do Pressable: em tap rápido (< minPressDuration, 130ms) o onPressOut
  // chega ATRASADO, depois do onPress — e sobrescreveria o pop com um spring simples.
  // Esse ref marca que o tap completou, pra o pressOut não cancelar a animação.
  const pressCompleted = useRef(false);

  const handlePressIn = () => {
    pressCompleted.current = false;
    if (reduceMotion) return;
    scale.value = withTiming(0.85, { duration: 80, easing: Easing.out(Easing.quad) });
  };

  const handlePressOut = () => {
    // Só age se o tap NÃO completou (dedo arrastou pra fora) → volta ao normal.
    if (reduceMotion || pressCompleted.current) return;
    scale.value = withSpring(1, SPRING);
  };

  const handlePress = () => {
    pressCompleted.current = true;
    const willBeActive = !active;
    if (!reduceMotion) {
      if (willBeActive) {
        scale.value = withSequence(
          withTiming(1.4, { duration: 120, easing: Easing.out(Easing.cubic) }),
          withSpring(1, SPRING)
        );
        rotation.value = withSequence(
          withTiming(-15, { duration: 120, easing: Easing.out(Easing.cubic) }),
          withSpring(0, SPRING)
        );
      } else {
        scale.value = withSequence(
          withTiming(0.8, { duration: 100 }),
          withSpring(1, SPRING)
        );
      }
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={8}
      style={styles.hit}
      accessibilityRole="button"
      accessibilityLabel={active ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      accessibilityState={{ selected: active }}
      testID="heart-button"
    >
      <Animated.View style={animatedStyle}>
        <Text style={{ fontSize: size }}>{active ? '❤️' : '🤍'}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: { padding: 8, alignItems: 'center', justifyContent: 'center' },
});
