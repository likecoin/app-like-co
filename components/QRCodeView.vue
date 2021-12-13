<template>
  <div
    ref="qrcode"
    :style="style"
  />
</template>


<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import QRCode from 'easyqrcodejs';

@Component
export default class QRCodeView extends Vue {
  /**
   * QR code value
   */
  @Prop(String) readonly value!: string

  /**
   * QR code size
   */
  @Prop({ default: 100 }) readonly size!: number

  /**
   * QR code color
   */
  @Prop({ default: 'black' }) readonly color!: string

  qrcode: QRCode | undefined

  get style() {
    const width = `${this.size}px`;
    return {
      width,
      height: width,
    };
  }

  mounted() {
    this.drawQRCode()
  }

  @Watch('value')
  drawQRCode() {
    if (!this.value) return;
    if (!this.qrcode) {
      this.qrcode = new QRCode(this.$refs.qrcode, {
        text: this.value,
        width: this.size,
        height: this.size,
        colorDark: this.color,
        colorLight: 'transparent',
        drawer: 'svg',
        correctLevel: QRCode.CorrectLevel.H,
      })
    } else {
      this.qrcode.makeCode(this.value)
    }
  }

  handleResize() {
    window.requestAnimationFrame(this.drawQRCode)
  }
}
</script>
