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
import { getHotels } from "../services/hotelService";
import type { HotelType } from "../types/HotelType";
import "./HotelSearchPage.css";
import { formatRupiah } from "../Utils/formatCurrency";

// Helper: ambil harga termurah dari daftar rooms milik hotel.
// HotelType tidak punya field price/priceValue sendiri, jadi dihitung dari rooms[].
const getLowestPrice = (hotel: HotelType): number => {
  if (!hotel.rooms || hotel.rooms.length === 0) return 0;
  return Math.min(...hotel.rooms.map((r) => r.price));
};

const HotelSearchPage: React.FC = () => {
  // State untuk melacak ID hotel mana saja yang disukai
  const [favorites, setFavorites] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recommended");

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const [minPrice, setMinPrice] = useState<string>("0");
  const [maxPrice, setMaxPrice] = useState<string>("10000000");

  // State untuk menyimpan data dari API dan status loading
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const params = new URLSearchParams(window.location.search);

  const locationParam = params.get("location") || "";

  // STATE PAGINASI
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6; // Menampilkan 6 hotel per halaman agar paginasinya terlihat

  // Mengambil data saat halaman pertama kali dirender
  useEffect(() => {
    const fetchHotelData = async () => {
      setIsLoading(true);

      try {
        const data = await getHotels();

        setHotels(data as HotelType[]);

        if (locationParam) {
          setSearchTerm(locationParam);
        }
      } catch (error) {
        console.error("Gagal mengambil data hotel", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotelData();
  }, [locationParam]);

  const toggleFavorite = (id: number) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((favId) => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const handleAmenityChange = (amenity: string) => {
    setCurrentPage(1);
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(
        selectedAmenities.filter((item) => item !== amenity),
      );
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedAmenities([]);
    setSortBy("recommended");
    setMinPrice("0");
    setMaxPrice("10000000");
    setCurrentPage(1);
  };
  const filteredHotels = hotels
    .filter((hotel) => {
      const matchSearch =
        hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchAmenities =
        selectedAmenities.length === 0 ||
        selectedAmenities.every((amenity) => hotel.amenities.includes(amenity));

      const min = minPrice === "" ? 0 : Number(minPrice);
      const max = maxPrice === "" ? Infinity : Number(maxPrice);

      const lowestPrice = getLowestPrice(hotel);
      const matchPrice = lowestPrice >= min && lowestPrice <= max;

      return matchSearch && matchPrice && matchAmenities;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") {
        return getLowestPrice(a) - getLowestPrice(b);
      }

      if (sortBy === "rating") {
        return b.rating - a.rating;
      }

      return 0;
    });

  const indexOfLastItem = currentPage * itemsPerPage;

  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentHotels = filteredHotels.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);

  return (
    <>
      <Navbar />

      <div className="hotel-search-wrapper">
        <div className="hotel-main-container">
          {/* KIRI: SIDEBAR FILTER */}
          <aside className="hotel-sidebar">
            <div className="sidebar-header">
              <h3 className="sidebar-title">Filter</h3>
              <button className="btn-reset" onClick={handleReset}>
                Reset
              </button>
            </div>

            <div className="filter-section">
              <span className="filter-label">Cari Hotel</span>

              <input
                className="search-hotel-input"
                type="text"
                placeholder="Cari hotel..."
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
              <span className="filter-label">Fasilitas Hotel</span>

              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes("pool")}
                  onChange={() => handleAmenityChange("pool")}
                />
                Kolam Renang
              </label>

              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes("wifi")}
                  onChange={() => handleAmenityChange("wifi")}
                />
                WiFi Gratis
              </label>

              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes("gym")}
                  onChange={() => handleAmenityChange("gym")}
                />
                Pusat Kebugaran
              </label>

              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes("restaurant")}
                  onChange={() => handleAmenityChange("restaurant")}
                />
                Restoran
              </label>

              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes("parking")}
                  onChange={() => handleAmenityChange("parking")}
                />
                Parkir Gratis
              </label>
            </div>

            {/* Filter Fasilitas Hotel */}
          </aside>

          {/* KANAN: KONTEN HASIL PENCARIAN */}
          <main className="hotel-results-content">
            <div className="results-header-block">
              <div className="results-title-group">
                <h4>Hasil Pencarian</h4>
                <h1>
                  {searchTerm
                    ? `Hotel di ${searchTerm}`
                    : "Luxury Stays di Indonesia"}
                </h1>
              </div>
              <div className="sort-group">
                <span>Urutkan:</span>
                <select
                  className="sort-select-hotel"
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
                  Mencari hotel terbaik untuk Anda...
                </h3>
              </div>
            ) : currentHotels.length === 0 ? (
              <div className="empty-state">
                <h3>Hotel tidak ditemukan</h3>
                <p>Coba ubah filter atau kata kunci pencarian.</p>
              </div>
            ) : (
              <div className="hotel-grid">
                {currentHotels.map((hotel) => (
                  <div className="hotel-card" key={hotel.id}>
                    <div className="card-img-wrapper">
                      {hotel.img && <img src={hotel.img} alt={hotel.name} />}

                      <button
                        className="btn-favorite"
                        onClick={() => toggleFavorite(hotel.id)}
                      >
                        {favorites.includes(hotel.id) ? (
                          <MdFavorite size={18} color="#7B3FE4" />
                        ) : (
                          <MdFavoriteBorder size={18} />
                        )}
                      </button>

                      <div className="rating-badge">
                        <MdStar size={14} />
                        {hotel.rating}
                      </div>
                    </div>

                    <div className="card-body">
                      <h3 className="hotel-name">{hotel.name}</h3>

                      <div className="hotel-location">
                        <MdLocationOn size={14} />
                        <span>{hotel.location}</span>
                      </div>

                      <div className="card-footer">
                        <div className="price-info">
                          <p>Mulai dari</p>
                          <h3>{formatRupiah(getLowestPrice(hotel))}</h3>
                        </div>

                        <button
                          className="btn-lihat-kamar"
                          onClick={() => {
                            window.location.href = `/hotel-detail?id=${hotel.id}`;
                          }}
                        >
                          Lihat Kamar
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

export default HotelSearchPage;