import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from './Header';

export default function Busqueda({ navigation }) {
  const [bookName, setBookName] = useState('');
  const [bookData, setBookData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    loadInitialBooks();
  }, []);

  const loadInitialBooks = () => {
    setLoading(true);
    const query = 'fiction';
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`;
    
    console.log(' Intentando cargar libros iniciales...');
    
    fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    })
      .then(response => {
        console.log(' Respuesta:', response.status);
        return response.json();
      })
      .then(data => {
        if (data.items) {
          console.log(` Libros cargados: ${data.items.length}`);
          setBookData(data.items);
        } else {
          console.log('Sin items en respuesta');
          setBookData([]);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('❌ Error:', error.message);
        setBookData([]);
        setLoading(false);
      });
  };

  const searchBooks = (query) => {
    if (!query.trim()) {
      Alert.alert(' Campo vacío', 'Por favor ingresa un término de búsqueda');
      return;
    }

    setLoading(true);
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`;
    
    console.log(' Buscando:', query);
    
    fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    })
      .then(response => {
        console.log('📡 Respuesta:', response.status);
        return response.json();
      })
      .then(data => {
        if (data.items) {
          console.log(` Encontrados ${data.items.length} libros`);
          setBookData(data.items);
        } else {
          console.log('Sin resultados');
          setBookData([]);
          Alert.alert('ℹ Sin resultados', 'No se encontraron libros con ese término');
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('❌ Error en búsqueda:', error.message);
        setLoading(false);
        Alert.alert('❌ Error', 'No se pudo conectar. Intenta de nuevo.');
      });
  };

  const handleSearch = () => {
    if (bookName.trim()) {
      searchBooks(bookName);
    }
  };

  const handleCardClick = (book) => {
    setSelectedBook(book);
    setShowModal(true);
  };

  const handleAddToGoal = () => {
    if (selectedBook) {
      setShowModal(false);
      navigation.navigate('Metas', { book: selectedBook });
    }
  };

  const renderBookCard = ({ item }) => {
    const thumbnail = item.volumeInfo?.imageLinks?.thumbnail;
    const title = item.volumeInfo?.title || 'Sin título';
    const authors = item.volumeInfo?.authors?.join(', ') || 'Autor desconocido';

    return (
      <TouchableOpacity
        style={styles.bookCard}
        onPress={() => handleCardClick(item)}
      >
        {thumbnail ? (
          <Image
            source={{ uri: thumbnail }}
            style={styles.bookCover}
          />
        ) : (
          <View style={styles.bookCoverPlaceholder}>
            <Ionicons name="book" size={40} color="#999" />
          </View>
        )}
        <Text style={styles.bookTitle} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {authors}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Buscar Libros" />

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={20} color="#58a6ff" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Busca un libro..."
            placeholderTextColor="#999"
            value={bookName}
            onChangeText={setBookName}
            onSubmitEditing={handleSearch}
          />
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="search" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Lista de libros */}
      {loading && bookData.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#58a6ff" />
          <Text style={styles.loadingText}>Cargando libros...</Text>
        </View>
      ) : bookData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={64} color="#666" />
          <Text style={styles.emptyText}>Busca un libro para comenzar</Text>
        </View>
      ) : (
        <FlatList
          data={bookData}
          keyExtractor={(item, idx) => `${item.id}-${idx}`}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={renderBookCard}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Modal de detalles */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Botón cerrar */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Ionicons name="close" size={28} color="#c9d1d9" />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Título */}
              <Text style={styles.modalTitle}>
                {selectedBook?.volumeInfo?.title}
              </Text>

              {/* Imagen */}
              {selectedBook?.volumeInfo?.imageLinks?.thumbnail ? (
                <Image
                  source={{
                    uri: selectedBook.volumeInfo.imageLinks.thumbnail,
                  }}
                  style={styles.modalBookCover}
                />
              ) : (
                <View style={styles.modalBookCoverPlaceholder}>
                  <Ionicons name="book" size={64} color="#999" />
                </View>
              )}

              {/* Detalles */}
              <View style={styles.modalDetails}>
                <Text style={styles.detailLabel}>Autor(es):</Text>
                <Text style={styles.detailText}>
                  {selectedBook?.volumeInfo?.authors?.join(', ') || 'Desconocido'}
                </Text>

                <Text style={styles.detailLabel}>Fecha de publicación:</Text>
                <Text style={styles.detailText}>
                  {selectedBook?.volumeInfo?.publishedDate || 'Desconocida'}
                </Text>

                <Text style={styles.detailLabel}>Editorial:</Text>
                <Text style={styles.detailText}>
                  {selectedBook?.volumeInfo?.publisher || 'Desconocida'}
                </Text>

                <Text style={styles.detailLabel}>Descripción:</Text>
                <Text style={styles.detailText}>
                  {selectedBook?.volumeInfo?.description || 'No disponible'}
                </Text>
              </View>

              {/* Botón agregar */}
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddToGoal}
              >
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Agregar a mis metas</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161b22',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#0d1117',
    gap: 10,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    backgroundColor: '#161b22',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    color: '#c9d1d9',
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#58a6ff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#8b949e',
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8b949e',
    marginTop: 15,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  columnWrapper: {
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  bookCard: {
    width: '45%',
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30363d',
    overflow: 'hidden',
  },
  bookCover: {
    width: 110,
    height: 170,
    borderRadius: 8,
    marginBottom: 10,
  },
  bookCoverPlaceholder: {
    width: 110,
    height: 170,
    borderRadius: 8,
    backgroundColor: '#0d1117',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  bookTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#58a6ff',
    textAlign: 'center',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 10,
    color: '#c9d1d9',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#161b22',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: '90%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#58a6ff',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalBookCover: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 15,
  },
  modalBookCoverPlaceholder: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    backgroundColor: '#0d1117',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalDetails: {
    marginVertical: 15,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#58a6ff',
    marginTop: 12,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#c9d1d9',
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: '#6a0dad',
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});