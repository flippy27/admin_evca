import * as React from "react";
import Svg, { LinearGradient, Path, Stop } from "react-native-svg";

interface DhemaxLogoProps {
  width?: number;

  height?: number;
}
export function DhemaxLogo({ width = 64, height = 64 }: DhemaxLogoProps) {
  return (
    <Svg
      id="Capa_1"
      x="0px"
      y="0px"
      width={width}
      height={height}
      viewBox="0 0 24.7 26"
      preserveAspectRatio="xMidYMid meet"
      //enableBackground="new 0 0 24.7 26"
    >
      <Path
        d="M6.2 7.2H3.1c-.1 0-.2.2-.1.3l5 6.8v.2l-5.1 6.8c-.1.1 0 .3.1.3h3.2c.2 0 .4-.1.5-.3l5-6.7c.1-.2.1-.4 0-.5l-5-6.7c-.1-.1-.3-.2-.5-.2z"
        fill="#fff"
      />
      <LinearGradient
        id="SVGID_1_"
        gradientUnits="userSpaceOnUse"
        x1={21.1323}
        y1={27.3117}
        x2={14.3755}
        y2={-1.7946}
      >
        <Stop offset={0} stopColor="#38baec" />
        <Stop offset={0.07386206} stopColor="#40bbe1" />
        <Stop offset={0.2071} stopColor="#53bfc1" />
        <Stop offset={0.3844} stopColor="#73c58e" />
        <Stop offset={0.5965} stopColor="#9ecc48" />
        <Stop offset={0.7942} stopColor="#cad400" />
      </LinearGradient>
      <Path
        d="M19.4 23c-.3.7-1 1.2-1.8 1.2-.6 0-1.2-.3-1.6-.7l-2.2-2.6c-1.4-1.8-1.5-4.2-.2-6.1l.2-.2 5.3 6.4c.6.4.7 1.2.3 2zm2-20.4c-.2-.2-.5-.4-.8-.6-.9-.3-1.8 0-2.3.6l-4.5 5.5c-1.4 1.8-1.5 4.2-.2 6l.2.2L21.4 5c.7-.6.7-1.7 0-2.4z"
        fill="url(#SVGID_1_)"
      />
    </Svg>
  );
}
