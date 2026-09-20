"use client";

import { useEffect, useMemo, useRef, useState, useCallback, type SVGProps, type ComponentType } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { notify } from "@/lib/notifications/toast";
import { useUrlState } from "@/lib/use-url-state";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useSlashFocus } from "@/lib/use-slash-focus";
import { normalizeText } from "@/lib/normalize-text";

import {
  MdAdd2LineIcon, MdAlertLineIcon, MdAlertSolidIcon, MdAlertSolid1Icon,
  MdAllInclusiveLineIcon, MdAppsLineIcon,
  MdArrowBackIosNewLineIcon, MdArrowBackIosNewLine1Icon,
  MdArrowBackLineIcon, MdArrowDownwardLineIcon,
  MdArrowForwardIosLineIcon, MdArrowForwardIosLine1Icon,
  MdArrowForwardLineIcon, MdArrowInsertLineIcon, MdArrowOutwardLineIcon,
  MdArrowUpwardLineIcon, MdAsteriskLineIcon, MdBlockLineIcon, MdBoltSolidIcon,
  MdBookmarkLineIcon, MdBookmarkSolidIcon, MdBugLineIcon, MdCalendarSolidIcon,
  MdChartLineIcon, MdChatLineIcon, MdChatSolidIcon,
  MdCheckLineIcon, MdCheckSolidIcon, MdCicleSolidIcon, MdClipsLineIcon,
  MdClockLineIcon, MdCloseLineIcon, MdCloseSolidIcon,
  MdCloudLineIcon, MdCloudSolidIcon, MdCognitionLineIcon, MdCookieSolidIcon,
  MdCrownSolidIcon, MdDehazeLineIcon, MdDehazeLine1Icon,
  MdDeleteLineIcon, MdDeleteSolidIcon, MdDockToRightLineIcon,
  MdDocLineIcon, MdDocSolidIcon, MdDownloadLineIcon, MdDownloadSolidIcon,
  MdEditSolidIcon, MdEmojiSolidIcon, MdFavoriteLineIcon, MdFavoriteSolidIcon,
  MdFilterLineIcon, MdFolderLineIcon, MdFolderSolidIcon, MdGraphicEqLineIcon,
  MdHelpLineIcon, MdHistoryLineIcon, MdHomeSolidIcon, MdImageLineIcon,
  MdInfoLineIcon, MdInfoSolidIcon, MdInvoiceLineIcon, MdInvoiceSolidIcon,
  MdLanguageLineIcon, MdLibrarySolidIcon, MdLink2LineIcon,
  MdLockLineIcon, MdLockOpenLineIcon, MdLockOpenSolidIcon, MdLockSolidIcon,
  MdLogoutLineIcon, MdMailLineIcon, MdMailSolidIcon,
  MdMediumSoundLineIcon, MdMediumSoundSolidIcon, MdMicLineIcon, MdMinusLineIcon,
  MdMoreLineIcon, MdMoreSolidIcon, MdNoSoundLineIcon, MdNoSoundSolidIcon,
  MdNotificationLineIcon, MdNotificationOnLineIcon, MdNotificationOnSolidIcon,
  MdNotificationSolidIcon, MdOpenFolderLineIcon, MdOpenFolderSolidIcon,
  MdPhotoCameraLineIcon, MdPhotoCameraSolidIcon, MdPlaySolidIcon, MdPlusSolidIcon,
  MdProfileLineIcon, MdQuestionLineIcon, MdQuestionSolidIcon, MdReturnSolidIcon,
  MdSearchLineIcon, MdSettingsLineIcon, MdShopLineIcon, MdShopSolidIcon,
  MdSoundLineIcon, MdSoundSolidIcon, MdToolSolidIcon, MdUploadLineIcon,
  MdVerifiedLineIcon, MdVerifiedShieldLineIcon, MdVerifiedShieldSolidIcon,
  MdVerifiedSolidIcon, MdVisibilityOnSolidIcon, MdVisibilitySolidIcon,
} from "@/components/icons";

