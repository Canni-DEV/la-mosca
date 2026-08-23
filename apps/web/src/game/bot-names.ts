export const BOT_NAMES = ["Néstor", "Marta", "Julio", "Elena"] as const;

export function botName(index: number): string {
  return BOT_NAMES[index % BOT_NAMES.length] ?? `Bot ${index + 1}`;
}
