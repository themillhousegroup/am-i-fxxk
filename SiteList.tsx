import React from 'react';
import { SiteData } from './typings';

const SiteList = ({ sites }: { sites: Array<SiteData> }) => {
  return (
    <div>
      {sites.map((site) => (
        <h5 className="siteListRow" key={site.Site_title}>
          {site.Site_title} | {site.Site_streetaddress}
        </h5>
      ))}
    </div>
  );
};

export default SiteList;
