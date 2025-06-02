'use client';

import { useState, useEffect } from 'react';
import { Share2, Copy, Clock, Eye, Check, Settings, X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ShareButtonProps {
  candidateId: string;
  candidateName: string;
  className?: string;
}

interface ShareLinkOptions {
  expirationHours: number;
  maxAccess?: number;
}

export function ShareButton({ candidateId, candidateName, className = '' }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareData, setShareData] = useState<any>(null);
  const [options, setOptions] = useState<ShareLinkOptions>({
    expirationHours: 168, // 7 Tage Standard
    maxAccess: undefined
  });
  const { toast } = useToast();

  // Cleanup function
  const closeModal = () => {
    setIsOpen(false);
    setShareUrl(null);
    setShareData(null);
    setOptions({
      expirationHours: 168, // 7 Tage Standard
      maxAccess: undefined
    });
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const generateShareLink = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/share-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId,
          expirationHours: options.expirationHours,
          maxAccess: options.maxAccess,
          metadata: {
            candidateName,
            sharedBy: 'System'
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Fehler beim Erstellen des Share-Links`);
      }

      const result = await response.json();
      setShareUrl(result.data.shareUrl);
      setShareData(result.data);
      
      toast({
        title: "Share-Link erstellt",
        description: "Der sichere Link wurde erfolgreich generiert",
      });
    } catch (error) {
      console.error('ShareButton Error:', error);
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Share-Link konnte nicht erstellt werden",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Kopiert!",
        description: "Share-Link wurde in die Zwischenablage kopiert",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Link konnte nicht kopiert werden",
        variant: "destructive"
      });
    }
  };

  const formatExpirationTime = (hours: number) => {
    if (hours < 24) return `${hours} Stunden`;
    const days = Math.floor(hours / 24);
    return `${days} Tag${days > 1 ? 'e' : ''}`;
  };

  const presetOptions = [
    { label: '1 Stunde', hours: 1, icon: Clock },
    { label: '24 Stunden', hours: 24, icon: Calendar },
    { label: '7 Tage', hours: 168, icon: Calendar },
    { label: '30 Tage', hours: 720, icon: Calendar },
  ];

  if (isOpen) {
    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            closeModal();
          }
        }}
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Share2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Sicheren Link erstellen</h3>
                  <p className="text-sm text-gray-600">für {candidateName}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {!shareUrl ? (
              <>
                {/* Options */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-900 mb-3 block">
                      Gültigkeitsdauer
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {presetOptions.map((preset) => (
                        <Button
                          key={preset.hours}
                          variant={options.expirationHours === preset.hours ? "default" : "outline"}
                          onClick={() => setOptions(prev => ({ ...prev, expirationHours: preset.hours }))}
                          className="h-12 flex items-center gap-2"
                        >
                          <preset.icon className="h-4 w-4" />
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-900 mb-3 block">
                      Maximale Zugriffe (optional)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      <Button
                        variant={options.maxAccess === undefined ? "default" : "outline"}
                        onClick={() => setOptions(prev => ({ ...prev, maxAccess: undefined }))}
                        className="h-10"
                      >
                        Unbegrenzt
                      </Button>
                      {[1, 5, 10].map((count) => (
                        <Button
                          key={count}
                          variant={options.maxAccess === count ? "default" : "outline"}
                          onClick={() => setOptions(prev => ({ ...prev, maxAccess: count }))}
                          className="h-10"
                        >
                          {count}x
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Settings className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Sicherheitshinweise</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Alle persönlichen Daten werden automatisch pseudonymisiert</li>
                        <li>• Link läuft nach {formatExpirationTime(options.expirationHours)} ab</li>
                        {options.maxAccess && <li>• Maximal {options.maxAccess} Zugriffe möglich</li>}
                        <li>• DSGVO-konform und sicher</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={generateShareLink}
                  disabled={loading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Erstelle Link...
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4 mr-2" />
                      Sicheren Link erstellen
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Link erfolgreich erstellt!</h4>
                  <p className="text-gray-600">Der sichere Share-Link ist bereit zum Versenden</p>
                </div>

                {/* Link Display */}
                <div className="bg-gray-50 rounded-xl p-4 border">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">Sicherer Link</p>
                      <p className="text-sm font-mono text-gray-900 truncate">{shareUrl}</p>
                    </div>
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Link Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">Gültigkeitsdauer</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {formatExpirationTime(shareData.expirationHours)}
                    </p>
                  </div>

                  <div className="bg-white border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">Zugriffe</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {shareData.maxAccess ? `0 / ${shareData.maxAccess}` : 'Unbegrenzt'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={copyToClipboard}
                    className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Link kopieren
                  </Button>
                  <Button
                    onClick={() => {
                      setShareUrl(null);
                      setShareData(null);
                    }}
                    variant="outline"
                    className="h-12 px-6"
                  >
                    Neuer Link
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={() => setIsOpen(true)}
      variant="outline"
      size="sm"
      className={`h-10 px-4 ${className}`}
    >
      <Share2 className="h-4 w-4 mr-2" />
      Teilen
    </Button>
  );
} 