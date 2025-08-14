declare module 'gifenc' {
  export interface GIFEncoderInstance {
    writeFrame(
      indexedData: Uint8Array,
      width: number,
      height: number,
      options?: {
        palette?: Uint8Array[]
        delay?: number
        dispose?: number
        transparent?: boolean | number
      }
    ): void
    finish(): void
    bytesView(): Uint8Array
  }

  export function GIFEncoder(): GIFEncoderInstance
  export function quantize(rgbData: Uint8Array, maxColors: number): Uint8Array[]
  export function applyPalette(rgbData: Uint8Array, palette: Uint8Array[]): Uint8Array
}
