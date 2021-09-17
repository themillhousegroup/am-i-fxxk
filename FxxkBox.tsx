import React from 'react';
import { FxxkLevel } from './typings';

type FxxkBoxProps = {
  level: FxxkLevel;
};

const FxxkBox = ({ level }: FxxkBoxProps) => {
  const { backgroundColor, textShadowColor, textColor, heading, extraCss } =
    level;
  return (
    <h1
      className="fxxkbox"
      style={{
        backgroundColor,
        textShadow: `1px 1px ${textShadowColor}`,
        color: textColor,
        ...extraCss,
      }}
    >
      {heading}
    </h1>
  );
};

export default FxxkBox;
