import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
  Modal,
} from "react-native";

export default function DashboardScreen({ route }) {
  

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [transactionType, setTransactionType] = useState(""); //buy or sel
  const [amount, setAmount] = useState(""); // User input for amount

  // Open the modal for Buy/Sell
  const openTransactionModal = (currency, type) => {
    setSelectedCurrency(currency);
    setTransactionType(type);
    setModalVisible(true);
  };

  // Handle Buy/Sell Currency
  const handleTransaction = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return Alert.alert("Invalid Amount", "Please enter a valid amount.");
    }

    try {
      const endpoint =
        transactionType === "buy"
          ? "http://localhost:8000/buy-currency"
          : "http://localhost:8000/sell-currency";

      const response = await axios.post(endpoint, {
        userId,
        amount: parseFloat(amount),
        currency: selectedCurrency,
      });

      Alert.alert("Success", response.data.message);
      setBalance(response.data.newBalance || 0); // Update balance safely
      const updatedTransactions = await axios.get(
        `http://localhost:8000/transactions/${userId}`
      );
      setTransactions(updatedTransactions.data || []); // Update transactions
    } catch (error) {
      Alert.alert("Error", `Failed to ${transactionType} currency.`);
      console.error(error);
    } finally {
      setModalVisible(false);
      setAmount(""); // Clear the amount field
    }
  };

  

  return (
    <View style={styles.container}>
      {/* Modal for Buy/Sell */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {transactionType === "buy" ? "Buy" : "Sell"} {selectedCurrency}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter amount"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buyButton]}
                onPress={handleTransaction}
              >
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Exchange Rates Tab */}
      {activeTab === "rates" && (
        <FlatList
          data={exchangeRates}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => (
            <View style={styles.rateCard}>
              <Text style={styles.rateText}>
                {item.currency} ({item.code})
              </Text>
              <Text style={styles.rateText}>Rate: {item.mid}</Text>
              <View style={styles.rateButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.buyButton]}
                  onPress={() => openTransactionModal(item.code, "buy")}
                >
                  <Text style={styles.buttonText}>Buy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.sellButton]}
                  onPress={() => openTransactionModal(item.code, "sell")}
                >
                  <Text style={styles.buttonText}>Sell</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f8f8" },
  rateCard: { padding: 15, backgroundColor: "#fff", marginBottom: 10, borderRadius: 5, },
  rateText: { fontSize: 16, marginBottom: 5 , color:"black"},
  rateButtons: { flexDirection: "row", justifyContent: "space-around" },
  button: { padding: 10, borderRadius: 5 },
  buyButton: { backgroundColor: "#28a745" },
  sellButton: { backgroundColor: "#dc3545" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "black",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    color:"black",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: "100%",
    color:"black",
  },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  cancelButton: { backgroundColor: "#dc3545" },
});

