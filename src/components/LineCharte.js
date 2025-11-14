import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View, processColor} from 'react-native';
import {LineChart} from 'react-native-charts-wrapper';
import {useSelector} from 'react-redux';
import {converter} from './Common_functions';
import * as constants from '../config/constants';
export const LineCharte = React.memo((props) => {
  const [marker, setMarker] = useState({
    enabled: true,
    digits: 1,
    markerColor: processColor('#272958'),
    textColor: processColor('white'),
    markerFontSize: 14,
  });
  const uniteTemp = useSelector((state) => state.appReducer.unite);

  const dataChartX = () => {
    const dataValueX = [];
    props.tempChart.map((value) => {
      dataValueX.push(value.cycleTime);
    });
    return {
      valueFormatter: dataValueX,
      position: 'BOTTOM',
      granularityEnabled: true,
      granularity:
        Platform.OS === constants.PLATFORM_ANDROID
          ? props.tempChart.length > 9
            ? 2
            : 1
          : props.tempChart.length > 9
          ? 2
          : 1,
      labelCount: 9,
      avoidFirstLastClipping: false,
      drawGridLines: false,
    };
  };

  const tempInterChart = (label, color, lineColor) => {
    const dataTempInterChart = [];
    props.isTempInterVisible &&
      props.tempChart.map((value) => {
        dataTempInterChart.push(
          Number(converter(parseFloat(value.tempTair), uniteTemp).toFixed(2)),
        );
      });
    return {
      values: dataTempInterChart,
      label: label,
      config: {
        mode: 'LINEAR',
        drawValues: false,
        lineWidth: 2,
        drawCircles: true,
        circleColor: processColor(lineColor),
        drawCircleHole: false,
        circleRadius: 2,
        highlightColor: processColor(lineColor),
        color: processColor(lineColor),
        valueTextSize: 12,
        drawFilled: false,
        fillGradient: {
          colors: [
            processColor('rgba(255, 255, 255, 0.2)'),
            processColor(color),
          ],
          positions: [0, 0.5],
          angle: 90,
          orientation: 'TOP_BOTTOM',
        },
        fillAlpha: 1000,
      },
    };
  };

  const tempAmbiantChart = (label, color, lineColor) => {
    const dataTempAmbiantChart = [];
    props.isTempAmbVisible &&
      props.tempChart.map((value) => {
        dataTempAmbiantChart.push(
          Number(converter(parseFloat(value.tempAmb), uniteTemp).toFixed(2)),
        );
      });
    return {
      values: dataTempAmbiantChart,
      label: label,
      config: {
        mode: 'LINEAR',
        drawValues: false,
        lineWidth: 2,
        drawCircles: true,
        circleColor: processColor(lineColor),
        drawCircleHole: false,
        circleRadius: 2,
        highlightColor: processColor(lineColor),
        color: processColor(lineColor),
        valueTextSize: 12,
        drawFilled: false,
        fillGradient: {
          colors: [
            processColor('rgba(255, 255, 255, 0.2)'),
            processColor(color),
          ],
          positions: [0, 0.5],
          angle: 90,
          orientation: 'TOP_BOTTOM',
        },
        fillAlpha: 1000,
      },
    };
  };

  const tempEvaporateurChart = (label, color, lineColor) => {
    const dataTempEvaporateurChart = [];
    props.istempEvapVisible &&
      props.tempChart.map((value) => {
        dataTempEvaporateurChart.push(
          Number(converter(parseFloat(value.tempEvap), uniteTemp).toFixed(2)),
        );
      });
    return {
      values: dataTempEvaporateurChart,
      label: label,
      config: {
        mode: 'LINEAR',
        drawValues: false,
        lineWidth: 2,
        drawCircles: true,
        circleColor: processColor(lineColor),
        drawCircleHole: false,
        circleRadius: 2,
        highlightColor: processColor(lineColor),
        color: processColor(lineColor),
        valueTextSize: 12,
        drawFilled: false,
        fillGradient: {
          colors: [
            processColor('rgba(255, 255, 255, 0.2)'),
            processColor(color),
          ],
          positions: [0, 0.5],
          angle: 90,
          orientation: 'TOP_BOTTOM',
        },
        fillAlpha: 1000,
      },
    };
  };

  const tempReacteurChart = (label, color, lineColor) => {
    const dataTempReacteurChart = [];
    props.isTempReactVisible &&
      props.tempChart.map((value) => {
        dataTempReacteurChart.push(
          Number(converter(parseFloat(value.tempReact), uniteTemp).toFixed(2)),
        );
      });
    return {
      values: dataTempReacteurChart,
      label: label,
      config: {
        mode: 'LINEAR',
        drawValues: false,
        lineWidth: 2,
        drawCircles: true,
        circleColor: processColor(lineColor),
        drawCircleHole: false,
        circleRadius: 2,
        highlightColor: processColor(lineColor),
        color: processColor(lineColor),
        valueTextSize: 12,
        drawFilled: false,
        fillGradient: {
          colors: [
            processColor('rgba(255, 255, 255, 0.2)'),
            processColor(color),
          ],
          positions: [0, 0.5],
          angle: 90,
          orientation: 'TOP_BOTTOM',
        },
        fillAlpha: 1000,
      },
    };
  };

  useEffect(() => {
    dataChartX();
  }, [props.tempChart]);

  return (
    <LineChart
      style={[styles.chart, props.height && {height: props.height}]}
      chartDescription={{text: ''}}
      legend={{enabled: false}}
      marker={marker}
      yAxis={{
        left: {drawGridLines: false},
        right: {enabled: false, drawGridLines: false},
      }}
      xAxis={dataChartX()}
      drawGridBackground={false}
      borderWidth={1}
      drawBorders={false}
      autoScaleMinMaxEnabled={true}
      touchEnabled={true}
      dragEnabled={true}
      scaleEnabled={true}
      scaleXEnabled={true}
      scaleYEnabled={true}
      pinchZoom={true}
      avoidFirstLastClipping={true}
      animation={{
        durationY: 1000,
      }}
      doubleTapToZoomEnabled={false}
      highlightPerTapEnabled={true}
      highlightPerDragEnabled={false}
      dragDecelerationEnabled={true}
      dragDecelerationFrictionCoef={0.99}
      keepPositionOnRotation={false}
      data={{
        dataSets: [
          tempInterChart(props.label, '#272958', '#272958'),
          tempAmbiantChart(props.label, '#902038', '#902038'),
          tempEvaporateurChart(props.label, '#E25382', '#E25382'),
          tempReacteurChart(props.label, '#3442C0', '#3442C0'),
        ],
      }}
    />
  );
});

const styles = StyleSheet.create({
  chart: {
    height: 150,
  },
});