import {
  SmAdd2LineIcon, SmAlertLineIcon, SmAlertSolidIcon, SmAlertSolid1Icon,
  SmAllInclusiveLineIcon, SmAppsLineIcon,
  SmArrowBackIosNewLineIcon, SmArrowBackIosNewLine1Icon,
  SmArrowBackLineIcon, SmArrowDownIosLineIcon, SmArrowDownwardLineIcon,
  SmArrowForwardIosLineIcon, SmArrowForwardIosLine1Icon,
  SmArrowForwardLineIcon, SmArrowInsertLineIcon, SmArrowOutwardLineIcon,
  SmArrowUpwardLineIcon, SmAsteriskLineIcon, SmBlockLineIcon,
  SmBookmarkLineIcon, SmBookmarkSolidIcon, SmBugLineIcon, SmCalendarSolidIcon,
  SmChartLineIcon, SmChatLineIcon, SmChatSolidIcon,
  SmCheckLineIcon, SmCheckSolidIcon, SmCicleSolidIcon, SmClipsLineIcon,
  SmClockLineIcon, SmCloseLineIcon, SmCloseSolidIcon,
  SmCloudLineIcon, SmCloudSolidIcon, SmCognitionLineIcon, SmContrastLineIcon,
  SmCookieSolidIcon, SmCrownLineIcon, SmCrownSolidIcon,
  SmDehazeLineIcon, SmDehazeLine1Icon,
  SmDeleteLineIcon, SmDeleteSolidIcon, SmDockToRightLineIcon,
  SmDocLineIcon, SmDocSolidIcon, SmDownloadLineIcon, SmDownloadSolidIcon,
  SmEditSolidIcon, SmEmojiSolidIcon, SmFavoriteLineIcon, SmFavoriteSolidIcon,
  SmFilterLineIcon, SmFolderLineIcon, SmFolderSolidIcon, SmGraphicEqLineIcon,
  SmHelpLineIcon, SmHistoryLineIcon, SmHomeSolidIcon, SmImageLineIcon,
  SmInfoLineIcon, SmInfoSolidIcon, SmInvoiceLineIcon, SmInvoiceSolidIcon,
  SmLanguageLineIcon, SmLibrarySolidIcon, SmLink2LineIcon,
  SmLockLineIcon, SmLockOpenLineIcon, SmLockOpenSolidIcon, SmLockSolidIcon,
  SmLogoutLineIcon, SmMailSolidIcon,
  SmMediumSoundLineIcon, SmMediumSoundSolidIcon,
  SmMessageCircleLineIcon, SmMessageCircleSolidIcon,
  SmMicLineIcon, SmMinusLineIcon,
  SmMoreLineIcon, SmMoreSolidIcon, SmNoSoundLineIcon, SmNoSoundSolidIcon,
  SmNotificationLineIcon, SmNotificationOnLineIcon, SmNotificationOnSolidIcon,
  SmNotificationSolidIcon, SmOpenFolderLineIcon, SmOpenFolderSolidIcon,
  SmPhotoCameraLineIcon, SmPhotoCameraSolidIcon, SmPlaySolidIcon, SmPlusSolidIcon,
  SmProfileLineIcon, SmQuestionLineIcon, SmQuestionSolidIcon, SmReturnSolidIcon,
  SmSearchLineIcon, SmSettingsLineIcon, SmShopLineIcon, SmShopSolidIcon,
  SmSoundLineIcon, SmSoundSolidIcon, SmToolSolidIcon, SmUnionLineIcon,
  SmUploadLineIcon, SmVerifiedLineIcon, SmVerifiedShieldLineIcon,
  SmVerifiedShieldSolidIcon, SmVerifiedSolidIcon,
  SmVisibilityOffSolidIcon, SmVisibilitySolidIcon,
} from "@/components/icons";

import {
  MicroAdmIcon, MicroInfiniteIcon, MicroShieldIcon,
} from "@/components/icons";

type IconEntry = {
  name: string;
  component: ComponentType<SVGProps<SVGSVGElement>>;
  size: "md" | "sm" | "micro";
  variant: "line" | "solid" | "other";
};

function e(name: string, component: ComponentType<SVGProps<SVGSVGElement>>, size: IconEntry["size"], variant: IconEntry["variant"]): IconEntry {
  return { name, component, size, variant };
}

