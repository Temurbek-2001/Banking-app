import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import axios from "axios";

export default function TransactionsScreen({ route }) {
  const { userId } = route.params;
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/transactions/${userId}`);
        setTransactions(response.data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, []);

  //  Warsaw timezone
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
  
    
    const offset = 60; 
    const localDate = new Date(date.getTime() + offset * 60 * 1000);
  
    return localDate.toLocaleString("en-GB", {
      timeZone: "Europe/Warsaw", 
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transaction History</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.transactionItem}>
            <Text style={styles.transactionText}>
              {item.type === "fund" ? "Funded Account" : item.type === "buy" ? "Bought Currency" : "Sold Currency"}
            </Text>
            <Text style={styles.transactionText}>
              Amount: {item.amount} {item.currency}
            </Text>
            <Text style={styles.transactionText}>Date: {formatDateTime(item.date)}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No transactions yet!</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f7f7f7" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  transactionItem: { backgroundColor: "#e0e0e0", padding: 10, borderRadius: 10, marginBottom: 10 },
  transactionText: { fontSize: 16, color: "#333" },
  emptyText: { fontSize: 16, color: "#999", textAlign: "center", marginTop: 20 },
});
