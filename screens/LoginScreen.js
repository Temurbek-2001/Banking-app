import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground } from "react-native";
import axios from "axios";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/login", {
        email,
        password,
      });

      if (response.status === 200) {
        const user = response.data;

        // Navigate to Dashboard with the user's data
        navigation.navigate("Dashboard", { userId: user.id, userName: user.name });
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        Alert.alert("Error", "Invalid credentials");
      } else {
        Alert.alert("Error", "Failed to login. Please try again.");
      }
    }
  };

  return (
   
    <ImageBackground
      source={require('../assets/2.jpg')} 
      style={styles.container}
    >
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.link}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.linkText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    padding: 20, 
    resizeMode: "cover",
    height:"110%",
    width:"110%", 
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 20,
    color: "#fff", 
  },
  input: { 
    borderWidth: 1, 
    borderColor: "#ccc", 
    borderRadius: 5, 
    padding: 10, 
    marginBottom: 10,
    backgroundColor: "rgba(255, 255, 255, 0.7)", 
  },
  button: { 
    backgroundColor: "#007bff", 
    padding: 15, 
    borderRadius: 5, 
    alignItems: "center",
  },
  buttonText: { 
    color: "#fff", 
    fontWeight: "bold" 
  },
  link: { 
    marginTop: 15, 
    alignItems: "center" 
  },
  linkText: { 
    color: "#007bff", 
    fontSize: 16 
  },
});