const allIcons: IconEntry[] = [
  // ── MD Line ──
  e("MdAdd2LineIcon", MdAdd2LineIcon, "md", "line"),
  e("MdAlertLineIcon", MdAlertLineIcon, "md", "line"),
  e("MdAllInclusiveLineIcon", MdAllInclusiveLineIcon, "md", "line"),
  e("MdAppsLineIcon", MdAppsLineIcon, "md", "line"),
  e("MdArrowBackIosNewLineIcon", MdArrowBackIosNewLineIcon, "md", "line"),
  e("MdArrowBackIosNewLine1Icon", MdArrowBackIosNewLine1Icon, "md", "line"),
  e("MdArrowBackLineIcon", MdArrowBackLineIcon, "md", "line"),
  e("MdArrowDownwardLineIcon", MdArrowDownwardLineIcon, "md", "line"),
  e("MdArrowForwardIosLineIcon", MdArrowForwardIosLineIcon, "md", "line"),
  e("MdArrowForwardIosLine1Icon", MdArrowForwardIosLine1Icon, "md", "line"),
  e("MdArrowForwardLineIcon", MdArrowForwardLineIcon, "md", "line"),
  e("MdArrowInsertLineIcon", MdArrowInsertLineIcon, "md", "line"),
  e("MdArrowOutwardLineIcon", MdArrowOutwardLineIcon, "md", "line"),
  e("MdArrowUpwardLineIcon", MdArrowUpwardLineIcon, "md", "line"),
  e("MdAsteriskLineIcon", MdAsteriskLineIcon, "md", "line"),
  e("MdBlockLineIcon", MdBlockLineIcon, "md", "line"),
  e("MdBookmarkLineIcon", MdBookmarkLineIcon, "md", "line"),
  e("MdBugLineIcon", MdBugLineIcon, "md", "line"),
  e("MdChartLineIcon", MdChartLineIcon, "md", "line"),
  e("MdChatLineIcon", MdChatLineIcon, "md", "line"),
  e("MdCheckLineIcon", MdCheckLineIcon, "md", "line"),
  e("MdClipsLineIcon", MdClipsLineIcon, "md", "line"),
  e("MdClockLineIcon", MdClockLineIcon, "md", "line"),
  e("MdCloseLineIcon", MdCloseLineIcon, "md", "line"),
  e("MdCloudLineIcon", MdCloudLineIcon, "md", "line"),
  e("MdCognitionLineIcon", MdCognitionLineIcon, "md", "line"),
  e("MdDehazeLineIcon", MdDehazeLineIcon, "md", "line"),
  e("MdDehazeLine1Icon", MdDehazeLine1Icon, "md", "line"),
  e("MdDeleteLineIcon", MdDeleteLineIcon, "md", "line"),
  e("MdDockToRightLineIcon", MdDockToRightLineIcon, "md", "line"),
  e("MdDocLineIcon", MdDocLineIcon, "md", "line"),
  e("MdDownloadLineIcon", MdDownloadLineIcon, "md", "line"),
  e("MdFavoriteLineIcon", MdFavoriteLineIcon, "md", "line"),
  e("MdFilterLineIcon", MdFilterLineIcon, "md", "line"),
  e("MdFolderLineIcon", MdFolderLineIcon, "md", "line"),
  e("MdGraphicEqLineIcon", MdGraphicEqLineIcon, "md", "line"),
  e("MdHelpLineIcon", MdHelpLineIcon, "md", "line"),
  e("MdHistoryLineIcon", MdHistoryLineIcon, "md", "line"),
  e("MdImageLineIcon", MdImageLineIcon, "md", "line"),
  e("MdInfoLineIcon", MdInfoLineIcon, "md", "line"),
  e("MdInvoiceLineIcon", MdInvoiceLineIcon, "md", "line"),
  e("MdLanguageLineIcon", MdLanguageLineIcon, "md", "line"),
  e("MdLink2LineIcon", MdLink2LineIcon, "md", "line"),
  e("MdLockLineIcon", MdLockLineIcon, "md", "line"),
  e("MdLockOpenLineIcon", MdLockOpenLineIcon, "md", "line"),
  e("MdLogoutLineIcon", MdLogoutLineIcon, "md", "line"),
  e("MdMailLineIcon", MdMailLineIcon, "md", "line"),
  e("MdMediumSoundLineIcon", MdMediumSoundLineIcon, "md", "line"),
  e("MdMicLineIcon", MdMicLineIcon, "md", "line"),
  e("MdMinusLineIcon", MdMinusLineIcon, "md", "line"),
  e("MdMoreLineIcon", MdMoreLineIcon, "md", "line"),
  e("MdNoSoundLineIcon", MdNoSoundLineIcon, "md", "line"),
  e("MdNotificationLineIcon", MdNotificationLineIcon, "md", "line"),
  e("MdNotificationOnLineIcon", MdNotificationOnLineIcon, "md", "line"),
  e("MdOpenFolderLineIcon", MdOpenFolderLineIcon, "md", "line"),
  e("MdPhotoCameraLineIcon", MdPhotoCameraLineIcon, "md", "line"),
  e("MdProfileLineIcon", MdProfileLineIcon, "md", "line"),
  e("MdQuestionLineIcon", MdQuestionLineIcon, "md", "line"),
  e("MdSearchLineIcon", MdSearchLineIcon, "md", "line"),
  e("MdSettingsLineIcon", MdSettingsLineIcon, "md", "line"),
  e("MdShopLineIcon", MdShopLineIcon, "md", "line"),
  e("MdSoundLineIcon", MdSoundLineIcon, "md", "line"),
  e("MdUploadLineIcon", MdUploadLineIcon, "md", "line"),
  e("MdVerifiedLineIcon", MdVerifiedLineIcon, "md", "line"),
  e("MdVerifiedShieldLineIcon", MdVerifiedShieldLineIcon, "md", "line"),
  // ── MD Solid ──
  e("MdAlertSolidIcon", MdAlertSolidIcon, "md", "solid"),
  e("MdAlertSolid1Icon", MdAlertSolid1Icon, "md", "solid"),
  e("MdBoltSolidIcon", MdBoltSolidIcon, "md", "solid"),
  e("MdBookmarkSolidIcon", MdBookmarkSolidIcon, "md", "solid"),
  e("MdCalendarSolidIcon", MdCalendarSolidIcon, "md", "solid"),
  e("MdChatSolidIcon", MdChatSolidIcon, "md", "solid"),
  e("MdCheckSolidIcon", MdCheckSolidIcon, "md", "solid"),
  e("MdCicleSolidIcon", MdCicleSolidIcon, "md", "solid"),
  e("MdCloseSolidIcon", MdCloseSolidIcon, "md", "solid"),
  e("MdCloudSolidIcon", MdCloudSolidIcon, "md", "solid"),
  e("MdCookieSolidIcon", MdCookieSolidIcon, "md", "solid"),
  e("MdCrownSolidIcon", MdCrownSolidIcon, "md", "solid"),
  e("MdDeleteSolidIcon", MdDeleteSolidIcon, "md", "solid"),
  e("MdDocSolidIcon", MdDocSolidIcon, "md", "solid"),
  e("MdDownloadSolidIcon", MdDownloadSolidIcon, "md", "solid"),
  e("MdEditSolidIcon", MdEditSolidIcon, "md", "solid"),
  e("MdEmojiSolidIcon", MdEmojiSolidIcon, "md", "solid"),
  e("MdFavoriteSolidIcon", MdFavoriteSolidIcon, "md", "solid"),
  e("MdFolderSolidIcon", MdFolderSolidIcon, "md", "solid"),
  e("MdHomeSolidIcon", MdHomeSolidIcon, "md", "solid"),
  e("MdInfoSolidIcon", MdInfoSolidIcon, "md", "solid"),
  e("MdInvoiceSolidIcon", MdInvoiceSolidIcon, "md", "solid"),
  e("MdLibrarySolidIcon", MdLibrarySolidIcon, "md", "solid"),
  e("MdLockOpenSolidIcon", MdLockOpenSolidIcon, "md", "solid"),
  e("MdLockSolidIcon", MdLockSolidIcon, "md", "solid"),
  e("MdMailSolidIcon", MdMailSolidIcon, "md", "solid"),
  e("MdMediumSoundSolidIcon", MdMediumSoundSolidIcon, "md", "solid"),
  e("MdMoreSolidIcon", MdMoreSolidIcon, "md", "solid"),
  e("MdNoSoundSolidIcon", MdNoSoundSolidIcon, "md", "solid"),
  e("MdNotificationOnSolidIcon", MdNotificationOnSolidIcon, "md", "solid"),
  e("MdNotificationSolidIcon", MdNotificationSolidIcon, "md", "solid"),
  e("MdOpenFolderSolidIcon", MdOpenFolderSolidIcon, "md", "solid"),
  e("MdPhotoCameraSolidIcon", MdPhotoCameraSolidIcon, "md", "solid"),
  e("MdPlaySolidIcon", MdPlaySolidIcon, "md", "solid"),
  e("MdPlusSolidIcon", MdPlusSolidIcon, "md", "solid"),
  e("MdQuestionSolidIcon", MdQuestionSolidIcon, "md", "solid"),
  e("MdReturnSolidIcon", MdReturnSolidIcon, "md", "solid"),
  e("MdShopSolidIcon", MdShopSolidIcon, "md", "solid"),
  e("MdSoundSolidIcon", MdSoundSolidIcon, "md", "solid"),
  e("MdToolSolidIcon", MdToolSolidIcon, "md", "solid"),
  e("MdVerifiedShieldSolidIcon", MdVerifiedShieldSolidIcon, "md", "solid"),
  e("MdVerifiedSolidIcon", MdVerifiedSolidIcon, "md", "solid"),
  e("MdVisibilityOnSolidIcon", MdVisibilityOnSolidIcon, "md", "solid"),
  e("MdVisibilitySolidIcon", MdVisibilitySolidIcon, "md", "solid"),
  // ── SM Line ──
  e("SmAdd2LineIcon", SmAdd2LineIcon, "sm", "line"),
  e("SmAlertLineIcon", SmAlertLineIcon, "sm", "line"),
  e("SmAllInclusiveLineIcon", SmAllInclusiveLineIcon, "sm", "line"),
  e("SmAppsLineIcon", SmAppsLineIcon, "sm", "line"),
  e("SmArrowBackIosNewLineIcon", SmArrowBackIosNewLineIcon, "sm", "line"),
  e("SmArrowBackIosNewLine1Icon", SmArrowBackIosNewLine1Icon, "sm", "line"),
  e("SmArrowBackLineIcon", SmArrowBackLineIcon, "sm", "line"),
  e("SmArrowDownIosLineIcon", SmArrowDownIosLineIcon, "sm", "line"),
  e("SmArrowDownwardLineIcon", SmArrowDownwardLineIcon, "sm", "line"),
  e("SmArrowForwardIosLineIcon", SmArrowForwardIosLineIcon, "sm", "line"),
  e("SmArrowForwardIosLine1Icon", SmArrowForwardIosLine1Icon, "sm", "line"),
  e("SmArrowForwardLineIcon", SmArrowForwardLineIcon, "sm", "line"),
  e("SmArrowInsertLineIcon", SmArrowInsertLineIcon, "sm", "line"),
  e("SmArrowOutwardLineIcon", SmArrowOutwardLineIcon, "sm", "line"),
  e("SmArrowUpwardLineIcon", SmArrowUpwardLineIcon, "sm", "line"),
  e("SmAsteriskLineIcon", SmAsteriskLineIcon, "sm", "line"),
  e("SmBlockLineIcon", SmBlockLineIcon, "sm", "line"),
  e("SmBookmarkLineIcon", SmBookmarkLineIcon, "sm", "line"),
  e("SmBugLineIcon", SmBugLineIcon, "sm", "line"),
  e("SmChartLineIcon", SmChartLineIcon, "sm", "line"),
  e("SmChatLineIcon", SmChatLineIcon, "sm", "line"),
  e("SmCheckLineIcon", SmCheckLineIcon, "sm", "line"),
  e("SmClipsLineIcon", SmClipsLineIcon, "sm", "line"),
  e("SmClockLineIcon", SmClockLineIcon, "sm", "line"),
  e("SmCloseLineIcon", SmCloseLineIcon, "sm", "line"),
  e("SmCloudLineIcon", SmCloudLineIcon, "sm", "line"),
  e("SmCognitionLineIcon", SmCognitionLineIcon, "sm", "line"),
  e("SmContrastLineIcon", SmContrastLineIcon, "sm", "line"),
  e("SmCrownLineIcon", SmCrownLineIcon, "sm", "line"),
  e("SmDehazeLineIcon", SmDehazeLineIcon, "sm", "line"),
  e("SmDehazeLine1Icon", SmDehazeLine1Icon, "sm", "line"),
  e("SmDeleteLineIcon", SmDeleteLineIcon, "sm", "line"),
  e("SmDockToRightLineIcon", SmDockToRightLineIcon, "sm", "line"),
  e("SmDocLineIcon", SmDocLineIcon, "sm", "line"),
  e("SmDownloadLineIcon", SmDownloadLineIcon, "sm", "line"),
  e("SmFavoriteLineIcon", SmFavoriteLineIcon, "sm", "line"),
  e("SmFilterLineIcon", SmFilterLineIcon, "sm", "line"),
  e("SmFolderLineIcon", SmFolderLineIcon, "sm", "line"),
  e("SmGraphicEqLineIcon", SmGraphicEqLineIcon, "sm", "line"),
  e("SmHelpLineIcon", SmHelpLineIcon, "sm", "line"),
  e("SmHistoryLineIcon", SmHistoryLineIcon, "sm", "line"),
  e("SmImageLineIcon", SmImageLineIcon, "sm", "line"),
  e("SmInfoLineIcon", SmInfoLineIcon, "sm", "line"),
  e("SmInvoiceLineIcon", SmInvoiceLineIcon, "sm", "line"),
  e("SmLanguageLineIcon", SmLanguageLineIcon, "sm", "line"),
  e("SmLink2LineIcon", SmLink2LineIcon, "sm", "line"),
  e("SmLockLineIcon", SmLockLineIcon, "sm", "line"),
  e("SmLockOpenLineIcon", SmLockOpenLineIcon, "sm", "line"),
  e("SmLogoutLineIcon", SmLogoutLineIcon, "sm", "line"),
  e("SmMediumSoundLineIcon", SmMediumSoundLineIcon, "sm", "line"),
  e("SmMessageCircleLineIcon", SmMessageCircleLineIcon, "sm", "line"),
  e("SmMicLineIcon", SmMicLineIcon, "sm", "line"),
  e("SmMinusLineIcon", SmMinusLineIcon, "sm", "line"),
  e("SmMoreLineIcon", SmMoreLineIcon, "sm", "line"),
  e("SmNoSoundLineIcon", SmNoSoundLineIcon, "sm", "line"),
  e("SmNotificationLineIcon", SmNotificationLineIcon, "sm", "line"),
  e("SmNotificationOnLineIcon", SmNotificationOnLineIcon, "sm", "line"),
  e("SmOpenFolderLineIcon", SmOpenFolderLineIcon, "sm", "line"),
  e("SmPhotoCameraLineIcon", SmPhotoCameraLineIcon, "sm", "line"),
  e("SmProfileLineIcon", SmProfileLineIcon, "sm", "line"),
  e("SmQuestionLineIcon", SmQuestionLineIcon, "sm", "line"),
  e("SmSearchLineIcon", SmSearchLineIcon, "sm", "line"),
  e("SmSettingsLineIcon", SmSettingsLineIcon, "sm", "line"),
  e("SmShopLineIcon", SmShopLineIcon, "sm", "line"),
  e("SmSoundLineIcon", SmSoundLineIcon, "sm", "line"),
  e("SmUnionLineIcon", SmUnionLineIcon, "sm", "line"),
  e("SmUploadLineIcon", SmUploadLineIcon, "sm", "line"),
  e("SmVerifiedLineIcon", SmVerifiedLineIcon, "sm", "line"),
  e("SmVerifiedShieldLineIcon", SmVerifiedShieldLineIcon, "sm", "line"),
  // ── SM Solid ──
  e("SmAlertSolidIcon", SmAlertSolidIcon, "sm", "solid"),
  e("SmAlertSolid1Icon", SmAlertSolid1Icon, "sm", "solid"),
  e("SmBookmarkSolidIcon", SmBookmarkSolidIcon, "sm", "solid"),
  e("SmCalendarSolidIcon", SmCalendarSolidIcon, "sm", "solid"),
  e("SmChatSolidIcon", SmChatSolidIcon, "sm", "solid"),
  e("SmCheckSolidIcon", SmCheckSolidIcon, "sm", "solid"),
  e("SmCicleSolidIcon", SmCicleSolidIcon, "sm", "solid"),
  e("SmCloseSolidIcon", SmCloseSolidIcon, "sm", "solid"),
  e("SmCloudSolidIcon", SmCloudSolidIcon, "sm", "solid"),
  e("SmCookieSolidIcon", SmCookieSolidIcon, "sm", "solid"),
  e("SmCrownSolidIcon", SmCrownSolidIcon, "sm", "solid"),
  e("SmDeleteSolidIcon", SmDeleteSolidIcon, "sm", "solid"),
  e("SmDocSolidIcon", SmDocSolidIcon, "sm", "solid"),
  e("SmDownloadSolidIcon", SmDownloadSolidIcon, "sm", "solid"),
  e("SmEditSolidIcon", SmEditSolidIcon, "sm", "solid"),
  e("SmEmojiSolidIcon", SmEmojiSolidIcon, "sm", "solid"),
  e("SmFavoriteSolidIcon", SmFavoriteSolidIcon, "sm", "solid"),
  e("SmFolderSolidIcon", SmFolderSolidIcon, "sm", "solid"),
  e("SmHomeSolidIcon", SmHomeSolidIcon, "sm", "solid"),
  e("SmInfoSolidIcon", SmInfoSolidIcon, "sm", "solid"),
  e("SmInvoiceSolidIcon", SmInvoiceSolidIcon, "sm", "solid"),
  e("SmLibrarySolidIcon", SmLibrarySolidIcon, "sm", "solid"),
  e("SmLockOpenSolidIcon", SmLockOpenSolidIcon, "sm", "solid"),
  e("SmLockSolidIcon", SmLockSolidIcon, "sm", "solid"),
  e("SmMailSolidIcon", SmMailSolidIcon, "sm", "solid"),
  e("SmMediumSoundSolidIcon", SmMediumSoundSolidIcon, "sm", "solid"),
  e("SmMessageCircleSolidIcon", SmMessageCircleSolidIcon, "sm", "solid"),
  e("SmMoreSolidIcon", SmMoreSolidIcon, "sm", "solid"),
  e("SmNoSoundSolidIcon", SmNoSoundSolidIcon, "sm", "solid"),
  e("SmNotificationOnSolidIcon", SmNotificationOnSolidIcon, "sm", "solid"),
  e("SmNotificationSolidIcon", SmNotificationSolidIcon, "sm", "solid"),
  e("SmOpenFolderSolidIcon", SmOpenFolderSolidIcon, "sm", "solid"),
  e("SmPhotoCameraSolidIcon", SmPhotoCameraSolidIcon, "sm", "solid"),
  e("SmPlaySolidIcon", SmPlaySolidIcon, "sm", "solid"),
  e("SmPlusSolidIcon", SmPlusSolidIcon, "sm", "solid"),
  e("SmQuestionSolidIcon", SmQuestionSolidIcon, "sm", "solid"),
  e("SmReturnSolidIcon", SmReturnSolidIcon, "sm", "solid"),
  e("SmShopSolidIcon", SmShopSolidIcon, "sm", "solid"),
  e("SmSoundSolidIcon", SmSoundSolidIcon, "sm", "solid"),
  e("SmToolSolidIcon", SmToolSolidIcon, "sm", "solid"),
  e("SmVerifiedShieldSolidIcon", SmVerifiedShieldSolidIcon, "sm", "solid"),
  e("SmVerifiedSolidIcon", SmVerifiedSolidIcon, "sm", "solid"),
  e("SmVisibilityOffSolidIcon", SmVisibilityOffSolidIcon, "sm", "solid"),
  e("SmVisibilitySolidIcon", SmVisibilitySolidIcon, "sm", "solid"),
  // ── Micro ──
  e("MicroAdmIcon", MicroAdmIcon, "micro", "other"),
  e("MicroInfiniteIcon", MicroInfiniteIcon, "micro", "other"),
  e("MicroShieldIcon", MicroShieldIcon, "micro", "other"),
];

