import axios from 'axios'
import cheerio from 'cheerio'

export default async function getCralwerData(url: string) {
  let description = ''
  let keywords = ''
  let title = ''
  try {
    const crawlerData = await axios.get(encodeURI(url as string))
    const $ = cheerio.load(crawlerData.data)
    title = $('title').text()
    const metas = $('meta')

    Object.keys(metas).forEach((key: any) => {
      const { name, property, content } = metas[key].attribs || {};
      if (
        name === 'description' ||
        property === 'og:description'
      ) {
        description = content
      } else if (name === 'keywords') {
        keywords = content
      }
    })
  } catch (error) {
    console.error(error)
  }
  return { title, description, keywords };
}
