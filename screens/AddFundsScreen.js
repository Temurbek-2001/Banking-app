import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import axios from "axios";

export default function AddFundsScreen({ route, navigation }) {
  const { userId } = route.params;
  const [amount, setAmount] = useState("");

  const handleAddFunds = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid amount.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/fund-account", {
        userId,
        amount: Number(amount),
      });

      if (response.data.success) {
        Alert.alert("Success", response.data.message, [
          { text: "OK", onPress: () => navigation.navigate("Dashboard") },
        ]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add funds. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Funds</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <TouchableOpacity style={styles.button} onPress={handleAddFunds}>
        <Text style={styles.buttonText}>Add Funds</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#f7f7f7" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10, marginBottom: 10 },
  button: { backgroundColor: "#007bff", padding: 15, borderRadius: 5, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
