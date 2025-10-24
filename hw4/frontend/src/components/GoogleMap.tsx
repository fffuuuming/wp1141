import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { loadGoogleMapsAPI } from '../utils/googleMapsLoader';

export interface MapMarker {
  id: number;
  position: {
    lat: number;
    lng: number;
  };
  title: string;
  description?: string;
}

interface GoogleMapProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  markers?: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
  onMapClick?: (lat: number, lng: number, placeId?: string) => void;
  height?: string | number;
  showInfoWindow?: boolean;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  center,
  zoom = 15,
  markers = [],
  onMarkerClick,
  onMapClick,
  height = 400,
  showInfoWindow = true,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初始化地圖
  useEffect(() => {
    const initMap = async () => {
      try {
        setLoading(true);
        setError(null);

        // 載入 Google Maps API
        await loadGoogleMapsAPI();

        // 檢查 Google Maps API 是否已載入
        if (!window.google || !window.google.maps) {
          throw new Error('Google Maps API 尚未載入');
        }

        if (!mapRef.current) {
          return;
        }

        // 創建地圖實例
        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        });

        mapInstanceRef.current = map;

        // 創建 InfoWindow
        if (showInfoWindow) {
          infoWindowRef.current = new google.maps.InfoWindow();
        }

        // 添加地圖點擊事件
        if (onMapClick) {
          map.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              // 檢查是否點擊了 POI（地標）
              const placeId = e.placeId;
              
              if (placeId) {
                // 點擊了地標，阻止預設行為並傳遞 placeId
                e.stop(); // 阻止預設的 InfoWindow
                console.log('點擊地標，placeId:', placeId);
                onMapClick(e.latLng.lat(), e.latLng.lng(), placeId);
              } else {
                // 點擊了空白處，只傳遞座標
                console.log('點擊空白處，座標:', e.latLng.lat(), e.latLng.lng());
                onMapClick(e.latLng.lat(), e.latLng.lng());
              }
            }
          });
        }

        setLoading(false);
      } catch (err: any) {
        console.error('初始化地圖失敗:', err);
        setError(err.message || '無法載入地圖');
        setLoading(false);
      }
    };

    initMap();

    // 清理函數
    return () => {
      // 清除所有標記
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      
      // 清除 InfoWindow
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, [center.lat, center.lng, zoom, onMapClick, showInfoWindow]);

  // 更新標記
  useEffect(() => {
    if (!mapInstanceRef.current || loading) {
      return;
    }

    // 清除舊標記
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // 添加新標記
    markers.forEach((markerData) => {
      const marker = new google.maps.Marker({
        position: markerData.position,
        map: mapInstanceRef.current!,
        title: markerData.title,
        animation: google.maps.Animation.DROP,
      });

      // 添加標記點擊事件
      marker.addListener('click', () => {
        if (onMarkerClick) {
          onMarkerClick(markerData);
        }

        // 顯示 InfoWindow
        if (showInfoWindow && infoWindowRef.current) {
          const content = `
            <div style="padding: 8px; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
                ${markerData.title}
              </h3>
              ${markerData.description ? `
                <p style="margin: 0; font-size: 14px; color: #666;">
                  ${markerData.description}
                </p>
              ` : ''}
            </div>
          `;
          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open(mapInstanceRef.current, marker);
        }
      });

      markersRef.current.push(marker);
    });

    // 如果有多個標記，調整地圖視野以包含所有標記
    if (markers.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      markers.forEach(marker => {
        bounds.extend(marker.position);
      });
      mapInstanceRef.current.fitBounds(bounds);
      
      // 設置最小縮放級別
      const listener = google.maps.event.addListener(mapInstanceRef.current, 'idle', () => {
        const currentZoom = mapInstanceRef.current?.getZoom();
        if (currentZoom && currentZoom > 15) {
          mapInstanceRef.current?.setZoom(15);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [markers, loading, onMarkerClick, showInfoWindow]);

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height }}>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 1,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '8px',
        }}
      />
    </Box>
  );
};

export default GoogleMap;

