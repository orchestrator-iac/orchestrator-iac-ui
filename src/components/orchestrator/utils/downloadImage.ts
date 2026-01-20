import { toPng } from "html-to-image";

interface DownloadOptions {
  fileName?: string;
  backgroundColor?: string;
  quality?: number;
  pixelRatio?: number;
}

const DEFAULT_SELECTOR = ".react-flow";

/**
 * Generate the orchestrator canvas as a PNG data URL (without downloading)
 * Useful for saving to backend/S3
 */
export const generateFlowImage = async ({
  backgroundColor = "transparent",
  quality = 0.95,
  pixelRatio = 2,
}: Omit<DownloadOptions, "fileName"> = {}): Promise<string> => {
  const flowWrapper = document.querySelector(DEFAULT_SELECTOR) as HTMLElement;

  if (!flowWrapper) {
    throw new Error("Unable to locate orchestrator canvas for export");
  }

  const dataUrl = await toPng(flowWrapper, {
    backgroundColor,
    cacheBust: true,
    quality,
    pixelRatio,
    skipFonts: true,
    filter: (node: HTMLElement) => {
      // Filter out UI controls from the image
      const exclusionClasses = [
        "react-flow__minimap",
        "react-flow__controls",
        "react-flow__panel",
      ];

      if (node.classList) {
        return !exclusionClasses.some((className) =>
          node.classList.contains(className),
        );
      }

      return true;
    },
  });

  return dataUrl;
};

/**
 * Download the orchestrator canvas as a PNG image
 */
export const downloadFlowAsImage = async ({
  fileName = "orchestrator.png",
  backgroundColor = "transparent",
  quality = 0.95,
  pixelRatio = 2,
}: DownloadOptions = {}) => {
  // Generate the image
  const dataUrl = await generateFlowImage({
    backgroundColor,
    quality,
    pixelRatio,
  });

  // Download it
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.click();
};

/**
 * Convert a data URL to a File object for uploading
 */
export const dataUrlToFile = (dataUrl: string, fileName: string): File => {
  const arr = dataUrl.split(",");
  const mime = /:(.*?);/.exec(arr[0])?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], fileName, { type: mime });
};
