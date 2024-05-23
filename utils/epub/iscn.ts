import QRCode from 'qrcode'
import JSZip from 'jszip'
import { Book } from 'epubjs'

import { SITE_URL } from '~/constant'
import { ISCN_CSS, ISCN_LOCALE_CONFIG, ISCN_LOGO_SVG, ISCN_XHTML } from './asset'
import { extractIscnIdPrefix } from '../ui'

type EPUB_LOCALE = 'zh' | 'en';

const LIKE_GREEN = '#28646e'
const QR_CODE_SIZE = 256
const LOGO_SIZE = 64

const ISCN_CSS_NAME = 'iscn.css'
const ISCN_XHTML_NAME = 'iscn.xhtml'
const ISCN_QR_CODE_PNG_NAME = 'iscn-qr-code.png'

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = (() => resolve(i));
    i.onerror = (e => reject(e));
    i.src = url;
  });
}

function getISCNURL(iscnPrefix: string) {
  return `${SITE_URL}/view/${encodeURIComponent(iscnPrefix)}`
}

export async function createQRCodeCanvas(iscnPrefix: string) {
  const iscnURL = getISCNURL(iscnPrefix)
  const initQRCode = await QRCode.toDataURL(iscnURL, {
    color: {
      light: LIKE_GREEN,
      dark: '#fff',
    },
    errorCorrectionLevel: 'H',
    margin: 2,
  })
  const canvas = document.createElement('canvas')
  canvas.width = QR_CODE_SIZE
  canvas.height = QR_CODE_SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Cannot get 2d context')

  const img = await loadImage(initQRCode)
  ctx.drawImage(img, 0, 0, QR_CODE_SIZE, QR_CODE_SIZE)

  // draw blank white circle
  const circleCenter = canvas.width / 2
  ctx.fillStyle = LIKE_GREEN
  ctx.beginPath()
  ctx.arc(circleCenter, circleCenter, LOGO_SIZE / 2 + 2, 0, 2 * Math.PI, false)
  ctx.fill()

  // draw logo
  const logoBlob = new Blob([ISCN_LOGO_SVG], {type: 'image/svg+xml'});
  const logoUrl = URL.createObjectURL(logoBlob);
  const logoImage = await loadImage(logoUrl)
  URL.revokeObjectURL(logoUrl)
  const logoPosition = (canvas.width - LOGO_SIZE) / 2
  ctx.drawImage(logoImage, logoPosition, logoPosition, LOGO_SIZE, LOGO_SIZE)

  return canvas
}

export function saveCanvas(canvas: HTMLCanvasElement, type = 'image/png'): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob: Blob | null) => blob ? resolve(blob) : reject(new Error('Cannot save canvas to blob')), type)
  })
}

function updateContentOPF(doc: Document, iscnPageHref: string, iscnQRCodeHref: string) {
  if (doc.querySelector('#iscn-page')) return
  const manifest = doc.querySelector('manifest')
  manifest?.insertAdjacentHTML('beforeend', `  <item id="iscn-css" href="iscn.css" media-type="text/css" />\n  `)
  manifest?.insertAdjacentHTML('beforeend', `  <item id="iscn-qr-code-image" href="${iscnQRCodeHref}" media-type="image/png" />\n  `)
  manifest?.insertAdjacentHTML('beforeend', `  <item id="iscn-page" href="${iscnPageHref}" media-type="application/xhtml+xml" />\n  `)

  const spine = doc.querySelector('spine')
  spine?.insertAdjacentHTML('beforeend', `  <itemref idref="iscn-page" />\n  `)
}

