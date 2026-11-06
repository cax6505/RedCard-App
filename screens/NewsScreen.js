import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Linking,
  Dimensions,
  RefreshControl,
  Share,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setCache, getCache } from "../utils/cache";
import { THEME } from "../constants/theme";
import { FALLBACK_NEWS } from "../utils/footballData";

const SCREEN_WIDTH = Dimensions.get("window").width;
const GNEWS_KEY = "49911c31e3d5302ae0e5740877008eb6";

const CATEGORIES = ["All", "Transfers", "Champions League", "Premier League", "Tactics", "Saved ⭐"];

export default function NewsScreen() {
  const [articles, setArticles] = useState([]);
  const [savedArticles, setSavedArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNews();
    loadSavedArticles();
  }, []);

  const loadSavedArticles = async () => {
    try {
      const stored = await AsyncStorage.getItem("redcard_saved_news");
      if (stored) setSavedArticles(JSON.parse(stored));
    } catch (err) {
      console.log("Error loading saved news:", err);
    }
  };

  const toggleSaveArticle = async (article) => {
    const isAlreadySaved = savedArticles.some((a) => a.title === article.title);
    const next = isAlreadySaved
      ? savedArticles.filter((a) => a.title !== article.title)
      : [...savedArticles, article];

    setSavedArticles(next);
    try {
      await AsyncStorage.setItem("redcard_saved_news", JSON.stringify(next));
    } catch (err) {
      console.log("Error saving news:", err);
    }
  };

  const handleShare = async (article) => {
    try {
      await Share.share({
        title: article.title,
        message: `${article.title} - Read more on RedCard: ${article.url}`,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const fetchNews = async () => {
    try {
      if (!refreshing) setLoading(true);

      const cached = await getCache("football_news_v2");
      if (cached && cached.length > 0 && !refreshing) {
        setArticles(cached);
        setLoading(false);
      }

      const url = `https://gnews.io/api/v4/search?q=football OR soccer OR premier league OR champions league OR transfer&lang=en&country=gb&max=20&apikey=${GNEWS_KEY}`;
      const res = await fetch(url);

      if (res.ok) {
        const data = await res.json();
        if (data.articles && data.articles.length > 0) {
          const processed = data.articles.map((a) => ({
            title: a.title,
            description: a.description || "",
            url: a.url,
            image: a.image || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
            source: a.source?.name || "Global Football",
            publishedAt: new Date(a.publishedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            category: a.title.toLowerCase().includes("transfer") ? "Transfers" : "Premier League",
          }));

          setArticles(processed);
          await setCache("football_news_v2", processed);
          return;
        }
      }

      // If GNews fails or quota reached, use fallback high quality curated news
      if (!articles.length) {
        setArticles(FALLBACK_NEWS);
      }
    } catch (err) {
      console.log("News fetch error, using curated football fallback:", err);
      if (!articles.length) {
        setArticles(FALLBACK_NEWS);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNews();
  };

  const filteredArticles = useMemo(() => {
    if (selectedCategory === "Saved ⭐") {
      return savedArticles;
    }
    if (selectedCategory === "All") {
      return articles.length ? articles : FALLBACK_NEWS;
    }
    const q = selectedCategory.toLowerCase();
    const source = articles.length ? articles : FALLBACK_NEWS;
    return source.filter(
      (a) =>
        a.category?.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q),
    );
  }, [articles, selectedCategory, savedArticles]);

  const featuredArticle = filteredArticles[0] || FALLBACK_NEWS[0];
  const listArticles = filteredArticles.slice(1);

  return (
    <LinearGradient colors={THEME.colors.gradientBackground} style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Navbar */}
        <View style={styles.topBar}>
          <View style={styles.brandContainer}>
            <View style={styles.brandIcon}>
              <Ionicons name="newspaper" size={17} color={THEME.colors.primary} />
            </View>
            <Text style={styles.brandTitle}>Football Gazette</Text>
          </View>

          <TouchableOpacity style={styles.circleBtn} onPress={onRefresh}>
            <Ionicons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Categories Ribbon */}
        <View style={styles.categoryRibbon}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catPill, isSelected && styles.activeCatPill]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.catText, isSelected && styles.activeCatText]}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Content List */}
        {loading && !refreshing ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={THEME.colors.primary} />
            <Text style={styles.loadingText}>Fetching breaking stories...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.mainScrollView}
            contentContainerStyle={styles.mainScrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={THEME.colors.primary}
              />
            }
          >
            {/* Hero Featured Article */}
            {featuredArticle && selectedCategory !== "Saved ⭐" && (
              <TouchableOpacity
                activeOpacity={0.88}
                style={styles.heroCard}
                onPress={() => featuredArticle.url && Linking.openURL(featuredArticle.url)}
              >
                <Image
                  source={{ uri: featuredArticle.image }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={["transparent", "rgba(8, 10, 15, 0.95)"]}
                  style={styles.heroGradient}
                >
                  <View style={styles.heroTopMeta}>
                    <View style={styles.breakingChip}>
                      <Text style={styles.breakingChipText}>FEATURED STORY</Text>
                    </View>
                    <View style={styles.heroActions}>
                      <TouchableOpacity
                        style={styles.miniActionBtn}
                        onPress={() => toggleSaveArticle(featuredArticle)}
                      >
                        <Ionicons
                          name={
                            savedArticles.some((a) => a.title === featuredArticle.title)
                              ? "bookmark"
                              : "bookmark-outline"
                          }
                          size={18}
                          color={THEME.colors.primary}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.miniActionBtn}
                        onPress={() => handleShare(featuredArticle)}
                      >
                        <Ionicons name="share-social-outline" size={18} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.heroTitle} numberOfLines={3}>
                    {featuredArticle.title}
                  </Text>
                  <Text style={styles.heroSource}>
                    {featuredArticle.source} • {featuredArticle.publishedAt}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Section Heading */}
            <View style={styles.listHeadingRow}>
              <Text style={styles.listHeadingTitle}>
                {selectedCategory === "Saved ⭐" ? "BOOKMARKED STORIES" : "LATEST HEADLINES"}
              </Text>
              <Text style={styles.listHeadingCount}>{filteredArticles.length} stories</Text>
            </View>

            {/* List Articles */}
            {listArticles.length > 0 || (selectedCategory === "Saved ⭐" && filteredArticles.length > 0) ? (
              (selectedCategory === "Saved ⭐" ? filteredArticles : listArticles).map((article, idx) => {
                const isSaved = savedArticles.some((a) => a.title === article.title);

                return (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.8}
                    style={styles.articleCard}
                    onPress={() => article.url && Linking.openURL(article.url)}
                  >
                    <Image source={{ uri: article.image }} style={styles.articleThumbnail} resizeMode="cover" />

                    <View style={styles.articleBody}>
                      <View style={styles.articleMetaRow}>
                        <Text style={styles.articleSource}>{article.source}</Text>
                        <Text style={styles.articleDate}>{article.publishedAt}</Text>
                      </View>

                      <Text style={styles.articleTitle} numberOfLines={2}>
                        {article.title}
                      </Text>

                      <View style={styles.articleBottomActions}>
                        <Text style={styles.readMoreText}>Read Story ›</Text>

                        <View style={styles.cardActionIcons}>
                          <TouchableOpacity
                            onPress={() => toggleSaveArticle(article)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Ionicons
                              name={isSaved ? "bookmark" : "bookmark-outline"}
                              size={16}
                              color={isSaved ? THEME.colors.primary : "rgba(255,255,255,0.4)"}
                            />
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => handleShare(article)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Ionicons name="share-social-outline" size={16} color="rgba(255,255,255,0.4)" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="bookmarks-outline" size={48} color="rgba(255,255,255,0.2)" />
                <Text style={styles.emptyTitle}>
                  {selectedCategory === "Saved ⭐" ? "No Saved Stories Yet" : "No Articles Available"}
                </Text>
                <Text style={styles.emptySub}>
                  {selectedCategory === "Saved ⭐"
                    ? "Bookmark articles while browsing to read them anytime."
                    : "Pull to refresh to get the latest football feed."}
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  centerLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
    marginTop: 12,
    fontWeight: "600",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(215, 252, 90, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#fff",
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryRibbon: {
    paddingVertical: 6,
    marginBottom: 6,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  catPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  activeCatPill: {
    backgroundColor: THEME.colors.primary,
  },
  catText: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.65)",
  },
  activeCatText: {
    color: "#080a0f",
    fontWeight: "900",
  },
  mainScrollView: { flex: 1 },
  mainScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 130,
  },

  // Hero Card
  heroCard: {
    height: 250,
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 18,
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: 16,
  },
  heroTopMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    top: 14,
    left: 14,
    right: 14,
  },
  breakingChip: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  breakingChipText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#080a0f",
  },
  heroActions: {
    flexDirection: "row",
    gap: 8,
  },
  miniActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#fff",
    lineHeight: 24,
  },
  heroSource: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.65)",
    marginTop: 6,
    fontWeight: "600",
  },

  listHeadingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 4,
  },
  listHeadingTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: THEME.colors.primary,
    letterSpacing: 0.8,
  },
  listHeadingCount: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.45)",
    fontWeight: "600",
  },

  // Article Card
  articleCard: {
    flexDirection: "row",
    backgroundColor: "rgba(22, 28, 40, 0.65)",
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  articleThumbnail: {
    width: 90,
    height: 90,
    borderRadius: 14,
  },
  articleBody: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  articleMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  articleSource: {
    fontSize: 11,
    fontWeight: "700",
    color: THEME.colors.primary,
  },
  articleDate: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.45)",
  },
  articleTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 18,
    marginVertical: 4,
  },
  articleBottomActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  readMoreText: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.6)",
  },
  cardActionIcons: {
    flexDirection: "row",
    gap: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 30,
    lineHeight: 18,
  },
});
