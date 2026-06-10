import { useMemo } from "react";
import { useI18n } from "../i18n/I18nProvider";
import { fileProcessingLimits } from "../utils/fileProcessingLimits";
import { ToolError } from "./ToolError";

/**
 * Hook centralizado para los textos visibles relacionados con los límites de
 * procesamiento local. Evita repetir `t()` inline en cada renderer y mantiene
 * la fuente del idioma en un solo lugar.
 *
 * Los métodos `get*LimitError` devuelven `string` traducido (no ToolError),
 * porque se usan antes de invocar al service y la UI los muestra directo.
 * Los services siguen lanzando ToolError por código.
 */
export function useFileProcessingLimitLabels() {
  const { t } = useI18n();

  return useMemo(() => {
    return {
      pdfSingle: t("tools.limits.pdfSingle"),
      pdfMultiple: t("tools.limits.pdfMultiple"),
      images: t("tools.limits.images"),
      pdfToImages: t("tools.limits.pdfToImages"),
      splitPdf: t("tools.limits.splitPdf"),

      getPdfFileSizeLimitError(file: File): string | null {
        if (file.size <= fileProcessingLimits.maxPdfFileSizeBytes) return null;
        return t("tools.errors.pdfFileTooLarge", { name: file.name });
      },

      getTotalPdfSizeLimitError(totalSizeBytes: number): string | null {
        if (totalSizeBytes <= fileProcessingLimits.maxTotalPdfSizeBytes) return null;
        return t("tools.errors.totalPdfTooLarge");
      },

      getImageFileSizeLimitError(file: File): string | null {
        if (file.size <= fileProcessingLimits.maxImageFileSizeBytes) return null;
        return t("tools.errors.imageFileTooLarge", { name: file.name });
      },

      getTotalImageSizeLimitError(totalSizeBytes: number): string | null {
        if (totalSizeBytes <= fileProcessingLimits.maxTotalImageSizeBytes) return null;
        return t("tools.errors.totalImageTooLarge");
      },

      getImageCountLimitError(imageCount: number, mode: "perPdf" | "generic" = "perPdf"): string | null {
        if (imageCount <= fileProcessingLimits.maxImageFileCount) return null;
        return t(mode === "perPdf" ? "tools.errors.tooManyImagesForPdf" : "tools.errors.tooManyImagesGeneric");
      },

      getSplitPagesLimitError(outputCount: number): string | null {
        if (outputCount <= fileProcessingLimits.maxGeneratedPageFiles) return null;
        return t("tools.errors.splitPagesLimit");
      },

      getConvertPagesLimitError(outputCount: number): string | null {
        if (outputCount <= fileProcessingLimits.maxGeneratedPageFiles) return null;
        return t("tools.errors.convertPagesLimit");
      },
    };
  }, [t]);
}

/**
 * Mismas validaciones que el hook, pero devuelven ToolError | null, para uso
 * desde services puros que no tienen acceso a `t()`.
 */
export function checkPdfFileSize(file: File): ToolError | null {
  return file.size > fileProcessingLimits.maxPdfFileSizeBytes
    ? new ToolError("tools.errors.pdfFileTooLarge", { name: file.name })
    : null;
}

export function checkTotalPdfSize(totalSizeBytes: number): ToolError | null {
  return totalSizeBytes > fileProcessingLimits.maxTotalPdfSizeBytes
    ? new ToolError("tools.errors.totalPdfTooLarge")
    : null;
}

export function checkImageFileSize(file: File): ToolError | null {
  return file.size > fileProcessingLimits.maxImageFileSizeBytes
    ? new ToolError("tools.errors.imageFileTooLarge", { name: file.name })
    : null;
}

export function checkTotalImageSize(totalSizeBytes: number): ToolError | null {
  return totalSizeBytes > fileProcessingLimits.maxTotalImageSizeBytes
    ? new ToolError("tools.errors.totalImageTooLarge")
    : null;
}
