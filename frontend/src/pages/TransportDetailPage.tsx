import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BusSeatLayout from "../components/BusSeatLayout";
import TrainSeatLayout from "../components/TrainSeatLayout";
import ShuttleSeatLayout from "../components/ShuttleSeatLayout";
import TravelSeatLayout from "../components/TravelSeatLayout";

import { getTransportById } from "../services/transportService";
import type { TransportType } from "../types/TransportType";

import "./TransportDetailPage.css";

const TransportDetailPage: React.FC = () => {
  const [transport, setTransport] = useState<TransportType | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  const params = new URLSearchParams(window.location.search);

  const transportId = Number(params.get("id"));
  const toggleSeat = (seat: number) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  useEffect(() => {
    const fetchTransport = async () => {
      try {
        setIsLoading(true);

        const data = await getTransportById(transportId);

        if (!data) {
          setIsLoading(false);
          return;
        }

        setTransport(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransport();
  }, [transportId]);
  const totalPrice = transport
    ? transport.priceValue * selectedSeats.length
    : 0;

  if (isLoading) {
    return (
      <div className="transport-detail-loading">
        <h2>Memuat detail perjalanan...</h2>
      </div>
    );
  }

  if (!transport) {
    return (
      <div className="transport-detail-loading">
        <h2>Transport tidak ditemukan</h2>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="transport-detail-page">
        {/* HERO */}
        <section className="transport-hero">
          <img
            src={transport.gallery?.[0] || transport.image}
            alt={transport.company}
          />

          <div className="transport-hero-overlay">
            <span className="transport-type">{transport.type}</span>

            <h1>{transport.company}</h1>

            <p>{transport.classType}</p>
            <div className="hero-route">
              <span>{transport.departureCity}</span>

              <span>→</span>

              <span>{transport.arrivalCity}</span>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <div className="transport-detail-container">
          {/* LEFT */}
          <div className="transport-left">
            <div className="detail-card">
              <h3>Informasi Perjalanan</h3>

              <div className="route-box">
                <div>
                  <span>Berangkat</span>

                  <strong>{transport.departureTime}</strong>

                  <p>{transport.departurePoint}</p>
                </div>

                <div>
                  <span>Durasi</span>

                  <strong>{transport.duration}</strong>
                </div>

                <div>
                  <span>Estimasi Tiba</span>

                  <strong>{transport.arrivalTime}</strong>

                  <p>{transport.arrivalPoint}</p>
                </div>
              </div>

              <hr />

              <h4>Deskripsi</h4>

              <p className="transport-description">
                {transport.description || "Informasi belum tersedia."}
              </p>

              <h4>Fasilitas</h4>

              <div className="facility-list">
                {transport.facilities?.map((facility) => (
                  <span key={facility.id} className="facility-badge">
                    {facility.name}
                  </span>
                ))}
              </div>
            </div>

            {transport.type === "Bus" && (
              <BusSeatLayout
                selectedSeats={selectedSeats}
                toggleSeat={toggleSeat}
              />
            )}

            {transport.type === "Kereta" && (
              <TrainSeatLayout
                selectedSeats={selectedSeats}
                toggleSeat={toggleSeat}
              />
            )}

            {transport.type === "Shuttle" && (
              <ShuttleSeatLayout
                selectedSeats={selectedSeats}
                toggleSeat={toggleSeat}
              />
            )}

            {transport.type === "Travel" && (
              <TravelSeatLayout
                selectedSeats={selectedSeats}
                toggleSeat={toggleSeat}
              />
            )}
          </div>

          {/* RIGHT */}
          <div className="transport-right">
            <div className="booking-card">
              <h3>Ringkasan Pemesanan</h3>

              <div className="summary-row">
                <span>Harga Tiket</span>
                <strong>{transport.price}</strong>
              </div>

              <div className="summary-row">
                <span>Kursi Tersedia</span>
                <strong>{transport.remainingSeats}</strong>
              </div>

              <div className="summary-row">
                <span>Kursi Dipilih</span>
                <strong>
                  {selectedSeats.length > 0 ? selectedSeats.join(", ") : "-"}
                </strong>
              </div>

              <div className="summary-row total">
                <span>Total</span>
                <strong>Rp {totalPrice.toLocaleString("id-ID")}</strong>
              </div>

              <button
                className="continue-btn"
                disabled={selectedSeats.length === 0}
                onClick={() => {
                  const seatParam = selectedSeats.join(",");

                  window.location.href = `/payment-page?id=${transport.id}&seats=${seatParam}`;
                }}
              >
                Lanjut Pembayaran
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default TransportDetailPage;
