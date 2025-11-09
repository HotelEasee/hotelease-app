import React, { useState } from 'react';
import { FaShare, FaCopy, FaFacebook, FaTwitter, FaWhatsapp, FaEnvelope, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelName: string;
  hotelUrl: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, hotelName, hotelUrl }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(hotelUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const shareText = `Check out ${hotelName} on HotelEase!`;
    const encodedUrl = encodeURIComponent(hotelUrl);
    const encodedText = encodeURIComponent(shareText);

    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(hotelName)}&body=${encodedText}%20${encodedUrl}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      toast.success(`Sharing on ${platform}...`);
    }
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h3>Share {hotelName}</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="share-modal-content">
          <div className="share-options">
            <button
              className="share-option"
              onClick={() => handleShare('facebook')}
            >
              <FaFacebook className="share-icon facebook" />
              <span>Facebook</span>
            </button>
            <button
              className="share-option"
              onClick={() => handleShare('twitter')}
            >
              <FaTwitter className="share-icon twitter" />
              <span>Twitter</span>
            </button>
            <button
              className="share-option"
              onClick={() => handleShare('whatsapp')}
            >
              <FaWhatsapp className="share-icon whatsapp" />
              <span>WhatsApp</span>
            </button>
            <button
              className="share-option"
              onClick={() => handleShare('email')}
            >
              <FaEnvelope className="share-icon email" />
              <span>Email</span>
            </button>
          </div>
          <div className="share-link-section">
            <input
              type="text"
              value={hotelUrl}
              readOnly
              className="share-link-input"
            />
            <button
              className={`copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopyLink}
            >
              <FaCopy />
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;

