import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../stylesComponentes/Header";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  loading?: boolean;
  onFocus?: () => void;
};

export default function Header({
  value,
  onChangeText,
  onSubmit,
  loading,
  onFocus,
}: Props) {
  const handleSubmit = (
    e?: NativeSyntheticEvent<TextInputSubmitEditingEventData>
  ) => {
    e?.preventDefault();
    onSubmit();
  };

  return (
    <View style={styles.headerView}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#888" />
        <TextInput
          placeholder="Para onde vamos? (endereço ou ponto)"
          placeholderTextColor="#888"
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
          onSubmitEditing={handleSubmit}
          onFocus={onFocus}
        />
        <TouchableOpacity onPress={onSubmit} disabled={loading}>
          <Ionicons
            name={loading ? "time" : "arrow-forward"}
            size={20}
            color="#f4511e"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.profileButton}>
        <Ionicons name="person-outline" size={24} color="#444" />
      </TouchableOpacity>
    </View>
  );
}
