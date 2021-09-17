import React, { useState, useEffect, ChangeEvent, Fragment } from 'react';
import { render } from 'react-dom';
import FxxkBox from './FxxkBox';
import SiteList from './SiteList';
import './style.css';
import { PartitionedSiteData, SiteData } from './typings';

const getQueryForPostcode = (postcode: string): string =>
  `https://discover.data.vic.gov.au/api/3/action/datastore_search?resource_id=afb52611-6061-4a2b-9110-74c920bede77&q={"Site_postcode":"${postcode}", "Advice_title": "Tier "}&fields=Site_title, Site_streetaddress,  Exposure_date_dtm, Exposure_time ,Advice_title`;

const dedupeByTitle = (data: Array<SiteData>): Array<SiteData> => {
  return data.filter(
    (r, index, self) =>
      self.findIndex((t) => t.Site_title === r.Site_title) === index
  );
};

const partitionData = (data: Array<SiteData>): PartitionedSiteData => {
  const tOne = data.filter((record) => {
    return record.Advice_title.startsWith('Tier 1');
  });
  const tTwo = data.filter((record) => {
    return record.Advice_title.startsWith('Tier 2');
  });

  return {
    tierOne: dedupeByTitle(tOne),
    tierTwo: dedupeByTitle(tTwo),
  };
};
const VIC_POSTCODE = /^3\d\d\d$/;
const isValidPostcode = (s: string): boolean => {
  return VIC_POSTCODE.test(s);
};

const levels: Array<FxxkLevel> = [
  {
    heading: 'LOADING',
    backgroundColor: 'LightSteelBlue',
    textShadowColor: 'grey',
    textColor: 'black',
    extraCss: { opacity: 0.2 },
    activeWhen: (data, postcode) => postcode && !data,
    dataFragment: () => null,
  },
  {
    heading: 'U R FXXK',
    backgroundColor: 'red',
    textShadowColor: 'grey',
    textColor: 'black',
    activeWhen: (data) => data?.tierOne?.length > 0,
    dataFragment: (data, postcode) => (
      <Fragment>
        <h3>
          There are Tier 1 {data?.tierTwo?.length > 0 && '(and 2)'} Sites in
          postcode <strong>{postcode}</strong>
        </h3>
        <h4>Tier One</h4>
        <SiteList sites={data.tierOne} />
        {data?.tierTwo?.length > 0 && (
          <Fragment>
            <h4>Tier Two</h4>
            <SiteList sites={data.tierTwo} />
          </Fragment>
        )}
      </Fragment>
    ),
  },
  {
    heading: 'U R A BIT FXXK',
    backgroundColor: 'orange',
    textShadowColor: 'black',
    textColor: 'white',
    activeWhen: (data) =>
      data?.tierOne?.length === 0 && data?.tierTwo?.length > 0,
    dataFragment: (data, postcode) => (
      <h3>
        Only Tier 2 Sites in postcode <strong>{postcode}</strong>
        <SiteList sites={data.tierTwo} />
      </h3>
    ),
  },
  {
    heading: 'U R NOT FXXK',
    backgroundColor: 'green',
    textShadowColor: 'black',
    textColor: 'white',
    activeWhen: (data) =>
      data?.tierOne?.length === 0 && data?.tierTwo?.length === 0,
    dataFragment: (_, postcode) => (
      <h3>
        No Tier 1/2 Sites in postcode <strong>{postcode}</strong>
      </h3>
    ),
  },
];

const App = () => {
  const [postcode, setPostcode] = useState<string | undefined>(undefined);
  const [data, setData] = useState<PartitionedSiteData | undefined>(undefined);

  const postcodeChanged = (changeEvent: ChangeEvent<HTMLInputElement>) => {
    setData(undefined);
    const newPostcode = changeEvent.target.value;
    setPostcode(isValidPostcode(newPostcode) ? newPostcode : undefined);
  };

  useEffect(() => {
    if (postcode) {
      fetch(getQueryForPostcode(postcode))
        .then((resp) => resp.json())
        .then((json) => {
          setData(partitionData(json.result.records));
        });
    }
  }, [postcode]);

  const fxxkLevel = levels.find((level) => level.activeWhen(data, postcode));

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Enter Your Victorian Postcode</h1>
      <input
        type="text"
        maxLength={4}
        placeholder="e.g. 3068"
        style={{
          fontSize: '28px',
          maxWidth: '5em',
          textAlign: 'center',
          borderRadius: '8px',
          outlineWidth: 0,
        }}
        disabled={postcode && !data}
        onChange={postcodeChanged}
      />
      <br />
      <br />
      {fxxkLevel && <FxxkBox level={fxxkLevel} />}
      {fxxkLevel && fxxkLevel.dataFragment(data, postcode)}
      <br />
      <br />
      <br />
      <h5>
        Data from{' '}
        <a
          target="_blank"
          href="https://discover.data.vic.gov.au/dataset/all-victorian-sars-cov-2-covid-19-current-exposure-sites/resource/afb52611-6061-4a2b-9110-74c920bede77"
        >
          Victorian Government Dataset
        </a>
      </h5>
    </div>
  );
};

render(<App />, document.getElementById('root'));
