import { useLocalSearchParams, useRouter } from "expo-router";
import { View, TextInput, TouchableOpacity, Alert, Text, StyleSheet } from "react-native";
import { useState, useEffect } from "react";

export default function NoteDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
const API_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:5000" 
    : "http://localhost:5000"; 



  const [editedTitle, setEditedTitle] = useState("");
  const [editedDetails, setEditedDetails] = useState("");

  useEffect(() => {
    if (!id) return; 
  
    fetch(`${API_URL}/todos/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data || !data.title) {
          Alert.alert("Error", "Note not found!");
          router.back();
          return;
        }
        setEditedTitle(data.title || "");
        setEditedDetails(data.description || "");
      })
      .catch((error) => console.error("❌ Error fetching note:", error));
  }, [id]);
  

  const saveNote = async () => {
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editedTitle, description: editedDetails }),
      });

      if (response.ok) {
        router.replace("/dashboard");
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message);
      }
    } catch (error) {
      console.error("❌ Error updating note:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.header}>Edit Note</Text>

        <TextInput
          style={styles.input}
          value={editedTitle}
          onChangeText={setEditedTitle}
          placeholder="Enter Title"
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          value={editedDetails}
          onChangeText={setEditedDetails}
          placeholder="Enter Details"
          multiline
        />

        <TouchableOpacity style={styles.button} onPress={saveNote}>
          <Text style={styles.buttonText}>Save & Go Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#F5F5F5",
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    minHeight: 300,
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 45,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  cancelButton: {
    backgroundColor: "#aaa",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

