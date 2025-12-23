/**
 * Value Build Homes Chatbot Widget v2
 * Self-contained Shadow DOM Web Component - Full Feature Parity
 */
(function() {
  'use strict';

  // Prevent double initialization
  if (window.__VBH_WIDGET_INITIALIZED__) {
    console.log('[VBH Widget] Already initialized, skipping');
    return;
  }
  window.__VBH_WIDGET_INITIALIZED__ = true;

  console.log('[VBH Widget v2.3] Shadow DOM Web Component loading...');

  // Configuration
  var SUPABASE_URL = 'https://bhsnjbisxeuguhggjyzv.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoc25qYmlzeGV1Z3VoZ2dqeXp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjA2MzYsImV4cCI6MjA3ODY5NjYzNn0.6AvpuIGDo-J08pDV0xrwbrJLNnUbzy6SNZNvfy_FiJw';
  var ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/5365219/ualt8zx/';
  var STORAGE_KEY = 'vbh-chat-session';
  var EXPIRATION_DAYS = 7;
  var LOGO_URL = 'https://bhsnjbisxeuguhggjyzv.supabase.co/storage/v1/object/public/assets/logo.png';

  // Territory Data
  var TERRITORIES = {
    greenville: {
      name: 'Greenville',
      counties: ['Abbeville County, SC', 'Anderson County, SC', 'Buncombe County, NC', 'Greenwood County, SC', 'Greenville County, SC', 'Haywood County, NC', 'Henderson County, NC', 'Jackson County, NC', 'Laurens County, SC', 'Madison County, NC', 'Oconee County, SC', 'Pickens County, SC', 'Polk County, NC', 'Rutherford County, NC', 'Spartanburg County, SC', 'Transylvania County, NC', 'Yancey County, NC'],
      appointmentType: 'in-person',
      eventTypeId: '3523440',
      calLink: 'team/value-build-homes/greenville',
      calNamespace: 'greenville'
    },
    columbia: {
      name: 'Columbia',
      counties: ['Barnwell County, SC', 'Bamberg County, SC', 'Calhoun County, SC', 'Edgefield County, SC', 'Fairfield County, SC', 'Kershaw County, SC', 'Lee County, SC', 'Lexington County, SC', 'McCormick County, SC', 'Newberry County, SC', 'Richland County, SC', 'Saluda County, SC', 'Sumter County, SC', 'Aiken County, SC', 'Clarendon County, SC', 'Orangeburg County, SC'],
      appointmentType: 'virtual',
      eventTypeId: '3523433',
      calLink: 'team/value-build-homes/columbia',
      calNamespace: 'columbia'
    },
    greensboro: {
      name: 'Greensboro',
      counties: ['Davidson County, NC', 'Davie County, NC', 'Forsyth County, NC', 'Guilford County, NC', 'Randolph County, NC', 'Yadkin County, NC'],
      appointmentType: 'virtual',
      eventTypeId: '3523455',
      calLink: 'team/value-build-homes/greensboro',
      calNamespace: 'greensboro'
    },
    oxford: {
      name: 'Oxford',
      counties: ['Alamance County, NC', 'Caswell County, NC', 'Durham County, NC', 'Granville County, NC', 'Orange County, NC', 'Person County, NC', 'Vance County, NC'],
      appointmentType: 'in-person',
      eventTypeId: '3552473',
      calLink: 'team/value-build-homes/oxford',
      calNamespace: 'oxford'
    },
    monroe: {
      name: 'Monroe',
      counties: ['Cherokee County, SC', 'Chester County, SC', 'Chesterfield County, SC', 'Cleveland County, NC', 'Gaston County, NC', 'Lancaster County, SC', 'Union County, NC', 'Union County, SC', 'York County, SC'],
      appointmentType: 'virtual',
      eventTypeId: '3825483',
      calLink: 'team/value-build-homes/monroe',
      calNamespace: 'monroe'
    },
    smithfield: {
      name: 'Smithfield',
      counties: ['Carteret County, NC', 'Craven County, NC', 'Edgecombe County, NC', 'Franklin County, NC', 'Greene County, NC', 'Halifax County, NC', 'Johnston County, NC', 'Jones County, NC', 'Lenoir County, NC', 'Nash County, NC', 'Pitt County, NC', 'Sampson County, NC', 'Warren County, NC', 'Wayne County, NC', 'Wilson County, NC', 'Duplin County, NC'],
      appointmentType: 'in-person',
      eventTypeId: '3523407',
      calLink: 'team/value-build-homes/smithfield',
      calNamespace: 'smithfield'
    },
    sanford: {
      name: 'Sanford',
      counties: ['Anson County, NC', 'Chatham County, NC', 'Cumberland County, NC', 'Harnett County, NC', 'Hoke County, NC', 'Lee County, NC', 'Montgomery County, NC', 'Moore County, NC', 'Richmond County, NC', 'Robeson County, NC', 'Scotland County, NC', 'Bladen County, NC', 'Wake County, NC'],
      appointmentType: 'in-person',
      eventTypeId: '3523167',
      calLink: 'team/value-build-homes/sanford',
      calNamespace: 'sanford'
    },
    statesville: {
      name: 'Statesville',
      counties: ['Alexander County, NC', 'Burke County, NC', 'Cabarrus County, NC', 'Caldwell County, NC', 'Catawba County, NC', 'Iredell County, NC', 'Lincoln County, NC', 'McDowell County, NC', 'Rowan County, NC', 'Stanly County, NC', 'Wilkes County, NC', 'Mecklenburg County, NC'],
      appointmentType: 'in-person',
      eventTypeId: '3523378',
      calLink: 'team/value-build-homes/statesville',
      calNamespace: 'statesville'
    },
    wilmington: {
      name: 'Wilmington',
      counties: ['Brunswick County, NC', 'Columbus County, NC', 'New Hanover County, NC', 'Pender County, NC', 'Onslow County, NC', 'Horry County, SC', 'Dillon County, SC'],
      appointmentType: 'virtual',
      eventTypeId: '3523418',
      calLink: 'team/value-build-homes/wilmington',
      calNamespace: 'wilmington'
    }
  };

  var TERRITORY_ADDRESSES = {
    oxford: '3015 S Jefferson Davis Hwy, Sanford, NC 27332',
    greenville: '783 East Butler Rd, Suite D, Mauldin, SC 29662',
    smithfield: '721 Seafood House Rd, Selma, NC 27576',
    statesville: '201 Absher Park Rd, Statesville, NC 28625',
    sanford: '3015 S Jefferson Davis Hwy, Sanford, NC 27332'
  };

  // Territory detection function
  function detectTerritory(location) {
    var normalizedLocation = location.toLowerCase().trim();
    
    for (var key in TERRITORIES) {
      var territory = TERRITORIES[key];
      if (normalizedLocation.includes(territory.name.toLowerCase())) {
        return { key: key, territory: territory };
      }
    }
    
    for (var key in TERRITORIES) {
      var territory = TERRITORIES[key];
      for (var i = 0; i < territory.counties.length; i++) {
        var county = territory.counties[i];
        var normalizedCounty = county.toLowerCase();
        var countyName = normalizedCounty.replace(', nc', '').replace(', sc', '');
        
        if (normalizedLocation.includes(countyName) || normalizedLocation.includes(normalizedCounty)) {
          return { key: key, territory: territory };
        }
      }
    }
    
    return null;
  }

  // Widget styles (injected into Shadow DOM)
  var WIDGET_STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    :host {
      all: initial;
      display: block;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      font-size: 16px;
      line-height: 1.5;
      color: #1f2937;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .vbh-widget-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      font-family: inherit;
    }

    .vbh-chat-button {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #E2362B 0%, #c42e25 100%);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(226, 54, 43, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s, box-shadow 0.3s;
      padding: 8px;
      overflow: hidden;
    }

    .vbh-chat-button:hover {
      transform: scale(1.1);
      box-shadow: 0 8px 32px rgba(226, 54, 43, 0.5);
    }

    .vbh-chat-button img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .vbh-chat-button svg {
      width: 32px;
      height: 32px;
      fill: white;
    }

    .vbh-chat-window {
      position: fixed;
      bottom: 112px;
      right: 24px;
      width: 400px;
      height: 690px;
      max-height: calc(100vh - 140px);
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 999998;
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .vbh-chat-window.open {
      display: flex;
    }

    .vbh-chat-window.calendar-mode {
      width: 500px;
      height: 828px;
    }

    @media (max-width: 768px) {
      .vbh-chat-window {
        width: 100%;
        height: 100%;
        max-height: 100%;
        bottom: 0;
        right: 0;
        top: 0;
        left: 0;
        border-radius: 0;
      }
      .vbh-chat-window.calendar-mode {
        width: 100%;
        height: 100%;
      }
      .vbh-widget-container {
        bottom: 16px;
        right: 16px;
      }
      .vbh-widget-container.chat-open {
        top: 16px;
        right: 16px;
        bottom: auto;
      }
    }

    .vbh-header {
      background: linear-gradient(135deg, #E2362B 0%, rgba(226, 54, 43, 0.9) 100%);
      color: white;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-radius: 16px 16px 0 0;
    }

    @media (max-width: 768px) {
      .vbh-header {
        border-radius: 0;
      }
    }

    .vbh-header-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: white;
      padding: 2px;
      position: relative;
      flex-shrink: 0;
    }

    .vbh-header-avatar img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .vbh-header-avatar::after {
      content: '';
      position: absolute;
      bottom: 0;
      right: 0;
      width: 12px;
      height: 12px;
      background: #22c55e;
      border-radius: 50%;
      border: 2px solid #E2362B;
    }

    .vbh-header-info h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }

    .vbh-header-info p {
      font-size: 12px;
      opacity: 0.9;
      margin: 0;
      font-weight: 500;
    }

    .vbh-close-btn {
      margin-left: auto;
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 8px;
      opacity: 0.8;
      transition: opacity 0.2s, background 0.2s;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .vbh-close-btn:hover {
      opacity: 1;
      background: rgba(255,255,255,0.2);
    }

    .vbh-messages {
      flex: 1;
      overflow-y: auto;
      padding: 8px 12px 12px 8px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .vbh-message-row {
      display: flex;
      gap: 8px;
      max-width: 100%;
    }

    .vbh-message-row.user {
      justify-content: flex-end;
    }

    .vbh-message-row.assistant {
      justify-content: flex-start;
    }

    .vbh-message-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: white;
      padding: 2px;
      flex-shrink: 0;
      margin-top: 4px;
    }

    .vbh-message-avatar img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .vbh-message-avatar.pulsing img {
      animation: vbh-pulse 1.5s ease-in-out infinite;
    }

    @keyframes vbh-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(0.95); }
    }

    .vbh-message-content {
      display: flex;
      flex-direction: column;
      max-width: 85%;
      min-width: 0;
    }

    .vbh-message {
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
      overflow-wrap: anywhere;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      transition: box-shadow 0.2s;
    }

    .vbh-message:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .vbh-message.user {
      background: #E2362B;
      color: white;
      border-bottom-right-radius: 4px;
    }

    .vbh-message.assistant {
      background: #f3f4f6;
      color: #1f2937;
      border-bottom-left-radius: 4px;
    }

    /* Citations */
    .vbh-citations {
      margin-top: 8px;
      max-width: 312px;
    }

    .vbh-citations-label {
      font-size: 12px;
      font-weight: 500;
      color: #6b7280;
      margin-bottom: 8px;
    }

    .vbh-citation-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 10px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    .vbh-citation-title {
      font-size: 14px;
      font-weight: 500;
      color: #E2362B;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .vbh-citation-title:hover {
      text-decoration: underline;
    }

    .vbh-citation-description {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 2.6em;
    }

    .vbh-citation-url {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .vbh-citation-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #e5e7eb;
    }

    .vbh-citation-nav span {
      font-size: 11px;
      color: #6b7280;
      font-weight: 500;
    }

    .vbh-citation-nav-btns {
      display: flex;
      gap: 4px;
    }

    .vbh-citation-nav-btn {
      width: 20px;
      height: 20px;
      border: none;
      background: none;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .vbh-citation-nav-btn:hover:not(:disabled) {
      background: #f3f4f6;
    }

    .vbh-citation-nav-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .vbh-citation-nav-btn svg {
      width: 10px;
      height: 10px;
      fill: #6b7280;
    }

    .vbh-typing {
      display: flex;
      gap: 8px;
      padding-top: 8px;
    }

    .vbh-typing .vbh-message-avatar {
      animation: vbh-pulse 1.5s ease-in-out infinite;
    }

    .vbh-typing-bubble {
      background: #f3f4f6;
      padding: 12px 16px;
      border-radius: 12px;
      display: flex;
      gap: 4px;
    }

    .vbh-typing-bubble span {
      width: 8px;
      height: 8px;
      background: #9ca3af;
      border-radius: 50%;
      animation: vbh-bounce 1.4s infinite ease-in-out;
    }

    .vbh-typing-bubble span:nth-child(1) { animation-delay: -0.32s; }
    .vbh-typing-bubble span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes vbh-bounce {
      0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }

    /* Schedule Button */
    .vbh-schedule-area {
      padding: 12px 16px 8px;
      border-top: 1px solid rgba(0,0,0,0.05);
      background: linear-gradient(to bottom, white, #fafafa);
    }

    .vbh-schedule-btn {
      width: 100%;
      height: 48px;
      background: #E2362B;
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(226, 54, 43, 0.3);
      transition: all 0.3s;
    }

    .vbh-schedule-btn:hover {
      background: #c42e25;
      box-shadow: 0 6px 20px rgba(226, 54, 43, 0.4);
    }

    .vbh-schedule-btn svg {
      width: 16px;
      height: 16px;
    }

    .vbh-input-area {
      padding: 8px 20px 20px;
      border-top: 1px solid rgba(0,0,0,0.08);
      background: linear-gradient(to bottom, white, #fafafa);
    }

    @media (max-width: 768px) {
      .vbh-input-area {
        border-radius: 0;
      }
    }

    .vbh-input-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px;
      border-radius: 16px;
      background: linear-gradient(to bottom right, white, #fafafa);
      border: 1px solid rgba(0,0,0,0.1);
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      transition: box-shadow 0.3s;
    }

    .vbh-input-wrapper:focus-within {
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
    }

    .vbh-input {
      flex: 1;
      padding: 14px 16px;
      border: none;
      font-size: 16px;
      outline: none;
      background: transparent;
      font-family: inherit;
      resize: none;
      min-height: 48px;
      max-height: 120px;
    }

    .vbh-input::placeholder {
      background: linear-gradient(90deg, #9ca3af 0%, #d1d5db 50%, #9ca3af 100%);
      background-size: 200% 100%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: vbh-shimmer 2s ease-in-out infinite;
    }

    @keyframes vbh-shimmer {
      0% { background-position: 100% 0; }
      100% { background-position: -100% 0; }
    }

    .vbh-send-btn {
      width: 43px;
      height: 43px;
      border-radius: 12px;
      background: #E2362B;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(226, 54, 43, 0.3);
    }

    .vbh-send-btn:hover:not(:disabled) {
      background: #c42e25;
      transform: scale(1.05);
    }

    .vbh-send-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .vbh-send-btn svg {
      width: 20px;
      height: 20px;
      fill: white;
    }

    /* Location Input Overlay */
    .vbh-location-overlay {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #E2362B;
      padding: 32px;
      position: relative;
    }

    .vbh-location-back {
      position: absolute;
      top: 12px;
      left: 12px;
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 8px 12px;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 4px;
      border-radius: 8px;
      transition: background 0.2s;
    }

    .vbh-location-back:hover {
      background: rgba(255,255,255,0.1);
    }

    .vbh-location-back svg {
      width: 20px;
      height: 20px;
    }

    .vbh-location-content {
      width: 100%;
      max-width: 320px;
      text-align: center;
    }

    .vbh-location-logo {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: white;
      padding: 4px;
      margin: 0 auto 24px;
    }

    .vbh-location-logo img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .vbh-location-title {
      font-size: 20px;
      font-weight: 600;
      color: white;
      margin-bottom: 24px;
    }

    .vbh-location-input {
      width: 100%;
      padding: 14px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      text-align: center;
      margin-bottom: 12px;
      outline: none;
    }

    .vbh-location-input::placeholder {
      color: #9ca3af;
    }

    .vbh-location-submit {
      width: 100%;
      padding: 14px;
      background: white;
      color: #E2362B;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
      display: none;
    }

    .vbh-location-submit.visible {
      display: block;
    }

    .vbh-location-submit:hover {
      background: #f3f4f6;
    }

    .vbh-location-submit:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    /* Calendar View */
    .vbh-calendar-header {
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    .vbh-calendar-header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .vbh-calendar-type {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 600;
    }

    .vbh-calendar-type svg {
      width: 16px;
      height: 16px;
    }

    .vbh-calendar-type.in-person svg {
      fill: #E2362B;
    }

    .vbh-calendar-type.virtual svg {
      fill: #3b82f6;
    }

    .vbh-calendar-actions {
      display: flex;
      gap: 4px;
    }

    .vbh-calendar-action-btn {
      background: none;
      border: none;
      padding: 4px 8px;
      font-size: 11px;
      color: #6b7280;
      cursor: pointer;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .vbh-calendar-action-btn:hover {
      background: #e5e7eb;
    }

    .vbh-calendar-address {
      font-size: 12px;
      color: #6b7280;
    }

    .vbh-calendar-container {
      flex: 1;
      overflow: auto;
      width: 100%;
    }

    /* Callback Form */
    .vbh-callback-header {
      background: #E2362B;
      color: white;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .vbh-callback-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .vbh-callback-header-left svg {
      width: 20px;
      height: 20px;
    }

    .vbh-callback-header h2 {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }

    .vbh-callback-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      opacity: 0.8;
      transition: opacity 0.2s, background 0.2s;
      border-radius: 4px;
    }

    .vbh-callback-close:hover {
      opacity: 1;
      background: rgba(255,255,255,0.2);
    }

    .vbh-callback-content {
      flex: 1;
      overflow: auto;
      padding: 24px;
      position: relative;
    }

    .vbh-callback-back {
      position: absolute;
      top: 12px;
      left: 12px;
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      padding: 8px 12px;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 4px;
      border-radius: 8px;
      transition: background 0.2s;
    }

    .vbh-callback-back:hover {
      background: #f3f4f6;
    }

    .vbh-callback-back svg {
      width: 20px;
      height: 20px;
    }

    .vbh-callback-form {
      max-width: 320px;
      margin: 32px auto 0;
    }

    .vbh-callback-intro {
      text-align: center;
      font-size: 16px;
      color: #374151;
      font-weight: 500;
      line-height: 1.5;
      margin-bottom: 24px;
    }

    .vbh-form-group {
      margin-bottom: 16px;
    }

    .vbh-form-label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 6px;
    }

    .vbh-form-input {
      width: 100%;
      padding: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .vbh-form-input:focus {
      border-color: #E2362B;
      box-shadow: 0 0 0 3px rgba(226, 54, 43, 0.1);
    }

    .vbh-form-input.error {
      border-color: #ef4444;
    }

    .vbh-form-error {
      font-size: 12px;
      color: #ef4444;
      margin-top: 4px;
    }

    .vbh-form-submit {
      width: 100%;
      padding: 14px;
      background: #E2362B;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
      margin-top: 8px;
    }

    .vbh-form-submit:hover:not(:disabled) {
      background: #c42e25;
    }

    .vbh-form-submit:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    /* Success State */
    .vbh-callback-success {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      text-align: center;
    }

    .vbh-success-icon {
      width: 64px;
      height: 64px;
      color: #22c55e;
      margin-bottom: 16px;
    }

    .vbh-success-title {
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 8px;
    }

    .vbh-success-text {
      font-size: 14px;
      color: #6b7280;
    }

    /* Loader */
    .vbh-loader {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: vbh-spin 0.8s linear infinite;
    }

    @keyframes vbh-spin {
      to { transform: rotate(360deg); }
    }

    .hidden {
      display: none !important;
    }
  `;

  // Create the Web Component
  class VBHChatbot extends HTMLElement {
    constructor() {
      super();
      this.isOpen = false;
      this.messages = [];
      this.isLoading = false;
      this.sessionId = null;
      this.showLocationInput = false;
      this.showCalendar = false;
      this.selectedTerritory = null;
      this.showCallbackForm = false;
      this.callbackSuccess = false;
      this.expandedCitations = {};
      this.typingTimeout = null;
      this.isMobile = window.innerWidth < 768;
    }

    connectedCallback() {
      this.shadow = this.attachShadow({ mode: 'open' });

      var style = document.createElement('style');
      style.textContent = WIDGET_STYLES;
      this.shadow.appendChild(style);

      this.render();
      this.loadSession();
      this.bindEvents();

      // Listen for resize
      window.addEventListener('resize', () => {
        this.isMobile = window.innerWidth < 768;
        this.updateMobileClass();
      });

      console.log('[VBH Widget v2.3] Initialized successfully');
    }

    render() {
      var container = document.createElement('div');
      container.className = 'vbh-widget-container';
      container.id = 'widget-container';
      container.innerHTML = this.getWidgetHTML();
      this.shadow.appendChild(container);
    }

    getWidgetHTML() {
      return `
        <div class="vbh-chat-window" id="chat-window">
          ${this.getHeaderHTML()}
          ${this.getMessagesHTML()}
          ${this.getScheduleButtonHTML()}
          ${this.getInputAreaHTML()}
          ${this.getLocationOverlayHTML()}
          ${this.getCalendarViewHTML()}
          ${this.getCallbackFormHTML()}
        </div>
        <button class="vbh-chat-button" id="toggle-btn">
          <img src="${LOGO_URL}" alt="Value Build Homes" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" />
          <svg style="display:none;" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          </svg>
        </button>
      `;
    }

    getHeaderHTML() {
      return `
        <div class="vbh-header" id="main-header">
          <div class="vbh-header-avatar">
            <img src="${LOGO_URL}" alt="Sam" onerror="this.parentElement.innerHTML='S';" />
          </div>
          <div class="vbh-header-info">
            <h3>Sam</h3>
            <p>Digital Assistant</p>
          </div>
          <button class="vbh-close-btn" id="close-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      `;
    }

    getMessagesHTML() {
      return `
        <div class="vbh-messages" id="messages">
          <div class="vbh-message-row assistant">
            <div class="vbh-message-avatar">
              <img src="${LOGO_URL}" alt="Sam" onerror="this.parentElement.innerHTML='S';" />
            </div>
            <div class="vbh-message-content">
              <div class="vbh-message assistant">Hey there👋🏻! I'm Sam, what can I answer for you?</div>
            </div>
          </div>
        </div>
      `;
    }

    getScheduleButtonHTML() {
      return `
        <div class="vbh-schedule-area" id="schedule-area">
          <button class="vbh-schedule-btn" id="schedule-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Schedule Appointment
          </button>
        </div>
      `;
    }

    getInputAreaHTML() {
      return `
        <div class="vbh-input-area" id="input-area">
          <div class="vbh-input-wrapper">
            <textarea class="vbh-input" id="input" placeholder="Ask me anything.." rows="1"></textarea>
            <button class="vbh-send-btn" id="send-btn">
              <svg viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      `;
    }

    getLocationOverlayHTML() {
      return `
        <div class="vbh-location-overlay hidden" id="location-overlay">
          <button class="vbh-location-back" id="location-back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            Back
          </button>
          <div class="vbh-location-content">
            <div class="vbh-location-logo">
              <img src="${LOGO_URL}" alt="Value Build Homes" onerror="this.parentElement.innerHTML='VBH';" />
            </div>
            <h2 class="vbh-location-title">Schedule an Appointment</h2>
            <input type="text" class="vbh-location-input" id="location-input" placeholder="What county will you build in?" />
            <button class="vbh-location-submit" id="location-submit">Continue</button>
          </div>
        </div>
      `;
    }

    getCalendarViewHTML() {
      return `
        <div class="vbh-calendar-header hidden" id="calendar-header">
          <div class="vbh-calendar-header-top">
            <div class="vbh-calendar-type" id="calendar-type">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span id="calendar-type-text">In-Person Appointment</span>
            </div>
            <div class="vbh-calendar-actions">
              <button class="vbh-calendar-action-btn" id="change-location-btn">Change Location</button>
              <button class="vbh-calendar-action-btn" id="close-calendar-btn">×</button>
            </div>
          </div>
          <p class="vbh-calendar-address" id="calendar-address"></p>
        </div>
        <div class="vbh-calendar-container hidden" id="calendar-container"></div>
      `;
    }

    getCallbackFormHTML() {
      return `
        <div class="vbh-callback-header hidden" id="callback-header">
          <div class="vbh-callback-header-left">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <h2>Request Callback</h2>
          </div>
          <button class="vbh-callback-close" id="callback-close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="vbh-callback-content hidden" id="callback-content">
          <button class="vbh-callback-back" id="callback-back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            Back
          </button>
          <div class="vbh-callback-form">
            <p class="vbh-callback-intro">Have a specific question?<br/>Request a call back from our team!</p>
            <form id="callback-form">
              <div class="vbh-form-group">
                <label class="vbh-form-label" for="cb-firstName">First Name</label>
                <input type="text" class="vbh-form-input" id="cb-firstName" placeholder="John" />
                <p class="vbh-form-error hidden" id="err-firstName"></p>
              </div>
              <div class="vbh-form-group">
                <label class="vbh-form-label" for="cb-lastName">Last Name</label>
                <input type="text" class="vbh-form-input" id="cb-lastName" placeholder="Doe" />
                <p class="vbh-form-error hidden" id="err-lastName"></p>
              </div>
              <div class="vbh-form-group">
                <label class="vbh-form-label" for="cb-phone">Phone</label>
                <input type="tel" class="vbh-form-input" id="cb-phone" placeholder="(555) 123-4567" />
                <p class="vbh-form-error hidden" id="err-phone"></p>
              </div>
              <div class="vbh-form-group">
                <label class="vbh-form-label" for="cb-email">Email</label>
                <input type="email" class="vbh-form-input" id="cb-email" placeholder="john.doe@example.com" />
                <p class="vbh-form-error hidden" id="err-email"></p>
              </div>
              <button type="submit" class="vbh-form-submit" id="callback-submit">Submit Request</button>
            </form>
          </div>
        </div>
        <div class="vbh-callback-success hidden" id="callback-success">
          <svg class="vbh-success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <h3 class="vbh-success-title">Thank You!</h3>
          <p class="vbh-success-text">Your callback request has been submitted. We'll be in touch soon!</p>
        </div>
      `;
    }

    bindEvents() {
      var self = this;
      
      // Toggle button
      this.shadow.getElementById('toggle-btn').addEventListener('click', function() {
        self.toggle();
      });

      // Close button
      this.shadow.getElementById('close-btn').addEventListener('click', function() {
        self.close();
      });

      // Send button
      this.shadow.getElementById('send-btn').addEventListener('click', function() {
        self.sendMessage();
      });

      // Input enter key
      this.shadow.getElementById('input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          self.sendMessage();
        }
      });

      // Auto-resize textarea
      this.shadow.getElementById('input').addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
      });

      // Schedule button
      this.shadow.getElementById('schedule-btn').addEventListener('click', function() {
        self.showLocationInputView();
      });

      // Location input
      this.shadow.getElementById('location-back').addEventListener('click', function() {
        self.hideLocationInputView();
      });

      this.shadow.getElementById('location-input').addEventListener('input', function() {
        var submitBtn = self.shadow.getElementById('location-submit');
        if (this.value.length >= 3) {
          submitBtn.classList.add('visible');
        } else {
          submitBtn.classList.remove('visible');
        }
      });

      this.shadow.getElementById('location-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && this.value.length >= 3) {
          self.handleLocationSubmit();
        }
      });

      this.shadow.getElementById('location-submit').addEventListener('click', function() {
        self.handleLocationSubmit();
      });

      // Calendar controls
      this.shadow.getElementById('change-location-btn').addEventListener('click', function() {
        self.hideCalendarView();
        self.showLocationInputView();
      });

      this.shadow.getElementById('close-calendar-btn').addEventListener('click', function() {
        self.hideCalendarView();
      });

      // Callback form
      this.shadow.getElementById('callback-close').addEventListener('click', function() {
        self.hideCallbackForm();
      });

      this.shadow.getElementById('callback-back').addEventListener('click', function() {
        self.hideCallbackForm();
      });

      this.shadow.getElementById('callback-form').addEventListener('submit', function(e) {
        e.preventDefault();
        self.submitCallbackForm();
      });
    }

    toggle() {
      this.isOpen = !this.isOpen;
      var chatWindow = this.shadow.getElementById('chat-window');
      var container = this.shadow.getElementById('widget-container');
      
      if (this.isOpen) {
        chatWindow.classList.add('open');
        this.shadow.getElementById('input').focus();
      } else {
        chatWindow.classList.remove('open');
      }
      
      this.updateMobileClass();
      this.postResizeMessage();
    }

    close() {
      this.isOpen = false;
      this.shadow.getElementById('chat-window').classList.remove('open');
      this.shadow.getElementById('widget-container').classList.remove('chat-open');
      this.hideLocationInputView();
      this.hideCalendarView();
      this.hideCallbackForm();
      this.postResizeMessage();
    }

    updateMobileClass() {
      var container = this.shadow.getElementById('widget-container');
      if (this.isMobile && this.isOpen) {
        container.classList.add('chat-open');
      } else {
        container.classList.remove('chat-open');
      }
    }

    postResizeMessage() {
      try {
        var rect = this.shadow.getElementById('chat-window').getBoundingClientRect();
        window.parent.postMessage({
          type: 'chatbot-resize',
          width: this.isOpen ? Math.ceil(rect.width) : 88,
          height: this.isOpen ? Math.ceil(rect.height) + 140 : 146,
          isOpen: this.isOpen,
          isMobile: this.isMobile
        }, '*');
      } catch (e) {}
    }

    loadSession() {
      try {
        var saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          var session = JSON.parse(saved);
          
          // Check expiration
          if (session.timestamp) {
            var sessionDate = new Date(session.timestamp);
            var now = new Date();
            var diffDays = (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24);
            if (diffDays > EXPIRATION_DAYS) {
              this.clearSession();
              return;
            }
          }
          
          this.messages = session.messages || [];
          this.sessionId = session.sessionId || null;
          this.renderMessages();
        }
      } catch (e) {
        console.log('[VBH Widget] Could not load saved session');
      }
    }

    saveSession() {
      try {
        // Filter out welcome message
        var messagesToSave = this.messages.filter(function(m) { return m.id !== '1'; });
        var session = {
          messages: messagesToSave,
          sessionId: this.sessionId,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      } catch (e) {
        console.log('[VBH Widget] Could not save session');
      }
    }

    clearSession() {
      try {
        localStorage.removeItem(STORAGE_KEY);
        this.messages = [];
        this.sessionId = null;
      } catch (e) {}
    }

    renderMessages() {
      var self = this;
      var container = this.shadow.getElementById('messages');
      var html = `
        <div class="vbh-message-row assistant">
          <div class="vbh-message-avatar">
            <img src="${LOGO_URL}" alt="Sam" onerror="this.parentElement.innerHTML='S';" />
          </div>
          <div class="vbh-message-content">
            <div class="vbh-message assistant">Hey there👋🏻! I'm Sam, what can I answer for you?</div>
          </div>
        </div>
      `;
      
      for (var i = 0; i < this.messages.length; i++) {
        var msg = this.messages[i];
        html += this.getMessageHTML(msg, i);
      }

      container.innerHTML = html;
      this.scrollToBottom();
      this.bindCitationEvents();
    }

    getMessageHTML(msg, index) {
      var self = this;
      var isUser = msg.role === 'user';
      
      var html = '<div class="vbh-message-row ' + msg.role + '">';
      
      if (!isUser) {
        html += `
          <div class="vbh-message-avatar">
            <img src="${LOGO_URL}" alt="Sam" onerror="this.parentElement.innerHTML='S';" />
          </div>
        `;
      }
      
      html += '<div class="vbh-message-content">';
      html += '<div class="vbh-message ' + msg.role + '">' + this.escapeHtml(msg.content) + '</div>';
      
      // Add citations if present
      if (!isUser && msg.citations && msg.citations.length > 0) {
        var currentIndex = this.expandedCitations[msg.id] || 0;
        var citation = msg.citations[currentIndex];
        var totalCitations = msg.citations.length;
        
        html += '<div class="vbh-citations">';
        html += '<p class="vbh-citations-label">Sources</p>';
        html += '<div class="vbh-citation-card">';
        html += '<a href="' + (citation.url || '#') + '" target="_blank" class="vbh-citation-title">';
        html += this.escapeHtml(citation.title || 'Source');
        html += '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';
        html += '</a>';
        html += '<p class="vbh-citation-description">' + this.escapeHtml(citation.description || citation.chunk_text || '') + '</p>';
        html += '<p class="vbh-citation-url">' + this.escapeHtml(citation.url || '') + '</p>';
        
        if (totalCitations > 1) {
          html += '<div class="vbh-citation-nav">';
          html += '<span>' + (currentIndex + 1) + ' of ' + totalCitations + '</span>';
          html += '<div class="vbh-citation-nav-btns">';
          html += '<button class="vbh-citation-nav-btn" data-msg-id="' + msg.id + '" data-direction="prev" ' + (currentIndex === 0 ? 'disabled' : '') + '>';
          html += '<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>';
          html += '</button>';
          html += '<button class="vbh-citation-nav-btn" data-msg-id="' + msg.id + '" data-direction="next" ' + (currentIndex === totalCitations - 1 ? 'disabled' : '') + '>';
          html += '<svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>';
          html += '</button>';
          html += '</div>';
          html += '</div>';
        }
        
        html += '</div>';
        html += '</div>';
      }
      
      html += '</div>';
      html += '</div>';
      
      return html;
    }

    bindCitationEvents() {
      var self = this;
      var buttons = this.shadow.querySelectorAll('.vbh-citation-nav-btn');
      buttons.forEach(function(btn) {
        btn.addEventListener('click', function() {
          var msgId = this.getAttribute('data-msg-id');
          var direction = this.getAttribute('data-direction');
          var msg = self.messages.find(function(m) { return m.id === msgId; });
          if (!msg || !msg.citations) return;
          
          var currentIndex = self.expandedCitations[msgId] || 0;
          if (direction === 'prev' && currentIndex > 0) {
            self.expandedCitations[msgId] = currentIndex - 1;
          } else if (direction === 'next' && currentIndex < msg.citations.length - 1) {
            self.expandedCitations[msgId] = currentIndex + 1;
          }
          self.renderMessages();
        });
      });
    }

    escapeHtml(text) {
      if (!text) return '';
      var div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    scrollToBottom() {
      var container = this.shadow.getElementById('messages');
      container.scrollTop = container.scrollHeight;
    }

    async sendMessage() {
      var input = this.shadow.getElementById('input');
      var message = input.value.trim();

      if (!message || this.isLoading) return;

      // Add user message
      var userMsg = {
        id: Date.now().toString(),
        role: 'user',
        content: message
      };
      this.messages.push(userMsg);
      this.renderMessages();
      input.value = '';
      input.style.height = 'auto';

      // Check for territory + appointment keywords
      var territoryResult = detectTerritory(message);
      if (territoryResult && (message.toLowerCase().includes('appointment') || message.toLowerCase().includes('schedule') || message.toLowerCase().includes('meet'))) {
        var territory = territoryResult.territory;
        var assistantMsg = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Great! I\'ve found that ' + territory.name + ' territory serves your area. This territory offers ' + territory.appointmentType + ' appointments. I\'ll show you the calendar below where you can select a time that works for you.'
        };
        this.messages.push(assistantMsg);
        this.selectedTerritory = territoryResult.key;
        this.renderMessages();
        this.saveSession();
        this.showCalendarView();
        return;
      }

      // Show typing indicator after 1 second
      this.isLoading = true;
      var self = this;
      this.typingTimeout = setTimeout(function() {
        self.showTyping();
      }, 1000);

      try {
        // Build messages array for API
        var apiMessages = this.messages.map(function(m) {
          return { role: m.role, content: m.content };
        });

        var response = await fetch(SUPABASE_URL + '/functions/v1/chat-with-sam', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
          },
          body: JSON.stringify({
            messages: apiMessages,
            sessionId: this.sessionId
          })
        });

        var data = await response.json();
        
        this.hideTyping();
        this.isLoading = false;

        // Store session ID
        if (data.sessionId && !this.sessionId) {
          this.sessionId = data.sessionId;
        }

        // Check for callback trigger
        var rawMsg = data.message || '';
        var normalizedMsg = rawMsg.replace(/\u2019/g, "'").trim();
        var isUnknown = normalizedMsg === "I don't know the answer to that just yet. Please reach out to support for further help." || 
                        rawMsg.toLowerCase().includes('reach out to support for further help');

        if (isUnknown) {
          this.showCallbackFormView();
        } else if (data.message) {
          var assistantMsg = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.message,
            citations: data.citations || []
          };
          this.messages.push(assistantMsg);
          this.renderMessages();
        }

        this.saveSession();

      } catch (error) {
        console.error('[VBH Widget] Error:', error);
        this.hideTyping();
        this.isLoading = false;
        
        var errorMsg = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I couldn\'t connect. Please try again later.'
        };
        this.messages.push(errorMsg);
        this.renderMessages();
      }
    }

    showTyping() {
      var container = this.shadow.getElementById('messages');
      if (this.shadow.getElementById('typing-indicator')) return;
      
      var typing = document.createElement('div');
      typing.className = 'vbh-typing';
      typing.id = 'typing-indicator';
      typing.innerHTML = `
        <div class="vbh-message-avatar">
          <img src="${LOGO_URL}" alt="Sam" onerror="this.parentElement.innerHTML='S';" />
        </div>
        <div class="vbh-typing-bubble">
          <span></span><span></span><span></span>
        </div>
      `;
      container.appendChild(typing);
      this.scrollToBottom();
    }

    hideTyping() {
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
        this.typingTimeout = null;
      }
      var typing = this.shadow.getElementById('typing-indicator');
      if (typing) typing.remove();
    }

    // Location Input View
    showLocationInputView() {
      this.shadow.getElementById('main-header').classList.add('hidden');
      this.shadow.getElementById('messages').classList.add('hidden');
      this.shadow.getElementById('schedule-area').classList.add('hidden');
      this.shadow.getElementById('input-area').classList.add('hidden');
      this.shadow.getElementById('location-overlay').classList.remove('hidden');
      this.shadow.getElementById('location-input').focus();
    }

    hideLocationInputView() {
      this.shadow.getElementById('main-header').classList.remove('hidden');
      this.shadow.getElementById('messages').classList.remove('hidden');
      this.shadow.getElementById('schedule-area').classList.remove('hidden');
      this.shadow.getElementById('input-area').classList.remove('hidden');
      this.shadow.getElementById('location-overlay').classList.add('hidden');
      this.shadow.getElementById('location-input').value = '';
      this.shadow.getElementById('location-submit').classList.remove('visible');
    }

    async handleLocationSubmit() {
      var input = this.shadow.getElementById('location-input');
      var location = input.value.trim();
      if (!location) return;

      var submitBtn = this.shadow.getElementById('location-submit');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="vbh-loader"></span>';

      try {
        var response = await fetch(SUPABASE_URL + '/functions/v1/detect-territory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
          },
          body: JSON.stringify({ location: location })
        });

        var data = await response.json();

        if (data.success && data.territoryKey) {
          this.selectedTerritory = data.territoryKey;
          this.hideLocationInputView();
          this.showCalendarView();
        } else {
          // Territory not found
          var errorMsg = {
            id: Date.now().toString(),
            role: 'assistant',
            content: "I'm sorry, but we don't currently build in that area. Value Build Homes currently serves counties in North Carolina and South Carolina. We're expanding! Please check back or contact us for updates."
          };
          this.messages.push(errorMsg);
          this.hideLocationInputView();
          this.renderMessages();
          this.saveSession();
        }
      } catch (error) {
        console.error('[VBH Widget] Location error:', error);
        this.hideLocationInputView();
      }

      submitBtn.disabled = false;
      submitBtn.textContent = 'Continue';
    }

    // Calendar View
    showCalendarView() {
      var territory = TERRITORIES[this.selectedTerritory];
      if (!territory) return;

      this.shadow.getElementById('main-header').classList.add('hidden');
      this.shadow.getElementById('messages').classList.add('hidden');
      this.shadow.getElementById('schedule-area').classList.add('hidden');
      this.shadow.getElementById('input-area').classList.add('hidden');
      
      // Update calendar header
      var typeEl = this.shadow.getElementById('calendar-type');
      var typeTextEl = this.shadow.getElementById('calendar-type-text');
      var addressEl = this.shadow.getElementById('calendar-address');
      
      var isInPerson = territory.appointmentType === 'in-person';
      typeEl.className = 'vbh-calendar-type ' + (isInPerson ? 'in-person' : 'virtual');
      typeTextEl.textContent = isInPerson ? 'In-Person Appointment' : 'Virtual Appointment';
      
      if (isInPerson && TERRITORY_ADDRESSES[this.selectedTerritory]) {
        addressEl.textContent = 'Design Studio Location: ' + TERRITORY_ADDRESSES[this.selectedTerritory];
      } else {
        addressEl.textContent = 'A virtual meeting link will be provided after booking.';
      }

      // Update type icon
      var svgPath = isInPerson 
        ? '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>'
        : '<path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>';
      typeEl.querySelector('svg').innerHTML = svgPath;

      this.shadow.getElementById('calendar-header').classList.remove('hidden');
      this.shadow.getElementById('calendar-container').classList.remove('hidden');
      this.shadow.getElementById('chat-window').classList.add('calendar-mode');
      
      this.loadCalendar(territory);
    }

    hideCalendarView() {
      this.shadow.getElementById('main-header').classList.remove('hidden');
      this.shadow.getElementById('messages').classList.remove('hidden');
      this.shadow.getElementById('schedule-area').classList.remove('hidden');
      this.shadow.getElementById('input-area').classList.remove('hidden');
      this.shadow.getElementById('calendar-header').classList.add('hidden');
      this.shadow.getElementById('calendar-container').classList.add('hidden');
      this.shadow.getElementById('chat-window').classList.remove('calendar-mode');
      this.selectedTerritory = null;
    }

    loadCalendar(territory) {
      var container = this.shadow.getElementById('calendar-container');
      container.innerHTML = '';

      var w = window;

      // Ensure Cal stub exists
      if (!w.Cal) {
        var Cal = function() {
          Cal.q = Cal.q || [];
          Cal.q.push(arguments);
        };
        Cal.ns = {};
        w.Cal = Cal;
      }

      // Load Cal.com script
      var existingScript = document.querySelector('script[src="https://app.cal.com/embed/embed.js"]');
      if (!existingScript) {
        var script = document.createElement('script');
        script.src = 'https://app.cal.com/embed/embed.js';
        script.async = true;
        script.onload = () => this.initCalendar(territory, container);
        document.head.appendChild(script);
      } else {
        this.initCalendar(territory, container);
      }
    }

    initCalendar(territory, container) {
      var w = window;
      
      w.Cal('init', territory.calNamespace, { origin: 'https://app.cal.com' });
      w.Cal('ui', {
        hideEventTypeDetails: true,
        layout: 'month_view',
        styles: { branding: { brandColor: '#000000' } }
      });
      w.Cal('inline', {
        namespace: territory.calNamespace,
        elementOrSelector: container,
        calLink: territory.calLink,
        config: { theme: 'light' }
      });
    }

    // Callback Form
    showCallbackFormView() {
      this.shadow.getElementById('main-header').classList.add('hidden');
      this.shadow.getElementById('messages').classList.add('hidden');
      this.shadow.getElementById('schedule-area').classList.add('hidden');
      this.shadow.getElementById('input-area').classList.add('hidden');
      this.shadow.getElementById('callback-header').classList.remove('hidden');
      this.shadow.getElementById('callback-content').classList.remove('hidden');
    }

    hideCallbackForm() {
      this.shadow.getElementById('main-header').classList.remove('hidden');
      this.shadow.getElementById('messages').classList.remove('hidden');
      this.shadow.getElementById('schedule-area').classList.remove('hidden');
      this.shadow.getElementById('input-area').classList.remove('hidden');
      this.shadow.getElementById('callback-header').classList.add('hidden');
      this.shadow.getElementById('callback-content').classList.add('hidden');
      this.shadow.getElementById('callback-success').classList.add('hidden');
      this.callbackSuccess = false;
      
      // Clear form
      this.shadow.getElementById('cb-firstName').value = '';
      this.shadow.getElementById('cb-lastName').value = '';
      this.shadow.getElementById('cb-phone').value = '';
      this.shadow.getElementById('cb-email').value = '';
      this.clearFormErrors();
    }

    clearFormErrors() {
      var inputs = ['firstName', 'lastName', 'phone', 'email'];
      for (var i = 0; i < inputs.length; i++) {
        this.shadow.getElementById('cb-' + inputs[i]).classList.remove('error');
        this.shadow.getElementById('err-' + inputs[i]).classList.add('hidden');
      }
    }

    async submitCallbackForm() {
      this.clearFormErrors();
      
      var firstName = this.shadow.getElementById('cb-firstName').value.trim();
      var lastName = this.shadow.getElementById('cb-lastName').value.trim();
      var phone = this.shadow.getElementById('cb-phone').value.trim();
      var email = this.shadow.getElementById('cb-email').value.trim();
      
      var errors = {};
      
      if (!firstName) errors.firstName = 'First name is required';
      else if (firstName.length > 50) errors.firstName = 'First name must be less than 50 characters';
      
      if (!lastName) errors.lastName = 'Last name is required';
      else if (lastName.length > 50) errors.lastName = 'Last name must be less than 50 characters';
      
      if (!phone) errors.phone = 'Phone number is required';
      else if (phone.length < 10) errors.phone = 'Phone number must be at least 10 digits';
      else if (!/^[0-9+\-() ]+$/.test(phone)) errors.phone = 'Invalid phone number format';
      
      if (!email) errors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email address';
      
      if (Object.keys(errors).length > 0) {
        for (var field in errors) {
          this.shadow.getElementById('cb-' + field).classList.add('error');
          var errEl = this.shadow.getElementById('err-' + field);
          errEl.textContent = errors[field];
          errEl.classList.remove('hidden');
        }
        return;
      }
      
      var submitBtn = this.shadow.getElementById('callback-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
      
      try {
        await fetch(ZAPIER_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          mode: 'no-cors',
          body: JSON.stringify({
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            email: email,
            timestamp: new Date().toISOString(),
            source: 'Value Build Homes Chatbot Widget'
          })
        });
        
        // Show success
        this.shadow.getElementById('callback-content').classList.add('hidden');
        this.shadow.getElementById('callback-success').classList.remove('hidden');
        
        var self = this;
        setTimeout(function() {
          self.hideCallbackForm();
        }, 3000);
        
      } catch (error) {
        console.error('[VBH Widget] Callback error:', error);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Request';
      }
    }
  }

  // Register the custom element
  if (!customElements.get('vbh-chatbot')) {
    customElements.define('vbh-chatbot', VBHChatbot);
  }

  // Auto-inject
  function injectWidget() {
    if (document.querySelector('vbh-chatbot')) return;
    var widget = document.createElement('vbh-chatbot');
    document.body.appendChild(widget);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectWidget);
  } else {
    injectWidget();
  }

  console.log('[VBH Widget v2.3] Ready');
})();
