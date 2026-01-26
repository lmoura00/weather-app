import React, { useState, useMemo } from "react";
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
  Dimensions,
  Platform
} from "react-native";
import axios from "axios";
import * as Location from "expo-location";
import LottieView from "lottie-react-native";

const API_KEY = "5e7a7821bfcb7d18e0e21f6f82e794b6";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

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
  const [city, setCity] = useState<string>("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchWeather = async () => {
    if (!city.trim()) {
      Alert.alert("Erro", "Por favor, digite o nome de uma cidade.");
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      const response = await axios.get(BASE_URL, {
        params: {
          q: city,
          appid: API_KEY,
          units: "metric",
          lang: "pt_br",
        },
      });
      setWeather(response.data);
    } catch (error: any) {
      console.error(error);
      setWeather(null);
      if (error.response?.status === 404) {
        Alert.alert("Não encontrado", "Cidade não encontrada.");
      } else {
        Alert.alert("Erro", "Falha ao buscar dados.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByLocation = async () => {
    setLoading(true);
    Keyboard.dismiss();
    setCity("");

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão negada",
          "A permissão para acessar a localização foi negada.",
        );
        setLoading(false);
        return;
      }

      const hasServices = await Location.hasServicesEnabledAsync();
      if (!hasServices) {
        Alert.alert(
          "GPS Desativado",
          "Por favor, ative a localização no seu dispositivo.",
        );
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }).catch(() => null);

      if (!location) {
        location = await Location.getLastKnownPositionAsync({});
      }

      if (!location) {
        Alert.alert("Erro", "Não foi possível obter a localização atual.");
        setLoading(false);
        return;
      }

      const { latitude, longitude } = location.coords;

      const response = await axios.get(BASE_URL, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: API_KEY,
          units: "metric",
          lang: "pt_br",
        },
      });

      setWeather(response.data);
      setCity(response.data.name);
    } catch (error: any) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível obter os dados da localização.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getWindDirection = (deg: number) => {
    const directions = ["N", "NE", "L", "SE", "S", "SO", "O", "NO"];
    const index = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 45) % 8;
    return directions[index];
  };

  const getWeatherAnimation = (main: string, isDay: boolean) => {
    if (isDay) {
      switch (main) {
        case "Clear":
          return require("./assets/day-clear-sky.json");
        case "Clouds":
          return require("./assets/day-few-clouds.json");
        case "Rain":
          return require("./assets/day-rain.json");
        case "Drizzle":
          return require("./assets/day-shower-rains.json");
        case "Thunderstorm":
          return require("./assets/day-thunderstorm.json");
        case "Snow":
          return require("./assets/day-snow.json");
        case "Mist":
          return require("./assets/day-mist.json");
        case "Smoke":
        case "Haze":
        case "Dust":
        case "Fog":
        case "Sand":
        case "Ash":
        case "Squall":
        case "Tornado":
        default:
          return require("./assets/day-few-clouds.json");
      }
    } else {
      switch (main) {
        case "Clear":
          return require("./assets/night-clear-sky-dark.json");
        case "Clouds":
          return require("./assets/night-few-clouds-dark.json");
        case "Rain":
          return require("./assets/night-rain.json");
        case "Drizzle":
          return require("./assets/night-shower-rains.json");
        case "Thunderstorm":
          return require("./assets/night-thunderstorm.json");
        case "Snow":
          return require("./assets/night-snow.json");
        case "Mist":
          return require("./assets/night-mist.json");
        case "Smoke":
        case "Haze":
        case "Dust":
        case "Fog":
        case "Sand":
        case "Ash":
        case "Squall":
        case "Tornado":
          return require("./assets/night-mist.json");
        default:
          return require("./assets/night-few-clouds-dark.json");
      }
    }
  };

  const isDay = weather
    ? weather.dt >= weather.sys.sunrise && weather.dt < weather.sys.sunset
    : false;

  const backgroundColor = isDay ? "#4ea1d3" : "#0f2027";

  // Gera estrelas aleatórias quando é noite
  const stars = useMemo(() => {
    if (isDay) return [];
    const { width, height } = Dimensions.get("window");
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * width,
      top: Math.random() * (height * 0.6), // Estrelas na parte superior
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.8 + 0.2,
    }));
  }, [isDay]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Elementos do Céu (Estrelas/Lua ou Nuvens) */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {!isDay ? (
          <>
            <View style={styles.moon} />
            {stars.map((star) => (
              <View
                key={star.id}
                style={{
                  position: "absolute",
                  left: star.left,
                  top: star.top,
                  width: star.size,
                  height: star.size,
                  borderRadius: star.size / 2,
                  backgroundColor: "#FFF",
                  opacity: star.opacity,
                }}
              />
            ))}
          </>
        ) : (
          <>
            <LottieView
              source={require("./assets/day-few-clouds.json")}
              autoPlay
              loop
              style={styles.bgCloud1}
            />
            <LottieView
              source={require("./assets/day-few-clouds.json")}
              autoPlay
              loop
              style={styles.bgCloud2}
            />
          </>
        )}
      </View>

      {/* Paisagem (Chão, Árvores e Arbustos) */}
      <View style={styles.landscape} pointerEvents="none">
        {/* Árvore Esquerda */}
        <View style={[styles.treeContainer, { left: 20, bottom: 60 }]}>
          <View style={[styles.treeFoliage, { backgroundColor: isDay ? "#558B2F" : "#1B3026" }]} />
          <View style={[styles.treeTrunk, { backgroundColor: isDay ? "#795548" : "#3E2723" }]} />
        </View>

        {/* Arbusto Esquerda */}
        <View style={[styles.bush, { left: 80, bottom: 60, backgroundColor: isDay ? "#689F38" : "#243B30" }]} />

        {/* Árvore Direita (Maior) */}
        <View style={[styles.treeContainer, { right: -10, bottom: 60 }]}>
          <View style={[styles.treeFoliage, { width: 80, height: 80, borderRadius: 40, backgroundColor: isDay ? "#558B2F" : "#1B3026" }]} />
          <View style={[styles.treeTrunk, { height: 60, width: 16, backgroundColor: isDay ? "#795548" : "#3E2723" }]} />
        </View>

        {/* Arbusto Direita */}
        <View style={[styles.bush, { right: 90, bottom: 60, width: 50, height: 30, backgroundColor: isDay ? "#689F38" : "#243B30" }]} />
        
        {/* Arbusto Pequeno Centro-Direita */}
        <View style={[styles.bush, { right: 150, bottom: 60, width: 30, height: 20, backgroundColor: isDay ? "#7CB342" : "#2E4838" }]} />

        {/* Chão */}
        <View style={[styles.ground, { backgroundColor: isDay ? "#8BC34A" : "#2E4838" }]} />
      </View>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weather App ⛈️</Text>

        <View style={styles.searchBar}>
          <TextInput
            style={styles.input}
            placeholder="Digite a cidade..."
            placeholderTextColor="#888"
            placeholderTextColor="#ddd"
            value={city}
            onChangeText={setCity}
            onSubmitEditing={fetchWeather}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={styles.locationButton}
            onPress={fetchWeatherByLocation}
          >
            <Text style={styles.searchButtonText}>📍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchButton} onPress={fetchWeather}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.searchButtonText}>🔎</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {weather ? (
          <>
            <View style={styles.mainInfo}>
              <Text style={styles.cityName}>
                {weather.name}, {weather.sys.country}
              </Text>
              <Text style={styles.date}>
                {new Date().toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </Text>

              <LottieView
                autoPlay
                loop
                style={styles.lottieIcon}
                source={getWeatherAnimation(weather.weather[0].main, isDay)}
              />

              <Text style={styles.temp}>{Math.round(weather.main.temp)}°</Text>
              <Text style={styles.weatherDescription}>
                {weather.weather[0].description.charAt(0).toUpperCase() +
                  weather.weather[0].description.slice(1)}
              </Text>

              <View style={styles.minMaxContainer}>
                <Text style={styles.minMaxText}>
                  Min: {Math.round(weather.main.temp_min)}°
                </Text>
                <Text style={styles.minMaxText}>
                  Max: {Math.round(weather.main.temp_max)}°
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Detalhes do Clima</Text>
            <View style={styles.grid}>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Sensação Térmica</Text>
                <Text style={styles.cardValue}>
                  {Math.round(weather.main.feels_like)}°C
                </Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>Umidade</Text>
                <Text style={styles.cardValue}>{weather.main.humidity}%</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>Vento</Text>
                <Text style={styles.cardValue}>{weather.wind.speed} m/s</Text>
                <Text style={styles.cardSubValue}>
                  {getWindDirection(weather.wind.deg)} ({weather.wind.deg}°)
                </Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>Pressão</Text>
                <Text style={styles.cardValue}>
                  {weather.main.pressure} hPa
                </Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>Visibilidade</Text>
                <Text style={styles.cardValue}>
                  {(weather.visibility / 1000).toFixed(1)} km
                </Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>Nuvens</Text>
                <Text style={styles.cardValue}>{weather.clouds.all}%</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>Nascer do Sol 🌅</Text>
                <Text style={styles.cardValue}>
                  {formatTime(weather.sys.sunrise)}
                </Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>Pôr do Sol 🌇</Text>
                <Text style={styles.cardValue}>
                  {formatTime(weather.sys.sunset)}
                </Text>
              </View>
            </View>

            <View style={styles.footerInfo}>
              <Text style={styles.footerText}>
                Coord: {weather.coord.lat}, {weather.coord.lon}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>
              Pesquise uma cidade para ver a previsão do tempo
            </Text>
            <LottieView
              autoPlay
              loop
              style={styles.lottieIcon}
              source={require("./assets/weather-icon.json")}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "#fff",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 10,
  },
  locationButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 12,
    borderRadius: 25,
    width: 50,
    alignItems: "center",
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    padding: 12,
    borderRadius: 25,
    width: 50,
    alignItems: "center",
  },
  searchButtonText: {
    fontSize: 18,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mainInfo: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  cityName: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  date: {
    fontSize: 18,
    color: "#eee",
    marginTop: 5,
    textTransform: "capitalize",
    fontWeight: "500",
  },
  lottieIcon: {
    width: 250,
    height: 250,
  },
  temp: {
    fontSize: 90,
    fontWeight: "200",
    color: "#fff",
    marginTop: -10,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  weatherDescription: {
    fontSize: 22,
    color: "#fff",
    textTransform: "capitalize",
    marginBottom: 10,
    fontWeight: "500",
  },
  minMaxContainer: {
    flexDirection: "row",
    gap: 20,
  },
  minMaxText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "600",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    width: (width - 50) / 2,
    padding: 20,
    borderRadius: 25,
    marginBottom: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  cardLabel: {
    color: "#eee",
    fontSize: 14,
    marginBottom: 5,
    fontWeight: "500",
  },
  cardValue: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  cardSubValue: {
    color: "#ddd",
    fontSize: 12,
    marginTop: 2,
  },
  footerInfo: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 12,
  },
  placeholderContainer: {
    marginTop: 100,
    alignItems: "center",
    padding: 40,
  },
  placeholderText: {
    color: "#fff",
    fontSize: 20,
    textAlign: "center",
    fontWeight: "600",
    opacity: 0.8,
  },
  moon: {
    position: "absolute",
    top: 80,
    right: 30,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FEFCD7", // Amarelo pálido
    shadowColor: "#FEFCD7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  landscape: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  treeContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  treeFoliage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: -15, // Sobrepõe levemente o tronco
    zIndex: 2,
  },
  treeTrunk: {
    width: 12,
    height: 40,
    zIndex: 1,
  },
  bush: {
    position: 'absolute',
    width: 40,
    height: 25,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  bgCloud1: {
    position: "absolute",
    top: 40,
    left: -40,
    width: 200,
    height: 200,
    opacity: 0.4,
  },
  bgCloud2: {
    position: "absolute",
    top: 120,
    right: -40,
    width: 220,
    height: 220,
    opacity: 0.4,
  },
});
