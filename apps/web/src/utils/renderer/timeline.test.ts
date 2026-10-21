import { describe, expect, it } from 'vitest'

import { buildTimeline, Timeline, TimelineLayer } from './timeline'

const opts = { maxDurationMs: 10_000, maxFrames: 200 }

const frames = (n: number, delay: number): TimelineLayer => ({
  delays: Array(n).fill(delay),
})
const STATIC: TimelineLayer = { delays: [0] }

const sumDelays = (t: Timeline) => t.steps.reduce((s, x) => s + x.delay, 0)

describe('buildTimeline', () => {
  it('returns a single non-animated step when every layer is static', () => {
    const t = buildTimeline([STATIC, STATIC], opts)
    expect(t.isAnimated).toBe(false)
    expect(t.steps).toEqual([{ delay: 0, frames: [0, 0] }])
  })

  it('keeps per-frame delays of a single animated layer', () => {
    const t = buildTimeline([STATIC, { delays: [50, 120, 300] }], opts)
    expect(t.isAnimated).toBe(true)
    expect(t.duration).toBe(470)
    expect(t.steps).toEqual([
      { delay: 50, frames: [0, 0] },
      { delay: 120, frames: [0, 1] },
      { delay: 300, frames: [0, 2] },
    ])
  })

  it('extends loops of different lengths to their least common multiple', () => {
    const t = buildTimeline([frames(2, 100), frames(3, 100)], opts)
    expect(t.duration).toBe(600)
    expect(t.steps.map((s) => s.frames)).toEqual([
      [0, 0],
      [1, 1],
      [0, 2],
      [1, 0],
      [0, 1],
      [1, 2],
    ])
  })

  it('takes the union of change points for layers with different frame rates', () => {
    const t = buildTimeline([frames(2, 100), frames(2, 150)], opts)
    expect(t.duration).toBe(600)
    expect(t.steps.map((s) => s.delay)).toEqual([100, 50, 50, 100, 100, 50, 50, 100])
    // at t=150 layer A is in frame 1 (100..200) and layer B in frame 1 (150..300)
    expect(t.steps[2].frames).toEqual([1, 1])
    // at t=300 layer A is back to frame 1 (300%200=100) and B wraps to frame 0
    expect(t.steps[4].frames).toEqual([1, 0])
  })

  it('falls back to the longest loop when the LCM exceeds the duration cap', () => {
    const t = buildTimeline([frames(3, 100), frames(7, 100)], {
      ...opts,
      maxDurationMs: 1000,
    })
    expect(t.duration).toBe(700)
    expect(sumDelays(t)).toBe(700)
  })

  it('picks the best-aligned multiple of the longest loop when the LCM is too long', () => {
    // loops 960, 750 and 1000ms: LCM is 24s. 3000ms completes the 750 and 1000 loops
    // exactly and leaves the 960ms layer only 120ms off, beating a 1000ms seam.
    const t = buildTimeline([frames(4, 250), frames(12, 80), frames(5, 150)], opts)
    expect(t.duration).toBe(3000)
    expect(sumDelays(t)).toBe(3000)
  })

  it('rounds delays to the 10ms GIF grid', () => {
    const t = buildTimeline([{ delays: [44, 76] }], opts)
    expect(t.steps.map((s) => s.delay)).toEqual([40, 80])
  })

  it('never emits delays short enough for browsers to clamp to 100ms', () => {
    const t = buildTimeline([frames(2, 100), frames(2, 110)], opts)
    expect(t.steps.every((s) => s.delay >= 20)).toBe(true)
    expect(sumDelays(t)).toBe(t.duration)
  })

  it('resamples dense timelines down to maxFrames', () => {
    const t = buildTimeline([frames(50, 20), frames(7, 30)], { ...opts, maxFrames: 10 })
    expect(t.steps.length).toBeLessThanOrEqual(10)
    expect(sumDelays(t)).toBe(t.duration)
  })

  it('merges consecutive steps that show identical frames', () => {
    // Layer B changes at 30ms intervals but those changes get resampled away on a 100ms grid,
    // and layer A only has 2 frames: adjacent equal samples must be merged.
    const t = buildTimeline([frames(2, 500), frames(2, 500)], { ...opts, maxFrames: 1 })
    t.steps.forEach((s, i) => {
      if (i > 0) expect(s.frames).not.toEqual(t.steps[i - 1].frames)
    })
    expect(sumDelays(t)).toBe(t.duration)
  })

  it('satisfies timing invariants for random layer stacks', () => {
    let seed = 42
    const rand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    for (let run = 0; run < 200; run++) {
      const layers: TimelineLayer[] = Array.from(
        { length: 1 + Math.floor(rand() * 6) },
        () =>
          rand() < 0.4
            ? STATIC
            : {
                delays: Array.from(
                  { length: 2 + Math.floor(rand() * 30) },
                  () => 20 + Math.floor(rand() * 300)
                ),
              }
      )
      const maxFrames = 5 + Math.floor(rand() * 200)
      const t = buildTimeline(layers, { maxDurationMs: 10_000, maxFrames })

      if (!t.isAnimated) continue
      expect(sumDelays(t)).toBe(t.duration)
      expect(t.steps.length).toBeLessThanOrEqual(maxFrames)
      for (const step of t.steps) {
        expect(step.delay).toBeGreaterThanOrEqual(20)
        expect(step.delay % 10).toBe(0)
        step.frames.forEach((f, i) => {
          expect(f).toBeGreaterThanOrEqual(0)
          expect(f).toBeLessThan(Math.max(1, layers[i].delays.length))
        })
      }
    }
  })
})
