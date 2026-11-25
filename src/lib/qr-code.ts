/**
 * Pequeno gerador QR Code em byte mode (QR versão 5-L).
 * Mantido no projeto para gerar o SVG localmente, sem enviar o conteúdo do QR
 * a serviços externos. A versão 5-L comporta até 106 bytes UTF-8.
 */
const VERSION = 5;
const SIZE = 17 + 4 * VERSION;
const DATA_CODEWORDS = 108;
const ECC_CODEWORDS = 26;

const GF_EXP = new Array<number>(512).fill(0);
const GF_LOG = new Array<number>(256).fill(0);
let gfValue = 1;
for (let i = 0; i < 255; i++) {
  GF_EXP[i] = gfValue;
  GF_LOG[gfValue] = i;
  gfValue <<= 1;
  if (gfValue & 0x100) gfValue ^= 0x11d;
}
for (let i = 255; i < GF_EXP.length; i++) GF_EXP[i] = GF_EXP[i - 255];

function gfMultiply(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function polynomialMultiply(a: number[], b: number[]): number[] {
  const result = new Array<number>(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) result[i + j] ^= gfMultiply(a[i], b[j]);
  }
  return result;
}

function reedSolomon(data: number[]): number[] {
  let generator = [1];
  for (let i = 0; i < ECC_CODEWORDS; i++) generator = polynomialMultiply(generator, [1, GF_EXP[i]]);
  const work = [...data, ...new Array<number>(ECC_CODEWORDS).fill(0)];
  for (let i = 0; i < data.length; i++) {
    const factor = work[i];
    if (factor === 0) continue;
    for (let j = 0; j < generator.length; j++) work[i + j] ^= gfMultiply(generator[j], factor);
  }
  return work.slice(data.length);
}

function appendBits(target: number[], value: number, length: number) {
  for (let bit = length - 1; bit >= 0; bit--) target.push((value >>> bit) & 1);
}

function makeDataCodewords(payload: string): number[] {
  const bytes = Array.from(new TextEncoder().encode(payload));
  if (bytes.length > 106) {
    throw new Error(`O endereço do QR Code excede 106 bytes (${bytes.length}). Reduza o domínio configurado.`);
  }

  const bits: number[] = [];
  appendBits(bits, 0b0100, 4); // byte mode
  appendBits(bits, bytes.length, 8);
  for (const byte of bytes) appendBits(bits, byte, 8);
  appendBits(bits, 0, Math.min(4, DATA_CODEWORDS * 8 - bits.length));
  while (bits.length % 8 !== 0) bits.push(0);

  const codewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let value = 0;
    for (let j = 0; j < 8; j++) value = (value << 1) | bits[i + j];
    codewords.push(value);
  }
  let pad = 0;
  while (codewords.length < DATA_CODEWORDS) {
    codewords.push(pad++ % 2 === 0 ? 0xec : 0x11);
  }
  return codewords;
}

function formatInformation(mask: number): number {
  // Nível de correção L (01), seguido pelo identificador da máscara.
  const data = (0b01 << 3) | mask;
  let remainder = data << 10;
  for (let bit = 14; bit >= 10; bit--) {
    if (((remainder >>> bit) & 1) !== 0) remainder ^= 0x537 << (bit - 10);
  }
  return ((data << 10) | remainder) ^ 0x5412;
}

export function makeQrMatrix(payload: string): boolean[][] {
  const data = makeDataCodewords(payload);
  const allCodewords = [...data, ...reedSolomon(data)];
  const dataBits: number[] = [];
  for (const codeword of allCodewords) appendBits(dataBits, codeword, 8);

  const matrix = Array.from({ length: SIZE }, () => new Array<boolean>(SIZE).fill(false));
  const reserved = Array.from({ length: SIZE }, () => new Array<boolean>(SIZE).fill(false));
  const setFunction = (x: number, y: number, dark: boolean) => {
    if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
    matrix[y][x] = dark;
    reserved[y][x] = true;
  };

  const drawFinder = (left: number, top: number) => {
    for (let dy = -1; dy <= 7; dy++) {
      for (let dx = -1; dx <= 7; dx++) {
        const x = left + dx;
        const y = top + dy;
        const inFinder = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6;
        const dark = inFinder && (
          dx === 0 || dx === 6 || dy === 0 || dy === 6 ||
          (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4)
        );
        setFunction(x, y, dark);
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(SIZE - 7, 0);
  drawFinder(0, SIZE - 7);

  // Padrões de sincronização.
  for (let i = 8; i < SIZE - 8; i++) {
    if (!reserved[6][i]) setFunction(i, 6, i % 2 === 0);
    if (!reserved[i][6]) setFunction(6, i, i % 2 === 0);
  }

  // Versão 5 tem um padrão de alinhamento no canto inferior direito.
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const distance = Math.max(Math.abs(dx), Math.abs(dy));
      setFunction(30 + dx, 30 + dy, distance === 2 || distance === 0);
    }
  }

  // Reservar as posições de informação de formato antes de inserir os dados.
  for (let i = 0; i <= 5; i++) setFunction(8, i, false);
  setFunction(8, 7, false);
  setFunction(8, 8, false);
  setFunction(7, 8, false);
  for (let i = 9; i < 15; i++) setFunction(14 - i, 8, false);
  for (let i = 0; i < 8; i++) setFunction(SIZE - 1 - i, 8, false);
  for (let i = 8; i < 15; i++) setFunction(8, SIZE - 15 + i, false);
  setFunction(8, SIZE - 8, true); // módulo escuro fixo

  // Inserção em zigue-zague, usando a máscara 0.
  let bitIndex = 0;
  let right = SIZE - 1;
  let upward = true;
  while (right > 0) {
    if (right === 6) right = 5;
    for (let step = 0; step < SIZE; step++) {
      const y = upward ? SIZE - 1 - step : step;
      for (let offset = 0; offset < 2; offset++) {
        const x = right - offset;
        if (reserved[y][x]) continue;
        const bit = bitIndex < dataBits.length ? dataBits[bitIndex] : 0;
        const masked = bit ^ (((x + y) % 2 === 0) ? 1 : 0);
        matrix[y][x] = masked === 1;
        bitIndex++;
      }
    }
    right -= 2;
    upward = !upward;
  }

  const format = formatInformation(0);
  const formatBit = (i: number) => ((format >>> i) & 1) !== 0;
  for (let i = 0; i <= 5; i++) matrix[i][8] = formatBit(i);
  matrix[7][8] = formatBit(6);
  matrix[8][8] = formatBit(7);
  matrix[8][7] = formatBit(8);
  for (let i = 9; i < 15; i++) matrix[8][14 - i] = formatBit(i);
  for (let i = 0; i < 8; i++) matrix[8][SIZE - 1 - i] = formatBit(i);
  for (let i = 8; i < 15; i++) matrix[SIZE - 15 + i][8] = formatBit(i);
  matrix[SIZE - 8][8] = true;

  return matrix;
}

export function qrSvgPath(payload: string): string {
  const matrix = makeQrMatrix(payload);
  const quiet = 4;
  const commands: string[] = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (matrix[y][x]) commands.push(`M${x + quiet},${y + quiet}h1v1h-1z`);
    }
  }
  return commands.join("");
}

export const QR_VIEWBOX = `0 0 ${SIZE + 8} ${SIZE + 8}`;
