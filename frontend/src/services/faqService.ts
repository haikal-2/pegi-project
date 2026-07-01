import type { FAQType } from "../types/FAQType";

const faqData: FAQType[] = [
  {
    id: 1,
    question: "Bagaimana cara memesan tiket bus atau kereta?",
    answer:
      "Pilih menu Transportasi Darat, tentukan rute perjalanan dan tanggal keberangkatan, lalu pilih armada yang tersedia dan lanjutkan ke proses pembayaran.",
  },
  {
    id: 2,
    question: "Cara membuat grup perjalanan untuk keluarga?",
    answer:
      "Saat melakukan pemesanan, Anda dapat menambahkan beberapa penumpang sekaligus sesuai jumlah kursi yang dibutuhkan.",
  },
  {
    id: 3,
    question: "Apakah bisa jika ingin pengembalian dana (refund) hotel?",
    answer:
      "Refund mengikuti kebijakan masing-masing hotel. Informasi lengkap dapat dilihat pada detail pemesanan sebelum melakukan pembayaran.",
  },
  {
    id: 4,
    question: "Apakah saya bisa memesan transportasi tanpa menginap?",
    answer:
      "Tentu bisa. Pemesanan transportasi dapat dilakukan secara terpisah tanpa harus memesan hotel.",
  },
  {
    id: 5,
    question: "Bagaimana jika pembayaran gagal?",
    answer:
      "Silakan cek kembali saldo atau metode pembayaran yang digunakan. Jika dana terpotong namun pesanan belum terkonfirmasi, hubungi Customer Service.",
  },
  {
    id: 6,
    question: "Mengapa tiket saya tidak muncul?",
    answer:
      "Pastikan Anda menggunakan akun yang sama saat melakukan pemesanan. Tiket juga dapat dilihat pada menu Riwayat Pemesanan.",
  },
  {
    id: 7,
    question: "Bagaimana cara mengubah jadwal keberangkatan?",
    answer:
      "Perubahan jadwal dapat dilakukan sesuai kebijakan penyedia layanan transportasi yang dipilih.",
  },
  {
    id: 8,
    question: "Bagaimana cara membatalkan pesanan?",
    answer:
      "Masuk ke halaman Riwayat Pemesanan, pilih pesanan yang ingin dibatalkan, lalu ikuti prosedur pembatalan yang tersedia.",
  },
  {
    id: 9,
    question: "Bagaimana cara mengganti password akun?",
    answer:
      "Masuk ke halaman Profil, pilih Pengaturan Akun, kemudian ubah password sesuai kebutuhan Anda.",
  },
  {
    id: 10,
    question: "Bagaimana cara menyimpan hotel ke wishlist?",
    answer:
      "Klik ikon hati pada kartu hotel atau halaman detail hotel untuk menambahkan ke wishlist.",
  },
  {
    id: 11,
    question: "Apakah tersedia promo perjalanan?",
    answer:
      "Promo terbaru dapat dilihat pada halaman utama maupun halaman promo yang tersedia di aplikasi.",
  },
  {
    id: 12,
    question: "Bagaimana cara menghubungi Customer Service?",
    answer:
      "Anda dapat menggunakan tombol Hubungi Customer Service pada halaman Pusat Bantuan atau melalui kontak resmi yang tersedia.",
  },
];

export const getFAQs = async (): Promise<FAQType[]> => {
  return faqData;
};