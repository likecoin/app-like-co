function hexString(buffer: Buffer | ArrayBuffer) {
  const byteArray = new Uint8Array(buffer);
  const hexCodes = [...byteArray].map(value => {
    const hexCode = value.toString(16);
    const paddedHexCode = hexCode.padStart(2, '0');
    return paddedHexCode;
  });
  return hexCodes.join('');
}

function digestMessage(message: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  return window.crypto.subtle.digest('SHA-256', data);
}

export async function setTrackerUser(vue: Vue, { wallet } : { wallet?: string } = {}) {
  if  (navigator.doNotTrack) return;
  try {
    if (vue.$gtag && wallet) {
      const hashedId = hexString(await digestMessage(wallet));
      vue.$gtag.set({ userId: hashedId });
    }
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
  }
}

export function logTrackerEvent(
  vue: Vue,
  category: string,
  action: string,
  label: string,
  value: number,
) {
  try {
    // do not track
    if (navigator.doNotTrack) return;
    if (vue.$gtag) {
      vue.$gtag.event(action, {
        event_category: category,
        event_label: label.substring(0, 499),
        value,
      });
    }
  } catch (err) {
    console.error('logging error:'); // eslint-disable-line no-console
    console.error(err); // eslint-disable-line no-console
  }
}

export default logTrackerEvent;
