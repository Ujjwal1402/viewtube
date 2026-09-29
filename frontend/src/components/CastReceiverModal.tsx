import React, { useState } from 'react';
import {
  Cast,
  Tv,
  Monitor,
  Smartphone,
  Radio,
  CheckCircle2,
  X,
  RefreshCw,
  QrCode,
  Wifi,
  ExternalLink,
  Volume2,
  Play,
  Pause,
} from 'lucide-react';
import { Video } from '../types';

export interface CastDevice {
  id: string;
  name: string;
  type: 'tv' | 'chromecast' | 'display' | 'airplay';
  location: string;
  isAvailable: boolean;
}

interface CastReceiverModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeVideo: Video | null;
  connectedDevice: CastDevice | null;
  onConnectDevice: (device: CastDevice | null) => void;
  darkMode: boolean;
}

const DEFAULT_DEVICES: CastDevice[] = [
  {
    id: 'dev-living-room',
    name: 'Living Room Smart TV',
    type: 'tv',
    location: 'Living Room • 4K OLED',
    isAvailable: true,
  },
  {
    id: 'dev-bedroom-cast',
    name: 'Bedroom Chromecast Ultra',
    type: 'chromecast',
    location: 'Bedroom • HDMI 1',
    isAvailable: true,
  },
  {
    id: 'dev-office-hub',
    name: 'Office Hub Receiver Display',
    type: 'display',
    location: 'Office Desk • Google Cast',
    isAvailable: true,
  },
  {
    id: 'dev-apple-tv',
    name: 'Family Room Apple TV',
    type: 'airplay',
    location: 'Family Room • AirPlay 2',
    isAvailable: true,
  },
];

