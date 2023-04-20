<template>
  <ClientOnly>
    <div
      :key="encodedIDInHex"
      v-bind="rootProps"
    >
      <div :class="containerClasses">
        <div
          ref="canvas"
          :class="canvasWrapperClasses"
          :style="rootStyle"
          @resize="handleResize"
        />
        <svg
          ref="svg"
          class="relative"
          xmlns="http://www.w3.org/2000/svg"
          :viewBox="viewBox"
        >
          <g :class="infoWrapperClasses">
            <rect
              x="9"
              y="9"
              v-bind="borderProps"
              rx="12"
              fill="none"
              stroke="#fff"
              stroke-linejoin="round"
              stroke-opacity="0.6"
              stroke-width="18"
            />
            <text
              v-bind="upperTextProps"
              font-size="10"
              fill="#28646e"
              alignment-baseline="middle"
              text-anchor="middle"
              font-family="PT Mono, monospace"
            >{{ recordID }}</text>
            <text
              v-bind="lowerTextProps"
              font-size="10"
              fill="#28646e"
              alignment-baseline="middle"
              text-anchor="middle"
              font-family="PT Mono, monospace"
            >{{ recordInfoText }}</text>
          </g>
          <g :class="qrCodeWrapperClasses">
            <rect
              v-bind="qrCodeSizeProps"
              rx="4"
              fill="#fff"
            />
            <foreignObject v-bind="qrCodeSizeProps">
              <div
                ref="qrcode"
                :class="[
                  'flex',
                  'items-center',
                  'justify-center',
                  'w-full',
                  'h-full',
                ]"
              />
            </foreignObject>
          </g>
        </svg>
      </div>
    </div>
  </ClientOnly>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import P5 from 'p5'
import QRCode from 'easyqrcodejs'

import { SITE_URL } from '~/constant'

function defaultEasingFunction(x: number): number {
  // Ease In Out Cubic
  return x < 0.5
    ? 4 * x * x * x
    : 1 - (-2 * x + 2) ** 3 / 2
}

interface ShapeConfig {
  value1: number
  value2: number
  value3: number
  r: number
  g: number
  b: number
  opacity: number
  offsetX: number
  offsetY: number
}

export enum IscnCardOrientation {
  portrait = 'portrait',
  landscape = 'landscape',
}

@Component
export default class IscnCard extends Vue {
  static baseWidth = 560
  static baseHeight = 280
  static baseBorderWidth = 18
  static baseBorderRadius = 24
  static baseAnimationDuration = 500
  static baseShapeMorphingMagnitude = 4
  static baseColorMultiplier = 10
  static bleeding = 5
  static qrCodeSize = 128
  static qrCodeColor = '#333'
  static qrCodeLogoSize = 22
  static qrCodePositionZoneColor = '#343434'

  /**
   * The ISCN record
   */
  @Prop(Object) readonly record!: any

  /**
   * Custom class for the labels
   */
  @Prop(String) readonly labelClass!: string

  /**
   * Custom class for the labels
   */
  @Prop({ default: IscnCardOrientation.portrait }) readonly orientation!: IscnCardOrientation

  /**
   * Control the saturation of the card. Default is 10.
   */
  @Prop({ default: IscnCard.baseColorMultiplier }) readonly colorMultiplier!: number

  /**
   * Set to true to show stunning mounting animation.
   */
  @Prop({ default: false }) readonly isAnimated!: boolean

  /**
   * Animation duration in frame in a cycle. Default is 500 frames.
   */
  @Prop({ default: IscnCard.baseAnimationDuration }) readonly animationDuration!: number

  /**
   * Morphing magniture of shapes. Default is 4.
   */
  @Prop({ default: IscnCard.baseShapeMorphingMagnitude }) readonly shapeMorphingMagnitude!: number

  /**
   * Easing function of the animation. Default is ease in out cubic.
   */
  @Prop({ default: () => defaultEasingFunction }) readonly easingFunction!: (x: number) => number

  width = IscnCard.baseWidth
  height = IscnCard.baseHeight

  canvas: P5 | undefined

  qrcode: QRCode | undefined

