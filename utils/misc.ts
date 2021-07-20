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

export async function digestFileSHA256(file: Blob) {
  const buffer = await fileToArrayBuffer(file);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer as ArrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function readImageType(file: Blob) {
  const buffer = await fileToArrayBuffer(file);
  if (buffer) return imageType(Buffer.from(buffer as ArrayBuffer));
  return null;
}
