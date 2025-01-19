import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    
    <ImageBackground
      source={require('../assets/1.jpg')} 
      style={styles.container}
    >
      <Text style={styles.title}>Welcome to the Banking App</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Register")}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    resizeMode:"cover",
    height:"110%",
    width:"100%", 
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 20,
    color: "#ff", 
  },
  button: { 
    backgroundColor: "#2196F3", 
    padding: 10, 
    borderRadius: 5, 
    marginVertical: 10,
  },
  buttonText: { 
    color: "#fff", 
    fontWeight: "bold",
  },
});
