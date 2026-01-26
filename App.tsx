import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Keyboard, 
  Alert,
  Image,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions
} from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location';
import LottieView from 'lottie-react-native';


const API_KEY = '5e7a7821bfcb7d18e0e21f6f82e794b6'; 
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';


interface WeatherData {
  coord: {
    lon: number;
    lat: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export default function App() {
  const [city, setCity] = useState<string>('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchWeather = async () => {
    if (!city.trim()) {
      Alert.alert('Erro', 'Por favor, digite o nome de uma cidade.');
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      const response = await axios.get(BASE_URL, {
        params: {
          q: city,
          appid: API_KEY,
          units: 'metric', 
          lang: 'pt_br'
        }
      });
      setWeather(response.data);
    } catch (error: any) {
      console.error(error);
      setWeather(null);
      if (error.response?.status === 404) {
        Alert.alert('Não encontrado', 'Cidade não encontrada.');
      } else {
        Alert.alert('Erro', 'Falha ao buscar dados.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByLocation = async () => {
    setLoading(true);
    Keyboard.dismiss();
    setCity(''); 

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'A permissão para acessar a localização foi negada.');
        setLoading(false);
        return;
      }

      const hasServices = await Location.hasServicesEnabledAsync();
      if (!hasServices) {
        Alert.alert('GPS Desativado', 'Por favor, ative a localização no seu dispositivo.');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }).catch(() => null);

      if (!location) {
        location = await Location.getLastKnownPositionAsync({});
      }

      if (!location) {
        Alert.alert('Erro', 'Não foi possível obter a localização atual.');
        setLoading(false);
        return;
      }

      const { latitude, longitude } = location.coords;

      const response = await axios.get(BASE_URL, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: API_KEY,
          units: 'metric',
          lang: 'pt_br'
        }
      });
      
      setWeather(response.data);
      setCity(response.data.name); 
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível obter os dados da localização.');
    } finally {
      setLoading(false);
    }
  };


  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('pt-BR', {
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const getWindDirection = (deg: number) => {
    const directions = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'];
    const index = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 45) % 8;
    return directions[index];
  };


  const getWeatherAnimation = (main: string, isDay: boolean) => {
    if (isDay) {
      switch (main) {
        case 'Clear': return require('./assets/day-clear-sky.json');
        case 'Clouds': return require('./assets/day-few-clouds.json');
        case 'Rain': return require('./assets/day-rain.json');
        case 'Drizzle': return require('./assets/day-shower-rains.json');
        case 'Thunderstorm': return require('./assets/day-thunderstorm.json');
        case 'Snow': return require('./assets/day-snow.json');
        case 'Mist': return require('./assets/day-mist.json');
        case 'Smoke':
        case 'Haze':
        case 'Dust':
        case 'Fog':
        case 'Sand':
        case 'Ash':
        case 'Squall':
        case 'Tornado': 
        default: return require('./assets/day-few-clouds.json');
      }
    } else {
      switch (main) {
        case 'Clear': return require('./assets/night-clear-sky-dark.json');
        case 'Clouds': return require('./assets/night-few-clouds-dark.json');
        case 'Rain': return require('./assets/night-rain.json');
        case 'Drizzle': return require('./assets/night-shower-rains.json');
        case 'Thunderstorm': return require('./assets/night-thunderstorm.json');
        case 'Snow': return require('./assets/night-snow.json');
        case 'Mist': 
        case 'Smoke':
        case 'Haze':
        case 'Dust':
        case 'Fog':
        case 'Sand':
        case 'Ash':
        case 'Squall':
        case 'Tornado': return require('./assets/night-mist.json');
        default: return require('./assets/night-few-clouds-dark.json');
      }
    }
  };

  // Determina se é dia ou noite com base nos dados da API (se existirem)
  const isDay = weather ? (weather.dt >= weather.sys.sunrise && weather.dt < weather.sys.sunset) : false;
  
  // Cores dinâmicas
  const backgroundColor = isDay ? '#5D9CEC' : '#121212'; // Azul claro para dia, Preto para noite
  const headerColor = isDay ? '#4A89DC' : '#1e1e1e';     // Azul um pouco mais escuro para o header de dia

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="light-content" backgroundColor={headerColor} />
      
      <View style={[styles.header, { backgroundColor: headerColor }]}>
        <Text style={styles.headerTitle}>Weather App ⛈️</Text>
        
        <View style={styles.searchBar}>
          <TextInput
            style={styles.input}
            placeholder="Digite a cidade..."
            placeholderTextColor="#888"
            value={city}
            onChangeText={setCity}
            onSubmitEditing={fetchWeather}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.locationButton} onPress={fetchWeatherByLocation}>
            <Text style={styles.searchButtonText}>📍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchButton} onPress={fetchWeather}>
            {loading ? <ActivityIndicator color="#FFF"/> : <Text style={styles.searchButtonText}>🔎</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {weather ? (
          <>
            {/* SEÇÃO PRINCIPAL */}
            <View style={styles.mainInfo}>
              <Text style={styles.cityName}>{weather.name}, {weather.sys.country}</Text>
              <Text style={styles.date}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
              
              <LottieView
                autoPlay
                loop
                style={styles.lottieIcon}
                source={getWeatherAnimation(weather.weather[0].main, isDay)}
              />
              
              <Text style={styles.temp}>{Math.round(weather.main.temp)}°</Text>
              <Text style={styles.weatherDescription}>
                {weather.weather[0].description.charAt(0).toUpperCase() + weather.weather[0].description.slice(1)}
              </Text>
              
              <View style={styles.minMaxContainer}>
                <Text style={styles.minMaxText}>Min: {Math.round(weather.main.temp_min)}°</Text>
                <Text style={styles.minMaxText}>Max: {Math.round(weather.main.temp_max)}°</Text>
              </View>
            </View>


            <Text style={styles.sectionTitle}>Detalhes do Clima</Text>
            <View style={styles.grid}>
              
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Sensação Térmica</Text>
                <Text style={styles.cardValue}>{Math.round(weather.main.feels_like)}°C</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>Umidade</Text>
                <Text style={styles.cardValue}>{weather.main.humidity}%</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>Vento</Text>
                <Text style={styles.cardValue}>
                  {weather.wind.speed} m/s
                </Text>
                <Text style={styles.cardSubValue}>{getWindDirection(weather.wind.deg)} ({weather.wind.deg}°)</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>Pressão</Text>
                <Text style={styles.cardValue}>{weather.main.pressure} hPa</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>Visibilidade</Text>
                <Text style={styles.cardValue}>{(weather.visibility / 1000).toFixed(1)} km</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>Nuvens</Text>
                <Text style={styles.cardValue}>{weather.clouds.all}%</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>Nascer do Sol 🌅</Text>
                <Text style={styles.cardValue}>{formatTime(weather.sys.sunrise)}</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>Pôr do Sol 🌇</Text>
                <Text style={styles.cardValue}>{formatTime(weather.sys.sunset)}</Text>
              </View>

            </View>
            
            <View style={styles.footerInfo}>
              <Text style={styles.footerText}>Coord: {weather.coord.lat}, {weather.coord.lon}</Text>
            </View>
          </>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>Digite uma cidade para ver os detalhes completos.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    backgroundColor: '#1e1e1e',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#2c2c2c',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 10,
  },
  locationButton: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    width: 50,
    alignItems: 'center',
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    width: 50,
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 18,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mainInfo: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  cityName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  date: {
    fontSize: 16,
    color: '#aaa',
    marginTop: 5,
    textTransform: 'capitalize',
  },
  lottieIcon: {
    width: 250,
    height: 250,
  },
  temp: {
    fontSize: 80,
    fontWeight: '300',
    color: '#fff',
    marginTop: -20,
  },
  weatherDescription: {
    fontSize: 20,
    color: '#ddd',
    textTransform: 'capitalize',
    marginBottom: 10,
  },
  minMaxContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  minMaxText: {
    fontSize: 18,
    color: '#ccc',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#2c2c2c',
    width: (width - 50) / 2, 
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  cardLabel: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 5,
  },
  cardValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardSubValue: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  footerInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#555',
    fontSize: 12,
  },
  placeholderContainer: {
    marginTop: 100,
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  }
});