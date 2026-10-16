"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { cn } from '@skeleton/core-utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';
import { Popover, PopoverContent, PopoverTrigger } from './popover';


interface Props {
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export function LongText({
                                   children,
                                   className = "",
                                   contentClassName = "",
                                 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [isOverflown, setIsOverflown] = useState(false)

  useLayoutEffect(() => {
    const overflown = checkOverflow(ref.current)
    setIsOverflown(overflown)
  }, [children])

  return (
    <>
      <div className="hidden sm:block">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div ref={ref} className={cn("truncate", className)}>
                {children}
              </div>
            </TooltipTrigger>
            {isOverflown && (
              <TooltipContent>
                <p className={contentClassName}>{children}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="sm:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <div ref={ref} className={cn("truncate", className)}>
              {children}
            </div>
          </PopoverTrigger>
          {isOverflown && (
            <PopoverContent className={cn("w-fit", contentClassName)}>
              <p>{children}</p>
            </PopoverContent>
          )}
        </Popover>
      </div>
    </>
  )
}

const checkOverflow = (textContainer: HTMLDivElement | null) => {
  if (textContainer) {
    return (
      textContainer.offsetHeight < textContainer.scrollHeight ||
      textContainer.offsetWidth < textContainer.scrollWidth
    )
  }
  return false
}
