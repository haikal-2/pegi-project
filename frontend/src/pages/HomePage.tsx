// src/pages/HomePage.tsx
import React, { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getDestinations } from "../services/destinationService";
import type { DestinationType } from "../types/DestinationType";
import { getHotels } from "../services/hotelService";
import type { HotelType } from "../types/HotelType";
import {
  MdOutlineHotel,
  MdDirectionsBus,
  MdOutlinePlace,
  MdLocationOn,
  MdDateRange,
  MdPeopleAlt,
  MdSearch,
  MdPersonAddAlt1,
  MdArrowForward,
  MdOutlinePersonOutline,
  MdOutlineChildCare,
  MdCategory,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
} from "react-icons/md";
import "./HomePage.css";

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Hotel");

  // State Popover Penumpang (Transportasi)
  const [showPassenger, setShowPassenger] = useState(false);
  const [adults, setAdults] = useState(1);
  const [infants, setInfants] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [partnerDate, setPartnerDate] = useState("");
  const [transportFrom, setTransportFrom] = useState("");
  const [transportTo, setTransportTo] = useState("");
  const [transportDate, setTransportDate] = useState("");

  // State Popover Tamu & Kamar (Hotel)
  const [showHotelGuests, setShowHotelGuests] = useState(false);
  const [hotelTamu, setHotelTamu] = useState(2);
  const [hotelKamar, setHotelKamar] = useState(1);
  const hotelGuestRef = useRef<HTMLDivElement>(null);
  const [hotelLocation, setHotelLocation] = useState("");
  const [showHotelSuggestions, setShowHotelSuggestions] = useState(false);
  const [hotelDate, setHotelDate] = useState("");
  const [hotels, setHotels] = useState<HotelType[]>([]);

  // State Popover Kategori Destinasi
  const partnerDestinationRef = useRef<HTMLDivElement>(null);
  const [showCategory, setShowCategory] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [destinationRegion, setDestinationRegion] = useState("Bali");
  const [destinationKeyword, setDestinationKeyword] = useState("");
  const [partnerDestination, setPartnerDestination] = useState("");
  const [showDestinationSuggestions, setShowDestinationSuggestions] =
    useState(false);

  const [allDestinations, setAllDestinations] = useState<DestinationType[]>([]);

  const [showRegion, setShowRegion] = useState(false);

  const regionRef = useRef<HTMLDivElement>(null);

  const regionsList = ["Bali", "Jawa", "Sumatra", "Sulawesi", "Papua"];
  const categoryRef = useRef<HTMLDivElement>(null);

  const categoriesList = ["Alam", "Budaya", "Kuliner", "Religi"];

  const destinationSuggestions = allDestinations
    .filter((destination) =>
      destination.name.toLowerCase().includes(partnerDestination.toLowerCase()),
    )
    .slice(0, 5);

  useEffect(() => {
    const fetchHotels = async () => {
      const data = await getHotels();
      setHotels(data);
    };

    fetchHotels();
  }, []);

  useEffect(() => {
    const fetchDestinations = async () => {
      const data = await getDestinations();
      setAllDestinations(data);
    };

    fetchDestinations();
  }, []);

  // Handle klik di luar untuk menutup semua popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setShowPassenger(false);
      }
      if (
        hotelGuestRef.current &&
        !hotelGuestRef.current.contains(event.target as Node)
      ) {
        setShowHotelGuests(false);
      }
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setShowCategory(false);
      }
      if (
        regionRef.current &&
        !regionRef.current.contains(event.target as Node)
      ) {
        setShowRegion(false);
      }
      if (
        partnerDestinationRef.current &&
        !partnerDestinationRef.current.contains(event.target as Node)
      ) {
        setShowDestinationSuggestions(false);
      }
      setShowHotelSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategoryChange = (category: string) => {
    if (category === "Semua") {
      setSelectedCategories([]);
      return;
    }
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const displayCategoryText =
    selectedCategories.length === 0
      ? "Semua Kategori"
      : selectedCategories.join(", ");

  const hotelSuggestions = hotels
    .filter((hotel) =>
      hotel.location.toLowerCase().includes(hotelLocation.toLowerCase()),
    )
    .slice(0, 5);

  return (
    <>
      <Navbar />
      <div className="home-wrapper">
        {/* 1. HERO SECTION */}
        <section className="hero-section">
          <h1 className="hero-title">Pegi Ke Mana Saja Tanpa Ragu</h1>

          <div className="hero-tabs">
            <button
              className={`hero-tab-btn ${activeTab === "Hotel" ? "active" : ""}`}
              onClick={() => setActiveTab("Hotel")}
            >
              <MdOutlineHotel size={18} /> Hotel
            </button>
            <button
              className={`hero-tab-btn ${activeTab === "Transport" ? "active" : ""}`}
              onClick={() => setActiveTab("Transport")}
            >
              <MdDirectionsBus size={18} /> Transportasi Darat
            </button>
            <button
              className={`hero-tab-btn ${activeTab === "Destinasi" ? "active" : ""}`}
              onClick={() => setActiveTab("Destinasi")}
            >
              <MdOutlinePlace size={18} /> Destinasi
            </button>
          </div>
        </section>

        {/* OVERLAPPING SEARCH WIDGET */}
        <div className="search-widget-container">
          {/* ================= MODE HOTEL ================= */}
          {activeTab === "Hotel" && (
            <div className="search-grid">
              <div className="search-field">
                <label className="search-label">Lokasi Tujuan</label>
                <div className="search-input-wrapper">
                  <MdLocationOn className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Cari kota atau hotel"
                    value={hotelLocation}
                    onChange={(e) => {
                      setHotelLocation(e.target.value);
                      setShowHotelSuggestions(true);
                    }}
                  />
                  {showHotelSuggestions &&
                    hotelLocation &&
                    hotelSuggestions.length > 0 && (
                      <div className="hotel-location-suggestions">
                        {hotelSuggestions.map((hotel) => (
                          <button
                            key={hotel.id}
                            type="button"
                            className="hotel-location-item"
                            onClick={() => {
                              setHotelLocation(hotel.location);
                              setShowHotelSuggestions(false);
                            }}
                          >
                            {hotel.location}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              </div>

              <div className="search-field">
                <label className="search-label">Check-in & Check-out</label>
                <div className="search-input-wrapper">
                  <MdDateRange className="search-icon" />
                  {/* Auto Date Picker */}
                  <input
                    type="date"
                    className="search-input"
                    value={hotelDate}
                    onChange={(e) => setHotelDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Field Tamu & Kamar dengan Popover (Baru) */}
              <div className="search-field" ref={hotelGuestRef}>
                <label className="search-label">Tamu & Kamar</label>
                <div
                  className="search-input-wrapper"
                  onClick={() => setShowHotelGuests(!showHotelGuests)}
                >
                  <MdPeopleAlt className="search-icon" />
                  <input
                    type="text"
                    className="search-input custom-select-input"
                    readOnly
                    value={`${hotelTamu} Tamu, ${hotelKamar} Kamar`}
                  />
                  {showHotelGuests ? (
                    <MdKeyboardArrowUp className="select-arrow" size={20} />
                  ) : (
                    <MdKeyboardArrowDown className="select-arrow" size={20} />
                  )}
                </div>

                {showHotelGuests && (
                  <div className="dropdown-popover passenger-dropdown">
                    <div className="passenger-row">
                      <div className="passenger-info">
                        <MdOutlinePersonOutline className="passenger-icon" />
                        <div className="passenger-text">
                          <h4>Tamu</h4>
                        </div>
                      </div>
                      <div className="passenger-controls">
                        <button
                          type="button"
                          className="control-btn"
                          onClick={() =>
                            setHotelTamu(Math.max(1, hotelTamu - 1))
                          }
                          disabled={hotelTamu <= 1}
                        >
                          -
                        </button>
                        <span className="passenger-count">{hotelTamu}</span>
                        <button
                          type="button"
                          className="control-btn"
                          onClick={() => setHotelTamu(hotelTamu + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="passenger-row">
                      <div className="passenger-info">
                        <MdOutlineHotel className="passenger-icon" />
                        <div className="passenger-text">
                          <h4>Kamar</h4>
                        </div>
                      </div>
                      <div className="passenger-controls">
                        <button
                          type="button"
                          className="control-btn"
                          onClick={() =>
                            setHotelKamar(Math.max(1, hotelKamar - 1))
                          }
                          disabled={hotelKamar <= 1}
                        >
                          -
                        </button>
                        <span className="passenger-count">{hotelKamar}</span>
                        <button
                          type="button"
                          className="control-btn"
                          onClick={() => setHotelKamar(hotelKamar + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      className="btn-selesai"
                      onClick={() => setShowHotelGuests(false)}
                    >
                      Selesai
                    </button>
                  </div>
                )}
              </div>

              <button
                className="btn-search"
                onClick={() => {
                  if (!hotelLocation.trim()) {
                    alert("Masukkan lokasi tujuan");
                    return;
                  }

                  window.location.href =
                    `/hotel-search?location=${encodeURIComponent(hotelLocation)}` +
                    `&date=${encodeURIComponent(hotelDate)}` +
                    `&guest=${hotelTamu}` +
                    `&room=${hotelKamar}`;
                }}
              >
                <MdSearch size={20} /> Cari Sekarang
              </button>
            </div>
          )}

          {/* ================= MODE TRANSPORTASI ================= */}
          {activeTab === "Transport" && (
            <div className="search-grid-transport">
              <div className="search-field">
                <label className="search-label">Terminal/Stasiun Asal</label>
                <div className="search-input-wrapper">
                  <MdDirectionsBus className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Berangkat dari mana?"
                    value={transportFrom}
                    onChange={(e) => setTransportFrom(e.target.value)}
                  />
                </div>
              </div>

              <div className="search-field">
                <label className="search-label">Kota Tujuan</label>
                <div className="search-input-wrapper">
                  <MdLocationOn className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Pergi ke mana?"
                    value={transportTo}
                    onChange={(e) => setTransportTo(e.target.value)}
                  />
                </div>
              </div>

              <div className="search-field">
                <label className="search-label">Tanggal Pergi</label>
                <div className="search-input-wrapper">
                  <MdDateRange className="search-icon" />
                  <input
                    type="date"
                    className="search-input"
                    value={transportDate}
                    onChange={(e) => setTransportDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="search-field" ref={popoverRef}>
                <label className="search-label">Jumlah Penumpang</label>
                <div
                  className="search-input-wrapper"
                  onClick={() => setShowPassenger(!showPassenger)}
                >
                  <MdPeopleAlt className="search-icon" />
                  <input
                    type="text"
                    className="search-input custom-select-input"
                    readOnly
                    value={`${adults} Dewasa, ${infants} Bayi`}
                  />
                  {showPassenger ? (
                    <MdKeyboardArrowUp className="select-arrow" size={20} />
                  ) : (
                    <MdKeyboardArrowDown className="select-arrow" size={20} />
                  )}
                </div>

                {showPassenger && (
                  <div className="dropdown-popover passenger-dropdown">
                    <div className="passenger-row">
                      <div className="passenger-info">
                        <MdOutlinePersonOutline className="passenger-icon" />
                        <div className="passenger-text">
                          <h4>Dewasa</h4>
                          <p>3 tahun ke atas</p>
                        </div>
                      </div>
                      <div className="passenger-controls">
                        <button
                          type="button"
                          className="control-btn"
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                          disabled={adults <= 1}
                        >
                          -
                        </button>
                        <span className="passenger-count">{adults}</span>
                        <button
                          type="button"
                          className="control-btn"
                          onClick={() => setAdults(adults + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="passenger-row">
                      <div className="passenger-info">
                        <MdOutlineChildCare className="passenger-icon" />
                        <div className="passenger-text">
                          <h4>Bayi</h4>
                          <p>Bawah 3 tahun</p>
                        </div>
                      </div>
                      <div className="passenger-controls">
                        <button
                          type="button"
                          className="control-btn"
                          onClick={() => setInfants(Math.max(0, infants - 1))}
                          disabled={infants <= 0}
                        >
                          -
                        </button>
                        <span className="passenger-count">{infants}</span>
                        <button
                          type="button"
                          className="control-btn"
                          onClick={() => setInfants(infants + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      className="btn-selesai"
                      onClick={() => setShowPassenger(false)}
                    >
                      Selesai
                    </button>
                  </div>
                )}
              </div>

              <button
                className="btn-search"
                onClick={() => {
                  window.location.href = `/transport-search?from=${encodeURIComponent(transportFrom)}&to=${encodeURIComponent(transportTo)}&date=${encodeURIComponent(transportDate)}&adult=${adults}`;
                }}
              >
                Cari Perjalanan
              </button>
            </div>
          )}

          {/* ================= MODE DESTINASI ================= */}
          {activeTab === "Destinasi" && (
            <div className="search-grid-destinasi">
              <div className="search-field" ref={categoryRef}>
                <label className="search-label">Kategori Wisata</label>

                <div
                  className="search-input-wrapper"
                  onClick={() => setShowCategory(!showCategory)}
                >
                  <MdCategory className="search-icon" />
                  <input
                    type="text"
                    className="search-input custom-select-input"
                    readOnly
                    value={displayCategoryText}
                  />
                  {showCategory ? (
                    <MdKeyboardArrowUp className="select-arrow" size={20} />
                  ) : (
                    <MdKeyboardArrowDown className="select-arrow" size={20} />
                  )}
                </div>

                {showCategory && (
                  <div className="dropdown-popover category-dropdown">
                    <label className="category-checkbox-item">
                      <input
                        type="checkbox"
                        checked={selectedCategories.length === 0}
                        onChange={() => handleCategoryChange("Semua")}
                      />
                      <span>Semua Kategori</span>
                    </label>

                    {categoriesList.map((cat) => (
                      <label key={cat} className="category-checkbox-item">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat)}
                          onChange={() => handleCategoryChange(cat)}
                        />
                        <span>{cat}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="search-field" ref={regionRef}>
                <label className="search-label">Wilayah</label>

                <div
                  className="search-input-wrapper"
                  onClick={() => setShowRegion(!showRegion)}
                >
                  <MdLocationOn className="search-icon" />

                  <input
                    type="text"
                    className="search-input custom-select-input"
                    readOnly
                    value={destinationRegion}
                  />

                  {showRegion ? (
                    <MdKeyboardArrowUp className="select-arrow" size={20} />
                  ) : (
                    <MdKeyboardArrowDown className="select-arrow" size={20} />
                  )}
                </div>

                {showRegion && (
                  <div className="dropdown-popover category-dropdown">
                    {regionsList.map((region) => (
                      <label key={region} className="category-checkbox-item">
                        <input
                          type="radio"
                          name="region"
                          checked={destinationRegion === region}
                          onChange={() => {
                            setDestinationRegion(region);
                            setShowRegion(false);
                          }}
                        />

                        <span>{region}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="search-field">
                <label className="search-label">Cari Destinasi Wisata</label>
                <div className="search-input-wrapper">
                  <MdOutlinePlace className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Mau liburan ke mana hari ini?"
                    value={destinationKeyword}
                    onChange={(e) => setDestinationKeyword(e.target.value)}
                  />
                </div>
              </div>

              <button
                className="btn-search"
                style={{ width: "100%" }}
                onClick={() => {
                  window.location.href = `/destination-search?region=${encodeURIComponent(
                    destinationRegion,
                  )}&search=${encodeURIComponent(
                    destinationKeyword,
                  )}&category=${encodeURIComponent(
                    selectedCategories.join(","),
                  )}`;
                }}
              >
                <MdSearch size={20} />
                Eksplor Sekarang
              </button>
            </div>
          )}
        </div>

        {/* 2. FEATURE SECTION */}
        <section className="feature-section">
          <div className="feature-image-wrapper">
            <img
              src=""
              alt="Teman Perjalanan"
              className="feature-img"
              style={{ backgroundColor: "#E5E7EB" }}
            />
            <div className="floating-card">
              <div className="floating-card-header">
                <div className="floating-icon">✌️</div>
                <span>1.2k+ Partner Tersedia</span>
              </div>
              <p className="floating-text">
                Temukan teman satu hobi untuk perjalanan yang lebih seru.
              </p>
            </div>
          </div>

          <div className="feature-content">
            <span className="badge-yellow">Fitur Eksklusif</span>
            <h2 className="feature-title">Cari Teman Perjalanan</h2>
            <p className="feature-desc">
              Jangan biarkan petualangan Anda terhambat karena tidak ada teman.
              Cari partner perjalanan yang memiliki minat dan destinasi yang
              sama dengan Anda secara aman dan mudah.
            </p>

            <div className="action-box">
              <div className="action-grid">
                <div
                  className="search-field partner-destination-field"
                  ref={partnerDestinationRef}
                >
                  <label className="search-label" style={{ fontSize: "12px" }}>
                    Destinasi Tujuan
                  </label>

                  <div className="search-input-wrapper">
                    <MdOutlinePlace className="search-icon" size={16} />

                    <input
                      type="text"
                      className="search-input"
                      style={{ backgroundColor: "#fff" }}
                      placeholder="Cari destinasi tujuan..."
                      value={partnerDestination}
                      onChange={(e) => {
                        setPartnerDestination(e.target.value);
                        setShowDestinationSuggestions(true);
                      }}
                    />
                  </div>

                  {showDestinationSuggestions &&
                    partnerDestination &&
                    destinationSuggestions.length > 0 && (
                      <div className="partner-destination-suggestions">
                        {destinationSuggestions.map((destination) => (
                          <button
                            key={destination.id}
                            type="button"
                            className="partner-destination-item"
                            onClick={() => {
                              setPartnerDestination(destination.name);
                              setShowDestinationSuggestions(false);
                            }}
                          >
                            {destination.name}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
                <div className="search-field">
                  <label className="search-label" style={{ fontSize: "12px" }}>
                    Tanggal Pergi
                  </label>
                  <div className="search-input-wrapper">
                    <MdDateRange className="search-icon" size={16} />
                    <input
                      type="date"
                      className="search-input"
                      style={{ backgroundColor: "#fff" }}
                      value={partnerDate}
                      onChange={(e) => setPartnerDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <button
                className="btn-partner"
                onClick={() => {
                  if (!partnerDestination.trim()) {
                    alert("Pilih destinasi terlebih dahulu");
                    return;
                  }

                  if (!partnerDate) {
                    alert("Pilih tanggal perjalanan");
                    return;
                  }

                  window.location.href = `/travel-partner?destination=${encodeURIComponent(
                    partnerDestination,
                  )}&date=${encodeURIComponent(partnerDate)}`;
                }}
              >
                <MdPersonAddAlt1 size={18} />
                Cari Partner
              </button>
            </div>

            <div className="stats-container">
              <div className="stat-item">
                <span className="stat-value">98%</span>
                <span className="stat-label">Partner Cocok</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-value">500+</span>
                <span className="stat-label">Komunitas</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. DESTINATION SECTION */}
        <section className="destination-section">
          <div className="dest-header">
            <div className="dest-title-wrap">
              <h2>Destinasi Populer</h2>
              <p>Eksplorasi keindahan nusantara dengan rute darat terbaik.</p>
            </div>
            <a href="/destinations" className="link-see-all">
              Lihat Semua <MdArrowForward />
            </a>
          </div>

          <div className="dest-grid">
            <div className="dest-card">
              <img
                src=""
                alt="Ubud Bali"
                style={{ backgroundColor: "#D1D5DB" }}
              />
              <div className="dest-overlay">
                <span className="dest-badge">Terpopuler</span>
                <h3 className="dest-name">Ubud, Bali</h3>
                <span className="dest-sub">Mulai dari Rp 850.000 / Malam</span>
              </div>
            </div>

            <div className="dest-card">
              <img
                src=""
                alt="Yogyakarta Kereta"
                style={{ backgroundColor: "#9CA3AF" }}
              />
              <div className="dest-overlay">
                <h3 className="dest-name">Yogyakarta</h3>
                <span className="dest-sub">Tiket Kereta & Hotel</span>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default HomePage;