function CopySvgButton({
  svgRef,
  name,
}: {
  svgRef: React.RefObject<SVGSVGElement | null>;
  name: string;
}) {
  const handleCopy = useCallback(async () => {
    if (!svgRef.current) return;
    const svg = svgRef.current.outerHTML;
    try {
      await navigator.clipboard.writeText(svg);
      notify.success("Copiado");
    } catch (err) {
      notify.fromError(err, "Não foi possível copiar");
    }
  }, [svgRef]);

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={handleCopy}
      className="w-full"
      aria-label={`Copiar SVG de ${name}`}
    >
      Copiar SVG
    </Button>
  );
}

function IconCard({ entry }: { entry: IconEntry }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const Icon = entry.component;

  const displayName = entry.name
    .replace(/^(Md|Sm|Micro)/, "")
    .replace(/Icon$/, "")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="group flex flex-col items-center gap-2 rounded-lg border border-transparent p-3 transition-colors hover:border-foreground/10 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        >
          <Icon className="size-6 text-foreground transition-transform motion-safe:group-hover:scale-110" aria-hidden="true" />
          <span className="max-w-full truncate text-xs leading-tight text-muted-foreground">
            {displayName}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent">
            <Icon ref={svgRef} className="size-6 text-foreground" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="truncate text-sm font-medium">{entry.name}</p>
            <p className="text-xs text-muted-foreground">
              {entry.size} / {entry.variant}
            </p>
          </div>
        </div>
        <div className="rounded-md bg-accent/50 px-2.5 py-1.5">
          <code className="block truncate text-caption text-muted-foreground">
            {`import { ${entry.name} }`}
          </code>
          <code className="block truncate text-caption text-muted-foreground">
            {`  from "@/components/icons"`}
          </code>
        </div>
        <CopySvgButton svgRef={svgRef} name={entry.name} />
      </PopoverContent>
    </Popover>
  );
}

