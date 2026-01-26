export const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('文件读取失败'));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });

export const getBase64FromFile = async (file: File): Promise<string> => {
  const dataUrl = await readFileAsDataUrl(file);
  const base64 = dataUrl.split(',')[1];
  if (!base64) {
    throw new Error('文件内容为空');
  }
  return base64;
};
