import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

import styles from "../styles/menu";
import Header from "../componentes/Header";

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permissão de localização negada");
        return;
      }

      
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  const handleSOS = () => {
    Alert.alert(
      "SOS Acionado",
      "Seus contatos de emergência serão notificados!",
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.background}>
      <Header />

      
      {location ? (
        <MapView
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Você está aqui"
          />
        </MapView>
      ) : (
        <View style={styles.mapMock}>
          <Text style={styles.mapMockText}>
            {errorMsg || "Carregando localização..."}
          </Text>
        </View>
      )}

      
      <TouchableOpacity style={styles.sosButton} onPress={handleSOS}>
        <Ionicons name="alert" size={28} color="#fff" />
        <Text style={styles.sosText}>SOS</Text>
      </TouchableOpacity>


    </View>
  );
}