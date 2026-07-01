import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  FaEllipsisV,
  FaImage,
  FaPaperPlane,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaTrain,
  FaBuilding,
  FaCar,
  FaArrowRight,
  FaStar,
  FaPlus,
  FaCalculator,
  FaBus,
  FaTicketAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimes,
  FaReceipt,
  FaUsers,
  FaWallet,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./GroupChat.css";
import TravelerSidebar from "../components/TravelerSidebar";

// --- BASE URL ---
const API_BASE = "http://localhost:8080/api";

// --- AUTH HELPER ---
const getAuthHeaders = (isFormData = false): HeadersInit => {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
};

// --- INTERFACES ---
interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  type: "text" | "card" | "image";
  content: string;
  time: string;
  cardData?: { title: string; price: string; rating: number; img: string };
}

interface ItineraryItem {
  id: number;
  date: string;
  time: string;
  title: string;
  status: string;
  statusColor: string;
  icon?: React.ReactNode;
  iconType?: string;
  details?: string;
  image?: string;
  extras?: string[];
}

interface Member {
  id: number;
  name: string;
  role: string;
  avatar: string;
  isOnline?: boolean;
  status?: string;
}

interface Bill {
  id: string;
  icon?: React.ReactNode;
  iconType?: string;
  iconBg: string;
  iconColor: string;
  title: string;
  date: string;
  paidBy: string;
  total: number;
  perPerson: number;
}

interface GroupInfo {
  id: string;
  title: string;
  status: string;
  location: string;
  date: string;
}

interface NewBillForm {
  title: string;
  category: string;
  totalAmount: string;
  paidBy: string;
  date: string;
  notes: string;
}

// --- HELPERS ---
const BILL_CATEGORIES = [
  { value: "bus", label: "Bus & Travel", icon: <FaBus /> },
  { value: "train", label: "Kereta Api", icon: <FaTrain /> },
  { value: "ticket", label: "Tiket Wisata", icon: <FaTicketAlt /> },
  { value: "hotel", label: "Hotel & Penginapan", icon: <FaBuilding /> },
  { value: "car", label: "Sewa Kendaraan", icon: <FaCar /> },
  { value: "other", label: "Lainnya", icon: <FaReceipt /> },
];

const getCategoryIcon = (iconType?: string): React.ReactNode => {
  switch (iconType) {
    case "bus": return <FaBus />;
    case "train": return <FaTrain />;
    case "ticket": return <FaTicketAlt />;
    case "hotel": return <FaBuilding />;
    case "car": return <FaCar />;
    case "receipt": return <FaReceipt />;
    default: return <FaReceipt />;
  }
};

const getItineraryIcon = (iconType?: string): React.ReactNode => {
  switch (iconType) {
    case "train": return <FaTrain />;
    case "building": return <FaBuilding />;
    case "car": return <FaCar />;
    default: return <FaMapMarkerAlt />;
  }
};

const formatRupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");

