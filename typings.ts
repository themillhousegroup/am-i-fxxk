import { CSSProperties } from 'react';

export type SiteData = {
  Site_title: string;
  Site_streetaddress: string;
  Exposure_date_dtm: string;
  Exposure_time: string;
  Advice_title: string;
};

export type PartitionedSiteData = {
  tierOne: Array<SiteData>;
  tierTwo: Array<SiteData>;
};

export type FxxkLevel = {
  heading: string;
  backgroundColor: string;
  textShadowColor: string;
  textColor: string;
  extraCss?: CSSProperties;
  activeWhen: (
    data: PartitionedSiteData | undefined,
    postcode: string | undefined
  ) => boolean;
  dataFragment: (
    data: PartitionedSiteData | undefined,
    postcode: string
  ) => React.ReactNode;
};