type SizeFilter = "all" | "md" | "sm" | "micro";
type VariantFilter = "all" | "line" | "solid";

const SIZE_FILTERS: readonly SizeFilter[] = ["all", "md", "sm", "micro"];
const VARIANT_FILTERS: readonly VariantFilter[] = ["all", "line", "solid"];

function isSizeFilter(v: string): v is SizeFilter {
  return (SIZE_FILTERS as readonly string[]).includes(v);
}
function isVariantFilter(v: string): v is VariantFilter {
  return (VARIANT_FILTERS as readonly string[]).includes(v);
}

const FILTER_ACTIVE = "bg-foreground text-background hover:bg-foreground/90";

interface IconGalleryProps {
  /** Busca controlada por fora (ex.: campo do AssetPageShell). Quando ausente, o campo interno é exibido. */
  externalSearch?: string;
  /** Limpa a busca externa — chamado por "Limpar filtros". */
  onClearSearch?: () => void;
  /** Reporta quantos ícones sobraram após os filtros (contador do shell). */
  onCountChange?: (count: number) => void;
  /**
   * Persiste busca, tamanho e variante na URL (`?q=&size=&variant=`). Exige um
   * `<Suspense>` acima (useSearchParams). Fora do shell de assets (ex.: o
   * markdown-renderer das docs) deixe desligado — lá o estado é local.
   */
  syncUrl?: boolean;
}

