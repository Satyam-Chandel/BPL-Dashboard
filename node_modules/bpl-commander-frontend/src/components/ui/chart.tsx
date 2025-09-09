"use client"

import * as React from "react"
import { cn } from "./utils"

// Simple chart configuration type
export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
  }
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ReactNode
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <div className="w-full h-full flex items-center justify-center">
          {children}
        </div>
      </div>
    </ChartContext.Provider>
  )
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
[data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`,
      }}
    />
  )
}

// Simple fallback components for basic chart functionality
function ChartTooltip({ children }: { children?: React.ReactNode }) {
  return <div className="chart-tooltip">{children}</div>
}

function ChartTooltipContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "border-border/50 bg-background rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function ChartLegend({ children }: { children?: React.ReactNode }) {
  return <div className="chart-legend">{children}</div>
}

function ChartLegendContent({
  className,
  payload,
  ...props
}: React.ComponentProps<"div"> & {
  payload?: Array<{ value: string; color: string }>
}) {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4 pt-3",
        className
      )}
      {...props}
    >
      {payload.map((item) => (
        <div
          key={item.value}
          className="flex items-center gap-1.5"
        >
          <div
            className="h-2 w-2 shrink-0 rounded-[2px]"
            style={{
              backgroundColor: item.color,
            }}
          />
          <span className="text-sm">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}