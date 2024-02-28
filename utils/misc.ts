import imageType from 'image-type';
import { AxiosPromise }  from 'axios'


export function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


export function fileToArrayBuffer(file: Blob): Promise<string | ArrayBuffer | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsArrayBuffer(file);
  });
}

export async function digestFileSHA256(buffer: ArrayBuffer) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export function readImageType(buffer: ArrayBuffer) {
  if (buffer) return imageType(Buffer.from(buffer));
  return null;
}

export function catchAxiosError(promise: AxiosPromise<any>) {
  return promise.catch((e) => {
    if (e.response?.status !== 404) {
      // eslint-disable-next-line no-console
      console.error(JSON.stringify(e));
      throw e;
    }
  });
}

export function downloadFile (blob: Blob, filename: string) {
  const file = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = file
  a.style.display = 'none'
  a.download = filename
  a.click()
}

export function downloadJSON(data: Object, fileName: string) {
  const jsonData = JSON.stringify(data, null, 2)

  const jsonBlob = new Blob([jsonData], { type: 'application/json' })

  downloadFile(jsonBlob, fileName)
}
