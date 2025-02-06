
const arweavekit = {
  createArweaveKit: jest.fn(() => ({
    // 加入需要模擬的方法
    encryption: {
      encrypt: jest.fn(),
      decrypt: jest.fn(),
    },
  })),
};

module.exports = arweavekit;