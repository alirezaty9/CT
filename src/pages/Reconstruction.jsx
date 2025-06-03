import React from "react";
import { useTranslation } from "react-i18next";

export default function Reconstruction() {
  const { t } = useTranslation();

  return <div>{t("reconstruction")}</div>;
}