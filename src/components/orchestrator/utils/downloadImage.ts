import { toPng } from 'html-to-image';

interface DownloadOptions {
  fileName?: string;
  backgroundColor?: string;
  quality?: number;
  pixelRatio?: number;
}

const DEFAULT_SELECTOR = '.react-flow';

export const downloadFlowAsImage = async ({
  fileName = 'orchestrator.png',
  backgroundColor = '#ffffff',
  quality = 0.95,
  pixelRatio = 2,
}: DownloadOptions = {}) => {
  const flowWrapper = document.querySelector(DEFAULT_SELECTOR) as HTMLElement | null;

  if (!flowWrapper) {
    throw new Error('Unable to locate orchestrator canvas for export');
  }

  const dataUrl = await toPng(flowWrapper, {
    backgroundColor,
    cacheBust: true,
    quality,
    pixelRatio,
  });

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  link.click();
};