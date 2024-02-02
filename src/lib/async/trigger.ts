export type Trigger<T> = {
  fire: (data: T) => void;
  signal: Promise<T>;
};

export const makeTrigger = <T>(): Trigger<T> => {
  let fire: Trigger<T>["fire"];
  const signal = new Promise<T>((res) => (fire = res));
  return {
    fire: fire!,
    signal,
  };
};
