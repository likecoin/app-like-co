import imageType from 'image-type';

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