interface FilterState {
  sizeFilter: SizeFilter;
  setSizeFilter: (v: SizeFilter) => void;
  variantFilter: VariantFilter;
  setVariantFilter: (v: VariantFilter) => void;
  /** Busca do campo interno (ignorada quando há `externalSearch`). */
  internalSearch: string;
  setInternalSearch: (v: string) => void;
}

function IconGalleryView({
  externalSearch,
  onClearSearch,
  onCountChange,
  sizeFilter,
  setSizeFilter,
  variantFilter,
  setVariantFilter,
  internalSearch,
  setInternalSearch,
}: Omit<IconGalleryProps, "syncUrl"> & FilterState) {
  const search = externalSearch ?? internalSearch;
  const searchRef = useRef<HTMLInputElement>(null);
  // "/" só pertence a esta galeria quando ela mostra o próprio campo; com
  // `externalSearch` quem responde é a busca do shell.
  useSlashFocus(searchRef, externalSearch === undefined);

  const filtered = useMemo(() => {
    // Busca insensível a acento (os nomes são ASCII, o termo digitado nem sempre).
    const q = normalizeText(search);
    return allIcons.filter((entry) => {
      if (sizeFilter !== "all" && entry.size !== sizeFilter) return false;
      if (variantFilter !== "all" && entry.variant !== variantFilter) return false;
      if (q) return normalizeText(entry.name).includes(q);
      return true;
    });
  }, [search, sizeFilter, variantFilter]);

  useEffect(() => {
    onCountChange?.(filtered.length);
  }, [filtered.length, onCountChange]);

  const clearAll = () => {
    setInternalSearch("");
    onClearSearch?.();
    setSizeFilter("all");
    setVariantFilter("all");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2">
        {externalSearch === undefined && (
          <div className="relative w-56">
            <input
              ref={searchRef}
              type="search"
              placeholder="Buscar ícones…"
              aria-label="Buscar ícones"
              aria-keyshortcuts="/"
              value={internalSearch}
              onChange={(e) => setInternalSearch(e.target.value)}
              className="h-9 w-full rounded-field border border-foreground/15 bg-transparent pl-3 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/70"
            />
            <kbd
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 rounded border border-border/60 bg-surface-900 px-1.5 font-mono text-caption text-muted-foreground sm:block"
            >
              /
            </kbd>
          </div>
        )}

        <div className="flex gap-1" role="group" aria-label="Filtrar por tamanho">
          {SIZE_FILTERS.map((s) => (
            <Button
              key={s}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setSizeFilter(s)}
              aria-pressed={sizeFilter === s}
              className={`rounded-full ${sizeFilter === s ? FILTER_ACTIVE : ""}`}
            >
              {s === "all" ? "Todos os tamanhos" : s.toUpperCase()}
            </Button>
          ))}
        </div>

        <div className="flex gap-1" role="group" aria-label="Filtrar por variante">
          {VARIANT_FILTERS.map((v) => (
            <Button
              key={v}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setVariantFilter(v)}
              aria-pressed={variantFilter === v}
              className={`rounded-full ${variantFilter === v ? FILTER_ACTIVE : ""}`}
            >
              {v === "all" ? "Todas as variantes" : v.charAt(0).toUpperCase() + v.slice(1)}
            </Button>
          ))}
        </div>

        {/* Contador local só quando ninguém acima já exibe um (evita duplicar o aria-live). */}
        {!onCountChange && (
          <span className="ml-auto text-xs text-muted-foreground" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "ícone" : "ícones"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-1">
        {filtered.map((entry) => (
          <IconCard key={entry.name} entry={entry} />
        ))}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          variant="filtered"
          title="Nenhum ícone encontrado"
          description="Tente outro termo ou limpe os filtros."
          onClear={clearAll}
        />
      )}
    </div>
  );
}

