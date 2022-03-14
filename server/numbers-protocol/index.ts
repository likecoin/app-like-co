import axios from 'axios';
import FormData from 'form-data';

import { UPLOAD_FILESIZE_MAX } from '../constant'

const {
  NUMBERS_PROTOCOL_BASE_URL,
  NUMBERS_PROTOCOL_API_KEY,
  NUMBERS_PROTOCOL_TOKEN,
} = require('../config/config')

const numAPI = axios.create({
  baseURL: NUMBERS_PROTOCOL_BASE_URL,
  timeout: 60000,
  headers: {
    'X-API-Key': NUMBERS_PROTOCOL_API_KEY,
    'Authorization': `token ${NUMBERS_PROTOCOL_TOKEN}`,
  },
  maxBodyLength: UPLOAD_FILESIZE_MAX,
});

const DEFAULT_TAGS = ['iscn']

export async function registerNUMAsset(file: Buffer, filename?: string, {
  tag = [],
  caption = '',
}: {
  tag?: string[],
  caption?: string,
} = {}) {
  try {
    const formData = new FormData();
    formData.append('asset_file', file, filename);
    // A public asset can be viewed by anyone.
    formData.append('public_access', 'true')
    formData.append('tag', DEFAULT_TAGS.concat(tag).join(','));
    formData.append('caption', caption);
    const result = await numAPI.post('/assets/', formData, {
      headers: formData.getHeaders(),
    })
    const { id } = result.data
    return id
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const numError = error.response?.data?.error
      if (numError) {
        if (numError.type === 'duplicate_asset_not_allowed') {
          const assetId = numError.details[0]?.cid
          if (assetId) {
            return assetId
          }
        } else {
          // eslint-disable-next-line no-console
          console.error(numError)
        }
      }
    }
    console.error(error)
    throw new Error("REGISTER_NUM_ASSET_FAILED")
  }
}

export function registerNUMAssets(assets: {
  file: Buffer
  filename?: string,
  tag?: string[],
  caption?: string,
}[]) {
  return Promise.all(assets.map(asset => registerNUMAsset(asset.file, asset.filename, {
    tag: asset.tag,
    caption: asset.caption,
  })))
}

export async function getAssetFromId(id: string) {
  try {
    const result = await numAPI.get(`/assets/${id}/`)
    return result.data
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return undefined;
  }
}
