/**
 * Device Styles Configuration
 * 
 * Each style defines the visual appearance of the device frame,
 * including bezel, notch/cutout, buttons, and home indicator.
 * 
 * CSS properties use template literals with ${width} and ${height} 
 * placeholders that will be replaced with actual device dimensions.
 */

window.deviceStyles = [
  // ============================================
  // MODERN STYLES
  // ============================================
  {
    id: 'modern-clean',
    name: 'Modern Clean',
    category: 'modern',
    description: 'Thin bezels, no notch',
    frame: {
      padding: 12,
      borderRadius: 40,
      screenRadius: 28,
      background: 'linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 50%, #0d0d0d 100%)',
      boxShadow: `
        0 50px 100px -20px rgba(0, 0, 0, 0.8),
        0 30px 60px -30px rgba(0, 0, 0, 0.6),
        inset 0 1px 1px rgba(255, 255, 255, 0.1),
        inset 0 -1px 1px rgba(0, 0, 0, 0.5)
      `
    },
    notch: null,
    buttons: {
      power: { right: -2, top: 100, width: 3, height: 70 },
      volumeUp: { left: -2, top: 80, width: 3, height: 35 },
      volumeDown: { left: -2, top: 125, width: 3, height: 35 }
    },
    homeIndicator: {
      show: true,
      width: 120,
      height: 5,
      bottom: 8,
      borderRadius: 3,
      background: 'rgba(255, 255, 255, 0.3)'
    }
  },
  
  {
    id: 'modern-notch',
    name: 'Modern Notch',
    category: 'modern',
    description: 'Center notch style',
    frame: {
      padding: 14,
      borderRadius: 44,
      screenRadius: 32,
      background: 'linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 50%, #0d0d0d 100%)',
      boxShadow: `
        0 50px 100px -20px rgba(0, 0, 0, 0.8),
        0 30px 60px -30px rgba(0, 0, 0, 0.6),
        inset 0 1px 1px rgba(255, 255, 255, 0.1),
        inset 0 -1px 1px rgba(0, 0, 0, 0.5)
      `
    },
    notch: {
      type: 'notch',
      width: 130,
      height: 32,
      borderRadius: '0 0 18px 18px',
      background: '#1a1a1a',
      elements: [
        { type: 'speaker', top: 12, width: 50, height: 5, background: '#333', borderRadius: 3 },
        { type: 'camera', top: 10, right: 20, size: 10, background: 'radial-gradient(circle, #1a3a5c 30%, #0a1520 100%)' }
      ]
    },
    buttons: {
      power: { right: -2, top: 120, width: 3, height: 80 },
      volumeUp: { left: -2, top: 100, width: 3, height: 40 },
      volumeDown: { left: -2, top: 150, width: 3, height: 40 }
    },
    homeIndicator: {
      show: true,
      width: 120,
      height: 5,
      bottom: 8,
      borderRadius: 3,
      background: 'rgba(255, 255, 255, 0.3)'
    }
  },
  
  {
    id: 'modern-pill',
    name: 'Modern Pill',
    category: 'modern',
    description: 'Dynamic Island style',
    frame: {
      padding: 12,
      borderRadius: 44,
      screenRadius: 32,
      background: 'linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 50%, #0d0d0d 100%)',
      boxShadow: `
        0 50px 100px -20px rgba(0, 0, 0, 0.8),
        0 30px 60px -30px rgba(0, 0, 0, 0.6),
        inset 0 1px 1px rgba(255, 255, 255, 0.1),
        inset 0 -1px 1px rgba(0, 0, 0, 0.5)
      `
    },
    notch: {
      type: 'pill',
      width: 95,
      height: 28,
      top: 12,
      borderRadius: 14,
      background: '#000000',
      elements: [
        { type: 'camera', top: 9, right: 12, size: 10, background: 'radial-gradient(circle, #1a3a5c 30%, #0a1520 100%)' }
      ]
    },
    buttons: {
      power: { right: -2, top: 100, width: 3, height: 70 },
      volumeUp: { left: -2, top: 80, width: 3, height: 35 },
      volumeDown: { left: -2, top: 125, width: 3, height: 35 }
    },
    homeIndicator: {
      show: true,
      width: 120,
      height: 5,
      bottom: 8,
      borderRadius: 3,
      background: 'rgba(255, 255, 255, 0.3)'
    }
  },
  
  {
    id: 'modern-punchhole',
    name: 'Modern Punch Hole',
    category: 'modern',
    description: 'Small camera cutout',
    frame: {
      padding: 10,
      borderRadius: 36,
      screenRadius: 26,
      background: 'linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 50%, #0d0d0d 100%)',
      boxShadow: `
        0 50px 100px -20px rgba(0, 0, 0, 0.8),
        0 30px 60px -30px rgba(0, 0, 0, 0.6),
        inset 0 1px 1px rgba(255, 255, 255, 0.1),
        inset 0 -1px 1px rgba(0, 0, 0, 0.5)
      `
    },
    notch: {
      type: 'punchhole',
      size: 14,
      top: 14,
      position: 'center', // 'center', 'left', 'right'
      background: '#000000',
      border: '2px solid #1a1a1a'
    },
    buttons: {
      power: { right: -2, top: 90, width: 3, height: 60 },
      volumeUp: { left: -2, top: 70, width: 3, height: 35 },
      volumeDown: { left: -2, top: 115, width: 3, height: 35 }
    },
    homeIndicator: {
      show: true,
      width: 100,
      height: 4,
      bottom: 8,
      borderRadius: 2,
      background: 'rgba(255, 255, 255, 0.3)'
    }
  },
  
  // ============================================
  // MINIMAL STYLES
  // ============================================
  {
    id: 'minimal-flat',
    name: 'Flat Frame',
    category: 'minimal',
    description: 'Simple flat bezel',
    frame: {
      padding: 8,
      borderRadius: 24,
      screenRadius: 16,
      background: '#2d2d2d',
      boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.5)'
    },
    notch: null,
    buttons: null,
    homeIndicator: {
      show: true,
      width: 100,
      height: 4,
      bottom: 6,
      borderRadius: 2,
      background: 'rgba(255, 255, 255, 0.25)'
    }
  },
  
  {
    id: 'minimal-outline',
    name: 'Outline Only',
    category: 'minimal',
    description: 'Thin border, no fill',
    frame: {
      padding: 4,
      borderRadius: 24,
      screenRadius: 20,
      background: 'transparent',
      border: '2px solid #333',
      boxShadow: 'none'
    },
    notch: null,
    buttons: null,
    homeIndicator: null
  },
  
  {
    id: 'minimal-none',
    name: 'No Frame',
    category: 'minimal',
    description: 'Screen only with rounded corners',
    frame: {
      padding: 0,
      borderRadius: 24,
      screenRadius: 24,
      background: 'transparent',
      boxShadow: '0 25px 80px -20px rgba(0, 0, 0, 0.6)'
    },
    notch: null,
    buttons: null,
    homeIndicator: null
  },
  
  {
    id: 'minimal-shadow',
    name: 'Floating Screen',
    category: 'minimal',
    description: 'Screen with soft shadow',
    frame: {
      padding: 0,
      borderRadius: 32,
      screenRadius: 32,
      background: 'transparent',
      boxShadow: `
        0 30px 80px -10px rgba(0, 0, 0, 0.4),
        0 15px 30px -5px rgba(0, 0, 0, 0.3)
      `
    },
    notch: null,
    buttons: null,
    homeIndicator: null
  }
];

// Helper to get style by ID
window.getDeviceStyle = function(styleId) {
  return window.deviceStyles.find(s => s.id === styleId) || window.deviceStyles[0];
};

// Get styles by category
window.getDeviceStylesByCategory = function() {
  const categories = {};
  window.deviceStyles.forEach(style => {
    if (!categories[style.category]) {
      categories[style.category] = [];
    }
    categories[style.category].push(style);
  });
  return categories;
};
