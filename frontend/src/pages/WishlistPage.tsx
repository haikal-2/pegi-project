import React, { useState, useEffect } from "react";
import { FaHeart, FaCompass, FaMapMarkerAlt } from "react-icons/fa";
import type { WishlistType } from "../types/WishlistType";
import { getWishlist, removeWishlist } from "../services/wishlistService";
import "./WishlistPage.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TravelerSidebar from "../components/TravelerSidebar";

const WishlistPage: React.FC = () => {
  const [wishlist, setWishlist] = useState<WishlistType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWishlist = async () => {
    setIsLoading(true);
    try {
      const response = await getWishlist();
      setWishlist(response.data);
    } catch (error) {
      console.error("Gagal menarik data wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleDeleteItem = async (id: string) => {
    try {
      await removeWishlist(id);
      fetchWishlist();
    } catch (error) {
      alert("Gagal menghapus item dari wishlist.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="profile-layout">
          <TravelerSidebar activeMenu="wishlist" />

          {/* --- KONTEN UTAMA --- */}
          <main className="profile-main">
            <div className="main-container">
              <header className="main-header">
                <h1>Wishlist Saya</h1>
                <p>Temukan kembali tempat dan transportasi impian Anda.</p>
              </header>

              {isLoading && <p className="loading-text">Memuat Wishlist...</p>}

              {!isLoading && wishlist.length > 0 && (
                <div className="wishlist-grid">
                  {wishlist.map((item) => (
                    <div key={item.id} className="wishlist-card">
                      <div className="wishlist-img-container">
                        <img src={item.itemImage || "https://placehold.co/300x200"} alt={item.itemName} />
                        <span className="wishlist-badge">{item.itemType}</span>
                        <button
                          className="btn-heart"
                          onClick={() => handleDeleteItem(item.id)}
                          title="Hapus dari Wishlist"
                        >
                          <FaHeart />
                        </button>
                      </div>
                      <div className="wishlist-info">
                        <h4>{item.itemName}</h4>
                        <p>
                          <FaMapMarkerAlt className="icon-grey" />{" "}
                          {item.itemLocation || "-"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="explore-more-box">
                <div className="explore-icon-wrapper">
                  <FaCompass />
                </div>
                <h3>Ingin menambah destinasi lain?</h3>
                <p>
                  Jelajahi ribuan pilihan hotel, transportasi darat, dan tempat
                  wisata
                  <br />
                  menarik lainnya di seluruh Indonesia.
                </p>
                <a href="/">
                  <button className="btn-explore">Eksplor Sekarang</button>
                </a>
              </div>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default WishlistPage;