function noop() {}

/**
 * Busca, tamanho e variante persistidos na query string (`?q=&size=&variant=`).
 *
 * Quando o shell da página já controla a busca (`externalSearch`), ele é o dono
 * de `?q=` — aqui o campo interno nem é renderizado, então escrever na mesma
 * chave só criaria dois escritores com dois debounces.
 */
function UrlFilteredIconGallery(props: Omit<IconGalleryProps, "syncUrl">) {
  const shellOwnsSearch = props.externalSearch !== undefined;
  const [sizeRaw, setSizeRaw] = useUrlState<string>("size", "all");
  const [variantRaw, setVariantRaw] = useUrlState<string>("variant", "all");
  const [qRaw, setQRaw] = useUrlState<string>("q", "");
  const q = shellOwnsSearch ? "" : qRaw;
  const setQ = shellOwnsSearch ? noop : setQRaw;

  // Input local (digitação fluida) → debounce 250ms → URL. Nunca ligue o
  // `value` do campo direto à URL.
  const [search, setSearch] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    // A URL mudou por fora (voltar/avançar, limpar filtros): sincroniza.
    setPrevQ(q);
    setSearch(q);
  }
  const debouncedSearch = useDebouncedValue(search, 250);
  useEffect(() => {
    if (search !== debouncedSearch) return; // ainda digitando
    if (debouncedSearch !== q) setQ(debouncedSearch);
  }, [search, debouncedSearch, q, setQ]);

  return (
    <IconGalleryView
      {...props}
      sizeFilter={isSizeFilter(sizeRaw) ? sizeRaw : "all"}
      setSizeFilter={setSizeRaw}
      variantFilter={isVariantFilter(variantRaw) ? variantRaw : "all"}
      setVariantFilter={setVariantRaw}
      internalSearch={search}
      setInternalSearch={setSearch}
    />
  );
}

/** Filtros em estado local (uso em docs/markdown, sem Suspense). */
function LocalFilteredIconGallery(props: Omit<IconGalleryProps, "syncUrl">) {
  const [sizeFilter, setSizeFilter] = useState<SizeFilter>("all");
  const [variantFilter, setVariantFilter] = useState<VariantFilter>("all");
  const [search, setSearch] = useState("");
  return (
    <IconGalleryView
      {...props}
      sizeFilter={sizeFilter}
      setSizeFilter={setSizeFilter}
      variantFilter={variantFilter}
      setVariantFilter={setVariantFilter}
      internalSearch={search}
      setInternalSearch={setSearch}
    />
  );
}

function IconGallery({ syncUrl = false, ...props }: IconGalleryProps = {}) {
  return syncUrl ? <UrlFilteredIconGallery {...props} /> : <LocalFilteredIconGallery {...props} />;
}

export { IconGallery };
