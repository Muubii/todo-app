import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import Icon from "react-native-vector-icons/FontAwesome"; 

export default function SettingsScreen() {
  const router = useRouter();
  const API_URL =
    Platform.OS === "android"
      ? "http://10.0.2.2:5000" 
      : "http://localhost:5000"; 

  const userId = 1;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false); 

  useEffect(() => {
    fetch(`${API_URL}/profile/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setEmail(data.email || "");
      })
      .catch((error) => console.error("❌ Error fetching profile:", error));
  }, []);
  const updatePassword = async () => {
    if (!password) {
      Alert.alert("❌ Error", "Password cannot be empty!");
      return;
    }
  
    try {
      const response = await fetch(`${API_URL}/profile/password/${userId}`, { 
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }), 
      });
  
      const data = await response.json(); 
  
      if (response.ok) {
        Alert.alert("✅ Success", "Password updated successfully!");
        setIsEditing(false);
        setPassword(""); 
      } else {
        Alert.alert("❌ Error", data.message || "Failed to update password.");
      }
    } catch (error) {
      console.error("❌ Error updating password:", error);
      Alert.alert("❌ Error", "Something went wrong! Check your server.");
    }
  };
  

  const cancelEdit = () => {
    setIsEditing(false);
    setPassword(""); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Settings</Text>

      <View style={styles.emailContainer}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <View style={styles.passwordContainer}>
        <Text style={styles.label}>Change Password:</Text>
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter new password"
            secureTextEntry
            editable={isEditing}
          />
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Icon name="edit" size={20} color="#007BFF" />
          </TouchableOpacity>
        </View>
      </View>

      {isEditing && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={updatePassword}>
            <Text style={styles.buttonText}>Save Password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={cancelEdit}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  emailContainer: {
    width: "100%",
    maxWidth: 400,
    marginBottom: 20,
  },
  passwordContainer: {
    width: "100%",
    maxWidth: 400,
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    paddingVertical: 10,
    backgroundColor: "#EDEDED",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
  },
  input: {
    height: 45,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 400,
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "48%",
  },
  cancelButton: {
    backgroundColor: "#FF5C5C",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "48%",
  },
  backButton: {
    backgroundColor: "#aaa",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    maxWidth: 200,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
