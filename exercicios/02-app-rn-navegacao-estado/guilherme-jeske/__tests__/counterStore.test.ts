// __tests__/counterStore.test.ts
//
// Exemplo de teste pra Zustand store.
//
// FEITO [TASK 4]: expandido com testes de decrement, reset e edge cases (gerados com IA).
//
// Prompt sugerido pra IA:
//   "Adicione testes Jest pra useCounterStore cobrindo:
//    - decrement diminui count em 1
//    - reset volta count pra 0 após mutações
//    - 100 increments seguidos resultam em count=100
//    Mantenha estilo dos testes existentes (describe + beforeEach + test)."

import { useCounterStore } from '../src/store/counterStore';

describe('counterStore', () => {
  beforeEach(() => {
    useCounterStore.setState({ count: 0 });
  });

  test('increment aumenta count em 1', () => {
    useCounterStore.getState().increment();
    expect(useCounterStore.getState().count).toBe(1);
  });

  test('decrement diminui count em 1', () => {
    useCounterStore.setState({ count: 5 });
    useCounterStore.getState().decrement();
    expect(useCounterStore.getState().count).toBe(4);
  });

  test('reset volta count pra 0 após mutações', () => {
    const { increment, decrement, reset } = useCounterStore.getState();
    increment();
    increment();
    increment();
    decrement();
    expect(useCounterStore.getState().count).toBe(2);

    reset();
    expect(useCounterStore.getState().count).toBe(0);
  });

  test('100 increments seguidos resultam em count=100', () => {
    const { increment } = useCounterStore.getState();
    for (let i = 0; i < 100; i++) {
      increment();
    }
    expect(useCounterStore.getState().count).toBe(100);
  });

  test('decrement abaixo de zero vai pra negativo (-1)', () => {
    useCounterStore.getState().decrement();
    expect(useCounterStore.getState().count).toBe(-1);
  });
});
