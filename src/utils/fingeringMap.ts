// Standard QWERTY fingering map
// Mapping characters to finger hints

const FINGERING_MAP: Record<string, string> = {
  // Left hand
  'a': '左小指',
  'q': '左小指',
  'z': '左小指',

  's': '左无名指',
  'w': '左无名指',
  'x': '左无名指',

  'd': '左中指',
  'e': '左中指',
  'c': '左中指',

  'f': '左食指',
  'g': '左食指',
  'r': '左食指',
  't': '左食指',
  'v': '左食指',
  'b': '左食指',

  // Right hand
  'h': '右食指',
  'j': '右食指',
  'u': '右食指',
  'y': '右食指',
  'n': '右食指',
  'm': '右食指',

  'k': '右中指',
  'i': '右中指',
  ',': '右中指',

  'l': '右无名指',
  'o': '右无名指',
  '.': '右无名指',

  'p': '右小指',

  ' ': '任意拇指'
}

export function getFingerHint(char: string): string {
  const lowerChar = char.toLowerCase()
  return FINGERING_MAP[lowerChar] || '未定义'
}
