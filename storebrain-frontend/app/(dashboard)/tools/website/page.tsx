'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Download, Check, X, Search } from 'lucide-react';
import { fetchTrackingData, TrackingItem, updateProductTrackingStatus } from './actions';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const Website = () => {
  const [trackingData, setTrackingData] = useState<TrackingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingProduct, setUpdatingProduct] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [groupeFilter, setGroupeFilter] = useState<string>('');
  const [familleFilter, setFamilleFilter] = useState<string>('');
  const [prestaStateFilter, setPrestaStateFilter] = useState<string>('');
  const [photosFilter, setPhotosFilter] = useState<string>('');
  const [productSheetFilter, setProductSheetFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleGetTracking = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchTrackingData();
      setTrackingData(data);
      // Reset filters when new data is loaded
      setGroupeFilter('');
      setFamilleFilter('');
      setPrestaStateFilter('');
      setPhotosFilter('');
      setProductSheetFilter('');
      setSearchQuery('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de la récupération des données';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (produitId: number, field: 'hasPhotos' | 'hasProductSheet', value: boolean) => {
    setUpdatingProduct(produitId);
    
    try {
      const item = trackingData.find(item => item.produitId === produitId);
      if (!item) return;
      
      const hasPhotos = field === 'hasPhotos' ? value : item.hasPhotos;
      const hasProductSheet = field === 'hasProductSheet' ? value : item.hasProductSheet;
      
      await updateProductTrackingStatus(produitId, hasPhotos, hasProductSheet);
      
      // Mise à jour locale des données
      setTrackingData(prev => 
        prev.map(item => 
          item.produitId === produitId 
            ? { ...item, [field]: value } 
            : item
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de la mise à jour du statut';
      setError(errorMessage);
    } finally {
      setUpdatingProduct(null);
    }
  };

  const getPrestaStateBadge = (state: TrackingItem['prestaState']) => {
    switch (state) {
      case 'NOT_FOUND':
        return <Badge color="destructive">Non trouvé</Badge>;
      case 'OFFLINE':
        return <Badge color="warning">Hors ligne</Badge>;
      case 'ONLINE':
        return <Badge color="success">En ligne</Badge>;
      default:
        return <Badge>{state}</Badge>;
    }
  };

  const getPrestaStateLabel = (state: TrackingItem['prestaState']) => {
    switch (state) {
      case 'NOT_FOUND':
        return 'Non trouvé';
      case 'OFFLINE':
        return 'Hors ligne';
      case 'ONLINE':
        return 'En ligne';
      default:
        return state;
    }
  };

  // Extract unique values for filters
  const uniqueGroupes = useMemo(() => {
    return Array.from(new Set(trackingData.map(item => item.groupe))).sort();
  }, [trackingData]);

  const uniqueFamilles = useMemo(() => {
    return Array.from(new Set(trackingData.map(item => item.famille))).sort();
  }, [trackingData]);

  const uniquePrestaStates = useMemo(() => {
    return Array.from(new Set(trackingData.map(item => item.prestaState))).sort();
  }, [trackingData]);

  // Apply filters to data
  const filteredData = useMemo(() => {
    return trackingData.filter(item => {
      const matchesSearch = searchQuery === '' || 
        item.produitId.toString().includes(searchQuery) || 
        item.reference.toLowerCase().includes(searchQuery.toLowerCase());
        
      return (
        matchesSearch &&
        (groupeFilter === '' || item.groupe === groupeFilter) &&
        (familleFilter === '' || item.famille === familleFilter) &&
        (prestaStateFilter === '' || item.prestaState === prestaStateFilter) &&
        (photosFilter === '' || 
          (photosFilter === 'true' && item.hasPhotos) || 
          (photosFilter === 'false' && !item.hasPhotos)) &&
        (productSheetFilter === '' || 
          (productSheetFilter === 'true' && item.hasProductSheet) || 
          (productSheetFilter === 'false' && !item.hasProductSheet))
      );
    });
  }, [trackingData, groupeFilter, familleFilter, prestaStateFilter, photosFilter, productSheetFilter, searchQuery]);

  // Export to CSV function
  const exportToCSV = () => {
    if (filteredData.length === 0) return;

    // CSV Headers
    const headers = [
      'ID',
      'Référence',
      'Groupe',
      'Famille',
      'Stock Total',
      'Stock SAS',
      'État Presta',
      'Photos',
      'Fiche Produit'
    ];

    // Convert data to CSV rows
    const rows = filteredData.map(item => [
      item.produitId,
      item.reference,
      item.groupe,
      item.famille,
      item.stockTotal,
      item.stockSas,
      getPrestaStateLabel(item.prestaState),
      item.hasPhotos ? 'Oui' : 'Non',
      item.hasProductSheet ? 'Oui' : 'Non'
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set up download attributes
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `tracking-data-${date}.csv`);
    link.style.visibility = 'hidden';
    
    // Trigger download and cleanup
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestion du site web</CardTitle>
          <Button 
            onClick={handleGetTracking} 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Chargement...
              </>
            ) : (
              'Récupérer les données de tracking'
            )}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Rechercher par ID ou référence"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              {filteredData.length > 0 && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={exportToCSV}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    Exporter CSV
                  </Button>
                  <Badge variant="outline">
                    {filteredData.length} {filteredData.length > 1 ? 'produits' : 'produit'}
                  </Badge>
                </>
              )}
            </div>
          </div>
          
          {error && (
            <div className="text-red-500 mb-4">
              {error}
            </div>
          )}

          {trackingData.length > 0 && (
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="w-full sm:w-auto">
                <Select value={groupeFilter} onValueChange={setGroupeFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtrer par groupe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les groupes</SelectItem>
                    {uniqueGroupes.map(groupe => (
                      <SelectItem key={groupe} value={groupe}>{groupe}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-auto">
                <Select value={familleFilter} onValueChange={setFamilleFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtrer par famille" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les familles</SelectItem>
                    {uniqueFamilles.map(famille => (
                      <SelectItem key={famille} value={famille}>{famille}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-auto">
                <Select value={prestaStateFilter} onValueChange={setPrestaStateFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtrer par état Presta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les états</SelectItem>
                    {uniquePrestaStates.map(state => (
                      <SelectItem key={state} value={state}>{getPrestaStateLabel(state)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-auto">
                <Select value={photosFilter} onValueChange={setPhotosFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtrer par photos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes</SelectItem>
                    <SelectItem value="true">Avec photos</SelectItem>
                    <SelectItem value="false">Sans photos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-auto">
                <Select value={productSheetFilter} onValueChange={setProductSheetFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtrer par fiche produit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes</SelectItem>
                    <SelectItem value="true">Avec fiche</SelectItem>
                    <SelectItem value="false">Sans fiche</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(groupeFilter || familleFilter || prestaStateFilter || photosFilter || productSheetFilter) && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setGroupeFilter('');
                    setFamilleFilter('');
                    setPrestaStateFilter('');
                    setPhotosFilter('');
                    setProductSheetFilter('');
                  }}
                  size="sm"
                  className="h-10"
                >
                  Réinitialiser les filtres
                </Button>
              )}
            </div>
          )}
          
          {filteredData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Groupe</TableHead>
                  <TableHead>Famille</TableHead>
                  <TableHead>Stock Total</TableHead>
                  <TableHead>Stock SAS</TableHead>
                  <TableHead>Photos</TableHead>
                  <TableHead>Fiche Produit</TableHead>
                  <TableHead>État Presta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.produitId}</TableCell>
                    <TableCell>{item.reference}</TableCell>
                    <TableCell>{item.groupe}</TableCell>
                    <TableCell>{item.famille}</TableCell>
                    <TableCell>{item.stockTotal}</TableCell>
                    <TableCell>{item.stockSas}</TableCell>
                    <TableCell>
                      {item.hasPhotos ? 
                        <Badge color="success">Oui</Badge> : 
                        <Badge color="destructive">Non</Badge>
                      }
                    </TableCell>
                    <TableCell>
                      {item.hasProductSheet ? 
                        <Badge color="success">Oui</Badge> : 
                        <Badge color="destructive">Non</Badge>
                      }
                    </TableCell>
                    <TableCell>{getPrestaStateBadge(item.prestaState)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : !loading && trackingData.length > 0 ? (
            <div className="text-center py-4 text-gray-500">
              Aucun résultat ne correspond aux filtres sélectionnés
            </div>
          ) : !loading && (
            <div className="text-center py-4 text-gray-500">
              Aucune donnée de tracking disponible
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Website;
