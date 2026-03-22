import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleSeat } from "../redux/slices/seatSlice";

const SEAT_TYPES = {
    vip: { color: "#f5c518", label: "VIP", bg: "rgba(245,197,24,0.15)" },
    premium: { color: "#a855f7", label: "Premium", bg: "rgba(168,85,247,0.15)" },
    regular: { color: "#3b82f6", label: "Regular", bg: "rgba(59,130,246,0.15)" },
};

function Seat({ seat, isSelected, isBooked, isLocked }) {
    const dispatch = useDispatch();
    const { user } = useSelector((s) => s.auth);

    const isMyLock = isLocked?.userId === user?._id?.toString();
    const disabled = isBooked || (isLocked && !isMyLock);

    const getColor = () => {
        if (isBooked) return "#374151";
        if (isLocked && !isMyLock) return "#6b7280";
        if (isSelected) return "#e50914";
        return SEAT_TYPES[seat.type]?.color || "#3b82f6";
    };

    const getBg = () => {
        if (isBooked) return "rgba(55,65,81,0.4)";
        if (isLocked && !isMyLock) return "rgba(107,114,128,0.2)";
        if (isSelected) return "rgba(229,9,20,0.25)";
        return SEAT_TYPES[seat.type]?.bg || "rgba(59,130,246,0.15)";
    };

    return (
        <div
            title={`${seat.seatId} - ${seat.type}${isBooked ? " (Booked)" : isLocked && !isMyLock ? " (Locked)" : ""
                }`}
            onClick={() => !disabled && dispatch(toggleSeat(seat.seatId))}
            style={{
                width: 34,
                height: 28,
                borderRadius: "4px 4px 8px 8px",
                border: `2px solid ${getColor()}`,
                background: getBg(),
                cursor: disabled ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                fontWeight: 700,
                color: getColor(),
                transition: "all 0.15s ease",
                opacity: disabled ? 0.5 : 1,
                transform: isSelected ? "scale(1.08)" : "scale(1)",
                userSelect: "none",
            }}
        >
            {seat.number}
        </div>
    );
}

export default function SeatMap({ show }) {
    const { selectedSeats, lockedSeats, bookedSeats } = useSelector(
        (s) => s.seats
    );

    if (!show?.seatLayout?.length) {
        return (
            <div style={{ textAlign: "center", padding: 40 }}>
                <p>No seats available</p>
            </div>
        );
    }

    const groupedByRow =
        show.seatLayout.reduce((acc, seat) => {
            if (!acc[seat.row]) acc[seat.row] = [];
            acc[seat.row].push(seat);
            return acc;
        }, {}) || {};

    const rows = Object.keys(groupedByRow).sort();

    return (
        <div>
            {/* Screen */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div
                    style={{
                        background:
                            "linear-gradient(180deg, #e50914 0%, rgba(229,9,20,0) 100%)",
                        height: 6,
                        borderRadius: "50%",
                        maxWidth: 400,
                        margin: "0 auto",
                        opacity: 0.6,
                        boxShadow: "0 0 40px rgba(229,9,20,0.4)",
                    }}
                />
                <p
                    style={{
                        color: "var(--color-muted)",
                        fontSize: 12,
                        marginTop: 8,
                        letterSpacing: 3,
                        textTransform: "uppercase",
                    }}
                >
                    Screen
                </p>
            </div>

            {/* Seat Grid */}
            <div style={{ overflowX: "auto", padding: "0 16px" }}>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        alignItems: "center",
                        minWidth: "max-content",
                    }}
                >
                    {rows.map((row) => (
                        <div
                            key={row}
                            style={{ display: "flex", alignItems: "center", gap: 4 }}
                        >
                            <span
                                style={{
                                    color: "var(--color-muted)",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    width: 20,
                                    textAlign: "center",
                                }}
                            >
                                {row}
                            </span>

                            <div style={{ display: "flex", gap: 4 }}>
                                {groupedByRow[row].map((seat, idx) => {
                                    const mid = Math.floor(groupedByRow[row].length / 2);

                                    return (
                                        <React.Fragment key={seat.seatId}>
                                            {idx === mid && <div style={{ width: 16 }} />}
                                            <Seat
                                                seat={seat}
                                                isSelected={selectedSeats.includes(seat.seatId)}
                                                isBooked={
                                                    seat.isBooked ||
                                                    bookedSeats.includes(seat.seatId)
                                                }
                                                isLocked={lockedSeats[seat.seatId]}
                                            />
                                        </React.Fragment>
                                    );
                                })}
                            </div>

                            <span
                                style={{
                                    color: "var(--color-muted)",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    width: 20,
                                    textAlign: "center",
                                }}
                            >
                                {row}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 20,
                    marginTop: 24,
                    flexWrap: "wrap",
                }}
            >
                {Object.entries(SEAT_TYPES).map(([type, cfg]) => (
                    <div
                        key={type}
                        style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                        <div
                            style={{
                                width: 20,
                                height: 16,
                                borderRadius: "2px 2px 4px 4px",
                                border: `2px solid ${cfg.color}`,
                                background: cfg.bg,
                            }}
                        />
                        <span style={{ color: "var(--color-muted)", fontSize: 12 }}>
                            {cfg.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}