export const CastReceiverModal: React.FC<CastReceiverModalProps> = ({
  isOpen,
  onClose,
  activeVideo,
  connectedDevice,
  onConnectDevice,
  darkMode,
}) => {
  const [devices, setDevices] = useState<CastDevice[]>(DEFAULT_DEVICES);
  const [isScanning, setIsScanning] = useState(false);
  const [tvCodeInput, setTvCodeInput] = useState('');
  const [activeTab, setActiveTab] = useState<'devices' | 'tv-code' | 'receiver-mode'>('devices');
  const [isReceiverHostActive, setIsReceiverHostActive] = useState(false);
  const [pairingSuccessMessage, setPairingSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleScanForDevices = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setDevices((prev) => [
        ...prev,
        {
          id: `dev-new-${Date.now()}`,
          name: 'Conference Room Display',
          type: 'tv',
          location: 'Conference Room • Nearby Receiver',
          isAvailable: true,
        },
      ]);
    }, 1200);
  };

  const handlePairWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tvCodeInput.trim()) return;

    const pairedDevice: CastDevice = {
      id: `dev-code-${Date.now()}`,
      name: `TV Linked (${tvCodeInput.trim()})`,
      type: 'tv',
      location: 'Linked via TV Code',
      isAvailable: true,
    };

    onConnectDevice(pairedDevice);
    setPairingSuccessMessage(`Successfully connected to TV with code ${tvCodeInput}!`);
    setTimeout(() => {
      setPairingSuccessMessage('');
      onClose();
    }, 1400);
  };

  const getDeviceIcon = (type: CastDevice['type']) => {
    switch (type) {
      case 'tv':
        return <Tv className="w-5 h-5 text-blue-500" />;
      case 'chromecast':
        return <Cast className="w-5 h-5 text-red-500" />;
      case 'display':
        return <Monitor className="w-5 h-5 text-emerald-500" />;
      case 'airplay':
        return <Radio className="w-5 h-5 text-amber-500" />;
      default:
        return <Tv className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div
      id="cast-receiver-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
    >
      <div
        className={`w-full max-w-md rounded-2xl p-5 shadow-2xl border flex flex-col max-h-[90vh] ${
          darkMode ? 'bg-[#212121] border-neutral-700 text-neutral-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-700/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-600/10 text-red-500">
              <Cast className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Cast & Device Receiver</h3>
              <p className="text-xs text-neutral-400">Connect to Smart TV, Chromecast, or Receiver display</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-700/40 mt-3 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('devices')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'devices'
                ? 'border-red-500 text-red-500'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Available Receivers
          </button>
          <button
            onClick={() => setActiveTab('tv-code')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'tv-code'
                ? 'border-red-500 text-red-500'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Link with TV Code
          </button>
          <button
            onClick={() => setActiveTab('receiver-mode')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'receiver-mode'
                ? 'border-red-500 text-red-500'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Receiver Screen
          </button>
        </div>

        {/* Active Connected Banner */}
        {connectedDevice && (
          <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <div>
                <p className="font-semibold text-red-400">Connected to {connectedDevice.name}</p>
                <p className="text-[11px] text-neutral-400">
                  {activeVideo ? `Streaming: "${activeVideo.title.slice(0, 30)}..."` : 'Ready to receive playback'}
                </p>
              </div>
            </div>
            <button
              onClick={() => onConnectDevice(null)}
              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-[11px] transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}

        {/* Tab 1: Available Receivers */}
        {activeTab === 'devices' && (
          <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-1">
            <div className="flex items-center justify-between text-xs text-neutral-400 px-1 mb-1">
              <span>Nearby receivers & screens</span>
              <button
                onClick={handleScanForDevices}
                disabled={isScanning}
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Searching...' : 'Scan again'}</span>
              </button>
            </div>

            {devices.map((device) => {
              const isConnected = connectedDevice?.id === device.id;
              return (
                <div
                  key={device.id}
                  onClick={() => onConnectDevice(isConnected ? null : device)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isConnected
                      ? 'border-red-500/60 bg-red-500/10'
                      : darkMode
                      ? 'border-neutral-800 bg-[#282828] hover:bg-[#323232]'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isConnected ? 'bg-red-600 text-white' : darkMode ? 'bg-[#1f1f1f]' : 'bg-white'
                      }`}
                    >
                      {getDeviceIcon(device.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-semibold text-xs">
                        <span>{device.name}</span>
                        {isConnected && <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />}
                      </div>
                      <div className="text-[11px] text-neutral-400">{device.location}</div>
                    </div>
                  </div>

                  <button
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      isConnected
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : darkMode
                        ? 'bg-neutral-700 hover:bg-neutral-600 text-neutral-200'
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    }`}
                  >
                    {isConnected ? 'Connected' : 'Connect'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Link with TV Code */}
        {activeTab === 'tv-code' && (
          <form onSubmit={handlePairWithCode} className="mt-4 space-y-4">
            <div className="text-xs text-neutral-400 leading-relaxed">
              Open the YouTube or ViewTube app on your Smart TV, go to <strong>Settings → Link with TV code</strong>, and enter the code shown on your television screen below.
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-neutral-300">Enter TV Code</label>
              <input
                type="text"
                placeholder="e.g. 582 910 334"
                value={tvCodeInput}
                onChange={(e) => setTvCodeInput(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono tracking-wider focus:outline-none focus:border-red-500 ${
                  darkMode ? 'bg-[#181818] border-neutral-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            {pairingSuccessMessage && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{pairingSuccessMessage}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTvCodeInput('742 819 031')}
                className={`px-3 py-1.5 rounded-lg text-xs border font-medium ${
                  darkMode ? 'border-neutral-700 hover:bg-neutral-800 text-neutral-300' : 'border-slate-200 hover:bg-slate-100'
                }`}
              >
                Use demo code: 742 819 031
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Link TV Receiver
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Receiver Screen Mode */}
        {activeTab === 'receiver-mode' && (
          <div className="mt-4 space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/60 space-y-2 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-600/10 text-blue-400 flex items-center justify-center">
                <Monitor className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm">Act as a Remote Receiver</h4>
              <p className="text-neutral-400 leading-relaxed text-[11px]">
                Turn this browser window into a receiver display. Other phones or laptops on your Wi-Fi network can cast videos directly to this screen.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-neutral-700/50 bg-[#181818] flex items-center justify-between">
              <div>
                <span className="text-neutral-400 text-[11px]">Your Receiver Pairing Code:</span>
                <div className="font-mono font-bold text-base text-red-500 tracking-widest">
                  814 392 607
                </div>
              </div>
              <div className="p-2 bg-white rounded-lg">
                <QrCode className="w-6 h-6 text-black" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsReceiverHostActive(!isReceiverHostActive);
              }}
              className={`w-full py-2.5 rounded-xl font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                isReceiverHostActive
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              <Wifi className="w-4 h-4" />
              <span>{isReceiverHostActive ? 'Receiver Online (Listening on port)' : 'Start Receiver Mode'}</span>
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-neutral-700/40 flex items-center justify-between text-[11px] text-neutral-400">
          <span>Standard Google Cast / AirPlay 2.0 protocol</span>
          <button onClick={onClose} className="text-red-400 hover:underline">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
