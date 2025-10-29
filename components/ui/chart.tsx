import * as React from "react"
import { cn } from "@/lib/utils"

// Chart context
const ChartContext = React.createContext<{
  config: ChartConfig
} | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

// Chart container
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
[data-chart="${chartId}"] {
${Object.entries(config)
  .filter(([, config]) => config.color)
  .map(([key, config]) => `  --color-${key}: ${config.color};`)
  .join("\n")}
}
`,
          }}
        />
        {children}
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

// Chart tooltip
const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    content?: React.ComponentProps<typeof ChartTooltipContent>
  }
>(({ content, ...props }, ref) => {
  return (
    <div
      ref={ref}
      {...props}
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        props.className
      )}
    >
      {content && <ChartTooltipContent {...content} />}
    </div>
  )
})
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  }
>(({ hideLabel, hideIndicator, indicator, nameKey, labelKey, ...props }, ref) => {
  const { config } = useChart()

  return (
    <div
      ref={ref}
      {...props}
      className={cn(
        "grid gap-1.5",
        props.className
      )}
    >
      {!hideLabel && (
        <div className="font-medium">
          {labelKey ? config[labelKey]?.label : "Value"}
        </div>
      )}
      <div className="grid gap-1.5">
        {Object.entries(config).map(([key, item]) => (
          <div key={key} className="flex items-center gap-2">
            {!hideIndicator && (
              <div
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  indicator === "line" && "h-0.5 w-3",
                  indicator === "dashed" && "h-0.5 w-3 border-t-2 border-dashed"
                )}
                style={{
                  backgroundColor: `var(--color-${key})`,
                }}
              />
            )}
            <span className="flex-1 text-muted-foreground">
              {nameKey ? config[nameKey]?.label : item.label}
            </span>
            <span className="font-mono">
              {key}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

// Chart legend
const ChartLegend = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    content?: React.ComponentProps<typeof ChartLegendContent>
  }
>(({ content, ...props }, ref) => {
  return (
    <div
      ref={ref}
      {...props}
      className={cn(
        "flex items-center justify-center gap-4",
        props.className
      )}
    >
      {content && <ChartLegendContent {...content} />}
    </div>
  )
})
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    nameKey?: string
  }
>(({ nameKey, ...props }, ref) => {
  const { config } = useChart()

  return (
    <div
      ref={ref}
      {...props}
      className={cn(
        "flex flex-wrap items-center gap-4",
        props.className
      )}
    >
      {Object.entries(config).map(([key, item]) => (
        <div key={key} className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{
              backgroundColor: `var(--color-${key})`,
            }}
          />
          <span className="text-muted-foreground">
            {nameKey ? config[nameKey]?.label : item.label}
          </span>
        </div>
      ))}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

// Types
type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    color?: string
  }
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  useChart,
  type ChartConfig,
}