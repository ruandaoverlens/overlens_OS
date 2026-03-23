/**
 * Lucide → icon-library mapping
 *
 * Maps lucide-react icon names to their icon-library equivalents.
 * Icons without equivalents (text formatting, Calculator, Slash, ChevronsUpDown)
 * should continue using lucide-react.
 */

// Direct component imports for tree-shaking
export { SmArrowDownwardLineIcon as ChevronDownIcon } from "./sm/sm-arrow-downward-line";
export { SmArrowUpwardLineIcon as ChevronUpIcon } from "./sm/sm-arrow-upward-line";
export { SmArrowBackIosNewLineIcon as ChevronLeftIcon } from "./sm/sm-arrow-back-ios-new-line";
export { SmArrowForwardIosLineIcon as ChevronRightIcon } from "./sm/sm-arrow-forward-ios-line";
export { SmArrowBackLineIcon as ArrowLeftIcon } from "./sm/sm-arrow-back-line";
export { SmArrowForwardLineIcon as ArrowRightIcon } from "./sm/sm-arrow-forward-line";
export { SmCheckLineIcon as CheckIcon } from "./sm/sm-check-line";
export { SmCloseLineIcon as XIcon } from "./sm/sm-close-line";
export { SmCloseSolidIcon as XCircleIcon } from "./sm/sm-close-solid";
export { SmSearchLineIcon as SearchIcon } from "./sm/sm-search-line";
export { SmMinusLineIcon as MinusIcon } from "./sm/sm-minus-line";
export { SmCicleSolidIcon as CircleIcon } from "./sm/sm-cicle-solid";
export { SmDehazeLineIcon as GripVerticalIcon } from "./sm/sm-dehaze-line";
export { SmMoreSolidIcon as MoreHorizontalIcon } from "./sm/sm-more-solid";
export { SmDockToRightLineIcon as PanelLeftIcon } from "./sm/sm-dock-to-right-line";
export { SmCheckSolidIcon as CheckCircle2Icon } from "./sm/sm-check-solid";
export { SmCloseSolidIcon as OctagonXIcon } from "./sm/sm-close-solid";
export { SmAlertSolidIcon as TriangleAlertIcon } from "./sm/sm-alert-solid";
export { SmInfoSolidIcon as InfoIcon } from "./sm/sm-info-solid";
export { SmInfoLineIcon as InfoLineIcon } from "./sm/sm-info-line";

/**
 * Icons that should remain lucide-react (no icon-library equivalent):
 * - Bold, Italic, Underline (text formatting)
 * - AlignLeft, AlignCenter, AlignRight (text alignment)
 * - Calculator
 * - Slash
 * - ChevronsUpDown
 * - Terminal
 * - Loader2 (replaced with CSS spinner)
 */
