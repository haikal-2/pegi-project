import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* LEFT */}
        <div className="footer-brand">
          <h2>Pegi</h2>

          <p>
            Solusi perjalanan terpercaya untuk eksplorasi nusantara
            tanpa batas dengan kenyamanan maksimal.
          </p>

          <div className="footer-social">
            <a href="#">
              <i className="fa-brands fa-instagram"></i>
            </a>

            <a href="#">
              <i className="fa-brands fa-facebook-f"></i>
            </a>

            <a href="#">
              <i className="fa-brands fa-x-twitter"></i>
            </a>

            <a href="#">
              <i className="fa-brands fa-youtube"></i>
            </a>
          </div>
        </div>

        {/* LAYANAN */}

        <div className="footer-column">
          <h4>Layanan</h4>

          <a href="/hotel-search">Hotel & Penginapan</a>

          <a href="/transport-search">Bus & Travel</a>

          <a href="/transport-search">Kereta Api</a>

          <a href="/destination-search">Destinasi Wisata</a>
        </div>

        {/* TENTANG */}

        <div className="footer-column">
          <h4>Tentang</h4>

          <a href="//help-center">Tentang Kami</a>

        </div>

        {/* DUKUNGAN */}

        <div className="footer-column">
          <h4>Dukungan</h4>

          <a href="/help-center">Pusat Bantuan</a>

          <a href="/help-center">FAQ</a>

        </div>

      </div>

      <div className="footer-divider"></div>

      <div className="footer-bottom">
        © 2026 <strong>Pegi</strong>. Solusi Perjalanan Terpercaya.
      </div>
    </footer>
  );
};

export default Footer;