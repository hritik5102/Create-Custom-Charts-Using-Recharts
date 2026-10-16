/**
 * Component for showing a chart with pre and post campaign data along with percentage change.
 * It uses Recharts library to render a composed chart with bars and lines.
 * @author Hritik Jaiswal <hritik@helpshift.com>
 * @created 11th Oct, 2026
 * @module components/chart.jsx
 */

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import PropTypes from "prop-types";

const pctClassMap = {
  positive: "text-green-600",
  negative: "text-red-600",
  zero: "text-gray-900",
};

/**
 * Identify if the percentage is positive, negative, or zero
 * @param {number} value - Percentage value
 * @returns {string} - return if the percentage is positive, negative, or zero
 */
const getPctState = (value) => {
  if (value > 0) {
    return "positive";
  }

  if (value < 0) {
    return "negative";
  }

  return "zero";
};

// Custom bar shape to color the first bar (baseline) gray and the rest blue
const CustomBar = (props) => {
  const { x, y, width, height, index, color } = props;
  const fill = index === 0 ? "fill-gray-500" : color.FILL;

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={2}
      ry={2}
      className={fill}
    />
  );
};

CustomBar.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  index: PropTypes.number,
  color: PropTypes.string,
};

// Custom dot — filled circle with white border
const CustomDot = (props) => {
  const { cx, cy, fill } = props;
  if (cx === null || cy === null) {
    return null;
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r={6}
      stroke="#fff"
      strokeWidth={2}
      className={fill}
    />
  );
};

CustomDot.propTypes = {
  cx: PropTypes.number,
  cy: PropTypes.number,
  fill: PropTypes.string,
};

const CustomTooltip = ({ active, payload, label, color }) => {
  const pct = payload?.find((p) => p.dataKey === "percentageChange");
  const post = payload?.find((p) => p.dataKey === "postCampaign");

  if (!active || !payload?.length || (!pct && !post)) {
    return null;
  }

  const pctState = getPctState(pct?.value);
  const isBaseline = post?.payload?.isPreCampaignBaseline;
  const pctClass = pctClassMap[pctState];

  const containerClass = [
    "min-w-[180px] rounded-8 border border-gray-200",
    "bg-white px-8 py-4 text-sm leading-[1.7]",
    "shadow-[0_4px_20px_rgba(0,0,0,0.12)]",
  ].join(" ");

  return (
    <div className={containerClass}>
      <span className="font-semibold text-gray-900">{label} </span>
      {pct && (
        <span className={`${pctClass} font-semibold`}>
          {pct.value > 0 && "+"}
          {pct.value}%
        </span>
      )}
      {post?.value !== null && (
        <div className={`${color.TEXT} font-semibold`}>
          {isBaseline
            ? `Pre-Campaign Baseline: ${post.value}`
            : `Post campaign: ${post.value}`}
        </div>
      )}
    </div>
  );
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(PropTypes.object),
  label: PropTypes.string,
  color: PropTypes.string,
};

const CustomLegend = ({ baseline, color }) => (
  <div
    className={
      "flex flex-wrap items-center justify-center " +
      "gap-12 text-sm text-gray-500"
    }
  >
    {/* Pre-Campaign Baseline */}
    <div className="flex items-center gap-4">
      <svg width="12" height="12">
        <rect width="12" height="12" rx="2" className="fill-gray-500" />
      </svg>
      <span className="text-gray-500">Pre-Campaign Baseline: {baseline}</span>
    </div>

    {/* Post-Campaign */}
    <div className="flex items-center gap-4">
      <svg width="12" height="12">
        <rect width="12" height="12" rx="2" className={color.FILL} />
      </svg>
      <span className={`${color.TEXT} font-semibold`}>Post-Campaign</span>
    </div>

    {/* % Change */}
    <div className="flex items-center gap-4">
      <svg width="32" height="14">
        <line
          x1="0"
          y1="7"
          x2="32"
          y2="7"
          strokeWidth="1.5"
          className="stroke-slate-400"
        />
        <circle
          cx="16"
          cy="7"
          r="5"
          stroke="#fff"
          strokeWidth="1.5"
          className="fill-slate-400"
        />
      </svg>
      <span className="text-gray-500">% Change</span>
    </div>
  </div>
);

CustomLegend.propTypes = {
  baseline: PropTypes.number,
  color: PropTypes.string,
};

const roundUpToNearestMinimum = (value, step) =>
  Math.floor(value / step) * step;

/**
 * Builds an array of exactly 5 ticks starting from a specific
 * minimum using a given step size
 * @param {number} startMin - The starting minimum value for the first tick mark.
 * @param {number} stepSize - The numeric gap distance to place between each sequential tick.
 * @param {number} [numTicks=5] - The exact total number of ticks to build inside the array.
 * @returns {number[]} An array of calculated tick values rounded to 2 decimal places.
 */
const createTickArray = (startMin, stepSize, numTicks = 5) => {
  return Array.from({ length: numTicks }, (_, index) => {
    const rawTickValue = startMin + index * stepSize;
    // Prevents JavaScript floating-point decimals (e.g. 0.30000004)
    return Number(rawTickValue.toFixed(2));
  });
};

/**
 * Generate the 5 ticks for the axis for any given dataset array.
 * @param {number[]} arr - The flat array of numbers
 * @param {number} [numTicks=5] - Total number of ticks to generate for the axis.
 * @returns {number[]} - A sequence of exactly 5 clean, progressive axis tick numbers.
 */
