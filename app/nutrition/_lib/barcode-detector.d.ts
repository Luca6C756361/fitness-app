/**
 * Tipi minimi per la Barcode Detection API nativa (Chrome/Android/Edge).
 * Non ancora presente in lib.dom.d.ts di TypeScript: dichiarata qui solo
 * per i formati che usiamo in BarcodeScanner.
 * https://developer.mozilla.org/docs/Web/API/Barcode_Detection_API
 */

export {};

declare global {
  type BarcodeFormatString =
    | "aztec"
    | "code_128"
    | "code_39"
    | "code_93"
    | "codabar"
    | "data_matrix"
    | "ean_13"
    | "ean_8"
    | "itf"
    | "pdf417"
    | "qr_code"
    | "upc_a"
    | "upc_e"
    | "unknown";

  interface BarcodeDetectorOptions {
    formats: BarcodeFormatString[];
  }

  interface DetectedBarcode {
    boundingBox: DOMRectReadOnly;
    rawValue: string;
    format: BarcodeFormatString;
    cornerPoints: { x: number; y: number }[];
  }

  interface BarcodeDetector {
    detect(image: CanvasImageSource): Promise<DetectedBarcode[]>;
  }

  var BarcodeDetector: {
    prototype: BarcodeDetector;
    new (options?: BarcodeDetectorOptions): BarcodeDetector;
    getSupportedFormats?: () => Promise<BarcodeFormatString[]>;
  };

  interface Window {
    BarcodeDetector?: typeof BarcodeDetector;
  }
}
