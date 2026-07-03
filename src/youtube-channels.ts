/** Owner YouTube channels — used for video posts and embed allowlists. */
export const youtubeChannels = [
  {
    key: "arabtechtrends",
    label: "عرب تك",
    labelEn: "Arab Tech Trends",
    href: "https://www.youtube.com/@arabtechtrends",
    channelId: "UChrliFvWW35aSvkcMkbjJhA"
  },
  {
    key: "invoices-reader",
    label: "قارئ الفواتير",
    labelEn: "Invoices Reader",
    href: "https://www.youtube.com/channel/UC_ZB9oGAXykxhe9ZzTKBkag",
    channelId: "UC_ZB9oGAXykxhe9ZzTKBkag"
  },
  {
    key: "elnabarawi",
    label: "elnabarawi",
    labelEn: "elnabarawi",
    href: "https://www.youtube.com/@elnabarawi",
    channelId: "UC8CyTYo_qz4T5onLKjhLhMg"
  }
] as const;

export const ownerYouTubeChannelIds = new Set(
  youtubeChannels.map((c) => c.channelId)
);