// --- COMPONENT ---
const GroupChat: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("splitbill");

  // Data state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [itineraryData, setItineraryData] = useState<ItineraryItem[]>([]);
  const [membersData, setMembersData] = useState<Member[]>([]);
  const [billsData, setBillsData] = useState<Bill[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Chat input
  const [inputText, setInputText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  // Add Bill popup
  const [showAddBill, setShowAddBill] = useState(false);
  const [billForm, setBillForm] = useState<NewBillForm>({
    title: "",
    category: "bus",
    totalAmount: "",
    paidBy: "",
    date: "",
    notes: "",
  });
  const [billSubmitting, setBillSubmitting] = useState(false);

  // --- FETCH DATA FROM JAVA BACKEND ---
  useEffect(() => {
    const fetchGroupData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const resGroup = await fetch(`${API_BASE}/groups/${id}`, {
  headers: getAuthHeaders(),
});

// Fetch messages, itinerary, members, bills (parallel)
      const [resMessages, resItinerary, resMembers, resBills] = await Promise.allSettled([
        fetch(`${API_BASE}/groups/${id}/chats`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/groups/${id}/itinerary`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/groups/${id}/members`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/groups/${id}/bills`, { headers: getAuthHeaders() }),
      ]);

        if (!resGroup.ok) {
          throw new Error(`Gagal mengambil data grup (${resGroup.status})`);
        }

        const dataGroup: GroupInfo = await resGroup.json();
        setGroupInfo(dataGroup);
        if (resMessages.status === "fulfilled" && resMessages.value.ok) {
          const data: Message[] = await resMessages.value.json();
          setMessages(data);
        }

        if (resItinerary.status === "fulfilled" && resItinerary.value.ok) {
          const data: ItineraryItem[] = await resItinerary.value.json();
          setItineraryData(data);
        }

        if (resMembers.status === "fulfilled" && resMembers.value.ok) {
          const data: Member[] = await resMembers.value.json();
          setMembersData(data);
        }

        if (resBills.status === "fulfilled" && resBills.value.ok) {
  const rawBills = await resBills.value.json();
  // Map response SplitBill (backend) jadi format Bill (frontend)
  const mappedBills: Bill[] = rawBills.map((b: any) => ({
    id: b.id?.toString() ?? `temp-${Date.now()}`,
    iconType: b.category,
    iconBg: "bg-purple-light",
    iconColor: "text-purple",
    title: b.title || "Tagihan",
    date: b.billDate
      ? new Date(b.billDate).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "-",
    paidBy: b.paidBy || "-",
    total: b.totalAmount ?? 0,
    perPerson:
      b.members && b.members.length > 0
        ? Math.round((b.totalAmount ?? 0) / b.members.length)
        : 0,
  }));
  setBillsData(mappedBills);
}
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || "Gagal terhubung ke server. Pastikan backend berjalan di port 8080.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchGroupData();
  }, [id]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [messages, activeTab]);

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = showAddBill ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showAddBill]);
  useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      // payload.sub berisi username, kita perlu fetch ID asli dari endpoint profile
      // tapi cara cepat: simpan username dulu untuk dibandingkan dengan senderName
    } catch (e) {
      console.error("Gagal decode token", e);
    }
  }
}, []);

  // --- SEND MESSAGE ---
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const now = new Date();
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: "me",
      senderName: "Anda",
      type: "text",
      content: inputText,
      time: now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    // Optimistic update
    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    try {
      const res = await fetch(`${API_BASE}/groups/${id}/chats`, {  // bukan /messages
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        message: inputText,  // sesuaikan field name dengan backend (lihat poin 2)
      }),
    });

      if (res.ok) {
        const saved: Message = await res.json();
        // Replace optimistic message with server response (preserves real ID)
        setMessages((prev) => prev.map((m) => (m.id === newMessage.id ? saved : m)));
      }
    } catch (err) {
      console.warn("Gagal menyimpan pesan ke server:", err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    const imageMessage: Message = {
      id: Date.now().toString(),
      senderId: "me",
      senderName: "Anda",
      type: "image",
      content: URL.createObjectURL(file),
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, imageMessage]);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("groupId", id || "");
      await fetch(`${API_BASE}/groups/${id}/messages/image`, {
        method: "POST",
        headers: getAuthHeaders(true), // true = skip Content-Type, biarkan browser set boundary
        body: formData,
      });
          } catch (err) {
      console.warn("Gagal upload gambar ke server:", err);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- ADD BILL ---
  const handleBillFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setBillForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddBillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billForm.title || !billForm.totalAmount || !billForm.paidBy || !billForm.date) return;

    setBillSubmitting(true);
    const memberCount = membersData.length || 1;
    const total = parseFloat(billForm.totalAmount.replace(/\D/g, ""));
    const perPerson = Math.round(total / memberCount);

    try {
      const res = await fetch(`${API_BASE}/groups/${id}/split-bill`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
      title: billForm.title,
      category: billForm.category,
      totalAmount: total,        // ganti dari "total" jadi "totalAmount"
      paidBy: billForm.paidBy,
      billDate: billForm.date,   // ganti dari "date" jadi "billDate"
      notes: billForm.notes,
      members: membersData.map(m => ({ memberName: m.name })), // backend butuh ini untuk hitung split
    }),
    });
      if (res.ok) {
  const rawSaved = await res.json();
  const savedBill: Bill = {
    id: rawSaved.id?.toString() ?? `temp-${Date.now()}`,
    iconType: rawSaved.category,
    iconBg: "bg-purple-light",
    iconColor: "text-purple",
    title: rawSaved.title || billForm.title,
    date: new Date(billForm.date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    paidBy: rawSaved.paidBy || billForm.paidBy,
    total: rawSaved.totalAmount ?? total,
    perPerson,
  };
  setBillsData((prev) => [...prev, savedBill]);
} else {
  throw new Error(`Server error: ${res.status}`);
}
    } catch (err) {
  console.error("Gagal menyimpan tagihan:", err);
  // Optimistic fallback with temp ID
  const tempBill: Bill = {   // baris "const catMeta = ..." dihapus
    id: `temp-${Date.now()}`,
    iconType: billForm.category,
    iconBg: "bg-purple-light",
    iconColor: "text-purple",
    title: billForm.title,
    date: new Date(billForm.date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    paidBy: billForm.paidBy,
    total,
    perPerson,
  };
  setBillsData((prev) => [...prev, tempBill]);
} finally {
      setBillSubmitting(false);
      setShowAddBill(false);
      setBillForm({ title: "", category: "bus", totalAmount: "", paidBy: "", date: "", notes: "" });
    }
  };

  // Derived totals
  const totalBill = billsData.reduce((s, b) => s + b.total, 0);

  // --- RENDER STATES ---
  if (isLoading) {
    return (
      <>
        <div className="page-wrapper">
          <Navbar />
          <div className="traveler-layout">
            <TravelerSidebar activeMenu="grup" />
            <main className="group-detail-main">
              <div className="loading-state">
                <div className="loading-spinner" />
                <span>Memuat data grup...</span>
              </div>
            </main>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !groupInfo) {
    return (
      <>
        <div className="page-wrapper">
          <Navbar />
          <div className="traveler-layout">
            <TravelerSidebar activeMenu="grup" />
            <main className="group-detail-main">
              <div className="empty-bills" style={{ padding: "48px 24px", textAlign: "center" }}>
                <FaExclamationCircle style={{ fontSize: "2rem", color: "#e74c3c", marginBottom: "12px" }} />
                <p style={{ fontWeight: 600, marginBottom: "6px" }}>Gagal Memuat Data</p>
                <p style={{ color: "#888", fontSize: "0.9rem" }}>{error}</p>
                <button
                  className="btn-add-bill"
                  style={{ marginTop: "16px" }}
                  onClick={() => window.location.reload()}
                >
                  Coba Lagi
                </button>
              </div>
            </main>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="page-wrapper">
        <Navbar />
        <div className="traveler-layout">
          <TravelerSidebar activeMenu="grup" />

          <main className="group-detail-main">
            {/* ======= TICKET-STYLE HEADER ======= */}
            <div className="group-detail-header ticket-header">
              <div className="ticket-bg-pattern" aria-hidden="true">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} className={`ticket-deco ticket-deco-${i}`}>
                    {i % 3 === 0 ? <FaTicketAlt /> : i % 3 === 1 ? <FaTrain /> : <FaMapMarkerAlt />}
                  </span>
                ))}
              </div>

              <div className="ticket-notch ticket-notch-left" />
              <div className="ticket-notch ticket-notch-right" />

              <div className="ticket-header-content">
                <div className="header-top-row">
                  <div className="header-badges">
                    <span className="badge-status-aktif">{groupInfo.status}</span>
                    <span className="ticket-id">#{groupInfo.id}</span>
                  </div>
                </div>

                <h1 className="group-title">{groupInfo.title}</h1>

                <div className="ticket-meta-row">
                  <div className="ticket-meta-item">
                    <FaMapMarkerAlt className="ticket-meta-icon" />
                    <span>{groupInfo.location}</span>
                  </div>
                  <div className="ticket-divider-dot" />
                  <div className="ticket-meta-item">
                    <FaCalendarAlt className="ticket-meta-icon" />
                    <span>{groupInfo.date}</span>
                  </div>
                  <div className="ticket-divider-dot" />
                  <div className="ticket-meta-item">
                    <FaUsers className="ticket-meta-icon" />
                    <span>{membersData.length} Anggota</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TAB NAVIGASI */}
            <div className="chat-tabs">
              {["obrolan", "itinerary", "splitbill"].map((tab) => (
                <button
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "obrolan"
                    ? "Obrolan"
                    : tab === "itinerary"
                    ? "Itinerary & Anggota"
                    : "Split Bill"}
                </button>
              ))}
            </div>

            <div className="tab-content-area" style={{ display: "flex", flexDirection: "column" }}>
              {/* ======= TAB: ITINERARY & ANGGOTA ======= */}
              {activeTab === "itinerary" && (
                <div className="itinerary-grid">
                  <div className="itinerary-left">
                    <div className="section-header">
                      <h3>Rencana Perjalanan Darat</h3>
                      <a href="#semua" className="link-purple">
                        Lihat Semua <FaArrowRight />
                      </a>
                    </div>
                    {itineraryData.length === 0 ? (
                      <div className="empty-bills">
                        <FaMapMarkerAlt />
                        <p>Belum ada rencana perjalanan.</p>
                      </div>
                    ) : (
                      <div className="timeline-container">
                        {itineraryData.map((item) => (
                          <div className="timeline-item" key={item.id}>
                            <div className={`timeline-icon icon-${item.statusColor}`}>
                              {item.icon ?? getItineraryIcon(item.iconType)}
                            </div>
                            <div className="timeline-card">
                              <div className="timeline-card-header">
                                <span className="timeline-datetime">
                                  {item.date} • {item.time}
                                </span>
                                <span className={`badge-status badge-${item.statusColor}`}>
                                  {item.status}
                                </span>
                              </div>
                              <h4 className="timeline-title">{item.title}</h4>
                              {item.details && <p className="timeline-desc">{item.details}</p>}
                              {item.image && (
                                <div className="timeline-media">
                                  <img src={item.image} alt={item.title} className="timeline-img" />
                                  {item.extras && (
                                    <ul className="timeline-extras">
                                      {item.extras.map((ex, i) => (
                                        <li key={i}>{ex}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="itinerary-right">
                    <div className="members-card">
                      <div className="section-header">
                        <h3>Anggota Grup</h3>
                        <span className="member-count">{membersData.length}/10</span>
                      </div>
                      {membersData.length === 0 ? (
                        <div className="empty-bills">
                          <FaUsers />
                          <p>Belum ada anggota.</p>
                        </div>
                      ) : (
                        <div className="member-list">
                          {membersData.map((member) => (
                            <div className="member-item" key={member.id}>
                              <div className="member-avatar-box">
                                <img src={member.avatar} alt={member.name} />
                                {member.isOnline && <span className="online-dot" />}
                              </div>
                              <div className="member-info">
                                <h4>{member.name}</h4>
                                <p>{member.role.split(" / ")[0]}</p>
                              </div>
                              <div
                                className={`ps-status-badge ${
                                  member.status === "Lunas" ? "badge-lunas" : "badge-belum"
                                }`}
                              >
                                {member.status === "Lunas" ? (
                                  <FaCheckCircle />
                                ) : (
                                  <FaExclamationCircle />
                                )}
                                {member.status || "Belum Bayar"}
                              </div>
                              <button className="btn-options" aria-label="Opsi">
                                <FaEllipsisV />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ======= TAB: OBROLAN ======= */}
              {activeTab === "obrolan" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    flex: 1,
                    minHeight: "450px",
                  }}
                >
                  <div
                    className="chat-body"
                    ref={chatBodyRef}
                    style={{ flex: 1, overflowY: "auto" }}
                  >
                    <div className="chat-date-separator">
                      <span>Hari ini</span>
                    </div>
                    {messages.length === 0 && (
                      <div className="empty-bills">
                        <FaPaperPlane />
                        <p>Belum ada pesan. Mulai obrolan!</p>
                      </div>
                    )}
                    {messages.map((msg) => {
                      const isMe = msg.senderId === "me";
                      return (
                        <div
                          key={msg.id}
                          className={`chat-bubble-wrapper ${isMe ? "sent" : "received"}`}
                        >
                          {!isMe && (
                            <img
                              src={msg.senderAvatar}
                              alt={msg.senderName}
                              className="chat-user-avatar"
                            />
                          )}
                          <div className="chat-message-content">
                            {!isMe && (
                              <span className="chat-sender-name">{msg.senderName}</span>
                            )}
                            {msg.type === "text" && (
                              <div className={`chat-bubble ${isMe ? "purple" : "white"}`}>
                                <p>{msg.content}</p>
                              </div>
                            )}
                            {msg.type === "image" && (
                              <div className="chat-bubble-image">
                                <img
                                  src={msg.content}
                                  alt="Uploaded"
                                  className="uploaded-image"
                                />
                              </div>
                            )}
                            {msg.type === "card" && msg.cardData && (
                              <div className="chat-product-card-no-img">
                                <div className="card-info-box">
                                  <h4 className="card-title-text">{msg.cardData.title}</h4>
                                  <div className="card-price-row">
                                    <span className="fw-bold text-purple">
                                      {msg.cardData.price}
                                    </span>
                                    <span className="rating">
                                      <FaStar className="text-yellow" /> {msg.cardData.rating}
                                    </span>
                                  </div>
                                  <button className="btn-detail-product">
                                    Lihat Detail Villa
                                  </button>
                                </div>
                              </div>
                            )}
                            <span className="chat-timestamp">{msg.time}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="chat-footer" style={{ marginTop: "auto" }}>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      onChange={handleImageUpload}
                    />
                    <button
                      className="btn-action-icon"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Upload gambar"
                    >
                      <FaImage />
                    </button>
                    <form className="chat-input-wrapper" onSubmit={handleSendMessage}>
                      <input
                        type="text"
                        placeholder="Tulis pesan untuk grup..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                      />
                    </form>
                    <button
                      className="btn-send-message"
                      onClick={handleSendMessage}
                      disabled={!inputText.trim()}
                    >
                      Kirim <FaPaperPlane />
                    </button>
                  </div>
                </div>
              )}

              {/* ======= TAB: SPLIT BILL ======= */}
              {activeTab === "splitbill" && (
                <div className="splitbill-wrapper">
                  <div className="splitbill-header">
                    <div>
                      <h2>Manajemen Keuangan Grup</h2>
                      <p>Kelola pengeluaran transportasi darat dan tiket wisata bersama.</p>
                    </div>
                    <button className="btn-add-bill" onClick={() => setShowAddBill(true)}>
                      <FaPlus /> Tambah Tagihan Baru
                    </button>
                  </div>

                  <div className="splitbill-grid">
                    <div className="splitbill-main">
                      {/* Summary Card */}
                      <div className="splitbill-summary-card">
                        <div className="summary-left">
                          <div className="summary-icon">
                            <FaCalculator />
                          </div>
                          <div>
                            <h3>Kalkulator Patungan Grup</h3>
                            <p>Total Biaya Perjalanan Bersama</p>
                          </div>
                        </div>
                        <div className="summary-right">
                          <span className="summary-label">TOTAL TERAKUMULASI</span>
                          <h2 className="summary-total">{formatRupiah(totalBill)}</h2>
                          <span className="summary-count">{billsData.length} Tagihan Aktif</span>
                        </div>
                      </div>

                      {/* Category Cards */}
                      <div className="category-cards-wrapper">
                        <div className="category-card">
                          <div className="cat-card-header">
                            <div className="cat-icon bg-purple-light text-blue">
                              <FaBus />
                            </div>
                            <span className="cat-badge text-blue">Terverifikasi</span>
                          </div>
                          <p className="cat-title">Tiket Bus & Travel</p>
                          <h3 className="cat-amount">
                            {formatRupiah(
                              billsData
                                .filter((b) => b.iconBg === "bg-blue-light")
                                .reduce((s, b) => s + b.total, 0)
                            )}
                          </h3>
                        </div>
                        <div className="category-card">
                          <div className="cat-card-header">
                            <div className="cat-icon bg-purple-light text-purple">
                              <FaTrain />
                            </div>
                            <span className="cat-badge text-purple">Terverifikasi</span>
                          </div>
                          <p className="cat-title">Kereta Api Antar Kota</p>
                          <h3 className="cat-amount">
                            {formatRupiah(
                              billsData
                                .filter(
                                  (b) =>
                                    b.title.toLowerCase().includes("kai") ||
                                    b.title.toLowerCase().includes("kereta")
                                )
                                .reduce((s, b) => s + b.total, 0)
                            )}
                          </h3>
                        </div>
                        <div className="category-card">
                          <div className="cat-card-header">
                            <div className="cat-icon bg-orange-light text-orange">
                              <FaTicketAlt />
                            </div>
                            <span className="cat-badge text-orange">Terverifikasi</span>
                          </div>
                          <p className="cat-title">Tiket Masuk Wisata</p>
                          <h3 className="cat-amount">
                            {formatRupiah(
                              billsData
                                .filter((b) => b.iconBg === "bg-purple-light")
                                .reduce((s, b) => s + b.total, 0)
                            )}
                          </h3>
                        </div>
                      </div>

                      {/* Bills List */}
                      <div className="active-bills-section">
                        <div className="active-bills-header">
                          <h4>DAFTAR TAGIHAN AKTIF</h4>
                          <a href="#semua">Lihat Semua</a>
                        </div>
                        <div className="bills-list">
                          {billsData.map((bill, idx) => (
                            <div
                              key={bill.id}
                              className={`bill-item ${
                                idx === billsData.length - 1 ? "border-none" : ""
                              }`}
                            >
                              <div
                                className={`bill-icon-wrapper ${bill.iconBg} ${bill.iconColor}`}
                              >
                                {bill.icon ?? getCategoryIcon(bill.iconType)}
                              </div>
                              <div className="bill-info">
                                <h5>{bill.title}</h5>
                                <p>
                                  {bill.date} • Dibayar oleh {bill.paidBy}
                                </p>
                              </div>
                              <div className="bill-amounts">
                                <h5 className="text-dark">{formatRupiah(bill.total)}</h5>
                                <p className="text-purple">{formatRupiah(bill.perPerson)} / orang</p>
                              </div>
                            </div>
                          ))}
                          {billsData.length === 0 && (
                            <div className="empty-bills">
                              <FaWallet />
                              <p>
                                Belum ada tagihan. Klik "Tambah Tagihan Baru" untuk mulai.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Sidebar */}
                    <div className="splitbill-sidebar">
                      <div className="payment-status-card">
                        <div className="ps-header">
                          <h3>Status Pembayaran</h3>
                          <span className="ps-badge">{membersData.length} Anggota</span>
                        </div>
                        <div className="ps-member-list">
                          {membersData.length === 0 && (
                            <div className="empty-bills">
                              <FaUsers />
                              <p>Belum ada anggota.</p>
                            </div>
                          )}
                          {membersData.map((member) => (
                            <div className="ps-member-item" key={member.id}>
                              <div className="ps-member-left">
                                <img src={member.avatar} alt={member.name} />
                                <div>
                                  <h5 className="text-dark">{member.name}</h5>
                                  <p className="text-gray">
                                    {member.role.split(" / ")[1] || member.role}
                                  </p>
                                </div>
                              </div>
                              <div
                                className={`ps-status-badge ${
                                  member.status === "Lunas" ? "badge-lunas" : "badge-belum"
                                }`}
                              >
                                {member.status === "Lunas" ? (
                                  <FaCheckCircle />
                                ) : (
                                  <FaExclamationCircle />
                                )}{" "}
                                {member.status || "Belum Bayar"}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="splitbill-tips-card">
                        <h4>Tips Patungan</h4>
                        <p>
                          Pegi secara otomatis menghitung pembagian untuk bus, kereta api, dan
                          tiket wisata secara merata agar tidak ada selisih perhitungan di akhir
                          perjalanan.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      <Footer />

      {/* ======= POPUP: TAMBAH TAGIHAN ======= */}
      {showAddBill && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddBill(false);
          }}
        >
          <div className="modal-container">
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-header-icon">
                <FaPlus />
              </div>
              <div>
                <h2>Tambah Tagihan Baru</h2>
                <p>Masukkan detail pengeluaran grup</p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setShowAddBill(false)}
                aria-label="Tutup"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {/* Judul Tagihan */}
              <div className="form-group">
                <label className="form-label">
                  Judul Tagihan <span className="required">*</span>
                </label>
                <input
                  className="form-input"
                  type="text"
                  name="title"
                  value={billForm.title}
                  onChange={handleBillFormChange}
                  placeholder="cth. Tiket Kereta Argo Anggrek"
                />
              </div>

              {/* Kategori */}
              <div className="form-group">
                <label className="form-label">
                  Kategori <span className="required">*</span>
                </label>
                <div className="category-grid">
                  {BILL_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      className={`category-option ${
                        billForm.category === cat.value ? "selected" : ""
                      }`}
                      onClick={() => setBillForm((p) => ({ ...p, category: cat.value }))}
                    >
                      <span className="cat-opt-icon">{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Row: Jumlah + Tanggal */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Total Biaya (Rp) <span className="required">*</span>
                  </label>
                  <input
                    className="form-input"
                    type="number"
                    name="totalAmount"
                    value={billForm.totalAmount}
                    onChange={handleBillFormChange}
                    placeholder="cth. 1600000"
                    min="0"
                  />
                  {billForm.totalAmount && membersData.length > 0 && (
                    <span className="form-hint">
                      ={" "}
                      {formatRupiah(
                        Math.round(parseFloat(billForm.totalAmount) / membersData.length)
                      )}{" "}
                      / orang ({membersData.length} anggota)
                    </span>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Tanggal <span className="required">*</span>
                  </label>
                  <input
                    className="form-input"
                    type="date"
                    name="date"
                    value={billForm.date}
                    onChange={handleBillFormChange}
                  />
                </div>
              </div>

              {/* Dibayar oleh */}
              <div className="form-group">
                <label className="form-label">
                  Dibayar oleh <span className="required">*</span>
                </label>
                <select
                  className="form-input form-select"
                  name="paidBy"
                  value={billForm.paidBy}
                  onChange={handleBillFormChange}
                >
                  <option value="">-- Pilih Anggota --</option>
                  {membersData.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Catatan */}
              <div className="form-group">
                <label className="form-label">
                  Catatan{" "}
                  <span className="optional">(opsional)</span>
                </label>
                <textarea
                  className="form-input form-textarea"
                  name="notes"
                  value={billForm.notes}
                  onChange={handleBillFormChange}
                  placeholder="Tambahkan keterangan jika diperlukan..."
                  rows={3}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button
                className="btn-modal-cancel"
                onClick={() => setShowAddBill(false)}
                disabled={billSubmitting}
              >
                Batal
              </button>
              <button
                className="btn-modal-submit"
                onClick={handleAddBillSubmit}
                disabled={
                  billSubmitting ||
                  !billForm.title ||
                  !billForm.totalAmount ||
                  !billForm.paidBy ||
                  !billForm.date
                }
              >
                {billSubmitting ? (
                  <>
                    <span className="btn-spinner" /> Menyimpan...
                  </>
                ) : (
                  <>
                    <FaPlus /> Simpan Tagihan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupChat;