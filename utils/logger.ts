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

export async function setLoggerUser(vue: Vue, { wallet, method } : { wallet?: string, method?: string } = {}) {
  if  (navigator.doNotTrack) return;
  try {
    if (vue.$gtag && wallet) {
      const hashedId = hexString(await digestMessage(wallet));
      vue.$gtag.set({ userId: hashedId });
      // HACK: use .set to mitigate connected site user_id issue
      // https://support.google.com/analytics/answer/9973999?hl=en
      // vue.$gtag.config({ user_id: hashedId });
      vue.$gtag.set({ user_id: hashedId });
      vue.$gtag.event('login', { method });
    }
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
  }
}

export function updateSentryUser(vue: Vue, { wallet } : { wallet?: string } = {}) {
  if (vue.$sentry && wallet) {
    const opt = {
     id: wallet,
    };
    vue.$sentry.getCurrentScope().setUser(opt);
  }
}

export function logTrackerEvent(
  vue: Vue,
  category: string,
  action: string,
  label: string = '',
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
