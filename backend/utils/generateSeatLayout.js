/**
 * Generate a seat layout for a show
 * Rows A-B = VIP, C-E = Premium, F-J = Regular
 */
const generateSeatLayout = () => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const seatsPerRow = 12;
    const layout = [];

    rows.forEach((row, rowIndex) => {
        let type = 'regular';
        if (rowIndex < 2) type = 'vip';
        else if (rowIndex < 5) type = 'premium';

        for (let n = 1; n <= seatsPerRow; n++) {
            layout.push({
                seatId: `${row}${n}`,
                row,
                number: n,
                type,
                isBooked: false,
            });
        }
    });

    return layout;
};

module.exports = generateSeatLayout;