import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome";

const API_URL = Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

export default function DashboardScreen() {
  const router = useRouter();

  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const userId = 1; 

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch(`${API_URL}/todos`);
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error("❌ Error fetching todos:", error);
    }
  };

  const addNote = async () => {
    if (!title.trim()) return;
    
    try {
      const response = await fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, title, description: details })
      });

      const data = await response.json();
      if (response.ok) {
        setNotes([...notes, { id: data.todoId, title, description: details }]);
        setTitle("");
        setDetails("");
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (error) {
      console.error("❌ Error adding todo:", error);
    }
  };

  const deleteNote = async (id) => {
    try {
      await fetch(`${API_URL}/todos/${id}`, { method: "DELETE" });
      setNotes(notes.filter((note) => note.id !== id));
    } catch (error) {
      console.error("❌ Error deleting todo:", error);
    }
  };

  const editNote = (note) => {
    router.push(`/note/${note.id}?title=${encodeURIComponent(note.title)}&description=${encodeURIComponent(note.description)}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowDropdown(!showDropdown)} style={styles.profileIcon}>
          <Icon name="user-circle" size={40} color="#333" />
        </TouchableOpacity>
        {showDropdown && (
          <View style={styles.dropdown}>
            <TouchableOpacity onPress={() => router.push("/settings")}>
              <Text style={styles.dropdownItem}>⚙ Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.replace("/")}>
              <Text style={styles.dropdownItem}>🚪 Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Text style={styles.title}>Dashboard - Notes</Text>

      <View style={styles.contentWrapper}>
        <TextInput style={styles.input} placeholder="Note Title" value={title} onChangeText={setTitle} />
        <TextInput style={[styles.input, styles.textArea]} placeholder="Details (Optional)" value={details} onChangeText={setDetails} multiline />
        
        <TouchableOpacity style={styles.button} onPress={addNote}>
          <Text style={styles.buttonText}>Add Note</Text>
        </TouchableOpacity>

        <FlatList
          data={notes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.noteItem}>
              <TouchableOpacity onPress={() => editNote(item)}>
                <Text style={styles.noteTitle}>{item.title}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteNote(item.id)}>
                <Text style={styles.deleteText}>🗑 Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No notes added yet.</Text>}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#F5F5F5",
  },
  header: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  profileIcon: {
    alignSelf: "flex-end",
  },
  dropdown: {
    position: "absolute",
    top: 50,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 120,
  },
  dropdownItem: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 60,
    marginBottom: 20,
    textAlign: "center",
  },
  contentWrapper: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    width: "100%",
    height: 45,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  noteItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  deleteText: {
    color: "red",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 20,
  },
});

