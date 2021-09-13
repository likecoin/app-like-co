<template>
  <div :class="rootClasses">
    <div :class="containerClasses">
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
      <div class="absolute inset-0 flex items-center justify-between">
        <div
          :class="labelClasses"
          style="writing-mode: vertical-lr"
        >
          {{ labelTextLeft }}
        </div>
        <div :class="qrCodeWrapperClasses">
          <div ref="qrcode" class="qrcode" />
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
import QRCode from 'easyqrcodejs'

function defaultEasingFunction(x: number): number {
  // Ease In Out Cubic
  return x < 0.5
    ? 4 * x * x * x
    : 1 - (-2 * x + 2) ** 3 / 2
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
  static baseWidth = 220
  static qrCodeSize = 112
  static qrCodeColor = '#333'
  static qrCodeLogoSize = 22
  static qrCodeLogoQuietZoneSize = 4
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
   * Control the saturation of the card. Default is 10.
   */
  @Prop({ default: 10 }) readonly colorMultiplier!: number

  /**
   * Set to true to show stunning mounting animation.
   */
  @Prop({ default: false }) readonly isAnimated!: boolean

  /**
   * Animation duration in frame in a cycle. Default is 500 frames.
   */
  @Prop({ default: 500 }) readonly animationDuration!: number

  /**
   * Easing function of the animation. Default is ease in out sine.
   */
  @Prop({ default: () => defaultEasingFunction }) readonly easingFunction!: (x: number) => number

  canvas: P5 | undefined

  qrcode: QRCode | undefined

  isQRCodeRendering = true

  get recordID() {
    return this.record?.id || ''
  }

  get encodedIDInHex() {
    const matches = this.recordID.match(/iscn:\/\/[a-zA-Z0-9-_]+\/([a-zA-Z0-9-_]+)\/\d+/)
    if (!matches || !matches[1]) return ''
    return Buffer.from(matches[1]).toString('hex')
  }

  get rootClasses() {
    const isShowLoadingIndicator = !this.isAnimated && this.isQRCodeRendering
    return [
      isShowLoadingIndicator ? 'bg-shade-gray' : 'bg-white',
      'rounded-[24px]',
      'text-like-green',
      'overflow-hidden',
      {
        'animate-pulse': isShowLoadingIndicator,
      },
    ]
  }

  get containerClasses() {
    return [
      'relative',
      'min-w-[220px]',
      'aspect-w-1',
      'aspect-h-2',
      'transition',
      'transition-all',
      this.isAnimated ? 'duration-1000' : 'duration-500',
      'ease-out',
      this.isAnimated && this.isQRCodeRendering ? 'scale-125' : 'scale-100',
      !this.isAnimated && this.isQRCodeRendering ? 'blur-3xl' : 'blur-none',
      !this.isAnimated && this.isQRCodeRendering ? 'opacity-0' : 'opacity-100',
    ]
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
    return this.recordID
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

  get qrCodeWrapperClasses() {
    return [
      'rounded-[4px]',
      'bg-white',
      'mix-blend-luminosity',
      'transition',
      'transition-all',
      'duration-700',
      'ease-out',
      this.isAnimated && this.isQRCodeRendering ? 'scale-50' : 'scale-100',
      this.isAnimated && this.isQRCodeRendering ? 'opacity-0' : 'opacity-80',
    ]
  }

  mounted() {
    this.sketchGraph()
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
        const { width, height } = this.getCardSize()
        s.createCanvas(width, height)

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

          // eslint-disable-next-line
          function animateX(x: number) {
            const mod = i % 3
            switch (mod) {
              case 0:
                return x + offset / 8 * (1 - progress)
              case 1:
                return x * progress
              default:
                return x - offset / 8 * (1 - progress)
            }
          }

          shapes.push({
            x1: animateX(offset * value1 % 255),
            x2: animateX(offset * value2 % 255),
            x3: animateX(offset * (value1 - value2) % 255),
            r: offset * value1 % 255,
            g: offset * value2 % 255,
            b: offset * (value1 - value2) % 255,
            opacity: this.colorMultiplier * (value1 - value2) % 255 / 255 * 100,
            offsetY: s.height * (1 - progress),
          })
        }

        // Scale the shape corresponding to the size of the canvas
        s.scale(s.width / IscnCard.baseWidth)

        s.background(255) // White
        s.noStroke()

        s.blendMode(s.BLEND)
        drawShapes({ shapes, shouldFill: true })
        s.strokeWeight(1)
        s.noFill()
        s.blendMode(s.SCREEN)
        drawShapes({ shapes, shouldFill: false })
      }

      // eslint-disable-next-line no-param-reassign
      s.windowResized = () => {
        const {
          width: newWidth,
          height: newHeight,
        } = this.getCardSize()
        s.resizeCanvas(newWidth, newHeight)
      }
    }

    if (!this.canvas) {
      this.canvas = new P5(sketch, this.$refs.canvas as HTMLElement)
    }

    const { width } = this.getCardSize()
    const qrCodeRatio = width / IscnCard.baseWidth
    const qrCodeSize = qrCodeRatio * IscnCard.qrCodeSize
    const qrCodeLogoSize = qrCodeRatio * IscnCard.qrCodeLogoSize
    const quietZoneSize = qrCodeRatio * IscnCard.qrCodeLogoQuietZoneSize
    if (!this.qrcode) {
      this.qrcode = new QRCode(this.$refs.qrcode, {
        text: this.recordID,
        width: qrCodeSize,
        height: qrCodeSize,
        colorDark: IscnCard.qrCodeColor,
        colorLight: 'transparent',
        drawer: 'svg',
        correctLevel: QRCode.CorrectLevel.H,
        quietZone: quietZoneSize,
        PO: IscnCard.qrCodePositionZoneColor,
        PI: IscnCard.qrCodePositionZoneColor,
        logo: '/images/iscn-card/logo/portrait.svg',
        logoWidth: qrCodeLogoSize,
        logoHeight: qrCodeLogoSize,
        onRenderingEnd: () => {
          this.isQRCodeRendering = false
        },
      })
    } else {
      this.qrcode.makeCode(this.recordID)
      this.qrcode.resize(qrCodeSize, qrCodeSize)
    }
  }

  getCardSize() {
    const {
      offsetWidth: width = 0,
      offsetHeight: height = 0,
    } = this.$refs.canvas as HTMLElement || {}
    return { width, height }
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
