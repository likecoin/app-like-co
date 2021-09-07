<template>
  <div
    :class="[
      'bg-white',
      'rounded-[24px]',
      'text-like-green',
      'overflow-hidden',
    ]"
  >
    <div class="relative min-w-[220px] aspect-w-1 aspect-h-2">
      <div
        :key="encodedIDInHex"
        ref="canvas"
        class="absolute inset-0"
        @resize="handleResize"
      />
      <div
        :class="[
          'absolute',
          'inset-0',
          'border-[18px]',
          'border-white',
          'border-opacity-60',
          'rounded-[24px]',
        ]"
      />
      <div class="absolute inset-0 flex justify-between">
        <div
          :class="labelClasses"
          style="writing-mode: vertical-lr"
        >
          {{ labelTextLeft }}
        </div>
        <div
          :class="labelClasses"
          style="writing-mode: vertical-rl"
        >
          {{ labelTextRight }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import P5 from 'p5'

function easeOutExpo(x: number): number {
  return x === 1 ? 1 : 1 - 2 ** (-10 * x)
}

interface ShapeConfig {
  x1: number
  x2: number
  x3: number
  r: number
  g: number
  b: number
  opacity: number
  offsetY: number
}

@Component
export default class IscnCard extends Vue {
  /**
   * The ISCN record
   */
  @Prop(Object) readonly record!: any

  /**
   * Custom class for the labels
   */
  @Prop(String) readonly labelClass!: string

  /**
   * Control the saturation of the card. Default is 10.
   */
  @Prop({ default: 10 }) readonly colorMultiplier!: number

  /**
   * Animation duration in frame. Default is 120 frames.
   */
  @Prop({ default: 120 }) readonly animationDuration!: number

  /**
   * Easing function of the animation. Default is ease out expo.
   */
  @Prop({ default: () => easeOutExpo }) readonly easingFunction!: (x: number) => number

  canvas: P5 | undefined

  get encodedIDInHex() {
    if (!this.record) return ''
    const id = this.record.id || ''
    const matches = id.match(/iscn:\/\/[a-zA-Z0-9-_]+\/([a-zA-Z0-9-_]+)\/\d+/)
    if (!matches || !matches[1]) return ''
    return Buffer.from(matches[1]).toString('hex')
  }

  get labelClasses() {
    return [
      'flex',
      'justify-center',
      'items-center',
      'w-[18px]',
      'font-mono',
      'text-center',
      'text-[8px]',
      'transform',
      'rotate-180',
      this.labelClass,
    ]
  }

  get labelTextLeft() {
    return this.record ? this.record.id : ''
  }

  get labelTextRight() {
    if (!this.record) return ''
    const {
      recordTimestamp: timestamp = '',
      contentMetadata: {
        '@type': type = '',
        version = '',
      } = {},
    } = this.record.data || {}
    return `${type} ${timestamp} ${version ? 'Version ' : ''}${version}`
  }

  mounted() {
    // HACK: To fix canvas not responsive issue
    setTimeout(this.sketchGraph, 100)
  }

  @Watch('record')
  sketchGraph() {
    if (!this.record) return

    const bleeding = 5
    const firstChunks = this.encodedIDInHex.slice(0, 42)
    const lastChunks = this.encodedIDInHex.slice(42)
    const offset = parseInt(lastChunks.slice(42), 16)

    const sketch = (s: P5) => {
      function drawShapes({
        shapes = [] as ShapeConfig[],
        shouldFill = false,
      } = {}) {
        for (let i = 0; i < shapes.length; i += 1) {
          const input = shapes[i]

          if (shouldFill) {
            s.fill(
              input.r,
              input.g,
              input.b,
              input.opacity,
            )
            s.stroke(
              input.r,
              input.g,
              input.b,
              input.opacity,
            )
          } else {
            s.stroke(255, 255, 255, input.opacity)
          }

          s.beginShape();
          const startX = i % 2 === 0 ? -bleeding : s.width + bleeding

          s.vertex(startX, -bleeding - input.offsetY)
          s.vertex(input.x1, -bleeding - input.offsetY)
          s.bezierVertex(
            input.x1, -bleeding - input.offsetY,
            input.x2, s.height / 2,
            input.x3, s.height + bleeding + input.offsetY,
          )
          s.vertex(input.x3, s.height + bleeding + input.offsetY)
          s.vertex(startX, s.height + bleeding + input.offsetY)
          s.endShape()
        }
      }

      // eslint-disable-next-line no-param-reassign
      s.setup = () => {
        const {
          offsetWidth: width = 0,
          offsetHeight: height = 0,
        } = this.$refs.canvas as HTMLElement || {}
        s.createCanvas(width, height)
      }

      // Current animation time
      let t = 0

      // eslint-disable-next-line no-param-reassign
      s.draw = () => {
        const progress = this.easingFunction(t / this.animationDuration)

        const shapes: ShapeConfig[] = []
        for (let i = 0; i < firstChunks.length; i += 2) {
          const value1 = parseInt(firstChunks.slice(i, i + 2), 16)
          const value2 = parseInt(lastChunks.slice(i, i + 2), 16)

          // eslint-disable-next-line
          function animateX(x: number) {
            const mod = i % 3
            switch (mod) {
              case 0:
                return x + offset * (1 - progress)
              case 1:
                return x * progress
              default:
                return x - offset * (1 - progress)
            }
          }

          shapes.push({
            x1: animateX(offset * value1 % 255),
            x2: animateX(offset * value2 % 255),
            x3: animateX(offset * (value1 - value2) % 255),
            r: offset * value1 % 255 * progress,
            g: offset * value2 % 255 * progress,
            b: offset * (value1 - value2) % 255 * progress,
            opacity: this.colorMultiplier * (value1 - value2) % 255 / 255 * 100 * progress,
            offsetY: s.height * (1 - progress),
          })
        }

        // Scale the shape corresponding to the size of the canvas
        s.scale(s.width / 220)

        s.background(255) // White
        s.noStroke()

        s.blendMode(s.BLEND)
        drawShapes({ shapes, shouldFill: true })
        s.strokeWeight(1)
        s.noFill()
        s.blendMode(s.SCREEN)
        drawShapes({ shapes, shouldFill: false })

        if (t <= this.animationDuration) {
          t += 1
        } else {
          s.noLoop()
        }
      }

      // eslint-disable-next-line no-param-reassign
      s.windowResized = () => {
        const {
          offsetWidth: newWidth = 0,
          offsetHeight: newHeight = 0,
        } = this.$refs.canvas as HTMLElement || {}
        s.resizeCanvas(newWidth, newHeight)
      }
    }

    if (!this.canvas) {
      this.canvas = new P5(sketch, this.$refs.canvas as HTMLElement)
    }
  }

  handleResize() {
    window.requestAnimationFrame(this.sketchGraph)
  }
}
</script>