  isQRCodeRendering = true

  get recordID() {
    return this.record?.id || ''
  }

  get recordInfoText() {
    if (!this.record) return ''
    const {
      recordTimestamp: timestamp = '',
      recordVersion: version = '',
      contentMetadata: {
        '@type': type = '',
      } = {},
    } = this.record.data || {}
    return `${type} ${timestamp} ${version ? 'Version ' : ''}${version}`
  }

  get iscnIDParts() {
    const parts = this.recordID.match(/(iscn:\/\/[a-zA-Z0-9-_]+\/([a-zA-Z0-9-_]+))\/\d+/)
    const [
      ,
      fullIDWithoutVersion = '',
      id = '',
    ] = parts || []
    return {
      fullIDWithoutVersion,
      id,
    }
  }

  get encodedIDInHex() {
    return Buffer.from(this.iscnIDParts.id).toString('hex')
  }

  get cardGraphData() {
    const firstChunks = this.encodedIDInHex.slice(0, 42)
    const lastChunks = this.encodedIDInHex.slice(42)
    const offset = parseInt(lastChunks.slice(42), 16)
    return { firstChunks, lastChunks, offset }
  }

  get isPortrait() {
    return this.orientation === IscnCardOrientation.portrait
  }

  get borderRadius() {
    return IscnCard.baseBorderRadius * this.width / this.svgSizeProps.width
  }

  get viewBox() {
    return this.isPortrait
      ? `0 0 ${IscnCard.baseHeight} ${IscnCard.baseWidth}`
      : `0 0 ${IscnCard.baseWidth} ${IscnCard.baseHeight}`
  }

  get isShowLoadingIndicator() {
    return !this.isAnimated && this.isQRCodeRendering
  }

  get rootStyle() {
    return {
      borderRadius: `${this.borderRadius}px`,
    }
  }

  get rootProps() {
    return {
      class: [
        'relative',
        'bg-shade-gray',
        {
          'animate-pulse': this.isShowLoadingIndicator,
        },
      ],
      style: this.rootStyle,
    }
  }

  get svgSizeProps() {
    return {
      width: this.isPortrait ? IscnCard.baseHeight : IscnCard.baseWidth,
      height: this.isPortrait ? IscnCard.baseWidth : IscnCard.baseHeight,
    }
  }

  get qrCodeSizeProps() {
    return {
      x: this.isPortrait
        ? (IscnCard.baseHeight - IscnCard.qrCodeSize) / 2
        : (IscnCard.baseWidth - IscnCard.qrCodeSize) / 2,
      y: this.isPortrait
        ? (IscnCard.baseWidth - IscnCard.qrCodeSize) / 2
        : (IscnCard.baseHeight - IscnCard.qrCodeSize) / 2,
      width: IscnCard.qrCodeSize,
      height: IscnCard.qrCodeSize,
    }
  }

  get qrCodeContent() {
    return SITE_URL.concat(`/view/${encodeURIComponent(this.iscnIDParts.fullIDWithoutVersion)}`)
  }

  get borderProps() {
    return {
      width: this.isPortrait
        ? IscnCard.baseHeight - IscnCard.baseBorderWidth
        : IscnCard.baseWidth - IscnCard.baseBorderWidth,
      height: this.isPortrait
        ? IscnCard.baseWidth - IscnCard.baseBorderWidth
        : IscnCard.baseHeight - IscnCard.baseBorderWidth,
    }
  }

  get upperTextProps() {
    return {
      x: IscnCard.baseHeight * (this.isPortrait ? -1 : 1),
      y: 10,
      transform: this.isPortrait ? 'rotate(-90)' : null,
    }
  }

  get lowerTextProps() {
    return {
      x: IscnCard.baseHeight * (this.isPortrait ? -1 : 1),
      y: IscnCard.baseHeight - 8,
      transform: this.isPortrait ? 'rotate(-90)' : null,
    }
  }

  get containerClasses() {
    return [
      'transition',
      'transition-all',
      'duration-500',
      'ease-out',
      {
        'opacity-0 blur-3xl brightness-200': this.isShowLoadingIndicator,
      },
    ]
  }

