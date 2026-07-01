import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  MdLocationOn,
  MdStar,
  MdFavoriteBorder,
  MdFavorite,
  MdKeyboardArrowDown,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
} from "react-icons/md";
import { getDestinations } from "../services/destinationService";
import type { DestinationType } from "../types/DestinationType";
import "./DestinationSearchPage.css";
import { formatRupiah } from "../Utils/formatCurrency";
import { getWishlist, addWishlist, removeWishlist } from "../services/wishlistService";


const DestinationSearchPage: React.FC = () => {
  // State untuk melacak ID hotel mana saja yang disukai

  const params = new URLSearchParams(window.location.search);

  const initialRegion = params.get("region") || "";

  const initialSearch = params.get("search") || "";

  const initialCategory = params.get("category") || "";

  const [favorites, setFavorites] = useState<string[]>([]); // simpan itemId yang sudah di-wishlist
  const [wishlistMap, setWishlistMap] = useState<Record<string, string>>({}); // itemId -> wishlistId (untuk delete)
  const [favoriteLoading, setFavoriteLoading] = useState<string | null>(null); // cegah double-click
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [sortBy, setSortBy] = useState("recommended");

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? initialCategory.split(",") : [],
  );

  const [selectedRegion, setSelectedRegion] = useState(initialRegion);

  const handleCategoryChange = (category: string) => {
    setCurrentPage(1);

    if (selectedCategories.includes(category)) {
      setSelectedCategories(
        selectedCategories.filter((item) => item !== category),
      );
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const [minPrice, setMinPrice] = useState<string>("0");
  const [maxPrice, setMaxPrice] = useState<string>("10000000");

  // State untuk menyimpan data dari API dan status loading
  const [destinations, setDestinations] = useState<DestinationType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // STATE PAGINASI
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6; // Menampilkan 6 hotel per halaman agar paginasinya terlihat

  // Mengambil data saat halaman pertama kali dirender
  useEffect(() => {
    const fetchDestinationData = async () => {
      setIsLoading(true);
      try {
        const data = await getDestinations();

        setDestinations(data as DestinationType[]);
      } catch (error) {
        console.error("Gagal mengambil data destination", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDestinationData();
  }, []);

  useEffect(() => {
  const fetchWishlistData = async () => {
    try {
      const res = await getWishlist();
      const wishlistItems = res.data as Array<{ id: string; itemId: number | string }>;

      const favIds: string[] = [];
      const map: Record<string, string> = {};

      wishlistItems.forEach((w) => {
        const itemIdStr = String(w.itemId);
        favIds.push(itemIdStr);
        map[itemIdStr] = String(w.id);
      });

      setFavorites(favIds);
      setWishlistMap(map);
    } catch (error) {
      // Wajar gagal kalau user belum login — biarkan favorites tetap kosong
      console.warn("Gagal mengambil wishlist (mungkin belum login):", error);
    }
  };

  fetchWishlistData();
}, []);

  const toggleFavorite = async (destination: DestinationType) => {
  const itemIdStr = String(destination.id);

  if (favoriteLoading === itemIdStr) return; // cegah klik ganda saat masih proses
  setFavoriteLoading(itemIdStr);

  const isFavorited = favorites.includes(itemIdStr);

  try {
    if (isFavorited) {
      // Hapus dari wishlist
      const wishlistId = wishlistMap[itemIdStr];
      if (wishlistId) {
        await removeWishlist(wishlistId);
      }
      setFavorites((prev) => prev.filter((id) => id !== itemIdStr));
      setWishlistMap((prev) => {
        const updated = { ...prev };
        delete updated[itemIdStr];
        return updated;
      });
    } else {
      // Tambah ke wishlist
      const res = await addWishlist({
      itemId: destination.id,
      itemType: "destination",
      itemName: destination.name,
      itemImage: destination.image,
      itemLocation: destination.location,
    } as WishlistType);

      const newWishlistId = res.data?.wishlistId ?? res.data?.id;

      setFavorites((prev) => [...prev, itemIdStr]);
      if (newWishlistId) {
        setWishlistMap((prev) => ({ ...prev, [itemIdStr]: String(newWishlistId) }));
      }
    }
  } catch (error) {
    console.error("Gagal update wishlist:", error);
    alert("Gagal memperbarui wishlist. Pastikan kamu sudah login.");
  } finally {
    setFavoriteLoading(null);
  }
};

  const handleReset = () => {
    setSearchTerm("");
    setSortBy("recommended");
    setMinPrice("0");
    setMaxPrice("10000000");
    setCurrentPage(1);
    setSelectedCategories([]);
    setSelectedRegion("");
  };
  const filteredDestinations = destinations
    .filter((destination) => {
      const matchSearch = destination.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const min = minPrice === "" ? 0 : Number(minPrice);

      const max = maxPrice === "" ? Infinity : Number(maxPrice);

      const matchPrice =
        destination.priceValue >= min && destination.priceValue <= max;

      const matchCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(destination.category);

      const matchRegion =
        selectedRegion === "" || destination.region === selectedRegion;

      return matchSearch && matchPrice && matchCategory && matchRegion;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") {
        return a.priceValue - b.priceValue;
      }

      if (sortBy === "rating") {
        return b.rating - a.rating;
      }

      return 0;
    });

  const indexOfLastItem = currentPage * itemsPerPage;

  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentDestinations = filteredDestinations.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const totalPages = Math.ceil(filteredDestinations.length / itemsPerPage);

  return (
    <>
      <Navbar />
      <div className="destination-search-wrapper">
        <div className="destination-main-container">
          {/* KIRI: SIDEBAR FILTER */}
          <aside className="destination-sidebar">
            <div className="sidebar-header">
              <h3 className="sidebar-title">Filter</h3>
              <button className="btn-reset" onClick={handleReset}>
                Reset
              </button>
            </div>

            <div className="filter-section">
              <span className="filter-label">Cari Destinasi</span>

              <input
                className="search-destination-input"
                type="text"
                placeholder="Cari Destinasi..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="filter-section">
              <span className="filter-label">Harga</span>

              <div className="price-range-inputs">
                <div className="price-input-group">
                  <span>Rp</span>
                  <input
                    type="number"
                    value={minPrice}
                    placeholder="Min"
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                <div className="price-input-group">
                  <span>Rp</span>
                  <input
                    type="number"
                    value={maxPrice}
                    placeholder="Max"
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              <div className="price-preview">
                {formatRupiah(Number(minPrice || 0))}
                {maxPrice && ` - ${formatRupiah(Number(maxPrice))}`}
              </div>
            </div>

            {/* Filter Harga */}
            <div className="filter-section">
              <span className="filter-label">Kategori Wisata</span>

              {["Alam", "Budaya", "Kuliner", "Religi"].map((category) => (
                <label key={category} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                  />
                  {category}
                </label>
              ))}
            </div>

            <div className="filter-section">
              <span className="filter-label">Wilayah</span>

              {["Bali", "Jawa", "Sumatra", "Sulawesi", "Papua"].map(
                (region) => (
                  <label key={region} className="filter-checkbox">
                    <input
                      type="radio"
                      checked={selectedRegion === region}
                      onChange={() => {
                        setSelectedRegion(region);
                        setCurrentPage(1);
                      }}
                    />
                    {region}
                  </label>
                ),
              )}
            </div>

            {/* Filter Fasilitas Hotel */}
          </aside>

          {/* KANAN: KONTEN HASIL PENCARIAN */}
          <main className="destination-results-content">
            <div className="results-header-block">
              <div className="results-title-group">
                <h4>Hasil Pencarian</h4>
                <h1>
                  {selectedRegion
                    ? `Eksplorasi Destinasi di ${selectedRegion}`
                    : "Eksplorasi Destinasi Indonesia"}
                </h1>
              </div>
              <div className="sort-group">
                <span>Urutkan:</span>
                <select
                  className="sort-select-destination"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="recommended">Rekomendasi</option>

                  <option value="price-low">Harga Terendah</option>

                  <option value="rating">Rating Tertinggi</option>
                </select>
                <MdKeyboardArrowDown
                  size={18}
                  color="#6B7280"
                  style={{ marginLeft: "-4px" }}
                />
              </div>
            </div>

            {/* TAMPILAN LOADING & GRID KARTU HOTEL */}
            {isLoading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 0",
                  width: "100%",
                }}
              >
                <h3 style={{ color: "#6B7280" }}>
                  Mencari destinasi terbaik untuk Anda...
                </h3>
              </div>
            ) : currentDestinations.length === 0 ? (
              <div className="empty-state">
                <h3>Destinasi tidak ditemukan</h3>
                <p>Coba ubah filter atau kata kunci pencarian.</p>
              </div>
            ) : (
              <div className="destination-grid">
                {currentDestinations.map((destination) => (
                  <div className="destination-card" key={destination.id}>
                    <div className="card-img-wrapper">
                      <img src={destination.image} alt={destination.name} />
                      <div
                        className={`crowd-badge ${
                          destination.crowd === "Sepi" ? "quiet" : "busy"
                        }`}
                      >
                        {destination.crowd}
                      </div>

                      <button
                        className="btn-favorite"
                        onClick={() => toggleFavorite(destination)}
                        disabled={favoriteLoading === String(destination.id)}
                      >
                        {favorites.includes(String(destination.id)) ? (
                          <MdFavorite size={18} color="#7B3FE4" />
                        ) : (
                          <MdFavoriteBorder size={18} />
                        )}
                      </button>

                      <div className="rating-badge">
                        <MdStar size={14} />
                        {destination.rating}
                      </div>
                    </div>

                    <div className="card-body">
                      <h3 className="destination-name">{destination.name}</h3>

                      <div className="destination-location">
                        <MdLocationOn size={14} />
                        <span>{destination.location}</span>
                      </div>

                      <div className="card-footer">
                        <div className="price-info">
                          <p>Mulai dari</p>
                          <h3>{destination.price}</h3>
                        </div>

                        <button
                          className="btn-lihat-detail"
                          onClick={() =>
                            (window.location.href = `/destination-detail?id=${destination.id}`)
                          }
                        >
                          Lihat Detail
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Paginasi Bawah Dinamis */}
            {!isLoading && totalPages > 1 && (
              <div className="pagination-container">
                {/* Tombol Mundur (Prev) */}
                <button
                  className="page-btn"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  style={{
                    opacity: currentPage === 1 ? 0.5 : 1,
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  <MdKeyboardArrowLeft size={18} />
                </button>

                {/* Generate Tombol Angka Halaman Secara Otomatis */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      className={`page-btn ${currentPage === page ? "active" : ""}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ),
                )}

                {/* Tombol Maju (Next) */}
                <button
                  className="page-btn"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  style={{
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    cursor:
                      currentPage === totalPages ? "not-allowed" : "pointer",
                  }}
                >
                  <MdKeyboardArrowRight size={18} />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default DestinationSearchPage;
