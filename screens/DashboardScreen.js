import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
} from "react-native";
import axios from "axios";

export default function DashboardScreen({ route }) {
  const { userId, userName } = route.params;
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [exchangeRates, setExchangeRates] = useState([]);
  const [activeTab, setActiveTab] = useState("balance");
  const [fundAmount, setFundAmount] = useState("");
  const [currencyBalances, setCurrencyBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [transactionAmount, setTransactionAmount] = useState(""); // State for input amount buy and selll
  const [selectedCurrency, setSelectedCurrency] = useState(null); // State for selected currency
  const [transactionType, setTransactionType] = useState(null); // Type of transaction buysell

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userResponse = await axios.get(`http://localhost:8000/users/${userId}`);
        setBalance(userResponse.data.balance || 0);

        const transactionsResponse = await axios.get(
          `http://localhost:8000/transactions/${userId}`
        );
        setTransactions(transactionsResponse.data || []);

        const ratesResponse = await axios.get(`http://localhost:8000/exchange-rates`);
        setExchangeRates(ratesResponse.data || []);
      } catch (error) {
        Alert.alert("Error", "Failed to fetch data.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFundAccount = async () => {
    if (!fundAmount || isNaN(fundAmount) || Number(fundAmount) <= 0) {
      return Alert.alert("Invalid Amount", "Please enter a valid amount to fund.");
    }
    try {
      const response = await axios.post("http://localhost:8000/fund-account", {
        userId,
        amount: parseFloat(fundAmount),
      });
      Alert.alert("Success", "Account funded successfully!");
      setBalance((prev) => prev + parseFloat(fundAmount));
      setFundAmount("");
    } catch (error) {
      Alert.alert("Error", "Failed to fund account.");
      console.error(error);
    }
  };

  const handleCurrencyTransaction = async (currency, rate) => {
    if (!transactionAmount || isNaN(transactionAmount) || Number(transactionAmount) <= 0) {
      return Alert.alert("Invalid Amount", "Please enter a valid amount.");
    }

    const amount = parseFloat(transactionAmount);

    if (transactionType === "buy") {
      if (amount * rate > balance) {
        return Alert.alert("Insufficient Balance", "You do not have enough funds.");
      }

      try {
        const response = await axios.post("http://localhost:8000/buy-currency", {
          userId,
          amount,
          currency,
        });
        if (response.data.success) {
          Alert.alert("Success", response.data.message);
          setBalance((prevBalance) => prevBalance - amount * rate);
          setCurrencyBalances((prevBalances) => ({
            ...prevBalances,
            [currency]: (prevBalances[currency] || 0) + amount,
          }));
        }
      } catch (error) {
        Alert.alert("Error", "Failed to buy currency.");
        console.error(error);
      }
    } else if (transactionType === "sell") {
      if ((currencyBalances[currency] || 0) < amount) {
        return Alert.alert("Insufficient Currency", "You do not have enough currency to sell.");
      }

      try {
        const response = await axios.post("http://localhost:8000/sell-currency", {
          userId,
          amount,
          currency,
        });
        if (response.data.success) {
          Alert.alert("Success", response.data.message);
          setBalance((prevBalance) => prevBalance + amount * rate);
          setCurrencyBalances((prevBalances) => ({
            ...prevBalances,
            [currency]: prevBalances[currency] - amount,
          }));
        }
      } catch (error) {
        Alert.alert("Error", "Failed to sell currency.");
        console.error(error);
      }
    }

    setSelectedCurrency(null); // Reset the selected currency
    setTransactionAmount(""); // Clear the input field
    setTransactionType(null); // Reset transaction type
  };

  const handleCurrencySelection = (currency, type) => {
    setSelectedCurrency(currency);
    setTransactionType(type);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "balance" && styles.activeTab]}
          onPress={() => setActiveTab("balance")}
        >
          <Text style={styles.tabText}>Balance</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "rates" && styles.activeTab]}
          onPress={() => setActiveTab("rates")}
        >
          <Text style={styles.tabText}>Exchange Rates</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "transactions" && styles.activeTab]}
          onPress={() => setActiveTab("transactions")}
        >
          <Text style={styles.tabText}>Transactions</Text>
        </TouchableOpacity>
      </View>

      {activeTab === "balance" && (
        <View style={styles.content}>
          <Text style={styles.title}>Welcome, {userName}</Text>
          <Text style={styles.balanceText}>Your PLN Balance: {balance.toFixed(2)} PLN</Text>
          {Object.keys(currencyBalances).map((currency) => (
            <Text key={currency} style={styles.balanceText}>
              Your {currency} Balance: {currencyBalances[currency].toFixed(2)}
            </Text>
          ))}
          <TextInput
            style={styles.input}
            placeholder="Enter amount to fund"
            keyboardType="numeric"
            value={fundAmount}
            onChangeText={setFundAmount}
          />
          <TouchableOpacity style={styles.button} onPress={handleFundAccount}>
            <Text style={styles.buttonText}>Fund Account</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === "rates" && (
        <FlatList
          data={exchangeRates}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => (
            <View style={styles.rateCard}>
              <Text style={styles.rateText}>{item.currency} ({item.code})</Text>
              <Text style={styles.rateText}>Rate: {item.mid.toFixed(2)}</Text>
              {selectedCurrency === item.code && transactionType ? (
                <View>
                  <TextInput
                    style={styles.input}
                    placeholder={`Enter amount to ${transactionType}`}
                    keyboardType="numeric"
                    value={transactionAmount}
                    onChangeText={setTransactionAmount}
                  />
                  <TouchableOpacity
                    style={[styles.button, styles.confirmButton]}
                    onPress={() => handleCurrencyTransaction(item.code, item.mid)}
                  >
                    <Text style={styles.buttonText}>Confirm {transactionType}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setSelectedCurrency(null)}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.buyButton]}
                    onPress={() => handleCurrencySelection(item.code, "buy")}
                  >
                    <Text style={styles.buttonText}>Buy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.sellButton]}
                    onPress={() => handleCurrencySelection(item.code, "sell")}
                  >
                    <Text style={styles.buttonText}>Sell</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}

      {activeTab === "transactions" && (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.transactionCard}>
              <Text style={styles.transactionText}>
                {item.type.toUpperCase()} {item.amount} {item.currency} on {item.date}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f8f8" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 18, color: "#555" },
  tabContainer: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  tabButton: { padding: 10, borderRadius: 5, backgroundColor: "#ddd" },
  activeTab: { backgroundColor: "#007bff" },
  tabText: { color: "#fff", fontWeight: "bold" },
  content: { alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  balanceText: { fontSize: 20, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10, marginBottom: 10, width: "80%" },
  button: { backgroundColor: "#007bff", padding: 10, borderRadius: 5, marginTop: 10 },
  cancelButton: { backgroundColor: "#dc3545", padding: 10, borderRadius: 5, marginTop: 10 },
  buttonText: { color: "#fff", fontWeight: "bold" },
  rateCard: { padding: 15, backgroundColor: "#fff", marginBottom: 10, borderRadius: 5 },
  rateText: { fontSize: 16, marginBottom: 5 },
  transactionCard: { padding: 15, backgroundColor: "#e0e0e0", marginBottom: 10, borderRadius: 5 },
  transactionText: { fontSize: 16 },
  buyButton: { backgroundColor: "#28a745", padding: 10, borderRadius: 5 },
});