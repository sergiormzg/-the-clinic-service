export function getReceptionEmailEndpoint() {
  return '/api/sendReceptionEmail';
}

export function getWhatsappBusinessUrl(phone, text, isMobile) {
  const encodedText = encodeURIComponent(text || '');
  return isMobile
    ? `whatsapp-business://send?phone=${phone}&text=${encodedText}`
    : `https://web.whatsapp.com/send?phone=${phone}&text=${encodedText}`;
}
