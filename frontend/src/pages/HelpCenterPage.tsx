import React, { useEffect, useRef, useState } from "react";
import { getFAQs } from "../services/faqService";
import type { FAQType } from "../types/FAQType";
import  Navbar from "../components/Navbar";
import  Footer from "../components/Footer";
import {
  MdHotel,
  MdDirectionsBus,
  MdPlace,
  MdManageAccounts,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
} from "react-icons/md";

import "./HelpCenterPage.css";


const HelpCenterPage: React.FC = () => {
  const faqSectionRef = useRef<HTMLElement>(null);
  const [faqs, setFaqs] = useState<FAQType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedTerm, setSearchedTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (faqId: number) => {
    setOpenFaq(openFaq === faqId ? null : faqId);
  };

  useEffect(() => {
    const fetchFAQs = async () => {
      const data = await getFAQs();

      setFaqs(data);
    };

    fetchFAQs();
  }, []);

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchedTerm.trim().toLowerCase()),
  );

  const suggestions = faqs
    .filter((faq) =>
      faq.question.toLowerCase().includes(searchTerm.trim().toLowerCase()),
    )
    .slice(0, 5);

  return (
    <>
      <Navbar />
      <div className="help-center-page">
        {/* HERO */}
        <section className="help-hero">
          <h1>Halo, ada yang bisa kami bantu?</h1>

          <p>
            Temukan panduan perjalanan, pengaturan grup, dan solusi cepat untuk
            petualangan cerdas Anda.
          </p>

          <div className="help-search-box">
            <input
              type="text"
              placeholder="Apa yang Bisa Kami Bantu?"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
            />

            {showSuggestions && searchTerm && suggestions.length > 0 && (
              <div className="search-suggestions">
                {suggestions.map((faq) => (
                  <button
                    key={faq.id}
                    className="suggestion-item"
                    onClick={() => {
                      setSearchTerm(faq.question);

                      setSearchedTerm(faq.question);

                      setShowSuggestions(false);

                      setOpenFaq(faq.id);

                      setTimeout(() => {
                        faqSectionRef.current?.scrollIntoView({
                          behavior: "smooth",
                        });
                      }, 100);
                    }}
                  >
                    {faq.question}
                  </button>
                ))}
              </div>
            )}

            <button
              className="help-search-btn"
              onClick={() => {
                setSearchedTerm(searchTerm);
                setOpenFaq(null);
                setShowSuggestions(false);

                setTimeout(() => {
                  faqSectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                  });
                }, 100);
              }}
            >
              Cari
            </button>
          </div>
        </section>

        {/* CATEGORY */}
        <section className="help-category-section">
          <div className="help-category-card">
            <div className="help-category-icon">
              <MdHotel />
            </div>

            <h3>Pemesanan Hotel</h3>

            <p>
              Informasi check-in, pembatalan, dan pemesanan khusus di berbagai
              pilihan Anda.
            </p>
          </div>

          <div className="help-category-card">
            <div className="help-category-icon">
              <MdDirectionsBus />
            </div>

            <h3>Transportasi Darat</h3>

            <p>
              Jadwal Bus & Kereta Api, cara pesan tiket, dan titik keberangkatan
              terminal.
            </p>
          </div>

          <div className="help-category-card">
            <div className="help-category-icon">
              <MdPlace />
            </div>

            <h3>Destinasi Wisata</h3>

            <p>
              Panduan tiket masuk, jam operasional, dan rekomendasi destinasi
              populer.
            </p>
          </div>

          <div className="help-category-card">
            <div className="help-category-icon">
              <MdManageAccounts />
            </div>

            <h3>Pengaturan Akun</h3>

            <p>
              Cara membuat grup, kelola profil, dan keamanan data perjalanan
              Anda.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="faq-section" ref={faqSectionRef}>
          <span className="faq-subtitle">PERTANYAAN UMUM</span>

          <h2>
            {searchedTerm
              ? `Hasil Pencarian "${searchedTerm}"`
              : "Sering Ditanyakan"}
          </h2>

          {searchedTerm && filteredFaqs.length === 0 && (
            <div className="empty-faq">
              <h3>FAQ tidak ditemukan</h3>

              <p>Coba gunakan kata kunci lain.</p>
            </div>
          )}

          {(!searchedTerm || filteredFaqs.length > 0) && (
            <div className="faq-list">
              {(searchedTerm ? filteredFaqs : faqs.slice(0, 4)).map((faq) => (
                <div
                  key={faq.id}
                  className={`faq-item ${openFaq === faq.id ? "active" : ""}`}
                >
                  <button
                    className="faq-question"
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <span>{faq.question}</span>

                    {openFaq === faq.id ? (
                      <MdKeyboardArrowUp />
                    ) : (
                      <MdKeyboardArrowDown />
                    )}
                  </button>

                  {openFaq === faq.id && (
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {searchedTerm && (
            <button
              className="show-all-btn"
              onClick={() => {
                setSearchTerm("");
                setSearchedTerm("");
                setOpenFaq(filteredFaqs[0]?.id ?? null);
                setShowSuggestions(false);
              }}
            >
              Tampilkan Semua FAQ
            </button>
          )}

          <div className="help-contact">
            <p>Masih punya pertanyaan lainnya?</p>

            <button>Hubungi Customer Service</button>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="help-banner">
          <div className="help-banner-content">
            <h2>
              Perjalanan Darat
              <br />
              Premium Menunggu
              <br />
              Anda.
            </h2>

            <p>
              Dapatkan diskon eksklusif untuk perjalanan darat terbaik bersama
              Pegi.
            </p>

            <button
              className="help-banner-btn"
              onClick={() => {
                window.location.assign("/transport-search");
              }}
            >
              Mulai Cari Tiket
            </button>
          </div>

          <div className="help-banner-image">
            <img
              src="https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=1200"
              alt="Transport"
            />
          </div>
        </section>
      </div>
      <Footer/>
    </>
  );
};

export default HelpCenterPage;