const generateTicks = (arr, numTicks = 5) => {
  const dataMin = Math.min(...arr);
  const dataMax = Math.max(...arr);
  const intervals = numTicks - 1;

  // Force the graph to start at 0 if the data is completely positive
  const minBound = dataMin < 0 ? dataMin : 0;
  const maxBound = dataMax > 0 ? dataMax : 0;

  // If data is entirely flat (e.g., all zeros)
  if (minBound === maxBound) {
    // If the numTicks is 5, this would generate [0, 1, 2, 3, 4]
    return Array.from({ length: numTicks }, (_, i) => i);
  }

  // 2. Calculate a raw step size
  const roughStep = (maxBound - minBound) / intervals;

  // 3. Normalize step size to a "nice number" (1, 2, 5, 10 multiplied by magnitude)
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const normalizedStep = roughStep / magnitude;

  let step;
  if (normalizedStep < 1.5) {
    step = 1;
  } else if (normalizedStep < 3) {
    step = 2;
  } else if (normalizedStep < 7) {
    step = 5;
  } else {
    step = 10;
  }

  step *= magnitude;

  // 4. Adjust the minimum boundary to snap to a multiple of our step
  // (This guarantees that 0 will align perfectly on a tick mark)
  const finalMin = roundUpToNearestMinimum(minBound, step);

  // 5. Generate exactly 5 ticks
  const ticks = createTickArray(finalMin, step, numTicks);

  // 6. Safety check: Did our ticks accidentally clip the max data value?
  // If so, will scale up the step sizes manually to encompass it.
  if (ticks[ticks.length - 1] < dataMax) {
    const adjustedStep = step * 2; // Double the interval scale or adjust as needed
    const adjustedMin = roundUpToNearestMinimum(minBound, adjustedStep);
    return createTickArray(adjustedMin, adjustedStep, numTicks);
  }

  return ticks;
};

const Chart = ({ metric }) => {
  if (!metric?.data.length) {
    return null;
  }

  const data = metric?.data?.map((d, index) => ({
    period: d.day,
    postCampaign: d.value,
    percentageChange: parseInt(d.change, 10),
    // Use the first value as the baseline
    ...(index === 0 && { isPreCampaignBaseline: true }),
  }));

  const color = {
    TEXT: "text-blue-800",
    FILL: "fill-blue-800",
    STROKE: "stroke-blue-800",
  };

  // Use first value as baseline
  const baseline = metric?.data?.[0]?.value;

  const y1Label = metric.y1_label;

  const postCampaignData = data.map((point) => point.postCampaign);
  const percentageChangeData = data.map((d) => d.percentageChange);

  const sessionTicks = generateTicks(postCampaignData);
  const pctTicks = generateTicks(percentageChangeData);

  return (
    <div className="flex w-full flex-col gap-4 rounded-lg border border-gray-200 bg-white p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-19 font-bold m-0 text-gray-900">{metric?.label}</h2>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={375}>
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 36, left: 36, bottom: 4 }}
        >
          <CartesianGrid
            strokeDasharray="4 4"
            stroke="#CCCCCC"
            vertical={false}
          />

          <XAxis
            dataKey="period"
            axisLine={{ stroke: "#A2A4A6", strokeWidth: 1.5 }}
            tick={{
              fontSize: 12,
              fill: "#555555",
              fontFamily: "Inter, sans-serif",
            }}
          />

          {/* Left Y Axis — Sessions per User */}
          <YAxis
            yAxisId="sessions"
            orientation="left"
            domain={[sessionTicks[0], sessionTicks.at(-1)]}
            ticks={sessionTicks}
            axisLine={{ stroke: "#A2A4A6", strokeWidth: 1.5 }}
            tick={{ fontSize: 12, fill: "#555555" }}
            width={40}
            label={{
              value: y1Label,
              angle: -90,
              position: "insideLeft",
              offset: 0,
              style: {
                fontSize: 12,
                fill: "#555555",
                fontFamily: "Inter, sans-serif",
                textAnchor: "middle",
              },
            }}
          />

          {/* Right Y Axis — % Change */}
          <YAxis
            yAxisId="pct"
            orientation="right"
            domain={[pctTicks[0], pctTicks.at(-1)]}
            ticks={pctTicks}
            tickFormatter={(v) => `${v}%`}
            axisLine={{ stroke: "#A2A4A6", strokeWidth: 1.5 }}
            tick={{ fontSize: 12, fill: "#555555" }}
            width={52}
            label={{
              value: "% change",
              angle: 90,
              position: "insideRight",
              offset: 0,
              style: {
                fontSize: 12,
                fill: "#555555",
                fontFamily: "Inter, sans-serif",
                textAnchor: "middle",
              },
            }}
          />

          <Tooltip
            content={<CustomTooltip color={color} />}
            cursor={{ fill: "rgba(0,0,0,0.03)" }}
          />

          {/* Bars */}
          <Bar
            yAxisId="sessions"
            dataKey="postCampaign"
            name="Post-Campaign"
            shape={<CustomBar color={color} />}
            maxBarSize={52}
            legendType="none"
          />

          {/* % Change line */}
          <Line
            yAxisId="pct"
            type="monotone"
            dataKey="percentageChange"
            name="% Change"
            strokeWidth={1.5}
            dot={<CustomDot fill="fill-slate-400" />}
            activeDot={<CustomDot fill="fill-slate-400" />}
            legendType="none"
            className="stroke-slate-400"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Custom Legend */}
      <CustomLegend baseline={baseline} color={color} />
    </div>
  );
};

Chart.propTypes = {
  /**
   * Metric object containing name, label and data points for the chart
   */
  metric: PropTypes.shape({
    name: PropTypes.string,
    label: PropTypes.string,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        day: PropTypes.string,
        value: PropTypes.number,
        change: PropTypes.number,
      }),
    ),
  }),
  /**
   * Attribute ID of the selected goal, used to determine which metric is selected in the chart
   */
  attributeId: PropTypes.string,
};

export default Chart;
