// Web shim for victory-native. Charts are native-only due to
// @shopify/react-native-skia dependency. Export no-op components
// so Metro can resolve the module on web without crashing.

const React = require("react");

const Noop = () => null;

module.exports = {
  VictoryChart: Noop,
  VictoryLine: Noop,
  VictoryAxis: Noop,
  VictoryScatter: Noop,
  VictoryTooltip: Noop,
  VictoryTheme: { material: {} },
};