  get canvasWrapperClasses() {
    return [
      'absolute',
      'overflow-hidden',
      'inset-0',
      'transition',
      'transition-opacity',
      'transform',
      'duration-1000',
      'ease-out',
      {
        'scale-150 opacity-0': this.isAnimated && this.isQRCodeRendering,
      },
    ]
  }

  get infoWrapperClasses() {
    return [
      'transition',
      'transition-all',
      'origin-center',
      'duration-500',
      'ease-out',
      {
        'opacity-0': this.isShowLoadingIndicator,
        'scale-150': this.isAnimated && this.isQRCodeRendering,
      },
    ]
  }

  get qrCodeWrapperClasses() {
    return [
      'qrcode',
      'mix-blend-luminosity',
      'transition',
      'transition-all',
      'origin-center',
      'duration-1000',
      'ease-out',
      this.isAnimated && this.isQRCodeRendering ? 'opacity-0 scale-50' : 'opacity-80',
      {
        'transform -rotate-90': this.isPortrait,
      },
    ]
  }

  mounted() {
    this.sketchGraph()
  }

  detectCardSize() {
    const {
      width = 0,
      height = 0,
    } = (this.$refs.svg as HTMLElement)?.getBoundingClientRect() || {}
    this.width = width
    this.height = height
  }

  animateValue({
    i,
    progress,
    value,
  }: {
    i: number
    value: number
    progress: number
  }) {
    const mod = i % 3
    const magnitude = this.shapeMorphingMagnitude
    switch (mod) {
      case 0:
        return value + magnitude * (1 - progress)
      case 1:
        return value + magnitude * progress
      default:
        return value - magnitude * (1 - progress)
    }
  }

