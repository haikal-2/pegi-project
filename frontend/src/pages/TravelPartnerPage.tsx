import React, { useEffect, useState } from "react";
import { MdLocationOn, MdCalendarToday } from "react-icons/md";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import type { TravelPartnerType } from "../types/TravelPartnerType";
import { getTravelPartners } from "../services/travelPartnerService";

import "./TravelPartnerPage.css";

const TravelPartnerPage: React.FC = () => {
  const [partners, setPartners] = useState<TravelPartnerType[]>([]);

  const params = new URLSearchParams(window.location.search);

  const destination = params.get("destination") || "Pura Uluwatu";

  useEffect(() => {
    const fetchPartners = async () => {
      const data = await getTravelPartners();

      const filteredPartners = data.filter((partner) =>
        partner.destination.toLowerCase().includes(destination.toLowerCase()),
      );

      setPartners(filteredPartners);
    };

    fetchPartners();
  }, [destination]);

  return (
    <>
      <Navbar />
      <div className="travel-partner-page">
        <div className="travel-partner-container">
          <div className="travel-partner-header">
            <span className="travel-partner-badge">Travel Matching</span>

            <h1>Cari Teman Perjalanan Serupa</h1>

            <p>
              Temukan traveler lain yang akan mengunjungi{" "}
              <strong>{destination}</strong> pada tanggal yang berdekatan.
            </p>

            <div className="travel-summary">
              <div className="summary-card">
                <h3>{destination}</h3>
                <span>Destinasi Tujuan</span>
              </div>

              <div className="summary-card">
                <h3>{partners.length}</h3>
                <span>Traveler Ditemukan</span>
              </div>

              <div className="summary-card">
                <h3>95%</h3>
                <span>Rata-rata Kecocokan</span>
              </div>
            </div>
          </div>

          <div className="partner-grid">
            {partners.map((partner) => (
              <div key={partner.id} className="partner-card">
                <div className="partner-top">
                  <img src={partner.avatar} alt={partner.name} />

                  <div>
                    <h3>{partner.name}</h3>

                    <p>{partner.city}</p>
                  </div>

                  <span className="match-badge">
                    {partner.matchPercentage}% Cocok
                  </span>
                </div>

                <div className="partner-info">
                  <p>
                    <MdLocationOn />
                    {partner.destination}
                  </p>

                  <p>
                    <MdCalendarToday />
                    {partner.travelDate}
                  </p>
                </div>

                <div className="interest-list">
                  {partner.interests.map((interest, index) => (
                    <span key={index}>{interest}</span>
                  ))}
                </div>

                <button
                  className="partner-btn"
                  onClick={() => (window.location.href = "/group-list")}
                >
                  Ajak Gabung Perjalanan
                </button>
              </div>
            ))}
          </div>

          {partners.length === 0 && (
            <div className="empty-partner">
              <h3>Belum ada traveler ditemukan</h3>

              <p>Coba destinasi lain atau cek kembali nanti.</p>
            </div>
          )}
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default TravelPartnerPage;
