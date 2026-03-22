/**
 * Recommend consecutive available seats in a row
 * @param {Array} seatLayout - flat array of seat objects from Show model
 * @param {number} seatsNeeded - number of consecutive seats to find
 * @returns {string[]} array of seatIds
 */
const recommendSeats = (seatLayout, seatsNeeded) => {
    // Group seats by row
    const rowMap = {};
    for (const seat of seatLayout) {
        if (!rowMap[seat.row]) rowMap[seat.row] = [];
        rowMap[seat.row].push(seat);
    }

    const rows = Object.keys(rowMap).sort();

    for (const row of rows) {
        const seats = rowMap[row].sort((a, b) => a.number - b.number);
        let count = 0;
        let group = [];

        for (const seat of seats) {
            if (!seat.isBooked) {
                group.push(seat.seatId);
                count++;
                if (count === seatsNeeded) {
                    return group;
                }
            } else {
                count = 0;
                group = [];
            }
        }
    }

    return [];
};

module.exports = { recommendSeats };