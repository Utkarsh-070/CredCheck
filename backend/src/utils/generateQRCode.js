import QRCode from 'qrcode';
import cloudinary from '../config/cloudinary.js';

export const generateQRCode = async (publicLinkId) => {
  const publicUrl = `${process.env.CLIENT_URL}/cert/${publicLinkId}`;

  const qrDataUrl = await QRCode.toDataURL(publicUrl, {
    width: 400,
    margin: 2,
  });

  const uploadResult = await cloudinary.uploader.upload(qrDataUrl, {
    folder: 'credcheck/qrcodes',
    public_id: `qr_${publicLinkId}`,
  });

  return uploadResult.secure_url;
};
