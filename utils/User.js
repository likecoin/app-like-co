import stringify from 'fast-json-stable-stringify';

const User = {
  async signCosmosMapping(inputWallet, signer, platform, iscnId, url, likerId) {
    if (!inputWallet) return null;
    if (![
'likeWallet',
'cosmosWallet',
].includes(platform)) {
      throw new Error('SIGN_COSMOS_LOGIN_INVALID_PLATFORM');
    }
    const ts = Date.now();
    const payload = JSON.stringify({
      ts,
      iscnId,
      url,
      likerId,
      [platform]: inputWallet,
    });
    const {
      signed: message,
      signature: { signature, pub_key: publicKey },
    } = await signer(payload);
    const data = {
      signature,
      publicKey: publicKey.value,
      message: stringify(message),
      from: inputWallet,
      platform,
    };
    return data;
  },
};

export default User;
