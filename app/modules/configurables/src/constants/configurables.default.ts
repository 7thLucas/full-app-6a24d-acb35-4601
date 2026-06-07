/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  primary: string;
  secondary: string;
  accent: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  tagline: string;
  startDescription: string;
  logoUrl: string;
  defaultPlayerName: string;
  startButtonLabel: string;
  brandColor: TBrandColor;
  showRomanizationDefault: boolean;
  showEnglishDefault: boolean;
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "Hongdae Korean Quest",
  tagline: "A cozy pixel adventure through Hongdae, Seoul",
  startDescription:
    "You just arrived in Hongdae. Walk the streets, talk to locals, order coffee, buy street food, and learn real Korean — one cozy conversation at a time.",
  logoUrl: "/logo.png",
  defaultPlayerName: "Alex",
  startButtonLabel: "Start Your Adventure",
  brandColor: {
    primary: "#E8964A", // golden-hour amber
    secondary: "#F2C9A0", // warm peach
    accent: "#7FB7A6", // soft mint
  },
  showRomanizationDefault: true,
  showEnglishDefault: true,
};
