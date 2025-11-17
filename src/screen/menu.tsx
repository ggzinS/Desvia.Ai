import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, {
  Circle,
  Heatmap,
  Marker,
  Polyline,
  PROVIDER_DEFAULT,
} from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

import Header from "../componentes/Header";
import TabsNavigation from "../componentes/TabsNavegation";
import styles from "../styles/menu";
import {
  Coordinate,
  FeedItem,
  HeatPoint,
  fetchFeed,
  fetchHeatmap,
  fetchSecureRoute,
  postDenuncia,
  postRastreamento,
} from "../services/api";

const TRACKING_INTERVAL_MS = 10000;
const randomUserId = `user-${Math.random().toString(36).slice(2, 8)}`;

const FORTALEZA_SAMPLES = [
  {
    display_name: "North Shopping Jóquei, Fortaleza",
    lat: -3.7765,
    lon: -38.5821,
  },
  {
    display_name: "Shopping Iguatemi Bosque, Fortaleza",
    lat: -3.7463,
    lon: -38.4899,
  },
  {
    display_name: "Praia de Iracema, Fortaleza",
    lat: -3.7184,
    lon: -38.5434,
  },
  {
    display_name: "Praia do Futuro, Fortaleza",
    lat: -3.7507,
    lon: -38.4635,
  },
];

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

const FORTALEZA_BBOX = {
  latMin: -3.9684,
  latMax: -3.6885,
  lonMin: -38.7059,
  lonMax: -38.3553,
};

const profileMap: Record<string, string> = {
  carro: "driving",
  moto: "driving",
  onibus: "driving",
  pe: "foot",
};

const riskColor = (weight: number) => {
  if (weight >= 0.8) return "#b71c1c";
  if (weight >= 0.6) return "#ff7043";
  if (weight >= 0.4) return "#ffe992";
  return "#14a0ff";
};

const decodePolyline = (polyline: string): Coordinate[] => {
  let index = 0;
  const len = polyline.length;
  let lat = 0;
  let lng = 0;
  const coordinates: Coordinate[] = [];

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = polyline.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const deltaLat = (result & 1 ? ~(result >> 1) : result >> 1) / 1e5;
    lat += deltaLat;

    shift = 0;
    result = 0;
    do {
      b = polyline.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const deltaLng = (result & 1 ? ~(result >> 1) : result >> 1) / 1e5;
    lng += deltaLng;

    coordinates.push({ latitude: lat, longitude: lng });
  }

  return coordinates;
};

