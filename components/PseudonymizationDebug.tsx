'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Shield, Clock, FileText, AlertTriangle } from 'lucide-react';
import type { PseudonymizationResult } from '@/types/pseudonymized';

interface PseudonymizationDebugProps {
  metadata: PseudonymizationResult['metadata'];
  className?: string;
}

export function PseudonymizationDebug({ metadata, className }: PseudonymizationDebugProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!metadata) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-md ${className}`}>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="mb-2 bg-gray-900 text-white border-gray-700 hover:bg-gray-800"
      >
        <Shield className="h-4 w-4 mr-2" />
        Debug: Pseudonymisierung
        {isVisible ? <EyeOff className="h-4 w-4 ml-2" /> : <Eye className="h-4 w-4 ml-2" />}
      </Button>

      {/* Debug Panel */}
      {isVisible && (
        <Card className="bg-gray-900 text-white border-gray-700 shadow-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-400" />
              Pseudonymisierung aktiv
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Clock className="h-4 w-4" />
              {new Date(metadata.timestamp).toLocaleString('de-DE')}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* PII Detection */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-yellow-400" />
                Erkannte personenbezogene Daten
              </h4>
              <div className="flex flex-wrap gap-1">
                {metadata.originalDataDetected.length > 0 ? (
                  metadata.originalDataDetected.map((field, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-red-400 text-red-300">
                      {field}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">Keine PII erkannt</span>
                )}
              </div>
            </div>

            {/* Transformations Applied */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-blue-400" />
                Angewandte Transformationen
              </h4>
              <div className="space-y-1">
                {metadata.transformationsApplied.length > 0 ? (
                  metadata.transformationsApplied.map((transformation, index) => (
                    <div key={index} className="text-xs bg-gray-800 px-2 py-1 rounded">
                      {transformation}
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">Keine Transformationen</span>
                )}
              </div>
            </div>

            {/* Seed Information */}
            {metadata.seedUsed && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Verwendeter Seed</h4>
                <Badge variant="outline" className="text-xs border-gray-600 text-gray-300 font-mono">
                  {metadata.seedUsed}
                </Badge>
              </div>
            )}

            {/* Statistics */}
            <div className="border-t border-gray-700 pt-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400">PII-Felder:</span>
                  <span className="ml-1 font-mono">{metadata.originalDataDetected.length}</span>
                </div>
                <div>
                  <span className="text-gray-400">Transformationen:</span>
                  <span className="ml-1 font-mono">{metadata.transformationsApplied.length}</span>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-900/20 border border-amber-700 rounded p-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200">
                  <strong>Development Modus:</strong> Diese Informationen sind nur in der Entwicklungsumgebung sichtbar.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 