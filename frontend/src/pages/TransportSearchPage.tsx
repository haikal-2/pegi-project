import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  MdDirectionsBus,
  MdTrain,
  MdAirportShuttle,
  MdKeyboardArrowDown,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
} from "react-icons/md";
import { MdWbSunny, MdLightMode, MdNightlight } from "react-icons/md";

import { getTransports } from "../services/transportService";
import type { TransportType } from "../types/TransportType";

import "./TransportSearchPage.css";

// Format "2024-10-24" -> "Kamis, 24 Okt 2024". Kalau tanggal kosong/invalid, balikin "-".
const formatTanggal = (dateStr: string): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const TransportSearchPage: React.FC = () => {
  const [transports, setTransports] = useState<TransportType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedTypes, setSelectedTypes] = useState<string[]>(["Bus"]);

  const [selectedTime, setSelectedTime] = useState("Siang");

  const [sortBy, setSortBy] = useState("price-low");

  const [showSort, setShowSort] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 4;

  // Baca query param dari URL hasil pencarian di HomePage (?from=...&to=...&date=...&adult=...)
  const params = new URLSearchParams(window.location.search);
  const fromParam = params.get("from") || "";
  const toParam = params.get("to") || "";
  const dateParam = params.get("date") || "";
  const adultParam = params.get("adult") || "1";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const data = await getTransports();

        setTransports(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTypeChange = (type: string) => {
    setCurrentPage(1);

    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((item) => item !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleReset = () => {
    setSelectedTypes([]);
    setSelectedTime("");
    setSortBy("price-low");
    setCurrentPage(1);
  };

  const getTimeCategory = (time: string) => {
    const hour = Number(time.split(":")[0]);

    if (hour >= 5 && hour < 11) return "Pagi";

    if (hour >= 11 && hour < 15) return "Siang";

    if (hour >= 15 && hour < 18) return "Sore";

    return "Malam";
  };

  const filteredTransports = useMemo(() => {
    let data = [...transports];

    // Filter berdasarkan kota asal & tujuan dari hasil pencarian (kalau diisi user)
    if (fromParam) {
      data = data.filter((transport) =>
        (transport.departureCity ?? "").toLowerCase().includes(fromParam.toLowerCase()),
      );
    }

    if (toParam) {
      data = data.filter((transport) =>
        (transport.arrivalCity ?? "").toLowerCase().includes(toParam.toLowerCase()),
      );
    }

    if (selectedTypes.length > 0) {
      data = data.filter((transport) => selectedTypes.includes(transport.type));
    }

    if (selectedTime) {
      data = data.filter(
        (transport) =>
          getTimeCategory(transport.departureTime) === selectedTime,
      );
    }

    if (sortBy === "price-low") {
      data.sort((a, b) => a.priceValue - b.priceValue);
    }

    if (sortBy === "rating") {
      data.sort((a, b) => b.rating - a.rating);
    }

    return data;
  }, [transports, selectedTypes, selectedTime, sortBy, fromParam, toParam]);

  const totalPages = Math.ceil(filteredTransports.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentItems = filteredTransports.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const getIcon = (type: string) => {
    switch (type) {
      case "Bus":
        return <MdDirectionsBus size={26} />;

      case "Kereta":
        return <MdTrain size={26} />;

      default:
        return <MdAirportShuttle size={26} />;
    }
  };

  return (
    <>
      <Navbar />
      <div className="transport-search-page">
        <div className="transport-search-header">
          <div className="search-summary">
            <div>
              <span>Rute Perjalanan</span>

              <strong>
                {fromParam || "Semua Asal"} ➜ {toParam || "Semua Tujuan"}
              </strong>
            </div>

            <div>
              <span>Tanggal</span>

              <strong>{formatTanggal(dateParam)}</strong>
            </div>

            <div>
              <span>Penumpang</span>

              <strong>{adultParam} Dewasa</strong>
            </div>
          </div>

          <button
            className="change-search-btn"
            onClick={() => (window.location.href = "/")}
          >
            Ubah Pencarian
          </button>
        </div>

        <div className="transport-layout">
          {/* SIDEBAR */}
          <aside className="transport-sidebar">
            <div className="sidebar-card">
              <div className="sidebar-header">
                <h3>Filter Perjalanan</h3>

                <button onClick={handleReset}>Reset</button>
              </div>

              <div className="filter-block">
                <h4>Tipe Angkutan Darat</h4>

                {["Bus", "Kereta", "Travel", "Shuttle"].map((type) => (
                  <label key={type} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={() => handleTypeChange(type)}
                    />

                    <span>{type}</span>
                  </label>
                ))}
              </div>

              <div className="filter-block">
                <h4>Waktu Keberangkatan</h4>

                <div className="time-filter">
                  <button
                    className={`time-card ${
                      selectedTime === "Pagi" ? "active" : ""
                    }`}
                    onClick={() => setSelectedTime("Pagi")}
                  >
                    <MdWbSunny />

                    <span>Pagi</span>

                    <small>05:00 - 10:59</small>
                  </button>

                  <button
                    className={`time-card ${
                      selectedTime === "Siang" ? "active" : ""
                    }`}
                    onClick={() => setSelectedTime("Siang")}
                  >
                    <MdLightMode />

                    <span>Siang</span>

                    <small>11:00 - 14:59</small>
                  </button>

                  <button
                    className={`time-card ${
                      selectedTime === "Sore" ? "active" : ""
                    }`}
                    onClick={() => setSelectedTime("Sore")}
                  >
                    <MdWbSunny />

                    <span>Sore</span>

                    <small>15:00 - 17:59</small>
                  </button>

                  <button
                    className={`time-card ${
                      selectedTime === "Malam" ? "active" : ""
                    }`}
                    onClick={() => setSelectedTime("Malam")}
                  >
                    <MdNightlight />

                    <span>Malam</span>

                    <small>18:00 - 04:59</small>
                  </button>
                </div>
              </div>
            </div>

            <div className="promo-card">
              <div className="promo-overlay">
                <h3>Diskon s.d 50%</h3>

                <p>Berlaku untuk perjalanan Jawa Raya</p>
              </div>
            </div>
          </aside>

          {/* CONTENT */}
          <main className="transport-content">
            <div className="transport-content-header">
              <h2>{filteredTransports.length} Armada Tersedia</h2>

              <div className="sort-wrapper">
                <span>Urutkan :</span>

                <div className="sort-dropdown">
                  <button
                    className="sort-trigger"
                    onClick={() => setShowSort(!showSort)}
                  >
                    {sortBy === "price-low"
                      ? "Harga Terendah"
                      : "Rating Tertinggi"}

                    <MdKeyboardArrowDown />
                  </button>

                  {showSort && (
                    <div className="sort-menu">
                      <button
                        onClick={() => {
                          setSortBy("price-low");
                          setShowSort(false);
                        }}
                      >
                        Harga Terendah
                      </button>

                      <button
                        onClick={() => {
                          setSortBy("rating");
                          setShowSort(false);
                        }}
                      >
                        Rating Tertinggi
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="loading-state">Memuat armada...</div>
            ) : (
              <>
                {filteredTransports.length === 0 ? (
                  <div className="empty-state">
                    <h3>Tidak ada armada ditemukan</h3>

                    <p>Coba ubah filter perjalanan yang dipilih.</p>
                  </div>
                ) : (
                  <div className="transport-list">
                    {currentItems.map((transport) => (
                      <div key={transport.id} className="transport-card">
                        <div className="transport-icon">
                          {getIcon(transport.type)}
                        </div>

                        <div className="transport-info">
                          <h3>{transport.company}</h3>

                          <p>{transport.classType}</p>
                        </div>

                        <div className="time-column">
                          <strong>{transport.departureTime}</strong>

                          <span>{transport.departurePoint}</span>
                        </div>

                        <div className="duration-column">
                          <span>{transport.duration}</span>
                        </div>

                        <div className="time-column">
                          <strong>{transport.arrivalTime}</strong>

                          <span>{transport.arrivalPoint}</span>
                        </div>

                        <div className="price-column">
                          {transport.remainingSeats && (
                            <div className="seat-badge">
                              Sisa {transport.remainingSeats} Kursi
                            </div>
                          )}

                          <h3>{transport.price}</h3>

                          <span>/orang</span>

                          <button
                            className="choose-btn"
                            onClick={() =>
                              (window.location.href = `/transport-detail?id=${transport.id}`)
                            }
                          >
                            Pilih
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {filteredTransports.length > 0 && totalPages > 1 && (
                  <div className="pagination-container">
                    <button
                      className="page-btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                      <MdKeyboardArrowLeft />
                    </button>

                    {Array.from(
                      {
                        length: totalPages,
                      },
                      (_, i) => i + 1,
                    ).map((page) => (
                      <button
                        key={page}
                        className={`page-btn ${
                          currentPage === page ? "active" : ""
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      className="page-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                      <MdKeyboardArrowRight />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default TransportSearchPage;