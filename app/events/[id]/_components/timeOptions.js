export const hours = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0")
);

export const minutes = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, "0")
);

export const periods = ["AM", "PM"];