import React from "react";

interface ShuttleSeatLayoutProps {
  selectedSeats: number[];
  toggleSeat: (seat: number) => void;
}

const ShuttleSeatLayout: React.FC<ShuttleSeatLayoutProps> = ({
  selectedSeats,
  toggleSeat,
}) => {
  const occupiedSeats = [2, 6];

  const rows = [
    [1, null, 2],
    [3, null, 4],
    [5, null, 6],
    [7, null, 8],
    [9, null, 10],
  ];

  return (
    <div className="detail-card">

      <h3>Pilih Kursi Shuttle</h3>

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

      <div className="shuttle-wrapper">

        <div className="shuttle-driver">

          🧑‍✈️

          <small>DRIVER</small>

        </div>

        <div className="shuttle-layout">

          {rows.map((row, index) => (
            <React.Fragment key={index}>
              {row.map((seat, i) => {

                if (seat === null)
                  return <div key={i} className="shuttle-aisle"></div>;

                const occupied = occupiedSeats.includes(seat);

                return (
                  <button
                    key={seat}
                    className={`seat ${
                      occupied
                        ? "occupied"
                        : selectedSeats.includes(seat)
                        ? "selected"
                        : "available"
                    }`}
                    onClick={() => {
                      if (!occupied) {
                        toggleSeat(seat);
                      }
                    }}
                  >
                    {seat.toString().padStart(2, "0")}
                  </button>
                );
              })}
            </React.Fragment>
          ))}

        </div>

      </div>

    </div>
  );
};

export default ShuttleSeatLayout;