import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  MdLocationOn,
  MdWifi,
  MdPool,
  MdRestaurant,
  MdFitnessCenter,
  MdStar,
  MdKingBed,
} from "react-icons/md";

import { getHotelById } from "../services/hotelService";
import type { HotelType } from "../types/HotelType";
import { formatRupiah } from "../Utils/formatCurrency";

import "./HotelDetailPage.css";

// Helper: ambil harga termurah dari daftar rooms milik hotel.
// HotelType tidak punya field price/priceValue sendiri, jadi dihitung dari rooms[].
const getLowestPrice = (hotel: HotelType): number => {
  if (!hotel.rooms || hotel.rooms.length === 0) return 0;
  return Math.min(...hotel.rooms.map((r) => r.price));
};

const HotelDetailPage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState("");
  const [hotel, setHotel] = useState<HotelType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const params = new URLSearchParams(window.location.search);

  const hotelId = Number(params.get("id"));

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        setIsLoading(true);

        const data = await getHotelById(hotelId);

        setHotel(data as HotelType);

        if ((data as HotelType)?.gallery?.length) {
          setSelectedImage((data as HotelType).gallery![0]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotel();
  }, [hotelId]);

  if (isLoading) {
    return (
      <div className="hotel-detail-loading">
        <h2>Memuat detail hotel...</h2>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="hotel-detail-loading">
        <h2>Hotel tidak ditemukan</h2>
      </div>
    );
  }

  const rooms = hotel.rooms ?? [];

  const facilityIcons = {
    wifi: <MdWifi size={24} />,
    pool: <MdPool size={24} />,
    restaurant: <MdRestaurant size={24} />,
    gym: <MdFitnessCenter size={24} />,
  };

  const facilityLabels = {
    wifi: "WiFi Gratis",
    pool: "Kolam Renang",
    restaurant: "Restoran",
    gym: "Pusat Kebugaran",
  };

  return (
    <>
      <Navbar />

      <div className="hotel-detail-page">
        <div className="hotel-detail-container">
          {/* ========================= */}
          {/* GALLERY */}
          {/* ========================= */}

          <section className="gallery-section">
            <div className="gallery-main">
              {(selectedImage || hotel.img) && (
                <img src={selectedImage || hotel.img} alt={hotel.name} />
              )}
            </div>

            <div className="gallery-grid">
              {hotel.gallery?.slice(1, 5).map((image, index) => (
                <div
                  key={index}
                  className={`gallery-item ${
                    selectedImage === image ? "active" : ""
                  }`}
                  onClick={() => setSelectedImage(image)}
                >
                  <img src={image} alt={`${hotel.name}-${index}`} />
                </div>
              ))}
            </div>
          </section>

          {/* ========================= */}
          {/* HEADER */}
          {/* ========================= */}

          <section className="hotel-header">
            <div>
              <h1>{hotel.name}</h1>

              <div className="hotel-address">
                <MdLocationOn />
                <span>{hotel.location}</span>
              </div>
            </div>

            <div className="hotel-rating">
              <MdStar />
              <span>{hotel.rating}</span>
            </div>
          </section>

          {/* ========================= */}
          {/* MAIN CONTENT */}
          {/* ========================= */}

          <section className="hotel-content-grid">
            {/* LEFT */}
            <div className="hotel-content-left">
              {/* FASILITAS */}
              <div className="detail-card">
                <h3>Fasilitas Populer</h3>

                <div className="facility-grid">
                  {hotel.amenities.map((facility) => (
                    <div key={facility} className="facility-item">
                      {facilityIcons[facility as keyof typeof facilityIcons]}

                      <span>
                        {
                          facilityLabels[
                            facility as keyof typeof facilityLabels
                          ]
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* DESKRIPSI */}
              <div className="detail-card">
                <h3>Tentang Akomodasi</h3>

                <p>{hotel.description}</p>
              </div>

              {/* LOKASI */}
              <div className="detail-card">
                <h3>Lokasi</h3>

                <div className="location-map">
                  <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200"
                    alt="map"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="booking-sidebar">
              <div className="booking-card">
                <h2>{formatRupiah(getLowestPrice(hotel))}</h2>

                <span>/ malam</span>

                <div className="booking-info">
                  <strong>Check-in</strong>
                  <p>12 Jun - 14 Jun 2024</p>
                </div>

                <div className="booking-info">
                  <strong>Tamu</strong>
                  <p>2 Dewasa, 1 Kamar</p>
                </div>

                <button className="booking-button">Pesan Sekarang</button>
              </div>

              <div className="member-card">
                <h4>Member Pegi Gold</h4>

                <p>Dapatkan diskon tambahan dan keuntungan eksklusif.</p>

                <button>Lihat Detail Member →</button>
              </div>
            </div>
          </section>

          {/* ========================= */}
          {/* ROOMS */}
          {/* ========================= */}

          <section className="rooms-section">
            <div className="rooms-header">
              <h2>Tipe Kamar Tersedia</h2>

              <p>Semua tipe kamar termasuk sarapan gratis dan WiFi</p>
            </div>

            <div className="rooms-table">
              <div className="rooms-table-header">
                <span>Tipe Kamar</span>
                <span>Pilihan Tempat Tidur</span>
                <span>Harga / Malam</span>
                <span>Aksi</span>
              </div>

              {rooms.map((room) => (
                <div key={room.id} className="room-row">
                  <div className="room-info">
                    <img src={room.image} alt={room.name} />

                    <div>
                      <h4>{room.name}</h4>

                      <span>Lihat Detail Kamar</span>
                    </div>
                  </div>

                  <div className="bed-info">
                    <MdKingBed />

                    <span>{room.bed}</span>
                  </div>

                  <div className="room-price">
                    {formatRupiah(room.price)}
                  </div>

                  <button className="room-select-btn">Pilih Kamar</button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default HotelDetailPage;