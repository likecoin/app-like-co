import { PDFDocument, StandardFonts } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import axios from 'axios'

import { extractIscnIdPrefix } from '../ui'
import { saveCanvas, createQRCodeCanvas } from '../epub/iscn'
import { ISCN_LOCALE_CONFIG } from '../epub/asset'

let fontBytes: ArrayBuffer | null = null

async function getFontBytes() {
  if (fontBytes) return fontBytes
  const { data } = await axios.get('/fonts/notosans_tc_regular.ttf', {
    responseType: 'arraybuffer',
  })
  fontBytes = data
  return data
}

export async function injectISCNQRCodePagePdf(
  buffer: ArrayBuffer,
  iscnId: string,
  iscnData: any,
) {
  const pdfDoc = await PDFDocument.load(buffer)
  pdfDoc.registerFontkit(fontkit)
  const bytes = await getFontBytes()
  const font = await pdfDoc.embedFont(bytes)
  const iscnIdFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const { width, height } = pdfDoc.getPage(0).getSize()
  const page = pdfDoc.addPage([
    width,
    height,
  ])

  const iscnPrefix = extractIscnIdPrefix(iscnId)
  // create QR code
  const canvas = await createQRCodeCanvas(iscnPrefix)
  const imageBlob = await saveCanvas(canvas)
  if (!imageBlob) throw new Error('Cannot save canvas to blob')
  let locale: 'en' | 'zh' = 'en'
  const iscnLanguage = iscnData.contentMetadata?.inLanguage || 'en'
  if (iscnLanguage.toLowerCase().includes('zh')) {
    locale = 'zh'
  }
  const pageWidth = page.getWidth()
  const pageHeight = page.getHeight()

  const fontSize = 16
  const iscnIdFontSize = 12
  const textHeight = font.heightAtSize(fontSize)

  const pngImage = await pdfDoc.embedPng(await imageBlob.arrayBuffer())
  const pngSize = pngImage.scale(0.7)

  const title = `${ISCN_LOCALE_CONFIG[locale].TITLE_LABEL}: ${iscnData?.contentMetadata?.name}`
  const titleTextWidth = font.widthOfTextAtSize(title, fontSize)
  page.drawText(title, {
    x: pageWidth / 2 - titleTextWidth / 2,
    y: pageHeight / 2 + pngSize.height / 2 + 110,
    font,
    size: fontSize,
  })

  const author = `${ISCN_LOCALE_CONFIG[locale].AUTHOR_LABEL}: ${iscnData?.contentMetadata?.author}`
  const authorTextWidth = font.widthOfTextAtSize(author, fontSize)
  page.drawText(author, {
    x: pageWidth / 2 - authorTextWidth / 2,
    y: pageHeight / 2 + pngSize.height / 2 + 80,
    font,
    size: 16,
  })

  const releaseDate = `${
    ISCN_LOCALE_CONFIG[locale].RELEASE_DATE_LABEL
  }: ${new Date().toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}`
  const dateTextWidth = font.widthOfTextAtSize(releaseDate, fontSize)
  page.drawText(releaseDate, {
    x: pageWidth / 2 - dateTextWidth / 2,
    y: pageHeight / 2 + pngSize.height / 2 + 50,
    font,
    size: fontSize,
  })

  page.drawImage(pngImage, {
    x: pageWidth / 2 - pngSize.width / 2,
    y: pageHeight / 2 - pngSize.height / 2,
    width: pngSize.width,
    height: pngSize.height,
  })

  const iscnTextWidth = iscnIdFont.widthOfTextAtSize(iscnId, iscnIdFontSize)
  const iscnTextHeight = iscnIdFont.heightAtSize(iscnIdFontSize)

  page.drawText(iscnId, {
    x: pageWidth / 2 - iscnTextWidth / 2,
    y: pageHeight / 2 - pngSize.height / 2 - iscnTextHeight - 20,
    font: iscnIdFont,
    size: iscnIdFontSize,
  })

  const disclaimerText = ISCN_LOCALE_CONFIG[locale].DEPUB_DISCLAIMER
  const disclaimerTextWidth = font.widthOfTextAtSize(disclaimerText, fontSize)

  page.drawText(disclaimerText, {
    x: pageWidth / 2 - disclaimerTextWidth / 2,
    y: pageHeight / 8 + textHeight / 2 + 20,
    font,
    size: fontSize,
  })

  const finalBuffer = await pdfDoc.save()
  const finalBlob = new Blob([finalBuffer], { type: 'application/pdf' })
  return finalBlob
}

export default injectISCNQRCodePagePdf
