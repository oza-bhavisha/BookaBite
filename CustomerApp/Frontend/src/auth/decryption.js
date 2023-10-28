import CryptoJS from 'crypto-js';

const decryptDataKey = (encryptedDataKey, kmsClient) => {
    return new Promise((resolve, reject) => {
      kmsClient.decrypt({ CiphertextBlob: encryptedDataKey }, (err, data) => {
        if (err) {
          console.error('Error decrypting data key:', err);
          reject(err);
        } else {
          const plaintextDataKey = data.Plaintext;
          console.log('Decrypted Plaintext Data Key:', plaintextDataKey.toString('base64'));
          resolve(plaintextDataKey.toString('base64'));
        }
      });
    });
  };
  
const decryptData = (encryptedData, plaintextDataKey) => {
  const decryptedData = CryptoJS.AES.decrypt(encryptedData, plaintextDataKey, {
    format: CryptoJS.format.OpenSSL,
  });

  return decryptedData.toString(CryptoJS.enc.Utf8);
};

export { decryptDataKey, decryptData };