  @Watch('record')
  async sketchGraph() {
    if (!this.record) return

    this.detectCardSize()
    if (this.width === 0 || this.height === 0) {
      // Back-off rendering if width or height is 0
      setTimeout(this.sketchGraph, 10)
      return
    }

    const orientation = this.isPortrait ? 0 : 1
    const { firstChunks, lastChunks, offset } = this.cardGraphData

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

          const isEven = i % 2 === 0
          const v = [
            // Portrait
            [
              // Vertex 1
              {
                x: isEven ? -IscnCard.bleeding : s.width + IscnCard.bleeding,
                y: -IscnCard.bleeding - input.offsetY,
              },
              // Vertex 2
              // Vertex 3a
              {
                x: input.value1,
                y: -IscnCard.bleeding - input.offsetY,
              },
              // Vertex 3b
              {
                x: input.value2,
                y: s.height / 2,
              },
              // Vertex 3c
              // Vertex 4
              {
                x: input.value3,
                y: s.height + IscnCard.bleeding + input.offsetY,
              },
              // Vertex 5
              {
                x: isEven ? -IscnCard.bleeding : s.width + IscnCard.bleeding,
                y: s.height + IscnCard.bleeding + input.offsetY,
              },
            ],
            // Landscape
            [
              // Vertex 1
              {
                x: s.width + IscnCard.bleeding + input.offsetX,
                y: isEven ? -IscnCard.bleeding : s.height + IscnCard.bleeding,
              },
              // Vertex 2
              // Vertex 3a
              {
                x: s.width + IscnCard.bleeding + input.offsetX,
                y: input.value1,
              },
              // Vertex 3b
              {
                x: s.width / 2,
                y: input.value2,
              },
              // Vertex 3c
              // Vertex 4
              {
                x: -IscnCard.bleeding - input.offsetX,
                y: input.value3,
              },
              // Vertex 5
              {
                x: -IscnCard.bleeding - input.offsetX,
                y: isEven ? -IscnCard.bleeding : s.height + IscnCard.bleeding,
              },
            ],
          ]

          s.beginShape()
          s.vertex(v[orientation][0].x, v[orientation][0].y)
          s.vertex(v[orientation][1].x, v[orientation][1].y)
          s.bezierVertex(
            v[orientation][1].x, v[orientation][1].y,
            v[orientation][2].x, v[orientation][2].y,
            v[orientation][3].x, v[orientation][3].y,
          )
          s.vertex(v[orientation][3].x, v[orientation][3].y)
          s.vertex(v[orientation][4].x, v[orientation][4].y)
          s.endShape()
        }
      }

      // eslint-disable-next-line no-param-reassign
      s.setup = () => {
        const canvas = s.createCanvas(this.width, this.height)
        canvas.style('border-radius', `${this.borderRadius}px`)
        if (!this.isAnimated) {
          s.noLoop()
        }
      }

      // Current animation time
      const animationDuration = Math.max(1, this.animationDuration)
      const shapeSpeeds = new Array(firstChunks.length).fill(1)
      const shapeTimes = new Array(firstChunks.length).fill(this.isAnimated ? animationDuration / 2 : animationDuration)
      const shapeDelay = animationDuration / firstChunks.length

      // eslint-disable-next-line no-param-reassign
      s.draw = () => {
        const shapes: ShapeConfig[] = []
        for (let i = 0; i < firstChunks.length; i += 2) {
          const value1 = parseInt(firstChunks.slice(i, i + 2), 16)
          const value2 = parseInt(lastChunks.slice(i, i + 2), 16)

          const delay = i * shapeDelay
          if (shapeTimes[i] + delay >= animationDuration + shapeDelay * firstChunks.length) {
            shapeSpeeds[i] = -1
          } else if (shapeTimes[i] + delay <= 0) {
            shapeSpeeds[i] = 1
          }
          shapeTimes[i] += 1 * shapeSpeeds[i]
          const progress = this.easingFunction(((shapeTimes[i] + delay)) / (animationDuration + shapeDelay * firstChunks.length))

          const r = offset * value1 % 255
          const g = offset * value2 % 255
          const b = offset * (value1 - value2) % 255
          shapes.push({
            value1: this.animateValue({ i, progress, value: r }),
            value2: this.animateValue({ i, progress, value: g }),
            value3: this.animateValue({ i, progress, value: b }),
            r,
            g,
            b,
            opacity: this.colorMultiplier * (value1 - value2) % 255 / 255 * 100,
            offsetX: this.isPortrait ? 0 : s.width * (1 - progress),
            offsetY: this.isPortrait ? s.height * (1 - progress) : 0,
          })
        }

        s.background(255) // White
        s.noStroke()
        s.scale(Math.max(1, this.width / this.svgSizeProps.width))
        s.blendMode(s.BLEND)
        drawShapes({ shapes, shouldFill: true })
        s.strokeWeight(1)
        s.noFill()
        s.blendMode(s.SCREEN)
        drawShapes({ shapes, shouldFill: false })
      }

      // eslint-disable-next-line no-param-reassign
      s.windowResized = () => {
        this.detectCardSize()
        s.resizeCanvas(this.width, this.height)
      }
    }

    if (!this.canvas && window) {
      const P5Default = (await import('p5')).default;
      this.canvas = new P5Default(sketch, this.$refs.canvas as HTMLElement)
    }

    if (!this.qrcode) {
      this.qrcode = new QRCode(this.$refs.qrcode, {
        text: this.qrCodeContent,
        width: IscnCard.qrCodeSize,
        height: IscnCard.qrCodeSize,
        colorDark: IscnCard.qrCodeColor,
        colorLight: 'transparent',
        drawer: 'svg',
        correctLevel: QRCode.CorrectLevel.H,
        PO: IscnCard.qrCodePositionZoneColor,
        PI: IscnCard.qrCodePositionZoneColor,
        logo: '/images/iscn-card/logo.svg',
        logoWidth: IscnCard.qrCodeLogoSize,
        logoHeight: IscnCard.qrCodeLogoSize,
        onRenderingEnd: () => {
          this.isQRCodeRendering = false
        },
      })
    } else {
      this.qrcode.makeCode(this.qrCodeContent)
    }
  }

  handleResize() {
    window.requestAnimationFrame(this.sketchGraph)
  }
}
</script>

<style>
/* To make circle dot */
.qrcode rect[fill="#333"] {
  rx: 50%;
  ry: 50%;
}
</style>