function readInfoMap(doc: Document, iscnData: any, locale: EPUB_LOCALE = 'en') {
  const titles = doc.querySelector("metadata title")
  const title = iscnData?.contentMetadata?.name || titles?.textContent
  const authors = doc.querySelector("metadata creator")
  const author = iscnData?.contentMetadata?.author || authors?.textContent
  const releaseDate = new Date().toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const map = new Map()
  map.set(ISCN_LOCALE_CONFIG[locale].TITLE_LABEL, title)
  map.set(ISCN_LOCALE_CONFIG[locale].AUTHOR_LABEL, author)
  map.set(ISCN_LOCALE_CONFIG[locale].RELEASE_DATE_LABEL, releaseDate)
  return map
}

function addBookInfo(doc: Document, infoItemMap: Map<string, string>) {
  const div = doc.querySelector('body #iscn-page-book-info')
  const itemsString = [...infoItemMap]
    .filter(([
      key,
      value,
    ]) => key && value)
    .map(([
      key,
      value,
    ]) => (
      `<p>${key}: ${value}</p>\n`
    ))
    .join('')
  div?.insertAdjacentHTML('afterbegin', itemsString)
}

function setISCNLink(doc: Document, iscnPrefix: string) {
  const a = doc.querySelector('body a#iscn-prefix')
  const iscnURL = getISCNURL(iscnPrefix)
  a?.setAttribute('href', iscnURL)
  if (a) a.textContent = iscnPrefix
}

function addFooterDisclaimer(doc: Document, locale: EPUB_LOCALE = 'en') {
  const footer = doc.querySelector('body #depub-disclaimer')
  if (footer) {
    footer.textContent = ISCN_LOCALE_CONFIG[locale].DEPUB_DISCLAIMER
  }
}

export async function injectISCNQRCodePageEpub(buffer: ArrayBuffer, book: Book, iscnId: string, iscnData: any) {
  const zipObject = new JSZip()
  await zipObject.loadAsync(buffer)
  const iscnPrefix = extractIscnIdPrefix(iscnId)
  // create QR code
  const canvas = await createQRCodeCanvas(iscnPrefix)
  const oebpsPath: string = (book.container as any).directory
  const blob = await saveCanvas(canvas)
  if (!blob) throw new Error('Cannot save canvas to blob')
  await zipObject.file(`${oebpsPath}/${ISCN_QR_CODE_PNG_NAME}`, blob)

  // read and update content.opf
  const path = (book.container as any).packagePath
  const opfString = await zipObject.file((book.container as any).packagePath)?.async('string') || ''
  const doc = new DOMParser().parseFromString(opfString, 'text/xml')
  const metadataLocale = doc.querySelector("metadata language")?.textContent || 'en'
  const locale = metadataLocale?.toLocaleLowerCase()?.includes('zh') ? 'zh' : 'en'
  updateContentOPF(doc, ISCN_XHTML_NAME, ISCN_QR_CODE_PNG_NAME)
  const infoMap = readInfoMap(doc, iscnData, locale)
  const updatedOpfString = new XMLSerializer().serializeToString(doc).toString()
  await zipObject.file(path, updatedOpfString)

  // add ISCN css
  await zipObject.file(`${oebpsPath}/${ISCN_CSS_NAME}`, ISCN_CSS)

  // add ISCN XHTML and update info
  const iscnXHTMLPath = `${oebpsPath}/${ISCN_XHTML_NAME}`
  const iscnXHTMLDoc =  new DOMParser().parseFromString(ISCN_XHTML, 'text/xml')
  addBookInfo(iscnXHTMLDoc, infoMap)
  setISCNLink(iscnXHTMLDoc, iscnPrefix)
  addFooterDisclaimer(iscnXHTMLDoc, locale)
  const updatedISCNXHTMLString = new XMLSerializer().serializeToString(iscnXHTMLDoc).toString()

  await zipObject.file(iscnXHTMLPath, updatedISCNXHTMLString)
  await zipObject.file('mimetype', 'application/epub+zip', {
    compression: 'STORE',
  });
  const epubBlob = await zipObject.generateAsync({
    mimeType: 'application/epub+zip',
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9,
    },
  })
  return epubBlob
}
