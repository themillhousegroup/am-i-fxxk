import React, { ChangeEvent, Fragment, useEffect, useState } from 'react';
import { render } from 'react-dom';
import SiteList from './SiteList';
import './style.css';

export type SiteData = {
  Site_title: string;
  Site_streetaddress: string;
  Exposure_date_dtm: string;
  Exposure_time: string;
  Advice_title: string;
};

type PartitionedSiteData = {
  tierOne: Array<SiteData>;
  tierTwo: Array<SiteData>;
};

const getQueryForPostcode = (postcode: string): string =>
  `https://discover.data.vic.gov.au/api/3/action/datastore_search?resource_id=afb52611-6061-4a2b-9110-74c920bede77&q={"Site_postcode":"${postcode}", "Advice_title": "Tier "}&fields=Site_title, Site_streetaddress,  Exposure_date_dtm, Exposure_time ,Advice_title`;

const dedupeByTitle = (data: Array<SiteData>): Array<SiteData> => {
  return data.filter((r, index, self) => (
    self.findIndex(t=>(t.Site_title === r.Site_title))===index
  ));
}

const partitionData = (data: Array<SiteData>): PartitionedSiteData => {
  const tOne = data.filter(record => {
    return record.Advice_title.startsWith('Tier 1');
  });
  const tTwo = data.filter(record => {
    return record.Advice_title.startsWith('Tier 2');
  });
  
  return {
    tierOne: dedupeByTitle(tOne),
    tierTwo: dedupeByTitle(tTwo)
  };
};
const VIC_POSTCODE = /^3\d\d\d$/
const isValidPostcode = (s: string):boolean => {
  return VIC_POSTCODE.test(s);
}

const App = () => {
  const [postcode, setPostcode] = useState('');
  const [data, setData] = useState(undefined);

  const postcodeChanged = (changeEvent: ChangeEvent<HTMLInputElement>) => {
    setData(undefined);
    const newValue = changeEvent.target.value;
    if (isValidPostcode(newValue)) {
      setPostcode(newValue);
    }
  };

  useEffect(() => {
    if (postcode) {
      fetch(getQueryForPostcode(postcode))
        .then(resp => resp.json())
        .then(json => {
          setData(partitionData(json.result.records));
        });
    }
  }, [postcode]);

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
          outlineWidth: 0
        }}
        onChange={postcodeChanged}
      />
      <br />
      <br />
      {(data?.tierOne?.length > 0) && (
        <Fragment>
        <h1
          className="fxxkbox"
          style={{
            backgroundColor: 'red',
            textShadow: '1px 1px grey'
          }}
        >
          U R FXXK
        </h1>
        <h3>
        There are Tier 1 {(data?.tierTwo?.length > 0) && "(and 2)"} Sites in postcode <strong>{postcode}</strong>
        </h3>
        <h4>Tier One</h4>
        <SiteList sites={data.tierOne} />
        {(data?.tierTwo?.length > 0) && (
          <Fragment>
            <h4>Tier Two</h4>
            <SiteList sites={data.tierTwo} />
          </Fragment>
        )}
        
          </Fragment>
      )}
      {(data?.tierOne?.length === 0) && (data?.tierTwo?.length > 0) && (
        <Fragment>
          <h1
            className="fxxkbox"
            style={{
              backgroundColor: 'orange',
              color: 'white',
              textShadow: '1px 1px black'
            }}
          >
            U R A BIT FXXK
          </h1>
          <h3>
            Only Tier 2 Sites in postcode <strong>{postcode}</strong>
            <SiteList sites={data.tierTwo} />
          </h3>
        </Fragment>
      )}
      {(data?.tierOne?.length === 0) && (data?.tierTwo?.length === 0) && (
        <Fragment>
          <h1
            className="fxxkbox"
            style={{
              backgroundColor: 'green',
              color: 'white',
              textShadow: '1px 1px black'
            }}
          >
            U R NOT FXXK
          </h1>
          <h3>
            No Tier 1/2 Sites in postcode <strong>{postcode}</strong>
          </h3>
        </Fragment>
      )}

      {data && (
        <Fragment>
          <br/>
          <br/>
          <br/>
        <h5>Data from <a target="_blank" href="https://discover.data.vic.gov.au/dataset/all-victorian-sars-cov-2-covid-19-current-exposure-sites/resource/afb52611-6061-4a2b-9110-74c920bede77">Victorian Government Dataset</a></h5>
        </Fragment>
      )}
    </div>
  );
};

render(<App />, document.getElementById('root'));
