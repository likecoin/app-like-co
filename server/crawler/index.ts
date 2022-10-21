import axios from 'axios'
import cheerio from 'cheerio'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import UaPlugin from 'puppeteer-extra-plugin-anonymize-ua'

puppeteer.use(UaPlugin())
puppeteer.use(StealthPlugin())

async function checkDomainExists(domain: string): Promise<boolean> {
  try {
    const { data } = await axios.get(`https://dns.google.com/resolve?name=${domain}`);
    return data.Status === 0;
  } catch (err) {
    return false;
  }
}

// refer to https://github.com/thematters/matters-html-formatter/blob/main/src/makeHtmlBundle/formatHTML/articleTemplate.ts
function formatBody({
  content,
  title,
  author,
  description,
}: {
  content: string
  title: string
  author: string
  description: string
}) {
  let meta = ''
  if (description) {
    meta += `
    <meta name="description" content="${description}" />
    <meta property="og:description" content="${description}">
    <meta name="twitter:description" content="${description}">`
  }
  if (author) {
    meta += `
    <meta property="article:author" content="${author}">
    <meta property="og:title" content="${author}: ${title}">
    <meta name="twitter:title" content="${author}: ${title}">`
  } else {
    meta += `
    <meta property="og:title" content="${title}">
    <meta name="twitter:title" content="${title}">`
  }
  const style = `
    <style>
      html, body {
        margin: 0;
        padding: 0;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
        font-size: 18px;
        line-height: 1.5;
      }
      main {
        max-width: 673px;
        margin: 40px auto;
        padding: 0 20px;
      }
      hr { height: 1px; }
      h1, h2, h3, h4, h5, h6 { font-weight: 600; line-height: 1.4; }
      h1 { font-size: 28px; }
      h2 { font-size: 24px; }
      h3 { font-size: 22px; }
      h4 { font-size: 18px; }
      h5 { font-size: 16px; }
      h6 { font-size: 14px; }
      li ul, li ol { margin: 0 20px; }
      li { margin: 20px 0; }
      ul { list-style-type: disc; }
      ol { list-style-type: decimal; }
      ol ol { list-style: upper-alpha; }
      ol ol ol { list-style: lower-roman; }
      ol ol ol ol { list-style: lower-alpha; }
      img, video, audio {
        display: block;
        max-width: 100%;
        margin: 0 auto;
      }
      audio {
        width: 100%;
      }
      blockquote {
        margin-left: 20px;
        margin-right: 20px;
        color: #5F5F5F;
      }

      pre {
        white-space: pre-wrap;
      }

      header {
        margin-bottom: 40px;
      }
      header h1 {
        font-size: 32px;
      }


      figure {
        margin: 0;
      }

      figure.byline {
        font-size: 16px;
        margin: 0;
      }
      figure.byline * + * {
        padding-left: 10px;
      }
      figure.byline time {
        color: #b3b3b3;
      }
      figure.byline [ref="source"]::before {
        content: '';
        border-left: 1px solid currentColor;
        padding-left: 10px;
      }

      figure.summary {
        margin: 40px 0; 
        color: #808080;
        font-size: 18px;
        font-weight: 500;
        line-height: 32px;
      }

      figure.read_more {
        margin: 40px 0; 
      }

      article {
        position: relative;
      }

      article > * {
        margin-top: 20px;
        margin-bottom: 24px;
      }
      article a {
        border-bottom: 1px solid currentcolor;
        text-decoration: none;
        padding-bottom: 2px;
      }
      article p {
        line-height: 1.8;
      }
      figure figcaption {
        margin-top: 5px;
        font-size: 16px;
        color: #b3b3b3;
      }

      figure .iframe-container {
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 56.25%;
      }
      figure .iframe-container iframe {
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
      }

      .encrypted {
        display: flex;
        justify-content: center;
        word-break: break-all;
      }
    </style>
`
  const body = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    ${meta}
  ${style}
  </head>
  <body itemscope itemtype="http://schema.org/Article">
    <main>
      <header>
        <h1 itemprop="headline">${title}</h1>
        <figure class="byline">
        </figure>
      </header>
      <article itemprop="articleBody">
        ${content}
      </article>
    </main>
  </body>
</html>
`
  return body
}

async function getBrowser(): Promise<any> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  })
  return browser
}

async function getContentFromUrl(url: string) {
  let content
  try {
    const { data } = await axios.get(url)
    content = data
  } catch (error: any) {
    if (error?.response?.status === 403) {
      const browser = await getBrowser()
      const page = await browser.newPage()
      const blockedResources = [
        'image',
        'stylesheet',
        'media',
        'font',
        'texttrack',
        'object',
        'beacon',
        'csp_report',
        'imageset',
      ]
      await page.setRequestInterception(true)
      page.on('request', (request: any) => {
        const handled = false
        if (!handled) {
          const url1 = request.url()
          const { host, pathname } = new URL(url1)
          if (
            blockedResources.includes(request.resourceType()) ||
            pathname.endsWith('.jpg') ||
            pathname.endsWith('.jpeg') ||
            pathname.endsWith('.png') ||
            pathname.endsWith('.gif') ||
            pathname.endsWith('.css') ||
            host.includes('button.like.co')
          ) {
            request.abort('blockedbyclient')
          } else {
            request.continue()
          }
        }
      })
      await page.goto(encodeURI(url as string), { waitUntil: 'networkidle2' })
      content = await page.content()
      await page.close()
      await browser.close()
    } else {
      throw error
    }
  }
  return content
}

export async function getCralwerData(url: string) {
  let description = ''
  let keywords = ''
  let author = ''
  let title = ''
  let body = ''
  let ogImage = ''
  let tileImage = ''
  let images: any = []

  try {
    const { protocol, host, hostname } = new URL(url)
    if (!(await checkDomainExists(hostname))) throw new Error('URL_NOT_REACHABLE');
    const content = await getContentFromUrl(url)
    const $ = cheerio.load(content)
    ;[
      'script',
      'style',
      'svg',
      'source',
    ].forEach((t: string) => $(t).remove())
    title = $('title').text()
    const metas = $('meta')
    const promiseImg: any = []

    const img = $('img')
    img.each((i, e) => {
      const src = $(e).attr('src')
      if (src) {
        let srcUrl = src
        if (!src.startsWith('http')) {
          srcUrl = `${protocol}//${host}${src}`
        }
        promiseImg.push(
          axios
            .get(`${srcUrl}`, { responseType: 'arraybuffer' })
            .then((element) => {
              const newFileName = `image_${i}`
              $(e).attr('src', `./${newFileName}`)
              return { element, key: newFileName }
            })
            .catch(() => {}),
        )
      }
    })

    const imgData: any = await Promise.all(promiseImg)
    images = imgData
      .filter((e: any) => e?.element?.status === 200)
      .map((e: any) => ({
        data: Buffer.from(e.element.data, 'binary').toString('base64'),
        key: e.key,
        type: e.element.headers['content-type'],
      }))

    Object.keys(metas).forEach((key: any) => {
      const { name, property, content: value } = metas[key].attribs || {}
      if (name === 'description' || property === 'og:description') {
        description = description || value
      } else if (name === 'keywords') {
        keywords = keywords || value
      } else if (name === 'author') {
        author = author || value
      } else if (property === 'og:image') {
        ogImage = ogImage || value
      } else if (name === 'msapplication-TileImage') {
        tileImage = tileImage || value
      }
    })
    ogImage = ogImage || tileImage
    body = $('body').html() || ''
    body = formatBody({ content: body, title, author, description })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
  }
  return { title, description, keywords, author, body, ogImage, images }
}

function encodedURL(url:string): string{
  if (decodeURI(url) !== url) return url;
  return encodeURI(url);
}

export async function crawlOgImage(url: string) {
  const content = await getContentFromUrl(url)
  const $ = cheerio.load(content)
  const metas = $('meta')
  let ogImageUrl = ''
  let tileImage = ''
  Object.keys(metas).forEach((key: any) => {
    const { name, property, content: value } = metas[key].attribs || {}
    if (property === 'og:image') {
      ogImageUrl = ogImageUrl || value
    } else if (name === 'msapplication-TileImage') {
      tileImage = tileImage || value
    }
  })
  if (!ogImageUrl && !tileImage) return null;
  const res = await axios.get(encodedURL(ogImageUrl || tileImage), { responseType: 'stream' })
  return res;
}
