import React, { useState, useEffect } from "react";
import { getMonitoringStats } from "../services/adminService"; 

interface ChartData {
  month: string;
  value: number;
}

const StatistikChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [filter, setFilter] = useState<"Bulanan" | "Mingguan">("Bulanan");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      try {

        const res = await getMonitoringStats();
        if (res.data && res.data.trendData) {
          setChartData(res.data.trendData);
        }
      } catch (error) {
        console.error("Gagal mengambil data grafik:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [filter]); 

  const maxValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) : 1;

  return (
    <div className="admin-card">
      <div className="widget-header">
        <div>
          <h3 className="widget-title">Tren Booking</h3>
        </div>
        
        <div className="toggle-group">
          <button 
            className={`toggle-btn ${filter === "Bulanan" ? "active" : ""}`}
            onClick={() => setFilter("Bulanan")}
          >
            Bulanan
          </button>
          <button 
            className={`toggle-btn ${filter === "Mingguan" ? "active" : ""}`}
            onClick={() => setFilter("Mingguan")}
          >
            Mingguan
          </button>
        </div>
      </div>

      <div className="css-bar-chart">
        {isLoading ? (
          <p style={{ color: "#8f9bba", textAlign: "center", width: "100%" }}>Memuat grafik...</p>
        ) : chartData.length > 0 ? (
          chartData.map((data, idx) => {
          
            const barHeight = (data.value / maxValue) * 100;
            
            const isHighest = data.value === maxValue;

            return (
              <div key={idx} className="bar-group">
                {/* Visual Batang Grafik */}
                <div 
                  className="bar" 
                  style={{ 
                    height: `${barHeight}%`, 
                    background: isHighest ? "#4318ff" : "#e0e5f2" 
                  }}
                  title={`${data.value} Booking`}
                ></div>
                
                {/* Teks Label Bulan */}
                <span style={{ 
                  color: isHighest ? "#4318ff" : "#8f9bba", 
                  fontWeight: isHighest ? "bold" : "normal" 
                }}>
                  {data.month}
                </span>
              </div>
            );
          })
        ) : (
          <p style={{ color: "#8f9bba", textAlign: "center", width: "100%" }}>Data tren booking belum tersedia.</p>
        )}
      </div>
    </div>
  );
};

export default StatistikChart;