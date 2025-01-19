import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import axios from "axios";

export default function FundAccountScreen({ route, navigation }) {
  const { userId } = route.params;
  const [amount, setAmount] = useState("");

  const handleFundAccount = async () => {
    try {
      const response = await axios.post("http://localhost:8000/fund-account", {
        userId,
        amount: parseFloat(amount),
      });
      if (response.data.success) {
        Alert.alert("Success", "Account funded successfully.");
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fund account.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fund Account</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <TouchableOpacity style={styles.button} onPress={handleFundAccount}>
        <Text style={styles.buttonText}>Fund Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
