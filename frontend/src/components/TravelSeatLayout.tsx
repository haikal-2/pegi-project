import React from "react";

interface TravelSeatLayoutProps {
  selectedSeats: number[];
  toggleSeat: (seat: number) => void;
}

const TravelSeatLayout: React.FC<TravelSeatLayoutProps> = ({
  selectedSeats,
  toggleSeat,
}) => {
  const occupiedSeats = [2, 5, 11];

  const rows = [
    [1, null, 2],
    [3, null, 4],
    [5, null, 6],
    [7, null, 8],
    [9, null, 10],
    [11, null, 12],
    [13, null, 14],
    [15, null, 16],
  ];

  return (
    <div className="detail-card">

      <h3>Pilih Kursi Travel</h3>

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

      <div className="travel-wrapper">

        <div className="travel-driver">
          🧑‍✈️
          <small>DRIVER</small>
        </div>

        <div className="travel-layout">

          {rows.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>

              {row.map((seat, index) => {

                if (seat === null) {
                  return (
                    <div
                      key={index}
                      className="travel-aisle"
                    ></div>
                  );
                }

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

export default TravelSeatLayout;