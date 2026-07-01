import React from "react";

interface TrainSeatLayoutProps {
  selectedSeats: number[];
  toggleSeat: (seat: number) => void;
}

const TrainSeatLayout: React.FC<TrainSeatLayoutProps> = ({
  selectedSeats,
  toggleSeat,
}) => {
  const occupiedSeats = [4, 7, 12, 19, 24, 32];

  const rows = [];

  let seat = 1;

  for (let i = 0; i < 10; i++) {
    rows.push([
      seat++,
      seat++,
      null,
      seat++,
      seat++,
    ]);
  }

  return (
    <div className="detail-card">

      <h3>Pilih Kursi Kereta</h3>

      <div className="train-direction">
        ↑ ARAH LAJU KERETA
      </div>

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

      <div className="train-wrapper">

        <div className="train-header">

          <div>🚪<small>PINTU</small></div>

          <div>🚻<small>TOILET</small></div>

        </div>

        <div className="train-column-label">

          <span>A</span>

          <span>B</span>

          <span></span>

          <span>C</span>

          <span>D</span>

        </div>

        <div className="train-layout">

          {rows.map((row, index) => (
            <React.Fragment key={index}>
              {row.map((seatNumber, i) => {

                if (seatNumber === null)
                  return <div key={i} className="train-aisle"></div>;

                const occupied = occupiedSeats.includes(seatNumber);

                return (
                  <button
                    key={seatNumber}
                    className={`seat ${
                      occupied
                        ? "occupied"
                        : selectedSeats.includes(seatNumber)
                        ? "selected"
                        : "available"
                    }`}
                    onClick={()=>{
                      if(!occupied){
                        toggleSeat(seatNumber);
                      }
                    }}
                  >
                    {seatNumber}
                  </button>
                );
              })}
            </React.Fragment>
          ))}

        </div>

        <div className="train-footer">

          <div>🚪<small>PINTU</small></div>

          <div>🚻<small>TOILET</small></div>

        </div>

      </div>

    </div>
  );
};

export default TrainSeatLayout;