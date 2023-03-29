export const ISCN_PUBLISHERS: {[key: string]: any} = {
  matters:
  {
    entity: {
      description: 'Matters is a decentralized, cryptocurrency driven content creation and discussion platform.',
      '@id': 'https://matters.news/',
      name: 'Matters',
    },
    license: 'matters',
    rewardProportion: 0,
  },
  depub: {
    entity: {
      id: 'https://depub.space',
      name: 'depub.space',
    },
    license: 'https://creativecommons.org/licenses/by/4.0',
    rewardProportion: 0.025,
    contentFingerprints: ['https://depub.blog'],
  },
};

export const ISCN_LICENSES: {[key: string]: string} = {
  matters: 'ipfs://QmRvpQiiLA8ttSLAXEd5RArmXeG4qWEsKPmrB7KeiLSuE4',
  default: 'ipfs://QmZhRNkZaSnhDr6gBC22zwhTjsGyUx39tm8gjFYnTr2SjN',
};
