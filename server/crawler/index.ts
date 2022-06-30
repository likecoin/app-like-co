import axios from 'axios'
import cheerio from 'cheerio'

export default async function getCralwerData(url: string) {
  let description = ''
  let keywords = ''
  let title = ''
  try {
    const cralwerData = await axios.get(encodeURI(url as string))
    const $ = cheerio.load(cralwerData.data)
      title = $('title').text()
      const metas = $('meta')

      Object.keys(metas).forEach((key: any) => {
        if (
          (metas[key].attribs || {}).name === 'description' ||
          (metas[key].attribs || {}).property === 'og:description'
        ) {
          description = metas[key].attribs.content
        } else if ((metas[key].attribs || {}).name === 'keywords') {
          keywords = metas[key].attribs.content
        }
      })
  } catch (error) {
    console.error(error)
  }
  return { title, description, keywords };
}
