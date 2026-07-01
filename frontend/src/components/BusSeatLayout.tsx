import React from "react";

interface BusSeatLayoutProps {
  selectedSeats: number[];
  toggleSeat: (seat: number) => void;
}

const BusSeatLayout: React.FC<BusSeatLayoutProps> = ({
  selectedSeats,
  toggleSeat,
}) => {
  const seatRows = [
    [1, 2, null, 3, 4],
    [5, 6, null, 7, 8],
    [9, 10, null, 11, 12],
    [13, 14, null, 15, 16],
    [17, 18, null, 19, 20],
    [21, 22, null, 23, 24],
    [25, 26, null, 27, 28],
    [29, 30, null, 31, 32],
    [33, 34, null, 35, 36],
    [37, 38, null, 39, 40],
    [41, 42, null, 43, 44],

    // Baris belakang
    [45, 46, 47, 48, 49],
    [null, null, 50, null, null],
  ];

  const occupiedSeats = [1, 5, 12, 18, 22, 31, 35];

  return (
    <div className="detail-card">
      <h3>Pilih Kursi Bus</h3>
      <div className="bus-direction">↑ ARAH LAJU BUS</div>
      <div className="seat-legend">
        <div className="legend-item">
          <span className="legend available"></span>
          Tersedia
        </div>

        <div className="legend-item">
          <span className="legend occupied"></span>
          Terisi
        </div>

        <div className="legend-item">
          <span className="legend selected"></span>
          Dipilih
        </div>
      </div>
      <div className="bus-wrapper">
        <div className="bus-header">
          <div className="dashboard"></div>
          <div className="bus-door">
            🚪
            <small>PINTU</small>
          </div>

          <div className="driver-area">
            🪑
            <small>DRIVER</small>
          </div>
        </div>

        <div className="bus-layout">
          {seatRows.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {row.map((seat, index) => {
                if (seat === null) {
                  return <div key={index} className="bus-aisle"></div>;
                }

                return (
                  <button
                    key={seat}
                    className={`seat
  ${
    occupiedSeats.includes(seat)
      ? "occupied"
      : selectedSeats.includes(seat)
        ? "selected"
        : "available"
  }
`}
                    onClick={() => {
                      if (!occupiedSeats.includes(seat)) {
                        toggleSeat(seat);
                      }
                    }}
                  >
                    <span>{seat.toString().padStart(2, "0")}</span>
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <div className="bus-footer">
          <div className="rear-door">PINTU BELAKANG</div>
        </div>
      </div>
    </div>
  );
};

export default BusSeatLayout;
