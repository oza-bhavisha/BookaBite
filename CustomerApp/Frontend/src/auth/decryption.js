import CryptoJS from 'crypto-js';

const decryptDataKey = (encryptedDataKey, kmsClient) => {
    const ciphertextBlob = Uint8Array.from(atob(encryptedDataKey), c => c.charCodeAt(0));
  
    return new Promise((resolve, reject) => {
      kmsClient.decrypt({ CiphertextBlob: ciphertextBlob }, (err, data) => {
        if (err) {
          console.error('Error decrypting data key:', err);
          reject(err);
        } else {
          const plaintextDataKey = btoa(String.fromCharCode.apply(null, data.Plaintext));
          resolve(plaintextDataKey);
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
