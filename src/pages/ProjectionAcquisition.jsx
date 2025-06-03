import React from "react";
import { useTranslation } from "react-i18next";

export default function ProjectionAcquisition() {
  const { t } = useTranslation();

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">{t("projectionAcquisition")}</h1>
    </div>
  );
}