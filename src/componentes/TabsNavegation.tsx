import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../stylesComponentes/TabsNavegation";

type Props = {
  onGuardiao?: () => void;
  onRotas?: () => void;
  onReporte?: () => void;
  onEstacione?: () => void;
  onFeed?: () => void;
};

export default function TabsNavegation({
  onGuardiao,
  onRotas,
  onReporte,
  onEstacione,
  onFeed,
}: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.tabButton} onPress={onGuardiao}>
        <Ionicons name="shield-checkmark" size={24} color="#f4511e" />
        <Text style={styles.tabText}>Guardião</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabButton} onPress={onRotas}>
        <Ionicons name="navigate" size={24} color="#f4511e" />
        <Text style={styles.tabText}>Rotas</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabButton} onPress={onReporte}>
        <Ionicons name="alert-circle" size={24} color="#f4511e" />
        <Text style={styles.tabText}>Reporte</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabButton} onPress={onFeed}>
        <Ionicons name="newspaper" size={24} color="#f4511e" />
        <Text style={styles.tabText}>Feed</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabButton} onPress={onEstacione}>
        <Ionicons name="car" size={24} color="#f4511e" />
        <Text style={styles.tabText}>Estacione</Text>
      </TouchableOpacity>
    </View>
  );
}
