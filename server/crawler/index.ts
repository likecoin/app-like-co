import axios from 'axios'
import cheerio from 'cheerio'

export default async function getCralwerData(url: string) {
  const data = await axios
    .get(encodeURI(url as string))
    .then((data1) => {

      const $ = cheerio.load(data1.data)
      const title = $('title').text()
      let description = ''
      let keywords = ''
      const metas = $('meta')

      Object.keys(metas).forEach((key: any) => {
        if (
          (metas[key].attribs || {}).name === 'description' ||
          (metas[key].attribs || {}).property === 'og:description'
        ) {
          description = metas[key].attribs.content
        } else if ((metas[key].attribs || {}).name === 'keywords'){
          keywords = metas[key].attribs.content
        }
      })
      return { title, description, keywords }
    })
    .catch((error) => {
      console.error(error)
    })
  return data
}