export default function Menu() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [heatPoints, setHeatPoints] = useState<HeatPoint[]>([]);
  const [routeCoords, setRouteCoords] = useState<Coordinate[]>([]);
  const [destination, setDestination] = useState<Coordinate | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [loadingHeatmap, setLoadingHeatmap] = useState(false);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [reportType, setReportType] = useState("Atividade Suspeita");
  const [reportDescription, setReportDescription] = useState("");
  const [sendingReport, setSendingReport] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Mapa seguro pronto");
  const [navigationActive, setNavigationActive] = useState(false);
  const [alertaPerigo, setAlertaPerigo] = useState<string | null>(null);
  const [feedVisible, setFeedVisible] = useState(false);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [startNavVisible, setStartNavVisible] = useState(false);
  const [routePreference, setRoutePreference] = useState<"segura" | "rapida">(
    "segura"
  );
  const [transportMode, setTransportMode] = useState<
    "carro" | "moto" | "onibus" | "pe"
  >("carro");
  const [searchResults, setSearchResults] = useState<
    { display_name: string; lat: string; lon: string }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suppressSuggestions, setSuppressSuggestions] = useState(false);

  const trackingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const locationWatcher = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permissão de localização negada");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  useEffect(() => {
    if (location) {
      handleFetchHeatmap();
      handleFetchFeed();
    }
  }, [location]);

  useEffect(() => {
    if (navigationActive) {
      startTracking();
      startFollowing();
    } else {
      stopTracking();
      stopFollowing();
    }

    return () => {
      stopTracking();
      stopFollowing();
    };
  }, [navigationActive]);

  const startTracking = () => {
    stopTracking();
    sendTrackingPing();
    trackingInterval.current = setInterval(
      () => sendTrackingPing(),
      TRACKING_INTERVAL_MS
    );
  };

  const stopTracking = () => {
    if (trackingInterval.current) {
      clearInterval(trackingInterval.current);
      trackingInterval.current = null;
    }
  };

  const startFollowing = async () => {
    if (locationWatcher.current) return;
    locationWatcher.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 3000,
        distanceInterval: 2,
      },
      (pos) => {
        setLocation(pos);
        if (navigationActive && mapRef.current) {
          mapRef.current.animateCamera(
            {
              center: {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              },
              pitch: 0,
              heading: pos.coords.heading || 0,
              zoom: 17,
            },
            { duration: 800 }
          );
        }
      }
    );
  };

  const stopFollowing = () => {
    if (locationWatcher.current) {
      locationWatcher.current.remove();
      locationWatcher.current = null;
    }
  };

  const sendTrackingPing = async () => {
    if (!location) return;
    try {
      const resp = await postRastreamento({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (resp.alerta) {
        setAlertaPerigo(resp.tipo || "Perigo");
      }
    } catch (err: any) {
      setStatusMessage(err.message || "Falha no rastreamento");
    }
  };

  const handleFetchHeatmap = async () => {
    setLoadingHeatmap(true);
    try {
      const data = await fetchHeatmap();
      setHeatPoints(data.points || []);
      setStatusMessage("Heatmap atualizado");
    } catch (err: any) {
      setStatusMessage(err.message || "Erro ao carregar heatmap");
    } finally {
      setLoadingHeatmap(false);
    }
  };

  const handleFetchFeed = async () => {
    setLoadingFeed(true);
    try {
      const res = await fetchFeed(12);
      setFeedItems(res.items || []);
    } catch (err: any) {
      setStatusMessage(err.message || "Erro ao carregar feed");
    } finally {
      setLoadingFeed(false);
    }
  };

  const handleSetDestination = (coord: Coordinate) => {
    setDestination(coord);
    setStatusMessage("Destino definido. Escolha o tipo de rota.");
    setShowSuggestions(false);
    setSearchResults([]);
    mapRef.current?.animateToRegion(
      {
        ...coord,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500
    );
    setStartNavVisible(true);
  };

  const handleSearchAddress = async () => {
    if (!searchQuery.trim()) {
      Alert.alert("Digite um destino", "Informe um endereço ou ponto.");
      return;
    }
    setSearchingAddress(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        `${searchQuery.trim()} Fortaleza CE`
      )}&city=Fortaleza&state=Ceara&countrycodes=br&viewbox=${FORTALEZA_BBOX.lonMin},${FORTALEZA_BBOX.latMax},${FORTALEZA_BBOX.lonMax},${FORTALEZA_BBOX.latMin}&bounded=1&limit=3`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "rotas-seguras-demo",
        },
      });
      const data = await res.json();
      const filtered =
        data?.filter((d: any) => {
          const lat = Number(d.lat);
          const lon = Number(d.lon);
          const inside =
            lat >= FORTALEZA_BBOX.latMin &&
            lat <= FORTALEZA_BBOX.latMax &&
            lon >= FORTALEZA_BBOX.lonMin &&
            lon <= FORTALEZA_BBOX.lonMax;
          return (
            inside ||
            normalize(d.display_name || "").includes("fortaleza") ||
            normalize(d.display_name || "").includes(normalize(searchQuery))
          );
        }) || [];
      const fallback = FORTALEZA_SAMPLES.filter((s) =>
        normalize(s.display_name).includes(normalize(searchQuery.trim()))
      );
      const results = filtered.length
        ? filtered
        : data?.length
        ? data
        : fallback;
      setSearchResults(results.length ? results : FORTALEZA_SAMPLES);
      setShowSuggestions(true);
      if (!results.length) {
        setStatusMessage("Nenhum resultado encontrado em Fortaleza");
      }
    } catch (err: any) {
      setStatusMessage("Erro ao buscar destino. Usando sugestões locais.");
      setSearchResults(FORTALEZA_SAMPLES);
      setShowSuggestions(true);
    } finally {
      setSearchingAddress(false);
    }
  };

  useEffect(() => {
    if (suppressSuggestions) return;
    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          `${searchQuery.trim()} Fortaleza CE`
        )}&city=Fortaleza&state=Ceara&countrycodes=br&addressdetails=1&limit=5&viewbox=${FORTALEZA_BBOX.lonMin},${FORTALEZA_BBOX.latMax},${FORTALEZA_BBOX.lonMax},${FORTALEZA_BBOX.latMin}&bounded=1`;
        const res = await fetch(url, {
          headers: {
            "User-Agent": "rotas-seguras-demo",
          },
        });
        const data = await res.json();
        const filtered =
          data?.filter((d: any) => {
            const lat = Number(d.lat);
            const lon = Number(d.lon);
            const inside =
              lat >= FORTALEZA_BBOX.latMin &&
              lat <= FORTALEZA_BBOX.latMax &&
              lon >= FORTALEZA_BBOX.lonMin &&
              lon <= FORTALEZA_BBOX.lonMax;
            return inside || d.display_name?.toLowerCase().includes("fortaleza");
          }) || [];
        const fallback = FORTALEZA_SAMPLES.filter((s) =>
          s.display_name.toLowerCase().includes(searchQuery.trim().toLowerCase())
        );
        const results =
          filtered.length || (data && data.length)
            ? filtered.length
              ? filtered
              : data
            : fallback;
        setSearchResults(results.length ? results : FORTALEZA_SAMPLES);
        setShowSuggestions(true);
      } catch (err) {
        setSearchResults(FORTALEZA_SAMPLES);
        setShowSuggestions(true);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, suppressSuggestions]);

  const handleChooseSuggestion = (item: {
    display_name: string;
    lat: string;
    lon: string;
  }) => {
    const coord = { latitude: Number(item.lat), longitude: Number(item.lon) };
    setSearchQuery(item.display_name);
    setSearchResults([]);
    setShowSuggestions(false);
    setSuppressSuggestions(true);
    handleSetDestination(coord);
    setStartNavVisible(true);
  };

  async function fetchOsrmRoute({
    origem,
    destino,
    profile,
  }: {
    origem: string;
    destino: string;
    profile: string;
  }) {
    const [oLat, oLng] = origem.split(",").map(Number);
    const [dLat, dLng] = destino.split(",").map(Number);
    const osrmProfile = profileMap[profile] || "driving";
    const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${oLng},${oLat};${dLng},${dLat}?overview=full&geometries=polyline`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Falha ao buscar rota alternativa");
    const json = await res.json();
    const route = json.routes?.[0];
    if (!route) throw new Error("Sem rota encontrada");
    return {
      polyline: route.geometry,
      coordinates: decodePolyline(route.geometry),
      etaMinutes: Math.round(route.duration / 60),
      dangerScore: routePreference === "segura" ? 0.2 : 0.5,
    };
  }

  const handleSecureRoute = async (manualDestination?: Coordinate) => {
    const finalDestination = manualDestination || destination;
    if (!location || !finalDestination) {
      Alert.alert("Selecione um destino", "Toque no mapa para definir o ponto.");
      return;
    }
    setLoadingRoute(true);
    try {
      const originCoords = `${location.coords.latitude},${location.coords.longitude}`;
      const destCoords = `${finalDestination.latitude},${finalDestination.longitude}`;

      let data;
      try {
        data = await fetchOsrmRoute({
          origem: originCoords,
          destino: destCoords,
          profile: transportMode,
        });
      } catch (osrmErr) {
        data = await fetchSecureRoute({
          origem: originCoords,
          destino: destCoords,
        });
      }

      const coords =
        data.coordinates?.length && (data.coordinates as any)[0].latitude !== undefined
          ? data.coordinates
          : decodePolyline(data.polyline);

      // Se ainda não houver coordenadas válidas, cria uma rota simples direta
      const safeCoords =
        coords && coords.length
          ? coords
          : [
              { latitude: location.coords.latitude, longitude: location.coords.longitude },
              { latitude: finalDestination.latitude, longitude: finalDestination.longitude },
            ];

      setRouteCoords(
        safeCoords.map((c) => ({
          latitude: Number(c.latitude),
          longitude: Number(c.longitude),
        }))
      );

      if (safeCoords.length && mapRef.current) {
        mapRef.current.fitToCoordinates(
          safeCoords.map((c) => ({
            latitude: Number(c.latitude),
            longitude: Number(c.longitude),
          })),
          {
            edgePadding: { top: 100, bottom: 180, left: 60, right: 60 },
            animated: true,
          }
        );
        mapRef.current.animateCamera(
          {
            pitch: 55,
            heading: location.coords.heading || 0,
            zoom: 16,
            center: safeCoords[Math.floor(safeCoords.length / 2)],
          },
          { duration: 900 }
        );
      }

      setStatusMessage(
        `Rota ${routePreference === "segura" ? "segura" : "rápida"} recalculada (risco ${(data.dangerScore * 100).toFixed(
          0
        )}%)`
      );
    } catch (err: any) {
      Alert.alert(
        "Erro ao buscar rota",
        err.message || "Tente novamente em instantes."
      );
    } finally {
      setLoadingRoute(false);
    }
  };

  const handleSendDenuncia = async () => {
    if (!location) {
      Alert.alert("Localização indisponível", "Ative o GPS para reportar.");
      return;
    }
    setSendingReport(true);
    try {
      await postDenuncia({
        tipo: reportType,
        descricao: reportDescription,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        userId: randomUserId,
      });
      setReportVisible(false);
      setReportDescription("");
      setStatusMessage("Denúncia enviada e aplicada ao heatmap");
      await handleFetchHeatmap();
      await handleFetchFeed();
      Alert.alert("Obrigado", "Denúncia enviada com sucesso.");
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Não foi possível enviar.");
    } finally {
      setSendingReport(false);
    }
  };

  const handleBuscarDesvio = async () => {
    setAlertaPerigo(null);
    await handleSecureRoute();
  };

  const mapRegion =
    location && {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

  const renderFeedItem = ({ item }: { item: FeedItem }) => (
    <View style={styles.feedItem}>
      <View style={styles.feedHeader}>
        <Ionicons name="alert-circle" size={20} color="#f4511e" />
        <Text style={styles.feedType}>{item.tipo}</Text>
      </View>
      {item.descricao ? (
        <Text style={styles.feedDescription}>{item.descricao}</Text>
      ) : null}
      <Text style={styles.feedTimestamp}>
        {new Date(item.criadoEm).toLocaleTimeString()} • lat{" "}
        {item.latitude.toFixed(4)} | lon {item.longitude.toFixed(4)}
      </Text>
    </View>
  );

  return (
    <View style={styles.background}>
      <Header
        value={searchQuery}
        onChangeText={(val) => {
          setSearchQuery(val);
          setShowSuggestions(true);
          setSuppressSuggestions(false);
        }}
        onSubmit={handleSearchAddress}
        loading={searchingAddress}
        onFocus={() => {
          setSuppressSuggestions(false);
          setShowSuggestions(searchResults.length > 0);
        }}
      />
      {showSuggestions && !startNavVisible && searchResults.length > 0 && (
        <View style={styles.suggestionList}>
          <FlatList
            data={searchResults}
            keyExtractor={(item, idx) => `${item.display_name}-${idx}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleChooseSuggestion(item)}
              >
                <Ionicons
                  name="location"
                  size={16}
                  color="#f4511e"
                  style={{ marginRight: 8 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.suggestionTitle} numberOfLines={1}>
                    {item.display_name.split(",")[0]}
                  </Text>
                  <Text style={styles.suggestionSubtitle} numberOfLines={1}>
                    {item.display_name}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
      {mapRegion ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={mapRegion}
          showsUserLocation
          showsMyLocationButton
          onLongPress={(e) => handleSetDestination(e.nativeEvent.coordinate)}
        >
          {heatPoints.length > 0 && (
            <>
              <Heatmap
                points={heatPoints}
                radius={60}
                opacity={0.75}
                gradient={{
                  colors: ["#14a0ff", "#ffe992", "#ff7043", "#b71c1c"],
                  startPoints: [0.01, 0.25, 0.5, 1],
                  colorMapSize: 256,
                }}
              />
              {heatPoints.map((p, idx) => (
                <React.Fragment key={`${p.latitude}-${p.longitude}-${idx}`}>
                  <Circle
                    center={p}
                    radius={180 * Math.max(1, p.weight * 2)}
                    strokeColor={riskColor(p.weight)}
                    fillColor={`${riskColor(p.weight)}30`}
                    strokeWidth={2}
                  />
                  <Marker
                    coordinate={p}
                    pinColor={riskColor(p.weight)}
                    title={p.label || "Área monitorada"}
                    description={`Risco ${(p.weight * 100).toFixed(0)}%`}
                  />
                </React.Fragment>
              ))}
            </>
          )}

          {destination && (
            <Marker
              coordinate={destination}
              pinColor="#f4511e"
              title="Destino seguro"
              description="Pronto para iniciar"
            />
          )}

          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeColor="#0E9F6E"
              strokeWidth={6}
            />
          )}

          <Marker
            coordinate={{
              latitude: mapRegion.latitude,
              longitude: mapRegion.longitude,
            }}
            title="Você está aqui"
            flat
            rotation={location?.coords.heading || 0}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.userArrow}>
              <Ionicons name="navigate" size={28} color="#0E9F6E" />
            </View>
          </Marker>
        </MapView>
      ) : (
        <View style={styles.mapMock}>
          <Text style={styles.mapMockText}>
            {errorMsg || "Carregando localização..."}
          </Text>
          <ActivityIndicator color="#f4511e" style={{ marginTop: 8 }} />
        </View>
      )}

      <TabsNavigation
        onGuardiao={() => setStartNavVisible(true)}
        onRotas={() => setStartNavVisible(true)}
        onReporte={() => setReportVisible(true)}
        onFeed={() => {
          handleFetchFeed();
          setFeedVisible(true);
        }}
        onEstacione={() =>
          mapRegion &&
          mapRef.current?.animateToRegion(
            {
              ...mapRegion,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
            500
          )
        }
      />

      <TouchableOpacity
        style={styles.sosButton}
        onPress={() => Alert.alert("SOS", "Acionando contatos de emergência!")}
      >
        <Ionicons name="alert" size={28} color="#fff" />
        <Text style={styles.sosText}>SOS</Text>
      </TouchableOpacity>

      <Modal visible={reportVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reportar incidente</Text>
            <View style={styles.chipsContainer}>
              {["Assalto", "Poste Quebrado", "Atividade Suspeita"].map(
                (tipo) => (
                  <TouchableOpacity
                    key={tipo}
                    style={[
                      styles.chip,
                      reportType === tipo ? styles.chipSelected : null,
                    ]}
                    onPress={() => setReportType(tipo)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        reportType === tipo ? styles.chipTextSelected : null,
                      ]}
                    >
                      {tipo}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
            <TextInput
              placeholder="Detalhes rápidos (opcional)"
              style={styles.input}
              value={reportDescription}
              onChangeText={setReportDescription}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButtonGhost}
                onPress={() => setReportVisible(false)}
              >
                <Text style={styles.modalButtonGhostText}>Fechar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleSendDenuncia}
                disabled={sendingReport}
              >
                {sendingReport ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Enviar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!alertaPerigo} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.alertModal}>
            <Ionicons name="warning" size={36} color="#fff" />
            <Text style={styles.alertTitle}>PERIGO IMINENTE</Text>
            <Text style={styles.alertDescription}>
              {alertaPerigo || "Zona de risco detectada próximo"}
            </Text>
            <View style={styles.alertActions}>
              <TouchableOpacity
                style={styles.modalButtonGhost}
                onPress={() => setAlertaPerigo(null)}
              >
                <Text style={styles.modalButtonGhostText}>Fechar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleBuscarDesvio}
              >
                <Text style={styles.modalButtonText}>Buscar desvio</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={feedVisible} animationType="slide">
        <View style={styles.feedContainer}>
          <View style={styles.feedHeaderBar}>
            <Text style={styles.feedTitle}>Feed de segurança</Text>
            <TouchableOpacity onPress={() => setFeedVisible(false)}>
              <Ionicons name="close" size={24} color="#444" />
            </TouchableOpacity>
          </View>
          {loadingFeed ? (
            <ActivityIndicator style={{ marginTop: 20 }} color="#f4511e" />
          ) : (
            <FlatList
              data={feedItems}
              keyExtractor={(item) => item.id}
              renderItem={renderFeedItem}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }}
              ListEmptyComponent={
                <Text style={styles.feedEmpty}>Sem relatos recentes.</Text>
              }
            />
          )}
        </View>
      </Modal>

      <Modal visible={startNavVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Iniciar rota</Text>
            <Text style={styles.modalSub}>
              Escolha o tipo de rota e o meio de transporte
            </Text>
            <Text style={styles.modalLabel}>Preferência</Text>
            <View style={styles.chipsContainer}>
              {[
                { label: "Segura", value: "segura" as const },
                { label: "Rápida", value: "rapida" as const },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.chip,
                    routePreference === opt.value ? styles.chipSelected : null,
                  ]}
                  onPress={() => setRoutePreference(opt.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      routePreference === opt.value
                        ? styles.chipTextSelected
                        : null,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Transporte</Text>
            <View style={styles.chipsContainer}>
              {[
                { label: "Carro", value: "carro" as const, icon: "car" },
                { label: "Moto", value: "moto" as const, icon: "bicycle" },
                { label: "Ônibus", value: "onibus" as const, icon: "bus" },
                { label: "A pé", value: "pe" as const, icon: "walk" },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.chip,
                    transportMode === opt.value ? styles.chipSelected : null,
                  ]}
                  onPress={() => setTransportMode(opt.value)}
                >
                  <Ionicons
                    name={opt.icon as any}
                    size={16}
                    color={
                      transportMode === opt.value ? "#fff" : "#f4511e"
                    }
                  />
                  <Text
                    style={[
                      styles.chipText,
                      transportMode === opt.value
                        ? styles.chipTextSelected
                        : null,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButtonGhost}
                onPress={() => setStartNavVisible(false)}
              >
                <Text style={styles.modalButtonGhostText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setStartNavVisible(false);
                  setNavigationActive(true);
                  handleSecureRoute();
                }}
                disabled={loadingRoute}
              >
                {loadingRoute ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Iniciar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
